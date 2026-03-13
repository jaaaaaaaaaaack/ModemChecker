# Reliability Improvements — Design Spec

**Date:** 2026-03-13
**Scope:** Error state in search state machine, request cancellation, search timeout, Error Boundary

## Problem

The ModemChecker widget has four reliability gaps:

1. **Silent error masking** — When `searchModems()` throws (network failure, Supabase outage), the error is caught, logged to `console.error`, and the state silently transitions to `no_match`. The user sees "No modem found" with no indication that the search failed due to an error rather than a genuine lack of results.

2. **Race condition** — If a user triggers a second search before the first resolves, both promises race. There is no `AbortController`, no request ID tracking, and no staleness check. The first to resolve sets state, then the second overwrites it.

3. **No search timeout** — If Supabase hangs (network stall, DNS timeout, cold function), the user sees the loading spinner indefinitely. There is no timeout, no "still searching" message, and no way to cancel or retry.

4. **No Error Boundary** — If any component throws during render (e.g., unexpected `null` from malformed data), the entire widget unmounts with no recovery path. For an embeddable widget running inside a host page, this is particularly risky.

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
- Step ordinal for direction tracking: `error: 2` (same level as `no_match` — forward from `searching`). Updated `STEP_ORDINAL` map: `{ idle: 0, searching: 1, multiple_matches: 2, no_match: 2, error: 2, single_match: 3 }`.
- No error message string in state. The error UI shows a generic "Something went wrong" message. Supabase error messages are technical and not useful to end users. The original error is still logged to `console.error` for debugging.

### 2. AbortController in useModemSearch

Three changes to `src/hooks/useModemSearch.ts`:

**a) AbortController ref** — A `useRef<AbortController | null>` tracks the in-flight request. On every `search()` call, the previous controller is aborted and a new one created. The signal is passed to `searchModems()`.

**b) Aggressive cancellation** — `reset()` also aborts any in-flight request. Since `handleClose` in ModemChecker already calls `reset()`, closing the sheet mid-search automatically cancels the request.

**c) Error routing** — The catch block checks `controller.signal.aborted` first — if true, the request was intentionally cancelled and the error is silently ignored (return early). Otherwise, it's a real error and the state transitions to `{ step: "error", query }`. Note: we check the signal, not the error type, because Supabase's postgrest-js client catches `AbortError` internally and returns it as a `{ error }` response object. The `throw new Error(ftsError.message)` in `search.ts` then wraps it as a plain `Error`, losing the `AbortError` name.

**d) New `retry` action** — Convenience method exposed from the hook that re-calls `search()` with the query from the current error state. No-op if `state.step !== "error"` (guard clause). Only called by the `SearchError` component, which is only rendered when `state.step === "error"`, so the guard is purely defensive.

**e) Stale response guard** — After `await searchModems()` returns, check `controller.signal.aborted` before setting state. This prevents a completed-but-stale response from overwriting the current state if the controller was aborted between the await resolving and the state update executing.

**f) Search timeout** — A 7-second `setTimeout` fires if the search hasn't resolved. It calls `controller.abort("timeout")` with a reason string to distinguish timeouts from user-initiated aborts. The catch block checks: if `controller.signal.aborted` is true but `controller.signal.reason === "timeout"`, it falls through to the error state (not silent return). User-initiated aborts (reset, new search) call `abort()` with no reason, so `signal.reason` defaults to a `DOMException` — only timeouts have the `"timeout"` string. The timeout is cleared in a `finally` block so it doesn't fire after successful resolution. Constant: `SEARCH_TIMEOUT_MS = 7000` at the top of the hook file.

### 3. searchModems signature change

`src/lib/search.ts` — `searchModems()` accepts an optional `AbortSignal` parameter:

```typescript
export async function searchModems(
  query: string,
  signal?: AbortSignal
): Promise<Modem[]>
```

The signal is passed to both Supabase calls (FTS and trigram) via the `.abortSignal(signal)` method on the Supabase query builder. Between the FTS and trigram calls, check `signal?.aborted` for a fast-fail path to avoid making a second network request when the first was already cancelled. Supabase's postgrest-js client catches `AbortError` internally and returns it as `{ error }` rather than re-throwing — the hook handles this via `controller.signal.aborted` check (see section 2c).

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

`src/components/ModemChecker.tsx` — One change:

**a) Error step rendering** — New branch in the `AnimatePresence` content:
```tsx
{state.step === "error" && (
  <SearchError query={state.query} onRetry={retry} onReset={reset} />
)}
```

Note: A submit guard (`disabled` prop on SearchInput) is unnecessary because `SearchInput` only renders when `state.step === "idle"`. The moment `search()` is called, state transitions to `searching` and `AnimatePresence` unmounts `SearchInput` entirely, replacing it with `LoadingState`.

### 6. ErrorBoundary wrapper

New file: `src/components/ErrorBoundary.tsx`

A React class component wrapping `<ModemChecker>` in `App.tsx`.

- Catches render errors via `componentDidCatch` (logs to `console.error`)
- Renders a minimal inline fallback: "Something went wrong" + "Reload" button
- "Reload" calls `this.setState({ hasError: false })` to reset the boundary and re-mount the entire component tree, which resets all React state including the `useModemSearch` hook (back to idle)
- Styled with Tailwind classes, no Subframe dependency
- Accepts `children` and optional `fallback` render prop for reusability
- Exempt from Subframe-first rule (behavioral wrapper, not a visual design component)

## Files changed

| File | Change |
|---|---|
| `src/types.ts` | Add `error` step to `SearchState` union |
| `src/lib/search.ts` | Add optional `signal` param, pass to Supabase calls |
| `src/hooks/useModemSearch.ts` | AbortController ref, aggressive cancellation, error routing, retry action, stale response guard, 7s timeout |
| `src/components/SearchError.tsx` | **New** — error screen component |
| `src/components/ModemChecker.tsx` | Render `SearchError` for error step, destructure `retry` from hook |
| `src/components/ErrorBoundary.tsx` | **New** — Error Boundary class component |
| `src/App.tsx` | Wrap `ModemChecker` in `ErrorBoundary` |
| `tests/hooks/useModemSearch.test.ts` | Update existing error test (currently asserts `no_match`, must change to `error`). Add tests for error state, retry, AbortController, stale response |
| `tests/components/SearchError.test.tsx` | **New** — tests for error screen |
| `tests/components/ErrorBoundary.test.tsx` | **New** — tests for Error Boundary |
| `tests/components/ModemChecker.test.tsx` | Test for error step rendering |

## Out of scope

- Custom error messages per failure type (network vs. server vs. timeout) — YAGNI for 70-row table
- Error reporting/telemetry service integration
- Retry with exponential backoff — single manual retry is sufficient
- Offline detection — the error screen covers this implicitly
- Progressive timeout messaging ("still searching…" before hard timeout) — the 7s hard cutoff to error is sufficient
