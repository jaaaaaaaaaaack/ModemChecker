import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get the public Storage URL for a modem image.
 * Returns the URL whether or not the image exists — use onError fallback in <img>.
 */
export function getModemImageUrl(modemId: string): string {
  return `${supabaseUrl}/storage/v1/object/public/modem-images/${modemId}.webp`;
}

/**
 * Get the public Storage URL for an NBN hardware image.
 * Image IDs match the `imageId` field in NBN_HARDWARE constants.
 */
export function getNbnHardwareImageUrl(imageId: string): string {
  return `${supabaseUrl}/storage/v1/object/public/nbn-hardware/${imageId}.webp`;
}
