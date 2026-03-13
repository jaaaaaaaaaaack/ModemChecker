-- Migration 002: Recreate modems table with correct JSONB schema
-- The original table was created with flat columns instead of the designed JSONB structure.
-- This drops and recreates to match the canonical schema from ModemChecker_Data.

-- ============================================================
-- 1. Drop existing objects
-- ============================================================
DROP TABLE IF EXISTS modem_sources CASCADE;
DROP TABLE IF EXISTS modems CASCADE;
DROP FUNCTION IF EXISTS modems_search_vector_trigger() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS search_modems_fuzzy(TEXT, INT) CASCADE;

-- ============================================================
-- 2. Create tables (from ModemChecker_Data/001_create_modem_schema.sql)
-- ============================================================
CREATE TABLE modems (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  alternative_names TEXT[] DEFAULT '{}',
  device_type TEXT NOT NULL CHECK (device_type IN ('modem_router', 'router', 'modem', 'mesh_system')),
  isp_provided_by TEXT,
  is_isp_locked BOOLEAN NOT NULL DEFAULT false,
  compatibility JSONB NOT NULL,
  wan JSONB NOT NULL,
  wifi JSONB,
  general JSONB,
  research JSONB,
  research_notes TEXT,
  callout_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- search_vector: populated by trigger
ALTER TABLE modems ADD COLUMN search_vector TSVECTOR;

CREATE OR REPLACE FUNCTION modems_search_vector_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.brand, '') || ' ' ||
    coalesce(NEW.model, '') || ' ' ||
    coalesce(array_to_string(NEW.alternative_names, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER modems_search_vector_update
  BEFORE INSERT OR UPDATE OF brand, model, alternative_names ON modems
  FOR EACH ROW
  EXECUTE PROCEDURE modems_search_vector_trigger();

-- modem_sources: provenance for each modem
CREATE TABLE modem_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modem_id TEXT NOT NULL REFERENCES modems(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT,
  accessed DATE,
  title TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0
);

-- ============================================================
-- 3. Indexes
-- ============================================================
CREATE INDEX idx_modems_brand ON modems(brand);
CREATE INDEX idx_modems_device_type ON modems(device_type);
CREATE INDEX idx_modems_isp_provided_by ON modems(isp_provided_by) WHERE isp_provided_by IS NOT NULL;
CREATE INDEX idx_modems_search_vector ON modems USING GIN(search_vector);
CREATE INDEX idx_modems_alternative_names ON modems USING GIN(alternative_names);
CREATE INDEX idx_modem_sources_modem_id ON modem_sources(modem_id);

-- ============================================================
-- 4. updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER modems_updated_at
  BEFORE UPDATE ON modems
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================
-- 5. pg_trgm + fuzzy search function
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION search_modems_fuzzy(
  query_text TEXT,
  max_results INT DEFAULT 10
)
RETURNS TABLE (
  id TEXT,
  brand TEXT,
  model TEXT,
  alternative_names TEXT[],
  device_type TEXT,
  isp_provided_by TEXT,
  is_isp_locked BOOLEAN,
  compatibility JSONB,
  wan JSONB,
  wifi JSONB,
  general JSONB,
  similarity_score REAL
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id, m.brand, m.model, m.alternative_names,
    m.device_type, m.isp_provided_by, m.is_isp_locked,
    m.compatibility, m.wan, m.wifi, m.general,
    GREATEST(
      similarity(m.brand || ' ' || m.model, query_text),
      similarity(m.model, query_text),
      (SELECT MAX(similarity(alt, query_text))
       FROM unnest(m.alternative_names) AS alt)
    ) AS similarity_score
  FROM modems m
  WHERE
    similarity(m.brand || ' ' || m.model, query_text) > 0.15
    OR similarity(m.model, query_text) > 0.15
    OR EXISTS (
      SELECT 1 FROM unnest(m.alternative_names) AS alt
      WHERE similarity(alt, query_text) > 0.15
    )
  ORDER BY similarity_score DESC
  LIMIT max_results;
END;
$$;

-- GIN trigram indexes for fuzzy search performance
CREATE INDEX idx_modems_brand_trgm ON modems USING GIN(brand gin_trgm_ops);
CREATE INDEX idx_modems_model_trgm ON modems USING GIN(model gin_trgm_ops);

-- ============================================================
-- 6. Row Level Security — public read-only
-- ============================================================
ALTER TABLE modems ENABLE ROW LEVEL SECURITY;
ALTER TABLE modem_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON modems FOR SELECT USING (true);
CREATE POLICY "Public read access" ON modem_sources FOR SELECT USING (true);
