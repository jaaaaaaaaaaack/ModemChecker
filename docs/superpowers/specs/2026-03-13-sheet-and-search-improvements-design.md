# Sheet & Search Improvements — Design Spec

**Date:** 2026-03-13
**Status:** Approved

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
| ≥ 768px (desktop) | Side sheet — full height, fixed width (~480px), anchored to right edge, no rounded corners | Slides in from right (`translateX(100%)` → `translateX(0)`) |

### Animation

- **Duration:** ~300ms ease-out for enter, ~200ms ease-in for exit
- **Scrim:** `Dialog.Overlay` fades opacity from 0 to `bg-black/40` on enter, reverses on exit
- **Sheet body:** CSS transition on `transform` property
- **Implementation:** Use `data-[state=open]` / `data-[state=closed]` attributes from Radix to drive CSS transitions. Use `forceMount` on Overlay and Content to keep them in DOM during exit animations, with `onAnimationEnd` or transition-based unmounting.

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
- Concatenates `brand || ' ' || model || ' ' || coalesce(alternative_names, '')` into a searchable string
- Ranks by `similarity()` score, filters by threshold (~0.15 to be forgiving)
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
    lower(brand || ' ' || model || ' ' || coalesce(alternative_names, '')),
    lower(query_text)
  ) > 0.15
  ORDER BY similarity(
    lower(brand || ' ' || model || ' ' || coalesce(alternative_names, '')),
    lower(query_text)
  ) DESC
  LIMIT max_results;
$$;
```

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
- All visual child components (SearchInput, MultipleMatches, ResultCard, etc.) remain Subframe-managed and unchanged.

## Testing Strategy

- **BottomSheet:** Test open/close callbacks, Escape key handling, scrim click, `aria-modal` presence. Animation is CSS-only and not unit-testable.
- **Search:** Test FTS-first-then-trigram fallback logic. Mock Supabase responses for both tiers. Test error logging.
- **Integration:** Manual verification in browser — animation smoothness, responsive breakpoint, search results for "Eero 6", "eero", "TPLink", typos.

## Dependencies

- `@radix-ui/react-dialog` — likely already installed via Subframe (uses Radix primitives). Verify, install if needed.
- `pg_trgm` Postgres extension — enable via Supabase SQL editor or migration.
