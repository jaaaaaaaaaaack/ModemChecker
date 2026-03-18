import { Badge } from "@/ui/components/Badge";

export function SearchTierDiagram() {
  return (
    <div className="mb-5 space-y-2">
      {/* Tier 1 */}
      <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
        <div className="mb-1.5 flex items-center gap-2">
          <Badge variant="brand">Tier 1</Badge>
          <span className="text-sm font-semibold text-doc-text">
            Full-text search
          </span>
          <code className="rounded bg-white/60 px-1.5 py-0.5 font-mono text-[0.7rem] text-brand-700">
            tsvector
          </code>
        </div>
        <p className="text-sm leading-relaxed text-neutral-600">
          Stemmed, GIN-indexed search across brand, model, and alternative
          names. Handles word order variations and partial matches.
        </p>
      </div>

      {/* Connector */}
      <div className="flex items-center justify-center gap-2 py-0.5">
        <div className="h-4 w-px bg-neutral-300" />
        <span className="text-[0.65rem] font-medium uppercase tracking-wide text-doc-muted">
          Zero results? Fallback
        </span>
        <div className="h-4 w-px bg-neutral-300" />
      </div>

      {/* Tier 2 */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <div className="mb-1.5 flex items-center gap-2">
          <Badge variant="neutral">Tier 2</Badge>
          <span className="text-sm font-semibold text-doc-text">
            Trigram similarity
          </span>
          <code className="rounded bg-white/60 px-1.5 py-0.5 font-mono text-[0.7rem] text-neutral-600">
            pg_trgm
          </code>
        </div>
        <p className="text-sm leading-relaxed text-neutral-600">
          Fuzzy matching catches typos, abbreviations, and partial strings.
          &ldquo;tp link archr&rdquo; or &ldquo;vr1600&rdquo; still finds the
          right device.
        </p>
      </div>
    </div>
  );
}
