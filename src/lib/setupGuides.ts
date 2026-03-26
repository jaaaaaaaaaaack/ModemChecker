import type { SetupGuideData } from "../types";

export interface GuideEntry {
  id: string;
  brand: string;
  model: string;
  device_type: string;
  setup: SetupGuideData;
}

// Build a lazy-load map: each guide is only fetched when requested.
// Vite code-splits each JSON file into its own chunk.
const guideModules = import.meta.glob<GuideEntry>(
  "../../data/setup-guides/*.json",
  { eager: false },
);

// Map from modem ID (filename without extension) to its dynamic loader.
// This index loads eagerly (just filenames, no content), so hasSetupGuide() is synchronous.
const GUIDE_LOADERS: Record<string, () => Promise<unknown>> = {};
for (const path of Object.keys(guideModules)) {
  const filename = path.split("/").pop()?.replace(".json", "");
  if (filename) {
    GUIDE_LOADERS[filename] = guideModules[path];
  }
}

/** Synchronous check — does a guide exist for this modem? */
export function hasSetupGuide(modemId: string): boolean {
  return modemId in GUIDE_LOADERS;
}

/** Lazy-load and return a single guide. Cached by the browser after first load. */
export async function getSetupGuide(modemId: string): Promise<GuideEntry | undefined> {
  const loader = GUIDE_LOADERS[modemId];
  if (!loader) return undefined;
  const mod = await loader() as { default: GuideEntry } | GuideEntry;
  return "default" in mod ? mod.default : mod;
}

/** Get all available guide IDs (synchronous — no content loaded). */
export function getAvailableGuideIds(): string[] {
  return Object.keys(GUIDE_LOADERS);
}

/** Load all guides (for dev menu). Only loads content when called. */
export async function getAllGuides(): Promise<GuideEntry[]> {
  const entries = await Promise.all(
    Object.values(GUIDE_LOADERS).map(async (loader) => {
      const mod = await loader() as { default: GuideEntry } | GuideEntry;
      return "default" in mod ? mod.default : mod;
    }),
  );
  return entries.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`));
}
