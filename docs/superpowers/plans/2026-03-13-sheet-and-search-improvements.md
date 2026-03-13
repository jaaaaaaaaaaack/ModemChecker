# Sheet & Search Improvements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the white border, add animated responsive sheet (bottom on mobile, side on desktop), and implement forgiving two-tier search with trigram fallback.

**Architecture:** BottomSheet becomes a Radix Dialog wrapper with CSS keyframe animations and an internal `mounted` state for exit transitions. Search gains a second tier — if FTS returns zero results, an RPC call to a `pg_trgm` similarity function provides fuzzy matching. Both changes are in code-only/data-layer files, exempt from Subframe workflow.

**Tech Stack:** React 19, Radix Dialog (already installed via @subframe/core), Tailwind CSS 4, Supabase (Postgres with pg_trgm), Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-03-13-sheet-and-search-improvements-design.md`

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/lib/search.ts` | Modify | Two-tier search: FTS first, trigram RPC fallback |
| `src/hooks/useModemSearch.ts` | Modify | Log errors to console.error instead of swallowing |
| `src/components/BottomSheet.tsx` | Rewrite | Radix Dialog wrapper, responsive layout, CSS animations |
| `src/index.css` | Modify | Add keyframe animations + body/root reset |
| `tests/lib/search.test.ts` | Rewrite | Test both tiers, error logging |
| `tests/components/BottomSheet.test.tsx` | Rewrite | Radix Dialog-based tests |
| `supabase/migrations/001_fuzzy_search.sql` | Create | pg_trgm extension, RPC function, GIN index |

No changes to: `ModemChecker.tsx` (BottomSheet API stays `open`/`onClose`/`children`), any Subframe components, types, or constants.

---

## Chunk 1: Search Improvements

### Task 1: Validate trigram threshold against live data

Before writing any code, confirm the 0.15 similarity threshold works with the real 70-modem dataset.

**Files:**
- Create: `supabase/migrations/001_fuzzy_search.sql` (threshold validation queries first, migration later)

- [ ] **Step 1: Enable pg_trgm and run threshold test queries**

Run these in the Supabase SQL Editor (Dashboard → SQL Editor → New Query) for project `mgkdulkdngifkzpgzofk`:

```sql
-- Step 1: Enable the extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step 2: Test similarity scores for known tricky queries
SELECT brand, model,
  similarity(
    lower(brand || ' ' || model || ' ' || coalesce(array_to_string(alternative_names, ' '), '')),
    lower('Ero 6')
  ) AS score
FROM modems ORDER BY score DESC LIMIT 5;
```

Repeat with: `'TPLink'`, `'eero'`, `'netgear nighthawk'`, `'tp link archer'`.

Expected: legitimate matches should score above 0.15. If not, lower the threshold.

- [ ] **Step 2: Record results and decide threshold**

Note the scores. If all legitimate matches are above 0.15, keep it. Otherwise adjust. Save the chosen threshold for Task 3.

- [ ] **Step 3: Run the full migration**

Run in Supabase SQL Editor:

```sql
-- Fuzzy search RPC function
CREATE OR REPLACE FUNCTION search_modems_fuzzy(
  query_text TEXT,
  max_results INT DEFAULT 10
)
RETURNS SETOF modems
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM modems
  WHERE similarity(
    lower(brand || ' ' || model || ' ' || coalesce(array_to_string(alternative_names, ' '), '')),
    lower(query_text)
  ) > 0.15
  ORDER BY similarity(
    lower(brand || ' ' || model || ' ' || coalesce(array_to_string(alternative_names, ' '), '')),
    lower(query_text)
  ) DESC
  LIMIT max_results;
$$;

-- GIN index for trigram queries
CREATE INDEX IF NOT EXISTS idx_modems_trgm ON modems
USING gin (
  (lower(brand || ' ' || model || ' ' || coalesce(array_to_string(alternative_names, ' '), '')))
  gin_trgm_ops
);
```

Replace `0.15` with the validated threshold from Step 2 if different.

- [ ] **Step 4: Verify the RPC function works**

Run in Supabase SQL Editor:

```sql
SELECT brand, model FROM search_modems_fuzzy('Ero 6', 10);
-- Expected: should return Amazon Eero 6+ (and possibly other Eero models)

SELECT brand, model FROM search_modems_fuzzy('TPLink', 10);
-- Expected: should return TP-Link modems
```

- [ ] **Step 5: Save the migration file locally**

```bash
mkdir -p supabase/migrations
```

Save the full SQL (extension + function + index) to `supabase/migrations/001_fuzzy_search.sql` for reference. This was already executed against the live DB in Steps 1-4.

- [ ] **Step 6: Commit the migration file**

```bash
git add supabase/migrations/001_fuzzy_search.sql
git commit -m "chore: add fuzzy search migration (pg_trgm + RPC function)"
```

### Task 2: Write failing tests for two-tier search

**Files:**
- Rewrite: `tests/lib/search.test.ts`

- [ ] **Step 1: Rewrite the search test file with two-tier mock structure**

The existing mock only handles `from().select().textSearch().limit()`. We need to also mock `supabase.rpc()` for the trigram fallback.

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Modem } from "../../src/types";

// Mock supabase before importing search
vi.mock("../../src/lib/supabase", () => {
  const mockLimit = vi.fn();
  const mockTextSearch = vi.fn(() => ({ limit: mockLimit }));
  const mockSelect = vi.fn(() => ({ textSearch: mockTextSearch }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  const mockRpc = vi.fn();

  return {
    supabase: { from: mockFrom, rpc: mockRpc },
    __mocks: { mockFrom, mockSelect, mockTextSearch, mockLimit, mockRpc },
  };
});

import { searchModems } from "../../src/lib/search";
import { __mocks } from "../../src/lib/supabase";

const { mockLimit, mockRpc } = __mocks as {
  mockFrom: ReturnType<typeof vi.fn>;
  mockSelect: ReturnType<typeof vi.fn>;
  mockTextSearch: ReturnType<typeof vi.fn>;
  mockLimit: ReturnType<typeof vi.fn>;
  mockRpc: ReturnType<typeof vi.fn>;
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

  it("returns modems from FTS when results found", async () => {
    mockLimit.mockResolvedValue({ data: [fakeModem], error: null });

    const result = await searchModems("tp-link archer");
    expect(result).toEqual([fakeModem]);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("falls back to trigram RPC when FTS returns empty", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });
    mockRpc.mockResolvedValue({ data: [fakeModem], error: null });

    const result = await searchModems("tplink archer");
    expect(mockRpc).toHaveBeenCalledWith("search_modems_fuzzy", {
      query_text: "tplink archer",
      max_results: 10,
    });
    expect(result).toEqual([fakeModem]);
  });

  it("returns empty array when both tiers find nothing", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });
    mockRpc.mockResolvedValue({ data: [], error: null });

    const result = await searchModems("zzzznotamodem");
    expect(mockRpc).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("throws on FTS error and does not fall back", async () => {
    mockLimit.mockResolvedValue({ data: null, error: { message: "DB error" } });

    await expect(searchModems("test")).rejects.toThrow("DB error");
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("throws on trigram RPC error", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });
    mockRpc.mockResolvedValue({ data: null, error: { message: "RPC error" } });

    await expect(searchModems("tplink")).rejects.toThrow("RPC error");
  });

  it("trims and rejects empty queries", async () => {
    const result = await searchModems("   ");
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib/search.test.ts`

Expected: 3 tests fail — "falls back to trigram RPC", "returns empty array when both tiers find nothing", and "throws on trigram RPC error" — because `searchModems` doesn't call `rpc()` yet. The FTS, FTS-error, and empty-query tests should still pass.

### Task 3: Implement two-tier search

**Files:**
- Modify: `src/lib/search.ts`

- [ ] **Step 1: Replace search.ts with two-tier implementation**

```typescript
import { supabase } from "./supabase";
import type { Modem } from "../types";

const SEARCH_COLUMNS = "id, brand, model, alternative_names, device_type, isp_provided_by, is_isp_locked, compatibility, wan, wifi, general";

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
  if (ftsData && ftsData.length > 0) return ftsData as Modem[];

  // Tier 2: Trigram similarity fallback
  const { data: fuzzyData, error: fuzzyError } = await supabase.rpc(
    "search_modems_fuzzy",
    { query_text: trimmed, max_results: 10 }
  );

  if (fuzzyError) throw new Error(fuzzyError.message);
  return (fuzzyData as Modem[]) ?? [];
}
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npx vitest run tests/lib/search.test.ts`

Expected: All 6 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/search.ts tests/lib/search.test.ts
git commit -m "feat: add trigram similarity fallback when FTS returns no results"
```

### Task 4: Fix error handling in useModemSearch

**Files:**
- Modify: `src/hooks/useModemSearch.ts`
- Modify: `tests/hooks/useModemSearch.test.ts`

- [ ] **Step 1: Add console.error logging to the catch block**

Replace the `catch` block in `useModemSearch.ts`:

```typescript
// Before:
    } catch {
      setState({ step: "no_match", query });
    }

// After:
    } catch (error) {
      console.error("[ModemChecker] Search failed:", error);
      setState({ step: "no_match", query });
    }
```

- [ ] **Step 2: Add a test for console.error logging**

Add this test to `tests/hooks/useModemSearch.test.ts` (inside the existing `describe` block):

```typescript
it("logs error to console.error on search failure", async () => {
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const searchError = new Error("Network error");
  mockSearchModems.mockRejectedValue(searchError);

  const { result } = renderHook(() => useModemSearch());

  await act(async () => {
    await result.current.search("test");
  });

  expect(consoleSpy).toHaveBeenCalledWith(
    "[ModemChecker] Search failed:",
    searchError
  );
  expect(result.current.state).toEqual({ step: "no_match", query: "test" });
  consoleSpy.mockRestore();
});
```

Note: Check the existing test file for the mock variable name (`mockSearchModems` or similar) and the `renderHook`/`act` imports — adapt accordingly.

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`

Expected: All tests pass, including the new console.error spy test.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useModemSearch.ts tests/hooks/useModemSearch.test.ts
git commit -m "fix: log search errors to console instead of swallowing silently"
```

---

## Chunk 2: Responsive Sheet

### Task 5: Add CSS keyframe animations and body reset

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add keyframes and body reset to index.css**

```css
@import "tailwindcss";
@import "./ui/theme.css";

/* Reset default margins for embedded widget */
body, #root {
  margin: 0;
  padding: 0;
}

/* Sheet overlay animations */
@keyframes overlay-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes overlay-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Bottom sheet animations (mobile) */
@keyframes sheet-slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes sheet-slide-down {
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
}

/* Side sheet animations (desktop) */
@keyframes sheet-slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes sheet-slide-out-right {
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/index.css
git commit -m "style: add sheet animation keyframes and body margin reset"
```

### Task 6: Write failing tests for new BottomSheet

**Files:**
- Rewrite: `tests/components/BottomSheet.test.tsx`

- [ ] **Step 1: Rewrite BottomSheet tests for Radix Dialog**

Radix Dialog renders into a Portal, uses `role="dialog"`, and manages focus/a11y automatically. The tests verify behavior through Radix's public API rather than implementation details.

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BottomSheet } from "../../src/components/BottomSheet";

describe("BottomSheet", () => {
  it("does not render when initially closed", () => {
    render(
      <BottomSheet open={false} onClose={() => {}}>
        <p>Sheet content</p>
      </BottomSheet>
    );
    expect(screen.queryByText("Sheet content")).not.toBeInTheDocument();
  });

  it("renders children when open", () => {
    render(
      <BottomSheet open onClose={() => {}}>
        <p>Sheet content</p>
      </BottomSheet>
    );
    expect(screen.getByText("Sheet content")).toBeInTheDocument();
  });

  it("has dialog role and aria-modal", () => {
    render(
      <BottomSheet open onClose={() => {}}>
        <p>Content</p>
      </BottomSheet>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("has an accessible title (sr-only)", () => {
    render(
      <BottomSheet open onClose={() => {}}>
        <p>Content</p>
      </BottomSheet>
    );
    // Radix Dialog requires a Title — ours is visually hidden but present
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby");
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

  it("calls onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose}>
        <p>Content</p>
      </BottomSheet>
    );
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when overlay is clicked", async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose}>
        <p>Content</p>
      </BottomSheet>
    );
    await userEvent.click(screen.getByTestId("sheet-overlay"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/components/BottomSheet.test.tsx`

Expected: All 7 tests fail because the current BottomSheet doesn't use Radix Dialog.

### Task 7: Rewrite BottomSheet with Radix Dialog

**Files:**
- Rewrite: `src/components/BottomSheet.tsx`

- [ ] **Step 1: Replace BottomSheet.tsx with Radix Dialog implementation**

```tsx
import { useEffect, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  // Stay mounted during exit animation
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  if (!mounted) return null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <Dialog.Portal forceMount>
        <Dialog.Overlay
          forceMount
          data-testid="sheet-overlay"
          className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-[overlay-fade-in_300ms_ease-out] data-[state=closed]:animate-[overlay-fade-out_200ms_ease-in]"
        />
        <Dialog.Content
          forceMount
          onAnimationEnd={() => {
            if (!open) setMounted(false);
          }}
          className={[
            // Base
            "fixed z-50 bg-white shadow-xl overflow-y-auto outline-none",
            // Mobile: bottom sheet
            "inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl p-5 pb-8",
            "data-[state=open]:animate-[sheet-slide-up_300ms_ease-out]",
            "data-[state=closed]:animate-[sheet-slide-down_200ms_ease-in]",
            // Desktop: side sheet
            "md:inset-y-0 md:right-0 md:left-auto",
            "md:w-[480px] md:max-h-none md:rounded-none md:p-6",
            "md:data-[state=open]:animate-[sheet-slide-in-right_300ms_ease-out]",
            "md:data-[state=closed]:animate-[sheet-slide-out-right_200ms_ease-in]",
          ].join(" ")}
        >
          <Dialog.Title className="sr-only">Modem search</Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

Key decisions:
- **API stays the same:** `open`, `onClose`, `children` — `ModemChecker.tsx` doesn't need changes.
- **`mounted` state:** Keeps Portal in DOM during exit animation. `onAnimationEnd` unmounts after exit completes.
- **Responsive via Tailwind `md:` prefix:** Mobile styles are default, desktop overrides at 768px.
- **`forceMount` on Portal, Overlay, Content:** All three stay in DOM during exit so CSS animations can play.
- **`data-[state]` selectors:** Radix sets `data-state="open"` or `data-state="closed"` automatically.

- [ ] **Step 2: Run BottomSheet tests**

Run: `npx vitest run tests/components/BottomSheet.test.tsx`

Expected: All 7 tests PASS.

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`

Expected: All 48+ tests pass. The `ModemChecker.test.tsx` tests should also pass since the BottomSheet API (`open`/`onClose`/`children`) is unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/components/BottomSheet.tsx tests/components/BottomSheet.test.tsx
git commit -m "feat: rewrite BottomSheet as responsive Radix Dialog with animations

Bottom sheet on mobile (<768px), side sheet on desktop (>=768px).
Scrim fades in/out, sheet slides up/in with CSS keyframes.
Focus trap, Escape close, scroll lock via Radix Dialog."
```

### Task 8: Verify in browser

**Files:** None (manual verification)

- [ ] **Step 1: Open the dev server**

Run: `npm run dev` (should already be running on http://localhost:5173/)

- [ ] **Step 2: Test the sheet animation**

1. Click "Check Modem" — sheet should slide up (mobile viewport) or slide in from right (desktop viewport)
2. Scrim should fade in (not appear instantly)
3. Click the ✕ or press Escape — sheet should slide out, scrim should fade out
4. Click the scrim — sheet should close with animation
5. Resize browser to cross the 768px breakpoint — layout should switch between bottom sheet and side sheet

- [ ] **Step 3: Test the search**

1. Type "Eero 6" → should find "Amazon Eero 6+" (FTS tier)
2. Type "eero" → should find 4 Eero modems (FTS tier)
3. Type "TPLink" (no hyphen/space) → should find TP-Link modems (trigram fallback)
4. Type "Ero 6" (typo) → should find Eero modems (trigram fallback)
5. Type "zzzzz" → should show "no modems found"
6. Open browser dev tools console — no silent errors should appear for valid queries

- [ ] **Step 4: Check for white border**

1. On desktop, the side sheet should be flush to the right edge of the viewport — no white gap
2. On mobile, the bottom sheet should be full width — no side gaps
3. No white border around the overall widget from body/root margins

- [ ] **Step 5: Check accessibility**

1. When sheet opens, focus should move into the sheet
2. Tab through the sheet — focus should be trapped (doesn't go behind the scrim)
3. Escape closes the sheet
4. After closing, focus returns to the "Check Modem" button
