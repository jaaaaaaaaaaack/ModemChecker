import { supabase } from "./supabase";
import type { Modem } from "../types";

const SEARCH_COLUMNS = "id, brand, model, alternative_names, device_type, isp_provided_by, is_isp_locked, compatibility, wan, wifi, general";

function sortByBrandModel(modems: Modem[]): Modem[] {
  return [...modems].sort((a, b) =>
    a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)
  );
}

export async function searchModems(
  query: string,
  signal?: AbortSignal
): Promise<Modem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Tier 1: Full-text search
  const ftsQuery = supabase
    .from("modems")
    .select(SEARCH_COLUMNS)
    .textSearch("search_vector", trimmed, { type: "plain", config: "english" });

  const { data: ftsData, error: ftsError } = signal
    ? await ftsQuery.abortSignal(signal).limit(10)
    : await ftsQuery.limit(10);

  if (ftsError) throw new Error(ftsError.message);
  if (ftsData && ftsData.length > 0) return sortByBrandModel(ftsData as Modem[]);

  // Fast-fail if already aborted before making second request
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  // Tier 2: Trigram similarity fallback
  const rpcQuery = supabase.rpc("search_modems_fuzzy", {
    query_text: trimmed,
    max_results: 10,
  });

  const { data: fuzzyData, error: fuzzyError } = signal
    ? await rpcQuery.abortSignal(signal)
    : await rpcQuery;

  if (fuzzyError) throw new Error(fuzzyError.message);
  return sortByBrandModel((fuzzyData as Modem[]) ?? []);
}
