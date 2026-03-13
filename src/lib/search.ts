import { supabase } from "./supabase";
import type { Modem } from "../types";

const SEARCH_COLUMNS = "id, brand, model, alternative_names, device_type, isp_provided_by, is_isp_locked, compatibility, wan, wifi, general";

function sortByBrandModel(modems: Modem[]): Modem[] {
  return modems.sort((a, b) =>
    a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)
  );
}

export async function searchModems(query: string): Promise<Modem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Tier 1: Full-text search
  const { data: ftsData, error: ftsError } = await supabase
    .from("modems")
    .select(SEARCH_COLUMNS)
    .textSearch("search_vector", trimmed, { type: "plain", config: "english" })
    .limit(10);

  if (ftsError) throw new Error(ftsError.message);
  if (ftsData && ftsData.length > 0) return sortByBrandModel(ftsData as Modem[]);

  // Tier 2: Trigram similarity fallback
  const { data: fuzzyData, error: fuzzyError } = await supabase.rpc(
    "search_modems_fuzzy",
    { query_text: trimmed, max_results: 10 }
  );

  if (fuzzyError) throw new Error(fuzzyError.message);
  return sortByBrandModel((fuzzyData as Modem[]) ?? []);
}
