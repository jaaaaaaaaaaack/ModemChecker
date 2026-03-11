import { supabase } from "./supabase";
import type { Modem } from "../types";

const SEARCH_COLUMNS = "id, brand, model, alternative_names, device_type, isp_provided_by, is_isp_locked, compatibility, wan, wifi, general";

export async function searchModems(query: string): Promise<Modem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { data, error } = await supabase
    .from("modems")
    .select(SEARCH_COLUMNS)
    .textSearch("search_vector", trimmed, { type: "plain", config: "english" })
    .limit(10);

  if (error) throw new Error(error.message);
  return (data as Modem[]) ?? [];
}
