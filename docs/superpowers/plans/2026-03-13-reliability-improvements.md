# Reliability Improvements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add proper error handling, request cancellation, search timeout, and crash recovery to the ModemChecker widget.

**Architecture:** New `error` step in the `SearchState` discriminated union, `AbortController` in `useModemSearch` for request lifecycle management with a 7-second timeout, a `SearchError` component for the error UI, and an `ErrorBoundary` class component wrapping the widget in `App.tsx`.

**Tech Stack:** React 19, TypeScript, Vitest, @testing-library/react, Supabase JS (`.abortSignal()` API)

**Spec:** `docs/superpowers/specs/2026-03-13-reliability-improvements-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/types.ts` | Modify | Add `error` step to `SearchState` union |
| `src/lib/search.ts` | Modify | Accept `AbortSignal`, pass to Supabase, fast-fail between tiers |
| `src/hooks/useModemSearch.ts` | Modify | AbortController lifecycle, error routing, retry action, 7s timeout |
| `src/components/SearchError.tsx` | Create | Error screen UI (heading, body, retry/reset buttons) |
| `src/components/ErrorBoundary.tsx` | Create | React Error Boundary class component |
| `src/components/ModemChecker.tsx` | Modify | Render `SearchError`, destructure `retry` from hook |
| `src/App.tsx` | Modify | Wrap `ModemChecker` in `ErrorBoundary` |
| `tests/lib/search.test.ts` | Modify | Tests for signal propagation |
| `tests/hooks/useModemSearch.test.ts` | Modify | Update error test, add abort/retry/stale/timeout tests |
| `tests/components/SearchError.test.tsx` | Create | Error screen component tests |
| `tests/components/ErrorBoundary.test.tsx` | Create | Error Boundary tests |
| `tests/components/ModemChecker.test.tsx` | Modify | Error step rendering test |

---

## Chunk 1: SearchState type + searchModems signal support

### Task 1: Add `error` step to SearchState

**Files:**
- Modify: `src/types.ts:68-73`

- [ ] **Step 1: Add the error variant**

In `src/types.ts`, add the `error` step to the `SearchState` union:

```typescript
export type SearchState =
  | { step: "idle" }
  | { step: "searching"; query: string }
  | { step: "single_match"; modem: Modem }
  | { step: "multiple_matches"; modems: Modem[] }
  | { step: "no_match"; query: string }
  | { step: "error"; query: string };
```

- [ ] **Step 2: Update STEP_ORDINAL in useModemSearch**

In `src/hooks/useModemSearch.ts`, add `error: 2` to the `STEP_ORDINAL` map:

```typescript
const STEP_ORDINAL: Record<SearchState["step"], number> = {
  idle: 0,
  searching: 1,
  multiple_matches: 2,
  no_match: 2,
  error: 2,
  single_match: 3,
};
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx tsc --noEmit`
Expected: No errors (the `Record<SearchState["step"], number>` type enforces all steps are present)

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/hooks/useModemSearch.ts
git commit -m "feat: add error step to SearchState union"
```

### Task 2: Add AbortSignal support to searchModems

**Files:**
- Modify: `src/lib/search.ts`
- Modify: `tests/lib/search.test.ts`

- [ ] **Step 1: Write failing test for signal propagation**

In `tests/lib/search.test.ts`, add a test that verifies an aborted signal causes `searchModems` to throw. Note: Supabase must be mocked since these are unit tests.

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase before importing search
vi.mock("../../src/lib/supabase", () => {
  const mockSelect = vi.fn();
  const mockTextSearch = vi.fn();
  const mockLimit = vi.fn();
  const mockAbortSignal = vi.fn();
  const mockRpc = vi.fn();

  // Chain: supabase.from().select().textSearch().abortSignal().limit()
  const chain = {
    select: mockSelect,
    textSearch: mockTextSearch,
    abortSignal: mockAbortSignal,
    limit: mockLimit,
  };
  mockSelect.mockReturnValue(chain);
  mockTextSearch.mockReturnValue(chain);
  mockAbortSignal.mockReturnValue(chain);

  return {
    supabase: {
      from: vi.fn().mockReturnValue(chain),
      rpc: mockRpc,
    },
    __mocks: { mockLimit, mockRpc, mockAbortSignal },
  };
});

import { searchModems } from "../../src/lib/search";
import { supabase, __mocks } from "../../src/lib/supabase";
const { mockLimit, mockRpc, mockAbortSignal } = __mocks as any;

describe("searchModems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes AbortSignal to FTS query", async () => {
    const controller = new AbortController();
    mockLimit.mockResolvedValue({ data: [{ id: "a" }], error: null });

    await searchModems("test", controller.signal);

    expect(mockAbortSignal).toHaveBeenCalledWith(controller.signal);
  });

  it("passes AbortSignal to trigram RPC when FTS returns empty", async () => {
    const controller = new AbortController();
    mockLimit.mockResolvedValue({ data: [], error: null });

    const rpcAbortSignal = vi.fn().mockResolvedValue({ data: [], error: null });
    mockRpc.mockReturnValue({ abortSignal: rpcAbortSignal });

    await searchModems("test", controller.signal);

    expect(mockRpc).toHaveBeenCalled();
    expect(rpcAbortSignal).toHaveBeenCalledWith(controller.signal);
  });

  it("skips trigram RPC when signal is already aborted after FTS", async () => {
    const controller = new AbortController();
    mockLimit.mockResolvedValue({ data: [], error: null });

    // Abort before the trigram call would happen
    controller.abort();

    await expect(searchModems("test", controller.signal)).rejects.toThrow(
      "Aborted"
    );
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("throws on FTS error", async () => {
    mockLimit.mockResolvedValue({ data: null, error: { message: "DB error" } });

    await expect(searchModems("test")).rejects.toThrow("DB error");
  });

  it("returns empty array for blank query", async () => {
    const result = await searchModems("  ");
    expect(result).toEqual([]);
  });
});
```

**Important:** The mock structure above is a starting point. The exact chain depends on how Supabase's query builder is used. Read the existing `tests/lib/search.test.ts` if it exists — if not, this is a new test file. The key assertions are: (1) `.abortSignal(signal)` is called in the chain, (2) the signal is the one we passed.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx vitest run tests/lib/search.test.ts`
Expected: FAIL — `abortSignal` is not called (current code doesn't pass it)

- [ ] **Step 3: Implement signal support in searchModems**

In `src/lib/search.ts`, update the function signature and both queries:

```typescript
export async function searchModems(
  query: string,
  signal?: AbortSignal
): Promise<Modem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Tier 1: Full-text search
  const ftsQuery = supabase
    .from("modems")
    .select(SEARCH_COLUMNS)
    .textSearch("search_vector", trimmed, { type: "plain", config: "english" });

  const { data: ftsData, error: ftsError } = signal
    ? await ftsQuery.abortSignal(signal).limit(10)
    : await ftsQuery.limit(10);

  if (ftsError) throw new Error(ftsError.message);
  if (ftsData && ftsData.length > 0) return sortByBrandModel(ftsData as Modem[]);

  // Fast-fail if already aborted before making second request
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  // Tier 2: Trigram similarity fallback
  const rpcQuery = supabase.rpc("search_modems_fuzzy", {
    query_text: trimmed,
    max_results: 10,
  });

  const { data: fuzzyData, error: fuzzyError } = signal
    ? await rpcQuery.abortSignal(signal)
    : await rpcQuery;

  if (fuzzyError) throw new Error(fuzzyError.message);
  return sortByBrandModel((fuzzyData as Modem[]) ?? []);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx vitest run tests/lib/search.test.ts`
Expected: PASS

- [ ] **Step 5: Run full test suite**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx vitest run`
Expected: All tests pass (existing tests don't pass signal, so the `signal ?` ternary preserves backwards compatibility)

- [ ] **Step 6: Commit**

```bash
git add src/lib/search.ts tests/lib/search.test.ts
git commit -m "feat: add AbortSignal support to searchModems"
```

---

## Chunk 2: useModemSearch — AbortController + error routing + retry

### Task 3: Update useModemSearch with AbortController and error routing

> **⚠️ Codebase drift note:** The hook may already have AbortController, error routing, and retry from earlier work. Step 4 below is a **full file replacement** that is still required — it adds the 7-second timeout and changes the catch block from `if (controller.signal.aborted) return` to `if (controller.signal.aborted && controller.signal.reason !== "timeout") return`. Do not skip this task.

**Files:**
- Modify: `src/hooks/useModemSearch.ts`
- Modify: `tests/hooks/useModemSearch.test.ts`

- [ ] **Step 1: Update the existing error test**

In `tests/hooks/useModemSearch.test.ts`, find the test "logs error to console.error on search failure" (around line 84). Change the assertion from `no_match` to `error`:

```typescript
it("transitions to error state on search failure", async () => {
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const searchError = new Error("Network error");
  mockSearch.mockRejectedValue(searchError);

  const { result } = renderHook(() => useModemSearch());

  await act(async () => {
    await result.current.search("test");
  });

  expect(consoleSpy).toHaveBeenCalledWith(
    "[ModemChecker] Search failed:",
    searchError
  );
  expect(result.current.state).toEqual({ step: "error", query: "test" });
  consoleSpy.mockRestore();
});
```

- [ ] **Step 2: Write new tests for abort, retry, stale response, and timeout**

Append to the same test file:

```typescript
it("ignores stale response when a newer search has completed", async () => {
  // Simulate: first search resolves AFTER second search completes.
  // The first search's AbortController is aborted by the second search,
  // so the stale guard (controller.signal.aborted) should prevent state update.
  let resolveFirst!: (value: Modem[]) => void;
  const firstPromise = new Promise<Modem[]>((resolve) => {
    resolveFirst = resolve;
  });

  mockSearch
    .mockImplementationOnce(() => firstPromise)
    .mockResolvedValueOnce([modemA]);

  const { result } = renderHook(() => useModemSearch());

  // Start first search (will hang on firstPromise)
  await act(async () => {
    result.current.search("old query");
  });
  expect(result.current.state.step).toBe("searching");

  // Start second search — this aborts the first controller, then resolves
  await act(async () => {
    await result.current.search("new query");
  });
  expect(result.current.state.step).toBe("single_match");

  // Now resolve the first (stale) search — should be ignored
  await act(async () => {
    resolveFirst([modemB]);
  });

  // State should still be single_match from the second search, not overwritten
  expect(result.current.state.step).toBe("single_match");
  if (result.current.state.step === "single_match") {
    expect(result.current.state.modem.id).toBe("a"); // modemA from second search
  }
});

it("retry re-runs search with the same query", async () => {
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  mockSearch
    .mockRejectedValueOnce(new Error("fail"))
    .mockResolvedValueOnce([modemA]);

  const { result } = renderHook(() => useModemSearch());

  await act(async () => {
    await result.current.search("tp-link");
  });

  expect(result.current.state.step).toBe("error");

  await act(async () => {
    await result.current.retry();
  });

  expect(result.current.state.step).toBe("single_match");
  consoleSpy.mockRestore();
});

it("retry is a no-op when not in error state", async () => {
  const { result } = renderHook(() => useModemSearch());

  await act(async () => {
    result.current.retry();
  });

  expect(result.current.state.step).toBe("idle");
});

it("reset aborts in-flight request and ignores late resolution", async () => {
  let resolveSearch!: (value: Modem[]) => void;
  const searchPromise = new Promise<Modem[]>((resolve) => {
    resolveSearch = resolve;
  });
  mockSearch.mockImplementation(() => searchPromise);

  const { result } = renderHook(() => useModemSearch());

  await act(async () => {
    result.current.search("test");
  });

  expect(result.current.state.step).toBe("searching");

  act(() => {
    result.current.reset();
  });

  expect(result.current.state.step).toBe("idle");

  // Late resolution after reset — should be ignored (controller was aborted)
  await act(async () => {
    resolveSearch([modemA]);
  });

  expect(result.current.state.step).toBe("idle");
});

it("direction is forward when transitioning to error", async () => {
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  mockSearch.mockRejectedValue(new Error("fail"));
  const { result } = renderHook(() => useModemSearch());

  await act(async () => {
    await result.current.search("test");
  });

  expect(result.current.state.step).toBe("error");
  expect(result.current.direction).toBe("forward");
  consoleSpy.mockRestore();
});

it("transitions to error after 7 second timeout", async () => {
  vi.useFakeTimers();
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  // Mock a search that hangs until aborted
  mockSearch.mockImplementation(
    (_q: string, signal?: AbortSignal) =>
      new Promise((_resolve, reject) => {
        signal?.addEventListener("abort", () => reject(new Error("aborted")));
      })
  );

  const { result } = renderHook(() => useModemSearch());

  // Start search without awaiting (it won't resolve until abort)
  act(() => {
    result.current.search("slow query");
  });

  expect(result.current.state.step).toBe("searching");

  // Fire the 7s timeout
  await act(async () => {
    vi.advanceTimersByTime(7000);
  });

  expect(result.current.state.step).toBe("error");
  if (result.current.state.step === "error") {
    expect(result.current.state.query).toBe("slow query");
  }

  consoleSpy.mockRestore();
  vi.useRealTimers();
});

it("clears timeout when search resolves before 7 seconds", async () => {
  vi.useFakeTimers();
  mockSearch.mockResolvedValue([modemA]);

  const { result } = renderHook(() => useModemSearch());

  await act(async () => {
    await result.current.search("fast query");
  });

  expect(result.current.state.step).toBe("single_match");

  // Advancing time should NOT cause error since timeout was cleared
  await act(async () => {
    vi.advanceTimersByTime(7000);
  });

  expect(result.current.state.step).toBe("single_match");
  vi.useRealTimers();
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx vitest run tests/hooks/useModemSearch.test.ts`
Expected: FAIL — current implementation routes errors to `no_match`, doesn't expose `retry`, doesn't use AbortController or timeout

- [ ] **Step 4: Implement the hook changes**

Replace `src/hooks/useModemSearch.ts` with:

```typescript
import { useCallback, useRef, useState } from "react";
import { searchModems } from "../lib/search";
import type { Modem, SearchState, TransitionDirection } from "../types";

const SEARCH_TIMEOUT_MS = 7000;

const STEP_ORDINAL: Record<SearchState["step"], number> = {
  idle: 0,
  searching: 1,
  multiple_matches: 2,
  no_match: 2,
  error: 2,
  single_match: 3,
};

export function useModemSearch() {
  const [state, setStateRaw] = useState<SearchState>({ step: "idle" });
  const [direction, setDirection] = useState<TransitionDirection>("forward");
  const prevStepRef = useRef<SearchState["step"]>("idle");
  const abortRef = useRef<AbortController | null>(null);

  const setState = useCallback((next: SearchState) => {
    const prevOrd = STEP_ORDINAL[prevStepRef.current];
    const nextOrd = STEP_ORDINAL[next.step];
    setDirection(nextOrd >= prevOrd ? "forward" : "backward");
    prevStepRef.current = next.step;
    setStateRaw(next);
  }, []);

  const search = useCallback(
    async (query: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const timeoutId = setTimeout(() => {
        controller.abort("timeout");
      }, SEARCH_TIMEOUT_MS);

      setState({ step: "searching", query });
      try {
        const results = await searchModems(query, controller.signal);
        if (controller.signal.aborted) return;
        if (results.length === 0) {
          setState({ step: "no_match", query });
        } else if (results.length === 1) {
          setState({ step: "single_match", modem: results[0] });
        } else {
          setState({ step: "multiple_matches", modems: results });
        }
      } catch (error) {
        // User-initiated abort (reset, new search) → silent return.
        // Timeout abort (reason === "timeout") → fall through to error state.
        if (controller.signal.aborted && controller.signal.reason !== "timeout")
          return;
        console.error("[ModemChecker] Search failed:", error);
        setState({ step: "error", query });
      } finally {
        clearTimeout(timeoutId);
      }
    },
    [setState]
  );

  const selectModem = useCallback(
    (modem: Modem) => {
      setState({ step: "single_match", modem });
    },
    [setState]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState({ step: "idle" });
  }, [setState]);

  const retry = useCallback(() => {
    if (state.step === "error") {
      search(state.query);
    }
  }, [state, search]);

  return { state, direction, search, selectModem, reset, retry };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx vitest run tests/hooks/useModemSearch.test.ts`
Expected: All tests pass

- [ ] **Step 6: Run full test suite**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx vitest run`
Expected: All tests pass

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useModemSearch.ts tests/hooks/useModemSearch.test.ts
git commit -m "feat: add AbortController, error state, and retry to useModemSearch"
```

---

## Chunk 3: SearchError component + ModemChecker integration

### Task 4: Create SearchError component

**Files:**
- Create: `src/components/SearchError.tsx`
- Create: `tests/components/SearchError.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `tests/components/SearchError.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchError } from "../../src/components/SearchError";

describe("SearchError", () => {
  const defaultProps = {
    query: "tp-link",
    onRetry: vi.fn(),
    onReset: vi.fn(),
  };

  it("renders error heading", () => {
    render(<SearchError {...defaultProps} />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it("renders error body text", () => {
    render(<SearchError {...defaultProps} />);
    expect(
      screen.getByText(/check your internet connection/i)
    ).toBeInTheDocument();
  });

  it("calls onRetry when Try again is clicked", async () => {
    const onRetry = vi.fn();
    render(<SearchError {...defaultProps} onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("calls onReset when Start a new search is clicked", async () => {
    const onReset = vi.fn();
    render(<SearchError {...defaultProps} onReset={onReset} />);
    await userEvent.click(
      screen.getByRole("button", { name: /start a new search/i })
    );
    expect(onReset).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx vitest run tests/components/SearchError.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement SearchError component**

Create `src/components/SearchError.tsx`:

```tsx
import { Button } from "@/ui/components/Button";

interface SearchErrorProps {
  query: string;
  onRetry: () => void;
  onReset: () => void;
}

export function SearchError({ query, onRetry, onReset }: SearchErrorProps) {
  return (
    <div className="flex w-full flex-1 flex-col items-start gap-6 min-h-0">
      <div className="flex w-full flex-col items-start gap-4">
        <span className="text-h2 font-h2 text-brand-900">
          Something went wrong
        </span>
        <span className="text-body font-body text-default-font">
          We couldn't complete your search. Check your internet connection and
          try again.
        </span>
      </div>
      <div className="flex w-full flex-col items-center gap-3 mt-auto pt-2">
        <Button
          className="rounded-full w-full"
          variant="brand-primary"
          onClick={onRetry}
        >
          Try again
        </Button>
        <Button
          className="rounded-full w-full"
          variant="brand-secondary"
          onClick={onReset}
        >
          Start a new search
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx vitest run tests/components/SearchError.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/SearchError.tsx tests/components/SearchError.test.tsx
git commit -m "feat: add SearchError component for search failure UI"
```

### Task 5: Integrate SearchError into ModemChecker

**Files:**
- Modify: `src/components/ModemChecker.tsx`
- Modify: `tests/components/ModemChecker.test.tsx`

- [ ] **Step 1: Write failing test**

In `tests/components/ModemChecker.test.tsx`, add:

```typescript
it("shows error screen when search fails", async () => {
  mockSearch.mockRejectedValue(new Error("Network error"));
  render(<ModemChecker techType="fttp" />);

  // Open sheet
  await userEvent.click(screen.getByText(/no, i.ll use my own/i));
  await userEvent.click(
    screen.getByRole("button", { name: /check your modem/i })
  );

  // Submit search
  const input = screen.getByRole("textbox");
  await userEvent.type(input, "TP-Link");
  await userEvent.click(screen.getByRole("button", { name: /continue/i }));

  // Should show error screen, not "No modem found"
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  expect(screen.queryByText(/no modem found/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx vitest run tests/components/ModemChecker.test.tsx`
Expected: FAIL — error screen not rendered (ModemChecker doesn't handle `error` step yet)

- [ ] **Step 3: Implement ModemChecker changes**

In `src/components/ModemChecker.tsx`:

Add the import:
```typescript
import { SearchError } from "./SearchError";
```

Update the hook destructuring:
```typescript
const { state, direction, search, selectModem, reset, retry } = useModemSearch();
```

Add the error branch inside the `AnimatePresence` `motion.div`, after the `no_match` block:
```tsx
{state.step === "error" && (
  <SearchError
    query={state.query}
    onRetry={retry}
    onReset={reset}
  />
)}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx vitest run tests/components/ModemChecker.test.tsx`
Expected: All tests pass

- [ ] **Step 5: Run full test suite**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx vitest run`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/components/ModemChecker.tsx tests/components/ModemChecker.test.tsx
git commit -m "feat: render SearchError in ModemChecker for error step"
```

---

## Chunk 4: ErrorBoundary + App integration

### Task 6: Create ErrorBoundary component

**Files:**
- Create: `src/components/ErrorBoundary.tsx`
- Create: `tests/components/ErrorBoundary.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `tests/components/ErrorBoundary.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "../../src/components/ErrorBoundary";

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Render crash");
  return <div>Normal content</div>;
}

describe("ErrorBoundary", () => {
  // Suppress React error boundary console noise in test output
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders fallback when child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.queryByText("Normal content")).not.toBeInTheDocument();
  });

  it("renders reload button in fallback", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole("button", { name: /reload/i })).toBeInTheDocument();
  });

  it("recovers when reload is clicked", async () => {
    // We need to control whether it throws across renders
    let shouldThrow = true;
    function Controlled() {
      if (shouldThrow) throw new Error("crash");
      return <div>Recovered</div>;
    }

    render(
      <ErrorBoundary>
        <Controlled />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    // Fix the error condition, then click reload
    shouldThrow = false;
    await userEvent.click(screen.getByRole("button", { name: /reload/i }));

    expect(screen.getByText("Recovered")).toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });

  it("logs error to console.error", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(console.error).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx vitest run tests/components/ErrorBoundary.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement ErrorBoundary**

Create `src/components/ErrorBoundary.tsx`:

```tsx
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ModemChecker] Render error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <span className="text-body-bold font-body-bold text-default-font">
            Something went wrong
          </span>
          <span className="text-body font-body text-subtext-color">
            The modem checker encountered an unexpected error.
          </span>
          <button
            onClick={this.handleReload}
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx vitest run tests/components/ErrorBoundary.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/ErrorBoundary.tsx tests/components/ErrorBoundary.test.tsx
git commit -m "feat: add ErrorBoundary component for render crash recovery"
```

### Task 7: Wrap ModemChecker in ErrorBoundary

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update App.tsx**

```tsx
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ModemChecker } from "./components/ModemChecker";

function App() {
  return (
    <ErrorBoundary>
      <ModemChecker techType="fttp" />
    </ErrorBoundary>
  );
}

export default App;
```

- [ ] **Step 2: Run full test suite**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx vitest run`
Expected: All tests pass

- [ ] **Step 3: Verify TypeScript compilation**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wrap ModemChecker in ErrorBoundary in App"
```

### Task 8: Final verification

- [ ] **Step 1: Run full test suite one final time**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx vitest run`
Expected: All tests pass (should be ~95+ tests now with the new ones)

- [ ] **Step 2: Build check**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx vite build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Manual smoke test (optional)**

Run: `cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui && npx vite dev`
Open http://localhost:5173, open the sheet, search for a modem — verify normal flow still works.
