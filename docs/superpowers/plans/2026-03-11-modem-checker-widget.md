# Modem Checker Widget Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an embeddable React+Vite widget that lets users check whether their modem is compatible with Belong nbn, querying a Supabase backend of 70 modems.

**Architecture:** Bottom-sheet modal pattern over a base screen. User selects "BYO modem" → searches by model name → gets routed to one of three result paths (single match, multiple matches, no match). Compatibility is evaluated against the user's nbn tech type (passed as a prop). State managed with React useState/useReducer — no external state library needed.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Supabase JS client (`@supabase/supabase-js`), Vitest + React Testing Library for tests, Plus Jakarta Sans font.

**Prerequisites:**
- Supabase anon key for project `mgkdulkdngifkzpgzofk` — set as `VITE_SUPABASE_ANON_KEY` in `.env`
- Supabase URL: `https://mgkdulkdngifkzpgzofk.supabase.co`

---

## File Structure

```
ModemChecker/
├── .env                          # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── .env.example                  # Template without secrets
├── .gitignore
├── index.html                    # Vite entry HTML
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts                # Vite config + library mode for embedding
├── src/
│   ├── main.tsx                  # Dev entry — mounts <App /> for standalone dev
│   ├── App.tsx                   # Dev wrapper — tech type selector + widget
│   ├── index.ts                  # Library entry — exports <ModemChecker /> for embedding
│   ├── types.ts                  # All TypeScript types (Modem, TechType, Status, etc.)
│   ├── constants.ts              # Condition code labels, status config
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client singleton
│   │   └── search.ts             # searchModems() — wraps Supabase full-text query
│   ├── hooks/
│   │   └── useModemSearch.ts     # React hook: manages search state machine
│   └── components/
│       ├── ModemChecker.tsx       # Root widget — receives techType prop, owns flow state
│       ├── BaseScreen.tsx         # Radio buttons: "Belong modem" vs "BYO" + "Check my modem"
│       ├── BottomSheet.tsx        # Modal overlay with slide-up sheet
│       ├── SearchInput.tsx        # Search field + Continue button
│       ├── LoadingState.tsx       # "Finding your modem..." spinner
│       ├── MultipleMatches.tsx    # Radio list of matching modems + Continue
│       ├── ResultCard.tsx         # Compatibility verdict (yes/yes_but/no)
│       ├── ConditionList.tsx      # Renders condition code badges for yes_but/no
│       └── NoMatch.tsx            # "No modem found" + Try again
├── tests/
│   ├── setup.ts                  # Vitest setup — jsdom, RTL cleanup
│   ├── lib/
│   │   └── search.test.ts        # searchModems unit tests
│   ├── hooks/
│   │   └── useModemSearch.test.ts # Hook state machine tests
│   └── components/
│       ├── BaseScreen.test.tsx
│       ├── BottomSheet.test.tsx
│       ├── SearchInput.test.tsx
│       ├── MultipleMatches.test.tsx
│       ├── ResultCard.test.tsx
│       ├── ConditionList.test.tsx
│       └── NoMatch.test.tsx
└── docs/
    ├── ux-flow.md                # (exists)
    └── frontend-context.md       # (exists)
```

---

## Chunk 1: Project Foundation

### Task 1: Scaffold Vite + React + TypeScript project

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `.gitignore`, `.env.example`, `postcss.config.js`, `tailwind.config.ts`

- [ ] **Step 1: Scaffold with Vite**

```bash
cd /Users/jack/Projects/ModemChecker
npm create vite@latest . -- --template react-ts
```

Accept overwrite prompts for existing files. This creates the base React+TS scaffold.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js
npm install -D tailwindcss@4 @tailwindcss/vite@4 vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/react @types/react-dom
```

- [ ] **Step 3: Configure Tailwind with Vite plugin**

Replace `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

Replace `src/index.css` with:

```css
@import "tailwindcss";

@theme {
  --font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;

  --color-brand-500: #0097a9;
  --color-brand-600: #007a8a;
  --color-brand-700: #005d6a;
  --color-brand-50: #e0f7fa;

  --color-success-500: #009f6e;
  --color-success-50: #e0f5ee;

  --color-warning-500: #b67800;
  --color-warning-50: #fff2c8;

  --color-error-500: #e44645;
  --color-error-50: #ffe6e1;
}
```

- [ ] **Step 4: Configure Vitest**

Add to `vite.config.ts` (update the existing file):

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    css: false,
  },
});
```

Create `tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 5: Create .env.example and .gitignore additions**

`.env.example`:

```
VITE_SUPABASE_URL=https://mgkdulkdngifkzpgzofk.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Append to `.gitignore`:

```
.env
.env.local
```

- [ ] **Step 6: Add Plus Jakarta Sans to index.html**

Add to `<head>` in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

- [ ] **Step 7: Add npm scripts**

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 8: Verify scaffold**

```bash
npm run build
npm test
```

Both should exit cleanly (tests may say "no tests found" — that's fine).

- [ ] **Step 9: Initialize git and commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Vite + React + TS + Tailwind + Vitest"
```

---

### Task 2: Define TypeScript types

**Files:**
- Create: `src/types.ts`
- Test: `tests/types.test.ts`

- [ ] **Step 1: Write type validation test**

Create `tests/types.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import type {
  TechType,
  CompatibilityStatus,
  ConditionCode,
  Compatibility,
  Modem,
  SearchState,
} from "../src/types";

describe("types", () => {
  it("TechType covers all nbn types", () => {
    const types: TechType[] = ["fttp", "fttc", "fttn", "hfc"];
    expect(types).toHaveLength(4);
  });

  it("CompatibilityStatus covers all statuses", () => {
    const statuses: CompatibilityStatus[] = ["yes", "yes_but", "no"];
    expect(statuses).toHaveLength(3);
  });

  it("Modem type matches database shape", () => {
    const modem: Modem = {
      id: "tp-link-archer-vr1600v",
      brand: "TP-Link",
      model: "Archer VR1600v",
      alternative_names: ["VR1600v"],
      device_type: "modem_router",
      isp_provided_by: null,
      is_isp_locked: false,
      compatibility: {
        fttp: { status: "yes", conditions: [] },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "yes", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
      wan: { has_vdsl2_modem: true, wan_port_speed_mbps: 1000 },
      wifi: {
        wifi_standard: "Wi-Fi 5 (802.11ac)",
        wifi_generation: 5,
        bands: ["2.4GHz", "5GHz"],
        max_speed_mbps: { theoretical_combined: 1600, per_band: { "2.4ghz": 300, "5ghz": 1300 } },
      },
      general: {
        release_year: 2019,
        still_sold: false,
        end_of_life: false,
        manufacturer_url: null,
      },
    };
    expect(modem.id).toBe("tp-link-archer-vr1600v");
  });

  it("SearchState covers all flow states", () => {
    const states: SearchState["step"][] = [
      "idle",
      "searching",
      "single_match",
      "multiple_matches",
      "no_match",
    ];
    expect(states).toHaveLength(5);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run tests/types.test.ts
```

Expected: FAIL — cannot resolve `../src/types`.

- [ ] **Step 3: Implement types**

Create `src/types.ts`:

```ts
export type TechType = "fttp" | "fttc" | "fttn" | "hfc";

export type CompatibilityStatus = "yes" | "yes_but" | "no";

export type ConditionCode =
  | "SWITCH_TO_IPOE"
  | "DISABLE_VLAN"
  | "ISP_LOCK"
  | "MISSING_SOS_ROC"
  | "WAN_PORT_LIMIT"
  | "NEEDS_2_5G_WAN"
  | "FIRMWARE_UPDATE"
  | "BRIDGE_MODE"
  | "NO_VOIP"
  | "EOL";

export type DeviceType = "router" | "modem_router" | "modem" | "mesh_system";

export interface TechCompatibility {
  status: CompatibilityStatus;
  conditions: ConditionCode[];
}

export interface Compatibility {
  fttp: TechCompatibility;
  fttc: TechCompatibility;
  fttn: TechCompatibility;
  hfc: TechCompatibility;
}

export interface Modem {
  id: string;
  brand: string;
  model: string;
  alternative_names: string[] | null;
  device_type: DeviceType;
  isp_provided_by: string | null;
  is_isp_locked: boolean;
  compatibility: Compatibility;
  wan: {
    has_vdsl2_modem: boolean;
    wan_port_speed_mbps: number;
    vdsl2?: {
      profiles: string[];
      supports_vectoring: boolean;
      supports_sra: boolean;
      supports_sos: boolean;
      supports_roc: boolean;
    };
  };
  wifi: {
    wifi_standard: string;
    wifi_generation: number;
    bands: string[];
    max_speed_mbps: {
      theoretical_combined: number;
      per_band: Record<string, number>;
    };
  };
  general: {
    release_year: number | null;
    still_sold: boolean;
    end_of_life: boolean;
    manufacturer_url: string | null;
  };
}

export type SearchState =
  | { step: "idle" }
  | { step: "searching"; query: string }
  | { step: "single_match"; modem: Modem }
  | { step: "multiple_matches"; modems: Modem[] }
  | { step: "no_match"; query: string };
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx vitest run tests/types.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types.ts tests/types.test.ts
git commit -m "feat: define TypeScript types for modem data and search state"
```

---

### Task 3: Constants — condition code labels and status config

**Files:**
- Create: `src/constants.ts`
- Test: `tests/constants.test.ts`

- [ ] **Step 1: Write test**

Create `tests/constants.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { CONDITION_LABELS, STATUS_CONFIG } from "../src/constants";
import type { ConditionCode, CompatibilityStatus } from "../src/types";

describe("CONDITION_LABELS", () => {
  it("has a label for every condition code", () => {
    const codes: ConditionCode[] = [
      "SWITCH_TO_IPOE", "DISABLE_VLAN", "ISP_LOCK", "MISSING_SOS_ROC",
      "WAN_PORT_LIMIT", "NEEDS_2_5G_WAN", "FIRMWARE_UPDATE", "BRIDGE_MODE",
      "NO_VOIP", "EOL",
    ];
    for (const code of codes) {
      expect(CONDITION_LABELS[code]).toBeDefined();
      expect(CONDITION_LABELS[code].label).toBeTruthy();
      expect(CONDITION_LABELS[code].description).toBeTruthy();
    }
  });
});

describe("STATUS_CONFIG", () => {
  it("has config for every status", () => {
    const statuses: CompatibilityStatus[] = ["yes", "yes_but", "no"];
    for (const status of statuses) {
      expect(STATUS_CONFIG[status]).toBeDefined();
      expect(STATUS_CONFIG[status].heading).toBeTruthy();
      expect(STATUS_CONFIG[status].color).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run tests/constants.test.ts
```

- [ ] **Step 3: Implement constants**

Create `src/constants.ts`:

```ts
import type { ConditionCode, CompatibilityStatus } from "./types";

export const CONDITION_LABELS: Record<ConditionCode, { label: string; description: string }> = {
  SWITCH_TO_IPOE: {
    label: "Reconfigure to IPoE",
    description: "This modem may be set up for PPPoE. You'll need to switch it to IPoE/DHCP for Belong.",
  },
  DISABLE_VLAN: {
    label: "Disable VLAN tagging",
    description: "VLAN tagging from a previous ISP may need to be turned off.",
  },
  ISP_LOCK: {
    label: "May be ISP-locked",
    description: "This device may be locked to its original ISP. Check before using with Belong.",
  },
  MISSING_SOS_ROC: {
    label: "Missing SOS/ROC support",
    description: "This modem lacks SOS/ROC support, which can cause dropouts on FTTN/FTTB connections.",
  },
  WAN_PORT_LIMIT: {
    label: "WAN port speed bottleneck",
    description: "The 100 Mbps WAN port will cap your speeds on nbn 100+ plans.",
  },
  NEEDS_2_5G_WAN: {
    label: "2.5G WAN recommended",
    description: "A 1 Gbps WAN port will bottleneck nbn 500/1000 plans. Consider a 2.5G WAN device.",
  },
  FIRMWARE_UPDATE: {
    label: "Firmware update required",
    description: "Update your modem's firmware before using it with Belong.",
  },
  BRIDGE_MODE: {
    label: "Requires bridge mode",
    description: "This device needs to be configured in bridge mode for use with Belong.",
  },
  NO_VOIP: {
    label: "No VoIP support",
    description: "This device doesn't support VoIP if you need a home phone service.",
  },
  EOL: {
    label: "End of life",
    description: "This device is no longer supported by the manufacturer. Security and compatibility may be affected.",
  },
};

export const STATUS_CONFIG: Record<CompatibilityStatus, { heading: string; color: string; bgColor: string }> = {
  yes: {
    heading: "Compatible with Belong nbn",
    color: "text-success-500",
    bgColor: "bg-success-50",
  },
  yes_but: {
    heading: "Compatible with some requirements",
    color: "text-warning-500",
    bgColor: "bg-warning-50",
  },
  no: {
    heading: "Not compatible with Belong nbn",
    color: "text-error-500",
    bgColor: "bg-error-50",
  },
};
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx vitest run tests/constants.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/constants.ts tests/constants.test.ts
git commit -m "feat: add condition code labels and status display config"
```

---

### Task 4: Supabase client + search function

**Files:**
- Create: `src/lib/supabase.ts`, `src/lib/search.ts`
- Test: `tests/lib/search.test.ts`

- [ ] **Step 1: Create Supabase client**

Create `src/lib/supabase.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 2: Write search test**

Create `tests/lib/search.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Modem } from "../../src/types";

// Mock supabase before importing search
vi.mock("../../src/lib/supabase", () => {
  const mockSelect = vi.fn();
  const mockTextSearch = vi.fn();
  const mockLimit = vi.fn();

  // Chain: from().select().textSearch().limit()
  const mockFrom = vi.fn(() => ({
    select: mockSelect.mockReturnValue({
      textSearch: mockTextSearch.mockReturnValue({
        limit: mockLimit,
      }),
    }),
  }));

  return {
    supabase: { from: mockFrom },
    __mocks: { mockFrom, mockSelect, mockTextSearch, mockLimit },
  };
});

import { searchModems } from "../../src/lib/search";
import { __mocks } from "../../src/lib/supabase";

const { mockLimit } = __mocks as {
  mockFrom: ReturnType<typeof vi.fn>;
  mockSelect: ReturnType<typeof vi.fn>;
  mockTextSearch: ReturnType<typeof vi.fn>;
  mockLimit: ReturnType<typeof vi.fn>;
};

const fakeModem: Modem = {
  id: "tp-link-archer-vr1600v",
  brand: "TP-Link",
  model: "Archer VR1600v",
  alternative_names: null,
  device_type: "modem_router",
  isp_provided_by: null,
  is_isp_locked: false,
  compatibility: {
    fttp: { status: "yes", conditions: [] },
    fttc: { status: "yes", conditions: [] },
    fttn: { status: "yes", conditions: [] },
    hfc: { status: "yes", conditions: [] },
  },
  wan: { has_vdsl2_modem: true, wan_port_speed_mbps: 1000 },
  wifi: {
    wifi_standard: "Wi-Fi 5",
    wifi_generation: 5,
    bands: ["2.4GHz", "5GHz"],
    max_speed_mbps: { theoretical_combined: 1600, per_band: {} },
  },
  general: { release_year: 2019, still_sold: false, end_of_life: false, manufacturer_url: null },
};

describe("searchModems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns modems from Supabase full-text search", async () => {
    mockLimit.mockResolvedValue({ data: [fakeModem], error: null });

    const result = await searchModems("tp-link archer");
    expect(result).toEqual([fakeModem]);
  });

  it("returns empty array when no results", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    const result = await searchModems("nonexistent modem");
    expect(result).toEqual([]);
  });

  it("throws on Supabase error", async () => {
    mockLimit.mockResolvedValue({ data: null, error: { message: "DB error" } });

    await expect(searchModems("test")).rejects.toThrow("DB error");
  });

  it("trims and rejects empty queries", async () => {
    const result = await searchModems("   ");
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 3: Run test — expect FAIL**

```bash
npx vitest run tests/lib/search.test.ts
```

- [ ] **Step 4: Implement search**

Create `src/lib/search.ts`:

```ts
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
  // Note: Supabase JS doesn't support ORDER BY ts_rank() directly.
  // With only 70 modems and limit 10, default ordering is acceptable.
  // If ranking becomes important, add a Postgres RPC function.
  return (data as Modem[]) ?? [];
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
npx vitest run tests/lib/search.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase.ts src/lib/search.ts tests/lib/search.test.ts
git commit -m "feat: add Supabase client and modem search function"
```

---

## Chunk 2: Search Hook + UI Components

### Task 5: useModemSearch hook

**Files:**
- Create: `src/hooks/useModemSearch.ts`
- Test: `tests/hooks/useModemSearch.test.ts`

- [ ] **Step 1: Write hook test**

Create `tests/hooks/useModemSearch.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("../../src/lib/search", () => ({
  searchModems: vi.fn(),
}));

import { useModemSearch } from "../../src/hooks/useModemSearch";
import { searchModems } from "../../src/lib/search";
import type { Modem } from "../../src/types";

const mockSearch = vi.mocked(searchModems);

const modemA: Modem = {
  id: "a", brand: "TP-Link", model: "Archer VR1600v",
  alternative_names: null, device_type: "modem_router",
  isp_provided_by: null, is_isp_locked: false,
  compatibility: {
    fttp: { status: "yes", conditions: [] },
    fttc: { status: "yes", conditions: [] },
    fttn: { status: "yes", conditions: [] },
    hfc: { status: "yes", conditions: [] },
  },
  wan: { has_vdsl2_modem: true, wan_port_speed_mbps: 1000 },
  wifi: { wifi_standard: "Wi-Fi 5", wifi_generation: 5, bands: [], max_speed_mbps: { theoretical_combined: 0, per_band: {} } },
  general: { release_year: null, still_sold: false, end_of_life: false, manufacturer_url: null },
};

const modemB: Modem = { ...modemA, id: "b", model: "Archer C7" };

describe("useModemSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts in idle state", () => {
    const { result } = renderHook(() => useModemSearch());
    expect(result.current.state.step).toBe("idle");
  });

  it("transitions to single_match on one result", async () => {
    mockSearch.mockResolvedValue([modemA]);
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("tp-link");
    });

    expect(result.current.state.step).toBe("single_match");
    if (result.current.state.step === "single_match") {
      expect(result.current.state.modem.id).toBe("a");
    }
  });

  it("transitions to multiple_matches on 2+ results", async () => {
    mockSearch.mockResolvedValue([modemA, modemB]);
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("archer");
    });

    expect(result.current.state.step).toBe("multiple_matches");
    if (result.current.state.step === "multiple_matches") {
      expect(result.current.state.modems).toHaveLength(2);
    }
  });

  it("transitions to no_match on 0 results", async () => {
    mockSearch.mockResolvedValue([]);
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("nonexistent");
    });

    expect(result.current.state.step).toBe("no_match");
  });

  it("selectModem transitions from multiple_matches to single_match", async () => {
    mockSearch.mockResolvedValue([modemA, modemB]);
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("archer");
    });

    act(() => {
      result.current.selectModem(modemB);
    });

    expect(result.current.state.step).toBe("single_match");
    if (result.current.state.step === "single_match") {
      expect(result.current.state.modem.id).toBe("b");
    }
  });

  it("reset returns to idle", async () => {
    mockSearch.mockResolvedValue([modemA]);
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("tp-link");
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.step).toBe("idle");
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run tests/hooks/useModemSearch.test.ts
```

- [ ] **Step 3: Implement hook**

Create `src/hooks/useModemSearch.ts`:

```ts
import { useCallback, useState } from "react";
import { searchModems } from "../lib/search";
import type { Modem, SearchState } from "../types";

export function useModemSearch() {
  const [state, setState] = useState<SearchState>({ step: "idle" });

  const search = useCallback(async (query: string) => {
    setState({ step: "searching", query });
    try {
      const results = await searchModems(query);
      if (results.length === 0) {
        setState({ step: "no_match", query });
      } else if (results.length === 1) {
        setState({ step: "single_match", modem: results[0] });
      } else {
        setState({ step: "multiple_matches", modems: results });
      }
    } catch {
      setState({ step: "no_match", query });
    }
  }, []);

  const selectModem = useCallback((modem: Modem) => {
    setState({ step: "single_match", modem });
  }, []);

  const reset = useCallback(() => {
    setState({ step: "idle" });
  }, []);

  return { state, search, selectModem, reset };
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx vitest run tests/hooks/useModemSearch.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useModemSearch.ts tests/hooks/useModemSearch.test.ts
git commit -m "feat: add useModemSearch hook with state machine"
```

---

### Task 6: BottomSheet component

**Files:**
- Create: `src/components/BottomSheet.tsx`
- Test: `tests/components/BottomSheet.test.tsx`

- [ ] **Step 1: Write test**

Create `tests/components/BottomSheet.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BottomSheet } from "../../src/components/BottomSheet";

describe("BottomSheet", () => {
  it("renders children when open", () => {
    render(
      <BottomSheet open onClose={() => {}}>
        <p>Sheet content</p>
      </BottomSheet>
    );
    expect(screen.getByText("Sheet content")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <BottomSheet open={false} onClose={() => {}}>
        <p>Sheet content</p>
      </BottomSheet>
    );
    expect(screen.queryByText("Sheet content")).not.toBeInTheDocument();
  });

  it("calls onClose when backdrop clicked", async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose}>
        <p>Content</p>
      </BottomSheet>
    );
    await userEvent.click(screen.getByTestId("bottom-sheet-backdrop"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when close button clicked", async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose}>
        <p>Content</p>
      </BottomSheet>
    );
    await userEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run tests/components/BottomSheet.test.tsx
```

- [ ] **Step 3: Implement BottomSheet**

Create `src/components/BottomSheet.tsx`:

```tsx
import type { ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        data-testid="bottom-sheet-backdrop"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 shadow-xl">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx vitest run tests/components/BottomSheet.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/BottomSheet.tsx tests/components/BottomSheet.test.tsx
git commit -m "feat: add BottomSheet modal component"
```

---

### Task 7: SearchInput component

**Files:**
- Create: `src/components/SearchInput.tsx`
- Test: `tests/components/SearchInput.test.tsx`

- [ ] **Step 1: Write test**

Create `tests/components/SearchInput.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "../../src/components/SearchInput";

describe("SearchInput", () => {
  it("renders heading and input field", () => {
    render(<SearchInput onSearch={() => {}} />);
    expect(screen.getByText(/find your modem/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\./i)).toBeInTheDocument();
  });

  it("calls onSearch with input value on submit", async () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);

    await userEvent.type(screen.getByPlaceholderText(/e\.g\./i), "TP-Link Archer");
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(onSearch).toHaveBeenCalledWith("TP-Link Archer");
  });

  it("does not submit when input is empty", async () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);

    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("submits on Enter key", async () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(/e\.g\./i);
    await userEvent.type(input, "Netgear{Enter}");

    expect(onSearch).toHaveBeenCalledWith("Netgear");
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run tests/components/SearchInput.test.tsx
```

- [ ] **Step 3: Implement SearchInput**

Create `src/components/SearchInput.tsx`:

```tsx
import { useState, type FormEvent } from "react";

interface SearchInputProps {
  onSearch: (query: string) => void;
}

export function SearchInput({ onSearch }: SearchInputProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-brand-700">
          Find your modem's model name/number
        </h2>
        <p className="text-sm text-gray-500">
          Check the sticker on the back or bottom of your device.
        </p>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. TP-Link Archer VR1600v"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      />

      <button
        type="submit"
        className="w-full rounded-full bg-brand-500 py-3 text-base font-semibold text-white hover:bg-brand-600 active:bg-brand-700"
      >
        Continue
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx vitest run tests/components/SearchInput.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/SearchInput.tsx tests/components/SearchInput.test.tsx
git commit -m "feat: add SearchInput component with form submission"
```

---

### Task 8: LoadingState component

**Files:**
- Create: `src/components/LoadingState.tsx`
- Test: `tests/components/LoadingState.test.tsx`

- [ ] **Step 1: Write test**

Create `tests/components/LoadingState.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingState } from "../../src/components/LoadingState";

describe("LoadingState", () => {
  it("renders loading text", () => {
    render(<LoadingState />);
    expect(screen.getByText(/finding your modem/i)).toBeInTheDocument();
  });

  it("has a spinner with accessible role", () => {
    render(<LoadingState />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run tests/components/LoadingState.test.tsx
```

- [ ] **Step 3: Implement LoadingState**

Create `src/components/LoadingState.tsx`:

```tsx
export function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-4 py-12" role="status">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      <p className="text-lg font-medium text-gray-600">Finding your modem...</p>
    </div>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx vitest run tests/components/LoadingState.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/LoadingState.tsx tests/components/LoadingState.test.tsx
git commit -m "feat: add LoadingState component"
```

---

### Task 9: ResultCard component

**Files:**
- Create: `src/components/ResultCard.tsx`, `src/components/ConditionList.tsx`
- Test: `tests/components/ResultCard.test.tsx`, `tests/components/ConditionList.test.tsx`

- [ ] **Step 1: Write ConditionList test**

Create `tests/components/ConditionList.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConditionList } from "../../src/components/ConditionList";

describe("ConditionList", () => {
  it("renders labels for each condition code", () => {
    render(<ConditionList conditions={["SWITCH_TO_IPOE", "WAN_PORT_LIMIT"]} />);
    expect(screen.getByText("Reconfigure to IPoE")).toBeInTheDocument();
    expect(screen.getByText("WAN port speed bottleneck")).toBeInTheDocument();
  });

  it("renders nothing when conditions is empty", () => {
    const { container } = render(<ConditionList conditions={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 2: Write ResultCard test**

Create `tests/components/ResultCard.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultCard } from "../../src/components/ResultCard";
import type { Modem, TechType } from "../../src/types";

const makeModem = (overrides: Partial<Modem> = {}): Modem => ({
  id: "test",
  brand: "TP-Link",
  model: "Archer VR1600v",
  alternative_names: null,
  device_type: "modem_router",
  isp_provided_by: null,
  is_isp_locked: false,
  compatibility: {
    fttp: { status: "yes", conditions: [] },
    fttc: { status: "yes", conditions: [] },
    fttn: { status: "yes", conditions: [] },
    hfc: { status: "yes", conditions: [] },
  },
  wan: { has_vdsl2_modem: true, wan_port_speed_mbps: 1000 },
  wifi: { wifi_standard: "Wi-Fi 5", wifi_generation: 5, bands: [], max_speed_mbps: { theoretical_combined: 0, per_band: {} } },
  general: { release_year: null, still_sold: false, end_of_life: false, manufacturer_url: null },
  ...overrides,
});

describe("ResultCard", () => {
  it("shows compatible heading for yes status", () => {
    render(<ResultCard modem={makeModem()} techType="fttp" />);
    expect(screen.getByText("Compatible with Belong nbn")).toBeInTheDocument();
  });

  it("shows incompatible heading for no status", () => {
    const modem = makeModem({
      compatibility: {
        fttp: { status: "no", conditions: [] },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "yes", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
    });
    render(<ResultCard modem={modem} techType="fttp" />);
    expect(screen.getByText("Not compatible with Belong nbn")).toBeInTheDocument();
  });

  it("shows conditions for yes_but status", () => {
    const modem = makeModem({
      compatibility: {
        fttp: { status: "yes_but", conditions: ["SWITCH_TO_IPOE"] },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "yes", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
    });
    render(<ResultCard modem={modem} techType="fttp" />);
    expect(screen.getByText("Compatible with some requirements")).toBeInTheDocument();
    expect(screen.getByText("Reconfigure to IPoE")).toBeInTheDocument();
  });

  it("displays modem brand and model", () => {
    render(<ResultCard modem={makeModem()} techType="fttp" />);
    expect(screen.getByText("TP-Link")).toBeInTheDocument();
    expect(screen.getByText("Archer VR1600v")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests — expect FAIL**

```bash
npx vitest run tests/components/ConditionList.test.tsx tests/components/ResultCard.test.tsx
```

- [ ] **Step 4: Implement ConditionList**

Create `src/components/ConditionList.tsx`:

```tsx
import { CONDITION_LABELS } from "../constants";
import type { ConditionCode } from "../types";

interface ConditionListProps {
  conditions: ConditionCode[];
}

export function ConditionList({ conditions }: ConditionListProps) {
  if (conditions.length === 0) return null;

  return (
    <ul className="flex flex-col gap-3">
      {conditions.map((code) => {
        const info = CONDITION_LABELS[code];
        return (
          <li key={code} className="rounded-xl bg-gray-50 p-3">
            <p className="text-sm font-semibold text-gray-800">{info.label}</p>
            <p className="text-sm text-gray-500">{info.description}</p>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 5: Implement ResultCard**

Create `src/components/ResultCard.tsx`:

```tsx
import { STATUS_CONFIG } from "../constants";
import { ConditionList } from "./ConditionList";
import type { Modem, TechType } from "../types";

interface ResultCardProps {
  modem: Modem;
  techType: TechType;
}

export function ResultCard({ modem, techType }: ResultCardProps) {
  const compat = modem.compatibility[techType];
  const config = STATUS_CONFIG[compat.status];

  return (
    <div className="flex flex-col gap-5">
      <div className={`rounded-2xl ${config.bgColor} p-4 text-center`}>
        <p className={`text-lg font-bold ${config.color}`}>{config.heading}</p>
      </div>

      <div className="rounded-2xl bg-gray-50 p-4">
        <p className="text-sm text-gray-500">{modem.brand}</p>
        <p className="text-base font-semibold text-gray-900">{modem.model}</p>
      </div>

      <ConditionList conditions={compat.conditions} />
    </div>
  );
}
```

- [ ] **Step 6: Run tests — expect PASS**

```bash
npx vitest run tests/components/ConditionList.test.tsx tests/components/ResultCard.test.tsx
```

- [ ] **Step 7: Commit**

```bash
git add src/components/ResultCard.tsx src/components/ConditionList.tsx tests/components/ResultCard.test.tsx tests/components/ConditionList.test.tsx
git commit -m "feat: add ResultCard and ConditionList components"
```

---

### Task 10: MultipleMatches component

**Files:**
- Create: `src/components/MultipleMatches.tsx`
- Test: `tests/components/MultipleMatches.test.tsx`

- [ ] **Step 1: Write test**

Create `tests/components/MultipleMatches.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MultipleMatches } from "../../src/components/MultipleMatches";
import type { Modem } from "../../src/types";

const makeModem = (id: string, model: string): Modem => ({
  id, brand: "TP-Link", model,
  alternative_names: null, device_type: "modem_router",
  isp_provided_by: null, is_isp_locked: false,
  compatibility: {
    fttp: { status: "yes", conditions: [] },
    fttc: { status: "yes", conditions: [] },
    fttn: { status: "yes", conditions: [] },
    hfc: { status: "yes", conditions: [] },
  },
  wan: { has_vdsl2_modem: true, wan_port_speed_mbps: 1000 },
  wifi: { wifi_standard: "Wi-Fi 5", wifi_generation: 5, bands: [], max_speed_mbps: { theoretical_combined: 0, per_band: {} } },
  general: { release_year: null, still_sold: false, end_of_life: false, manufacturer_url: null },
});

const modems = [makeModem("a", "Archer VR1600v"), makeModem("b", "Archer C7")];

describe("MultipleMatches", () => {
  it("renders heading and all modem options", () => {
    render(<MultipleMatches modems={modems} onSelect={() => {}} onBack={() => {}} />);
    expect(screen.getByText(/multiple matches/i)).toBeInTheDocument();
    expect(screen.getByText("Archer VR1600v")).toBeInTheDocument();
    expect(screen.getByText("Archer C7")).toBeInTheDocument();
  });

  it("Continue button is disabled until a modem is selected", () => {
    render(<MultipleMatches modems={modems} onSelect={() => {}} onBack={() => {}} />);
    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();
  });

  it("calls onSelect with chosen modem on Continue", async () => {
    const onSelect = vi.fn();
    render(<MultipleMatches modems={modems} onSelect={onSelect} onBack={() => {}} />);

    await userEvent.click(screen.getByText("Archer C7"));
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(onSelect).toHaveBeenCalledWith(modems[1]);
  });

  it("calls onBack when back button clicked", async () => {
    const onBack = vi.fn();
    render(<MultipleMatches modems={modems} onSelect={() => {}} onBack={onBack} />);

    await userEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run tests/components/MultipleMatches.test.tsx
```

- [ ] **Step 3: Implement MultipleMatches**

Create `src/components/MultipleMatches.tsx`:

```tsx
import { useState } from "react";
import type { Modem } from "../types";

interface MultipleMatchesProps {
  modems: Modem[];
  onSelect: (modem: Modem) => void;
  onBack: () => void;
}

export function MultipleMatches({ modems, onSelect, onBack }: MultipleMatchesProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleContinue = () => {
    const modem = modems.find((m) => m.id === selectedId);
    if (modem) onSelect(modem);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-brand-700">Multiple matches found</h2>
        <p className="text-sm text-gray-500">Select your exact modem model to continue.</p>
      </div>

      <div className="flex flex-col gap-2">
        {modems.map((modem) => (
          <button
            key={modem.id}
            onClick={() => setSelectedId(modem.id)}
            className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
              selectedId === modem.id
                ? "border-brand-500 bg-brand-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                selectedId === modem.id ? "border-brand-500" : "border-gray-300"
              }`}
            >
              {selectedId === modem.id && (
                <div className="h-2.5 w-2.5 rounded-full bg-brand-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{modem.model}</p>
              <p className="text-xs text-gray-500">{modem.brand}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-full border-2 border-brand-500 py-3 text-sm font-semibold text-brand-500 hover:bg-brand-50"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedId}
          className="flex-1 rounded-full bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx vitest run tests/components/MultipleMatches.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/MultipleMatches.tsx tests/components/MultipleMatches.test.tsx
git commit -m "feat: add MultipleMatches selection component"
```

---

### Task 11: NoMatch component

**Files:**
- Create: `src/components/NoMatch.tsx`
- Test: `tests/components/NoMatch.test.tsx`

- [ ] **Step 1: Write test**

Create `tests/components/NoMatch.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NoMatch } from "../../src/components/NoMatch";

describe("NoMatch", () => {
  it("renders no-match heading", () => {
    render(<NoMatch query="xyz modem" onRetry={() => {}} />);
    expect(screen.getByText(/no modem found/i)).toBeInTheDocument();
  });

  it("shows the query that failed", () => {
    render(<NoMatch query="xyz modem" onRetry={() => {}} />);
    expect(screen.getByText(/xyz modem/i)).toBeInTheDocument();
  });

  it("calls onRetry when Try again clicked", async () => {
    const onRetry = vi.fn();
    render(<NoMatch query="test" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run tests/components/NoMatch.test.tsx
```

- [ ] **Step 3: Implement NoMatch**

Create `src/components/NoMatch.tsx`:

```tsx
interface NoMatchProps {
  query: string;
  onRetry: () => void;
}

export function NoMatch({ query, onRetry }: NoMatchProps) {
  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-800">No modem found</h2>
        <p className="text-sm text-gray-500">
          We couldn't find a match for "<span className="font-medium text-gray-700">{query}</span>".
          Double-check the spelling or the sticker on your device.
        </p>
      </div>

      <button
        onClick={onRetry}
        className="w-full rounded-full bg-brand-500 py-3 text-base font-semibold text-white hover:bg-brand-600"
      >
        Try again
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx vitest run tests/components/NoMatch.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/NoMatch.tsx tests/components/NoMatch.test.tsx
git commit -m "feat: add NoMatch component"
```

---

## Chunk 3: Integration

### Task 12: BaseScreen component

**Files:**
- Create: `src/components/BaseScreen.tsx`
- Test: `tests/components/BaseScreen.test.tsx`

- [ ] **Step 1: Write test**

Create `tests/components/BaseScreen.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BaseScreen } from "../../src/components/BaseScreen";

describe("BaseScreen", () => {
  it("renders radio options", () => {
    render(<BaseScreen onCheckModem={() => {}} verifiedModem={null} />);
    expect(screen.getByText(/yes, I have a Belong modem/i)).toBeInTheDocument();
    expect(screen.getByText(/no, I have my own/i)).toBeInTheDocument();
  });

  it("shows Check my modem button only when BYO selected", async () => {
    render(<BaseScreen onCheckModem={() => {}} verifiedModem={null} />);
    expect(screen.queryByRole("button", { name: /check my modem/i })).not.toBeInTheDocument();

    await userEvent.click(screen.getByText(/no, I have my own/i));
    expect(screen.getByRole("button", { name: /check my modem/i })).toBeInTheDocument();
  });

  it("calls onCheckModem when button clicked", async () => {
    const onCheckModem = vi.fn();
    render(<BaseScreen onCheckModem={onCheckModem} verifiedModem={null} />);

    await userEvent.click(screen.getByText(/no, I have my own/i));
    await userEvent.click(screen.getByRole("button", { name: /check my modem/i }));
    expect(onCheckModem).toHaveBeenCalledOnce();
  });

  it("shows verified modem text when provided", () => {
    render(
      <BaseScreen
        onCheckModem={() => {}}
        verifiedModem={{ brand: "TP-Link", model: "Archer VR1600v" }}
      />
    );
    expect(screen.getByText(/verified.*compatible/i)).toBeInTheDocument();
    expect(screen.getByText(/Archer VR1600v/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run tests/components/BaseScreen.test.tsx
```

- [ ] **Step 3: Implement BaseScreen**

Create `src/components/BaseScreen.tsx`:

```tsx
import { useState } from "react";

interface BaseScreenProps {
  onCheckModem: () => void;
  verifiedModem: { brand: string; model: string } | null;
}

export function BaseScreen({ onCheckModem, verifiedModem }: BaseScreenProps) {
  const [selection, setSelection] = useState<"belong" | "byo" | null>(
    verifiedModem ? "byo" : null
  );

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-900">Modem selection</h2>
      <p className="text-sm text-gray-600">Do you rent a Belong modem?</p>

      <div className="flex flex-col gap-2">
        <label
          className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 ${
            selection === "belong" ? "border-brand-500 bg-brand-50" : "border-gray-200"
          }`}
        >
          <input
            type="radio"
            name="modem-choice"
            value="belong"
            checked={selection === "belong"}
            onChange={() => setSelection("belong")}
            className="sr-only"
          />
          <div
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
              selection === "belong" ? "border-brand-500" : "border-gray-300"
            }`}
          >
            {selection === "belong" && <div className="h-2.5 w-2.5 rounded-full bg-brand-500" />}
          </div>
          <span className="text-sm font-medium text-gray-900">Yes, I have a Belong modem</span>
        </label>

        <label
          className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 ${
            selection === "byo" ? "border-brand-500 bg-brand-50" : "border-gray-200"
          }`}
        >
          <input
            type="radio"
            name="modem-choice"
            value="byo"
            checked={selection === "byo"}
            onChange={() => setSelection("byo")}
            className="sr-only"
          />
          <div
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
              selection === "byo" ? "border-brand-500" : "border-gray-300"
            }`}
          >
            {selection === "byo" && <div className="h-2.5 w-2.5 rounded-full bg-brand-500" />}
          </div>
          <span className="text-sm font-medium text-gray-900">No, I have my own compatible modem</span>
        </label>
      </div>

      {selection === "byo" && (
        <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4">
          {verifiedModem ? (
            <p className="text-sm text-success-500 font-medium">
              You have verified your modem is compatible. ({verifiedModem.brand} {verifiedModem.model})
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Check if your modem is compatible with Belong nbn before continuing.
              </p>
              <button
                onClick={onCheckModem}
                className="w-full rounded-full bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Check my modem
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx vitest run tests/components/BaseScreen.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/components/BaseScreen.tsx tests/components/BaseScreen.test.tsx
git commit -m "feat: add BaseScreen with modem selection radios"
```

---

### Task 13: ModemChecker root component — wire the full flow

**Files:**
- Create: `src/components/ModemChecker.tsx`
- Modify: `src/main.tsx`, `src/App.tsx`
- Create: `src/index.ts`

- [ ] **Step 1: Implement ModemChecker**

Create `src/components/ModemChecker.tsx`:

```tsx
import { useState, useCallback } from "react";
import { useModemSearch } from "../hooks/useModemSearch";
import { BaseScreen } from "./BaseScreen";
import { BottomSheet } from "./BottomSheet";
import { SearchInput } from "./SearchInput";
import { LoadingState } from "./LoadingState";
import { MultipleMatches } from "./MultipleMatches";
import { ResultCard } from "./ResultCard";
import { NoMatch } from "./NoMatch";
import type { TechType } from "../types";

interface ModemCheckerProps {
  techType: TechType;
}

export function ModemChecker({ techType }: ModemCheckerProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [verifiedModem, setVerifiedModem] = useState<{ brand: string; model: string } | null>(null);
  const { state, search, selectModem, reset } = useModemSearch();

  const openSheet = useCallback(() => {
    reset();
    setSheetOpen(true);
  }, [reset]);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
  }, []);

  const handleDone = useCallback(() => {
    if (state.step === "single_match") {
      const compat = state.modem.compatibility[techType];
      if (compat.status !== "no") {
        setVerifiedModem({ brand: state.modem.brand, model: state.modem.model });
      }
    }
    setSheetOpen(false);
  }, [state, techType]);

  const handleRetry = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="mx-auto w-full max-w-md font-sans">
      <BaseScreen onCheckModem={openSheet} verifiedModem={verifiedModem} />

      <BottomSheet open={sheetOpen} onClose={closeSheet}>
        {state.step === "idle" && <SearchInput onSearch={search} />}

        {state.step === "searching" && <LoadingState />}

        {state.step === "multiple_matches" && (
          <MultipleMatches
            modems={state.modems}
            onSelect={selectModem}
            onBack={handleRetry}
          />
        )}

        {state.step === "single_match" && (
          <div className="flex flex-col gap-5">
            <ResultCard modem={state.modem} techType={techType} />
            <button
              onClick={handleDone}
              className="w-full rounded-full bg-brand-500 py-3 text-base font-semibold text-white hover:bg-brand-600"
            >
              Done
            </button>
          </div>
        )}

        {state.step === "no_match" && (
          <NoMatch query={state.query} onRetry={handleRetry} />
        )}
      </BottomSheet>
    </div>
  );
}
```

- [ ] **Step 2: Create library entry point**

Create `src/index.ts`:

```ts
export { ModemChecker } from "./components/ModemChecker";
export type { TechType, Modem, CompatibilityStatus, ConditionCode } from "./types";
```

- [ ] **Step 3: Create dev App with tech type selector**

Replace `src/App.tsx`:

```tsx
import { useState } from "react";
import { ModemChecker } from "./components/ModemChecker";
import type { TechType } from "./types";

const TECH_TYPES: TechType[] = ["fttp", "fttc", "fttn", "hfc"];

export default function App() {
  const [techType, setTechType] = useState<TechType>("fttp");

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Dev-only tech type selector */}
      <div className="mx-auto mb-6 w-full max-w-md rounded-xl bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Dev: nbn tech type
        </p>
        <div className="flex gap-2">
          {TECH_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTechType(t)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                techType === t
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* The actual widget */}
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <ModemChecker techType={techType} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update main.tsx**

Replace `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 5: Run all tests**

```bash
npx vitest run
```

All tests should pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/ModemChecker.tsx src/index.ts src/App.tsx src/main.tsx
git commit -m "feat: wire ModemChecker root component with full bottom sheet flow"
```

---

### Task 14: Set up .env and smoke test

**Prerequisites:** Get the Supabase anon key from Jack.

- [ ] **Step 1: Create .env**

```bash
cp .env.example .env
```

Then edit `.env` and paste in the actual anon key.

- [ ] **Step 2: Run dev server**

```bash
npm run dev
```

- [ ] **Step 3: Manual smoke test**

Open in browser and verify:
1. Base screen shows radio buttons
2. Selecting "BYO" shows "Check my modem" button
3. Clicking it opens the bottom sheet
4. Searching "tp-link archer" returns results
5. Single/multiple match routing works
6. Result card shows correct compatibility status
7. "Done" dismisses sheet and shows verification text

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "chore: smoke test fixes"
```

---

### Task 15: Library build mode for embedding

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Add library build config**

Update `vite.config.ts`:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "ModemChecker",
      fileName: "modem-checker",
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    css: false,
  },
});
```

- [ ] **Step 2: Build and verify output**

```bash
npm run build
ls dist/
```

Should produce `modem-checker.es.js` and `modem-checker.umd.js`.

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "feat: add library build mode for widget embedding"
```

---

## Summary

| Chunk | Tasks | What it delivers |
|-------|-------|-----------------|
| 1: Foundation | 1–4 | Scaffold, types, constants, Supabase search — all tested |
| 2: UI Components | 5–11 | Hook + all UI screens — all tested independently |
| 3: Integration | 12–15 | Full wired flow, dev app, smoke test, library build |

**Total tasks:** 15
**Total commits:** ~15 (one per task)
**Test files:** 10 (types, constants, search, hook, 6 components)
