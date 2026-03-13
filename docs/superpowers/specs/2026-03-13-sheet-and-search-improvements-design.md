# Sheet & Search Improvements — Design Spec

**Date:** 2026-03-13
**Status:** Approved (post-review revision)

## Problem

Three issues identified during first visual QA:

1. White border/gap around the bottom sheet on desktop (caused by `max-w-md` centering)
2. Sheet appears/disappears instantly — no animation, no focus trapping, no scrim fade
3. Search returned "no modems found" for "Eero 6" despite the query working against Supabase directly — error was silently swallowed. Search also needs to be more forgiving of typos and formatting.

## 1. Responsive Sheet (Radix Dialog)

### Overview

Replace the current conditional-render `BottomSheet` with a Radix Dialog-based component that adapts between bottom sheet (mobile) and side sheet (desktop). BottomSheet is a code-only shell component, exempt from the Subframe design workflow.

### Responsive Behaviour

| Breakpoint | Layout | Animation |
|---|---|---|
| < 768px (mobile) | Bottom sheet — full width, rounded top corners (`rounded-t-3xl`), anchored to bottom | Slides up from below viewport (`translateY(100%)` → `translateY(0)`) |
| ≥ 768px (desktop) | Side sheet — full height, `w-[480px]`, anchored to right edge, no rounded corners | Slides in from right (`translateX(100%)` → `translateX(0)`) |

### Animation

- **Duration:** ~300ms ease-out for enter, ~200ms ease-in for exit
- **Scrim:** `Dialog.Overlay` fades opacity from 0 to `bg-black/40` on enter, reverses on exit
- **Sheet body:** CSS transition on `transform` property
- **Implementation:** Use `data-[state=open]` / `data-[state=closed]` attributes from Radix to drive CSS `@keyframes` animations. Both Overlay and Content use `forceMount` so they remain in the DOM during exit. The component manages an internal `visible` state: when `open` transitions to `false`, the exit animation plays via `data-[state=closed]` keyframes. An `onAnimationEnd` handler sets `visible = false`, which unmounts the Portal. This keeps animation control in CSS while React handles the mount/unmount lifecycle.

### Accessibility (from Radix Dialog)

- Focus trap: focus stays within sheet while open
- `Escape` key closes the sheet
- Scroll lock on `<body>` while open
- `aria-modal="true"` on the sheet
- Return focus to trigger element on close
- Scrim click closes the sheet
- Close button with `aria-label="Close"`

### Structure

```
Dialog.Root (open/onOpenChange)
├── Dialog.Portal
│   ├── Dialog.Overlay (scrim, fade animation)
│   └── Dialog.Content (sheet body, slide animation)
│       ├── Dialog.Close (close button)
│       ├── Dialog.Title (sr-only, for a11y)
│       └── {children} (scrollable content area)
```

### Scrolling

Sheet content area scrolls internally (`overflow-y: auto`) if content exceeds viewport. The sheet container itself stays fixed. On mobile, max height is `85vh` to keep scrim visible above.

## 2. Search: FTS + Trigram Fallback

### Current Behaviour

- Uses Postgres full-text search via `textSearch("search_vector", query, { type: "plain", config: "english" })`
- Returns up to 10 results
- Catches all errors and silently shows "no match" — no logging, no way to diagnose issues

### Problem

- FTS works for well-formed queries but fails on typos ("Ero 6"), formatting differences ("TPLink" vs "TP-Link"), and partial model names
- Error swallowing made a real error look like zero results during QA

### Design: Two-tier search

**Tier 1 — Full-text search (existing):**
- Keep `textSearch` on `search_vector` with `type: "plain"` and `config: "english"`
- Fast, handles stemming and word matching
- If results > 0, return immediately

**Tier 2 — Trigram similarity fallback:**
- Only invoked if Tier 1 returns 0 results
- Database-side RPC function `search_modems_fuzzy(query_text, max_results)`
- Uses `pg_trgm` extension for similarity matching
- Concatenates `brand || ' ' || model || ' ' || coalesce(array_to_string(alternative_names, ' '), '')` into a searchable string (`alternative_names` is `TEXT[]`, requires `array_to_string`)
- Ranks by `similarity()` score, filters by threshold (starting at 0.15 — validate against the 70-modem dataset before finalising; see Threshold Validation below)
- Returns top 10 results ordered by similarity descending

### Database Migration

```sql
-- Enable trigram extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

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

-- GIN index for trigram queries (70 rows today, but good practice for growth)
CREATE INDEX IF NOT EXISTS idx_modems_trgm ON modems
USING gin (
  (lower(brand || ' ' || model || ' ' || coalesce(array_to_string(alternative_names, ' '), '')))
  gin_trgm_ops
);
```

### Threshold Validation

Before finalising the 0.15 threshold, run these test queries against the live database:

```sql
-- Test queries to validate threshold
SELECT brand, model,
  similarity(
    lower(brand || ' ' || model || ' ' || coalesce(array_to_string(alternative_names, ' '), '')),
    lower('Ero 6')
  ) AS score
FROM modems ORDER BY score DESC LIMIT 5;

-- Repeat for: 'TPLink', 'eero', 'netgear nighthawk', 'tp link archer'
```

Adjust threshold if legitimate matches score below 0.15 or irrelevant matches score above it.

### Client-Side Changes

**`src/lib/search.ts`:**
- `searchModems(query)` tries FTS first
- If 0 results, calls `supabase.rpc('search_modems_fuzzy', { query_text: query, max_results: 10 })`
- Returns whichever produces results

**Error handling:**
- Remove silent `catch` that hides errors
- Log errors to `console.error` in development
- Still show "no match" to the user, but with the real error visible in dev tools
- In `useModemSearch`, differentiate between "no results" and "error" states if needed later (for now, both show NoMatch)

### Result Cap

- Stays at 10 for both tiers
- Broad queries (e.g., "TP-Link") return top 10 by FTS relevance
- UI does not need to handle unbounded result lists

## 3. White Border Fix

### Root Cause

The current `BottomSheet` has `max-w-md` (448px) which creates a centered narrow card on wider screens, with visible white gaps on either side against the dark scrim.

### Fix

This is resolved by the responsive sheet redesign:
- **Mobile:** Sheet is `w-full` (no max-width constraint), flush to screen edges
- **Desktop:** Sheet is a side sheet flush to the right viewport edge, full height

Additionally, verify that `body` and `#root` have no default margins/padding creating gaps. Add reset if needed:

```css
body, #root {
  margin: 0;
  padding: 0;
}
```

## Component Boundary

- `BottomSheet.tsx` — code-only shell (Radix Dialog wrapper, animation, responsive layout). **Exempt from Subframe workflow.**
- `src/lib/search.ts` — data layer, no UI. **Exempt from Subframe workflow.**
- All visual child components (SearchInput, MultipleMatches, ResultCard, NoMatch, etc.) remain Subframe-managed and unchanged. Their props interfaces (`NoMatch.query`, `NoMatch.onRetry`, etc.) are not affected by this spec.

## Testing Strategy

- **BottomSheet:** Existing tests (`BottomSheet.test.tsx`) must be **rewritten** — the switch from conditional rendering to Radix Dialog changes the DOM structure (Portal rendering, `Dialog.Overlay` replaces `data-testid="bottom-sheet-backdrop"`, `forceMount` means content is in DOM during exit). New tests cover: open/close via `onOpenChange`, Escape key, overlay click, `aria-modal` presence, focus trap behavior. Animation is CSS-only and not unit-testable.
- **Search:** Test FTS-first-then-trigram fallback logic. Mock Supabase responses for both tiers. Test error logging (`console.error` spy).
- **Integration:** Manual verification in browser — animation smoothness, responsive breakpoint at 768px, search results for "Eero 6", "eero", "TPLink", "Ero 6" (typo).

## Dependencies

- `@radix-ui/react-dialog` — check if re-exported from `@subframe/core`; if not, install directly. Do not assume Subframe bundles it.
- `pg_trgm` Postgres extension — enable via Supabase SQL editor or migration.
