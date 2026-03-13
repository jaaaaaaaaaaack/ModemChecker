# Reliability Improvements — Design Spec

**Date:** 2026-03-13
**Scope:** Error state in search state machine, request cancellation, Error Boundary

## Problem

The ModemChecker widget has three reliability gaps:

1. **Silent error masking** — When `searchModems()` throws (network failure, Supabase outage), the error is caught, logged to `console.error`, and the state silently transitions to `no_match`. The user sees "No modem found" with no indication that the search failed due to an error rather than a genuine lack of results.

2. **Race condition** — If a user triggers a second search before the first resolves, both promises race. There is no `AbortController`, no request ID tracking, and no staleness check. The first to resolve sets state, then the second overwrites it.

3. **No Error Boundary** — If any component throws during render (e.g., unexpected `null` from malformed data), the entire widget unmounts with no recovery path. For an embeddable widget running inside a host page, this is particularly risky.

## Design

### 1. New `error` step in SearchState

Add a new variant to the discriminated union in `src/types.ts`:

```typescript
export type SearchState =
  | { step: "idle" }
  | { step: "searching"; query: string }
  | { step: "single_match"; modem: Modem }
  | { step: "multiple_matches"; modems: Modem[] }
  | { step: "no_match"; query: string }
  | { step: "error"; query: string };
```

Design decisions:
- `query` is preserved so the error screen can offer a one-tap retry with the same query.
- Step ordinal for direction tracking: `error: 2` (same level as `no_match` — forward from `searching`).
- No error message string in state. The error UI shows a generic "Something went wrong" message. Supabase error messages are technical and not useful to end users. The original error is still logged to `console.error` for debugging.

### 2. AbortController in useModemSearch

Three changes to `src/hooks/useModemSearch.ts`:

**a) AbortController ref** — A `useRef<AbortController | null>` tracks the in-flight request. On every `search()` call, the previous controller is aborted and a new one created. The signal is passed to `searchModems()`.

**b) Aggressive cancellation** — `reset()` also aborts any in-flight request. Since `handleClose` in ModemChecker already calls `reset()`, closing the sheet mid-search automatically cancels the request.

**c) Error routing** — The catch block distinguishes `AbortError` (silently ignored — user moved on intentionally) from real errors (transition to `{ step: "error", query }`).

**d) New `retry` action** — Convenience method exposed from the hook that re-calls `search()` with the query from the current error state.

**e) Stale response guard** — After `await searchModems()` returns, check `controller.signal.aborted` before setting state. This prevents a completed-but-stale response from overwriting the current state if the controller was aborted between the await resolving and the state update executing.

### 3. searchModems signature change

`src/lib/search.ts` — `searchModems()` accepts an optional `AbortSignal` parameter:

```typescript
export async function searchModems(
  query: string,
  signal?: AbortSignal
): Promise<Modem[]>
```

The signal is passed to both Supabase calls (FTS and trigram) via the `.abortSignal(signal)` method on the Supabase query builder. When aborted, Supabase throws a `DOMException` with `name: "AbortError"`, which the hook's catch block handles.

### 4. SearchError component

New file: `src/components/SearchError.tsx`

This is a behavioral/text-only component (no complex visual design), exempt from the Subframe-first rule — same category as BottomSheet.

**Props:**
```typescript
interface SearchErrorProps {
  query: string;
  onRetry: () => void;
  onReset: () => void;
}
```

**Content:** Mirrors the structure of `NoMatch` for visual consistency within the sheet:
- Heading: "Something went wrong"
- Body: "We couldn't complete your search. Check your internet connection and try again."
- Two buttons pinned at bottom (follows existing `mt-auto` pattern):
  - "Try again" (brand-primary) → `onRetry` (retries same query)
  - "Start a new search" (brand-secondary) → `onReset` (back to idle)

Uses existing Subframe `Button` component and the same flex layout patterns as other sheet content steps (`flex-1 flex-col min-h-0`, `mt-auto` on button container).

### 5. ModemChecker integration

`src/components/ModemChecker.tsx` — Two changes:

**a) Error step rendering** — New branch in the `AnimatePresence` content:
```tsx
{state.step === "error" && (
  <SearchError query={state.query} onRetry={retry} onReset={reset} />
)}
```

**b) Submit guard** — Pass `disabled={state.step === "searching"}` to `SearchInput` to prevent double-submit during in-flight requests. `SearchInput` receives an optional `disabled` prop that disables the submit button.

### 6. ErrorBoundary wrapper

New file: `src/components/ErrorBoundary.tsx`

A React class component wrapping `<ModemChecker>` in `App.tsx`.

- Catches render errors via `componentDidCatch` (logs to `console.error`)
- Renders a minimal inline fallback: "Something went wrong" + "Reload" button
- "Reload" calls `this.setState({ hasError: false })` to reset the boundary and re-mount the component tree
- Styled with Tailwind classes, no Subframe dependency
- Accepts `children` and optional `fallback` render prop for reusability
- Exempt from Subframe-first rule (behavioral wrapper, not a visual design component)

## Files changed

| File | Change |
|---|---|
| `src/types.ts` | Add `error` step to `SearchState` union |
| `src/lib/search.ts` | Add optional `signal` param, pass to Supabase calls |
| `src/hooks/useModemSearch.ts` | AbortController ref, aggressive cancellation, error routing, retry action, stale response guard |
| `src/components/SearchError.tsx` | **New** — error screen component |
| `src/components/SearchInput.tsx` | Accept optional `disabled` prop for submit button |
| `src/components/ModemChecker.tsx` | Render `SearchError` for error step, pass disabled to SearchInput, destructure `retry` from hook |
| `src/components/ErrorBoundary.tsx` | **New** — Error Boundary class component |
| `src/App.tsx` | Wrap `ModemChecker` in `ErrorBoundary` |
| `tests/hooks/useModemSearch.test.ts` | Tests for error state, retry, AbortController, stale response |
| `tests/components/SearchError.test.tsx` | **New** — tests for error screen |
| `tests/components/ErrorBoundary.test.tsx` | **New** — tests for Error Boundary |
| `tests/components/ModemChecker.test.tsx` | Test for error step rendering, submit guard |
| `tests/components/SearchInput.test.tsx` | Test disabled prop |

## Out of scope

- Custom error messages per failure type (network vs. server vs. timeout) — YAGNI for 70-row table
- Error reporting/telemetry service integration
- Retry with exponential backoff — single manual retry is sufficient
- Offline detection — the error screen covers this implicitly
