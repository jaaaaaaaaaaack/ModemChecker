# Sheet Animations Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace CSS keyframe sheet animations with Framer Motion for spring-based open/close, directional content transitions, and smooth height changes.

**Architecture:** Framer Motion's `AnimatePresence` replaces the manual mount/unmount lifecycle in BottomSheet. Content transitions use `AnimatePresence mode="wait"` with directional horizontal drift driven by ordinal-based direction tracking in the search hook. A `useMediaQuery` hook switches the sheet animation axis between mobile (Y) and desktop (X).

**Tech Stack:** Framer Motion, Radix Dialog (existing), Vitest + React Testing Library (existing)

**Spec:** `docs/superpowers/specs/2026-03-13-sheet-animations-design.md`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/hooks/useMediaQuery.ts` | **New.** Returns boolean for a CSS media query. Synchronous initial read (no SSR). |
| `src/hooks/useModemSearch.ts` | **Modify.** Add ordinal-based direction tracking. Expose `direction` alongside `state`. |
| `src/types.ts` | **Modify.** Add `TransitionDirection` type. |
| `src/components/BottomSheet.tsx` | **Modify.** Replace CSS keyframe animations with Framer Motion `AnimatePresence` + `motion.div`. Remove `mounted` state. |
| `src/components/ModemChecker.tsx` | **Modify.** Add `AnimatePresence mode="wait"` with directional keyed `motion.div` around content. |
| `src/index.css` | **Modify.** Remove 6 `@keyframes` blocks. |
| `tests/hooks/useMediaQuery.test.ts` | **New.** Tests for media query hook. |
| `tests/hooks/useModemSearch.test.ts` | **Modify.** Add direction tracking tests. |
| `tests/setup.ts` | **Modify.** Add framer-motion mock for test environment. |

---

## Chunk 1: Foundation (dependency + hooks)

### Task 1: Install Framer Motion

**Files:**
- Modify: `package.json`
- Modify: `tests/setup.ts`

- [ ] **Step 1: Install framer-motion**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
npm install framer-motion
```

- [ ] **Step 2: Verify installation**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
node -e "import('framer-motion').then(() => console.log('OK'))"
```
Expected: `OK`

- [ ] **Step 3: Add framer-motion test mock to setup**

Framer Motion's `AnimatePresence` delays unmounting for exit animations, which causes issues in test environments where animations don't run. Add a mock that makes `AnimatePresence` render children immediately and `motion.div` render as a forwardRef wrapper that strips motion-specific props (preventing React DOM warnings about unknown attributes).

Replace full contents of `tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { forwardRef, type ReactNode } from "react";

// Props that Framer Motion uses but are not valid HTML attributes.
// Strip these when rendering motion.div as a plain div in tests.
const MOTION_PROPS = new Set([
  "initial", "animate", "exit", "variants", "custom",
  "transition", "layout", "layoutId", "onAnimationComplete",
  "whileHover", "whileTap", "whileFocus", "whileDrag",
  "whileInView", "drag", "dragConstraints",
]);

// Mock framer-motion to avoid animation timing issues in tests.
// AnimatePresence renders children immediately; motion.div renders
// as a plain div with motion props filtered out.
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
    motion: {
      div: forwardRef<HTMLDivElement, Record<string, unknown>>(
        (props, ref) => {
          const filtered: Record<string, unknown> = {};
          for (const [key, val] of Object.entries(props)) {
            if (!MOTION_PROPS.has(key)) filtered[key] = val;
          }
          return <div ref={ref} {...filtered} />;
        },
      ),
    },
  };
});

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 4: Run existing tests to verify mock doesn't break anything**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
npx vitest run
```
Expected: All 77 tests pass (framer-motion isn't used yet, but mock should not interfere).

- [ ] **Step 5: Commit**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
git add package.json package-lock.json tests/setup.ts
git commit -m "chore: add framer-motion dependency and test mock"
```

---

### Task 2: Create useMediaQuery hook

**Files:**
- Create: `src/hooks/useMediaQuery.ts`
- Create: `tests/hooks/useMediaQuery.test.ts`

- [ ] **Step 1: Write the tests**

Create `tests/hooks/useMediaQuery.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "../../src/hooks/useMediaQuery";

describe("useMediaQuery", () => {
  let listeners: Array<() => void>;
  let currentMatches: boolean;

  beforeEach(() => {
    listeners = [];
    currentMatches = false;

    vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
      matches: currentMatches,
      media: query,
      addEventListener: (_: string, cb: () => void) => {
        listeners.push(cb);
      },
      removeEventListener: (_: string, cb: () => void) => {
        listeners = listeners.filter((l) => l !== cb);
      },
    })));
  });

  it("returns initial match state synchronously", () => {
    currentMatches = true;
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("returns false when query does not match", () => {
    currentMatches = false;
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
  });

  it("updates when media query changes", () => {
    currentMatches = false;
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);

    // Simulate the matchMedia change event — update the mock's matches value
    // and fire the subscribed callback so useSyncExternalStore re-reads.
    currentMatches = true;
    act(() => {
      listeners.forEach((cb) => cb());
    });
    expect(result.current).toBe(true);
  });

  it("cleans up listener on unmount", () => {
    const { unmount } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(listeners.length).toBeGreaterThanOrEqual(1);
    unmount();
    expect(listeners).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
npx vitest run tests/hooks/useMediaQuery.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/hooks/useMediaQuery.ts`:

```ts
import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot);
}
```

This uses `useSyncExternalStore` for tear-free reads. The `subscribe` and `getSnapshot` callbacks are memoized by `query` so `useSyncExternalStore` doesn't re-subscribe every render. `getSnapshot` reads `window.matchMedia(query).matches` synchronously — no SSR concerns since this is a client-only widget.

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
npx vitest run tests/hooks/useMediaQuery.test.ts
```
Expected: All 4 tests pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
git add src/hooks/useMediaQuery.ts tests/hooks/useMediaQuery.test.ts
git commit -m "feat: add useMediaQuery hook"
```

---

### Task 3: Add direction tracking to useModemSearch

**Files:**
- Modify: `src/types.ts`
- Modify: `src/hooks/useModemSearch.ts`
- Modify: `tests/hooks/useModemSearch.test.ts`

- [ ] **Step 1: Add TransitionDirection type**

Add to the end of `src/types.ts`:

```ts
export type TransitionDirection = "forward" | "backward";
```

- [ ] **Step 2: Write the direction tracking tests**

Add these tests to the existing `describe("useModemSearch", ...)` block in `tests/hooks/useModemSearch.test.ts`:

```ts
  it("direction starts as forward", () => {
    const { result } = renderHook(() => useModemSearch());
    expect(result.current.direction).toBe("forward");
  });

  it("direction is forward when advancing: idle → searching", async () => {
    mockSearch.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      result.current.search("test");
    });

    expect(result.current.direction).toBe("forward");
  });

  it("direction is forward when advancing: searching → single_match", async () => {
    mockSearch.mockResolvedValue([modemA]);
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("tp-link");
    });

    expect(result.current.state.step).toBe("single_match");
    expect(result.current.direction).toBe("forward");
  });

  it("direction is forward when advancing: multiple_matches → single_match", async () => {
    mockSearch.mockResolvedValue([modemA, modemB]);
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("archer");
    });

    act(() => {
      result.current.selectModem(modemA);
    });

    expect(result.current.state.step).toBe("single_match");
    expect(result.current.direction).toBe("forward");
  });

  it("direction is backward on reset from single_match", async () => {
    mockSearch.mockResolvedValue([modemA]);
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("tp-link");
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.step).toBe("idle");
    expect(result.current.direction).toBe("backward");
  });

  it("direction is backward on reset from no_match", async () => {
    mockSearch.mockResolvedValue([]);
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("nonexistent");
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.step).toBe("idle");
    expect(result.current.direction).toBe("backward");
  });
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
npx vitest run tests/hooks/useModemSearch.test.ts
```
Expected: FAIL — `direction` property does not exist on return value.

- [ ] **Step 4: Implement direction tracking**

Replace the full contents of `src/hooks/useModemSearch.ts`:

```ts
import { useCallback, useRef, useState } from "react";
import { searchModems } from "../lib/search";
import type { Modem, SearchState, TransitionDirection } from "../types";

const STEP_ORDINAL: Record<SearchState["step"], number> = {
  idle: 0,
  searching: 1,
  multiple_matches: 2,
  no_match: 2,
  single_match: 3,
};

export function useModemSearch() {
  const [state, setStateRaw] = useState<SearchState>({ step: "idle" });
  const [direction, setDirection] = useState<TransitionDirection>("forward");
  const prevStepRef = useRef<SearchState["step"]>("idle");

  const setState = useCallback((next: SearchState) => {
    const prevOrd = STEP_ORDINAL[prevStepRef.current];
    const nextOrd = STEP_ORDINAL[next.step];
    setDirection(nextOrd >= prevOrd ? "forward" : "backward");
    prevStepRef.current = next.step;
    setStateRaw(next);
  }, []);

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
    } catch (error) {
      console.error("[ModemChecker] Search failed:", error);
      setState({ step: "no_match", query });
    }
  }, [setState]);

  const selectModem = useCallback((modem: Modem) => {
    setState({ step: "single_match", modem });
  }, [setState]);

  const reset = useCallback(() => {
    setState({ step: "idle" });
  }, [setState]);

  return { state, direction, search, selectModem, reset };
}
```

Key details:
- `STEP_ORDINAL` maps each step to a number for comparison.
- `prevStepRef` tracks the previous step across renders without causing re-renders.
- `setState` wrapper computes direction before updating state.
- `nextOrd >= prevOrd` means same-ordinal transitions (e.g., searching→no_match, both ordinal 2) default to `"forward"`.

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
npx vitest run tests/hooks/useModemSearch.test.ts
```
Expected: All 13 tests pass (7 existing + 6 new).

- [ ] **Step 6: Commit**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
git add src/types.ts src/hooks/useModemSearch.ts tests/hooks/useModemSearch.test.ts
git commit -m "feat: add direction tracking to useModemSearch"
```

---

## Chunk 2: BottomSheet Framer Motion refactor

### Task 4: Refactor BottomSheet to use Framer Motion

**Files:**
- Modify: `src/components/BottomSheet.tsx`
- Modify: `src/index.css`
- Verify: `tests/components/BottomSheet.test.tsx` (no changes needed — mock handles FM)

- [ ] **Step 1: Replace BottomSheet implementation**

Replace full contents of `src/components/BottomSheet.tsx`:

```tsx
import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

const overlayTransition = {
  enter: { duration: 0.25 },
  exit: { duration: 0.2 },
};

const sheetSpring = { type: "spring" as const, damping: 30, stiffness: 300 };
const sheetExitTween = { type: "tween" as const, duration: 0.2, ease: "easeIn" as const };

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const axis = isDesktop ? "x" : "y";

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay forceMount asChild>
              <motion.div
                data-testid="sheet-overlay"
                className="fixed inset-0 z-50 bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={overlayTransition.enter}
              />
            </Dialog.Overlay>
            <Dialog.Content forceMount asChild>
              <motion.div
                aria-modal="true"
                aria-describedby={undefined}
                initial={{ [axis]: "100%" }}
                animate={{ [axis]: 0 }}
                exit={{ [axis]: "100%" }}
                transition={sheetSpring}
                className={[
                  // Base
                  "fixed z-50 bg-gradient-brand shadow-xl overflow-y-auto outline-none",
                  // Mobile: bottom sheet
                  "inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl p-5 pb-8",
                  // Desktop: side sheet
                  "md:inset-y-0 md:right-0 md:left-auto",
                  "md:bg-gradient-brand-compact md:w-[480px] md:max-h-none md:rounded-none md:p-6",
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
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
```

Key changes from old implementation:
- `mounted` state + `useEffect` + `onAnimationEnd` removed — `AnimatePresence` handles unmount delay.
- CSS animation classes removed — motion props (`initial`/`animate`/`exit`) drive animations.
- `axis` switches between `"x"` and `"y"` based on `useMediaQuery`.
- `data-testid="sheet-overlay"` preserved on the overlay `motion.div`.
- All `data-[state=open/closed]` animation classes removed from classNames.
- Spring used for both enter and exit on the sheet panel. The spec suggested a tween exit, but spring at `damping: 30, stiffness: 300` settles quickly and feels natural in both directions. If the exit feels too slow during testing, swap `transition` to `sheetExitTween` on the exit path (requires converting to variants — see below).

**Refinement note:** If differentiated enter/exit transitions are needed later, convert to variants:
```tsx
const sheetVariants = {
  hidden: (axis: string) => ({ [axis]: "100%" }),
  visible: (axis: string) => ({ [axis]: 0 }),
};
// Then use transition={{ ...sheetSpring }} on the motion.div
// and override exit with transition on the exit variant.
```

- [ ] **Step 2: Remove CSS keyframes from index.css**

Remove the 6 `@keyframes` blocks from `src/index.css`. The file should look like:

```css
@import "tailwindcss";
@import "./ui/theme.css";
@import "./styles/gradients.css";

/* Reset default margins for embedded widget */
body, #root {
  margin: 0;
  padding: 0;
}
```

- [ ] **Step 3: Run BottomSheet tests**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
npx vitest run tests/components/BottomSheet.test.tsx
```
Expected: All 7 tests pass. The framer-motion mock in `tests/setup.ts` renders `motion.div` as a prop-filtered `div` and `AnimatePresence` renders children immediately, so all existing test assertions (query by text, role, testid, aria attributes) should work unchanged.

- [ ] **Step 4: Run full test suite**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
npx vitest run
```
Expected: All tests pass. If any BottomSheet-related tests in other files fail (e.g., `ModemChecker.test.tsx`), investigate — the issue is likely that the `AnimatePresence` mock needs adjustment.

- [ ] **Step 5: Commit**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
git add src/components/BottomSheet.tsx src/index.css
git commit -m "feat: replace CSS sheet animations with Framer Motion springs"
```

---

## Chunk 3: Content transitions + height smoothing

### Task 5: Add directional content transitions in ModemChecker

**Files:**
- Modify: `src/components/ModemChecker.tsx`
- Verify: `tests/components/ModemChecker.test.tsx` (no changes expected)

- [ ] **Step 1: Add AnimatePresence with directional content wrapper**

Replace full contents of `src/components/ModemChecker.tsx`:

```tsx
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TechType, Modem, TransitionDirection } from "../types";
import { DEFAULT_PLAN_SPEED_MBPS } from "../constants";
import { useModemSearch } from "../hooks/useModemSearch";
import { BaseScreen } from "./BaseScreen";
import { BottomSheet } from "./BottomSheet";
import { SearchInput } from "./SearchInput";
import { LoadingState } from "./LoadingState";
import { MultipleMatches } from "./MultipleMatches";
import { ResultCard } from "./ResultCard";
import { NoMatch } from "./NoMatch";

const contentVariants = {
  enter: (direction: TransitionDirection) => ({
    opacity: 0,
    x: direction === "forward" ? 6 : -6,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: TransitionDirection) => ({
    opacity: 0,
    x: direction === "forward" ? -6 : 6,
  }),
};

const contentTransition = { duration: 0.15, ease: "easeOut" };

interface ModemCheckerProps {
  techType: TechType;
  planSpeedMbps?: number;
}

export function ModemChecker({
  techType,
  planSpeedMbps = DEFAULT_PLAN_SPEED_MBPS,
}: ModemCheckerProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [verifiedModem, setVerifiedModem] = useState<Modem | undefined>();
  const { state, direction, search, selectModem, reset } = useModemSearch();

  const handleClose = () => {
    setSheetOpen(false);
    reset();
  };

  const handleDone = () => {
    if (state.step === "single_match") {
      setVerifiedModem(state.modem);
    }
    setSheetOpen(false);
    reset();
  };

  const handleCheckAnother = () => {
    reset();
  };

  return (
    <>
      <BaseScreen
        onCheckModem={() => setSheetOpen(true)}
        verifiedModem={verifiedModem}
        techType={techType}
        planSpeedMbps={planSpeedMbps}
      />
      <BottomSheet open={sheetOpen} onClose={handleClose}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={state.step}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={contentTransition}
            className="overflow-hidden"
          >
            {state.step === "idle" && <SearchInput onSearch={search} />}
            {state.step === "searching" && <LoadingState />}
            {state.step === "multiple_matches" && (
              <MultipleMatches
                modems={state.modems}
                onSelect={selectModem}
                onBack={reset}
              />
            )}
            {state.step === "single_match" && (
              <ResultCard
                modem={state.modem}
                techType={techType}
                planSpeedMbps={planSpeedMbps}
                onDone={handleDone}
                onReset={handleCheckAnother}
              />
            )}
            {state.step === "no_match" && (
              <NoMatch
                onRetry={reset}
                query={state.query}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </BottomSheet>
    </>
  );
}
```

Key details:
- `contentVariants` uses `custom` parameter (the `direction`) to determine drift direction.
- `enter` variant: forward → content enters from right (+6px), backward → enters from left (-6px).
- `exit` variant: forward → content exits to left (-6px), backward → exits to right (+6px).
- `mode="wait"` on `AnimatePresence` ensures exit completes before enter starts.
- `custom={direction}` passed to both `AnimatePresence` and the `motion.div` — `AnimatePresence` needs it to update the exit animation of the outgoing component with the new direction value.
- `overflow-hidden` on wrapper prevents horizontal scrollbar flash during x-axis drift.
- Single `contentTransition` (150ms) used for both enter and exit. At 6px of drift, the spec's 120ms/180ms split is imperceptible — a single value keeps the code simpler. Easy to tune by feel during manual testing.

- [ ] **Step 2: Run ModemChecker tests**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
npx vitest run tests/components/ModemChecker.test.tsx
```
Expected: All 3 tests pass. The framer-motion mock renders `motion.div` as a prop-filtered `div` and `AnimatePresence` passes children through, so conditional rendering and text queries work unchanged.

- [ ] **Step 3: Run full test suite**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
npx vitest run
```
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
git add src/components/ModemChecker.tsx
git commit -m "feat: add directional content transitions between sheet states"
```

---

### Task 6: Add height smoothing with layout animation

**Files:**
- Modify: `src/components/ModemChecker.tsx` (add `layout` prop to content wrapper)

- [ ] **Step 1: Add layout prop to content motion.div**

In `src/components/ModemChecker.tsx`, add `layout` to the `motion.div` wrapper inside `AnimatePresence`:

Change:
```tsx
          <motion.div
            key={state.step}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={contentTransition}
            className="overflow-hidden"
          >
```

To:
```tsx
          <motion.div
            key={state.step}
            layout
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={contentTransition}
            className="overflow-hidden"
          >
```

This single prop addition enables FLIP-based height animation. When the keyed content changes and the container height shifts, Framer Motion smoothly interpolates the layout change.

- [ ] **Step 2: Run full test suite**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
npx vitest run
```
Expected: All tests pass. The `layout` prop is stripped by the mock (listed in `MOTION_PROPS`), so tests are unaffected.

- [ ] **Step 3: Manual verification**

Start the dev server and test the full flow:

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
npx vite --open
```

Verify:
1. Sheet opens with spring animation (mobile: slides up, desktop: slides from right)
2. Sheet closes with spring animation (same axis, reversed)
3. Content transitions: search → loading → results fades left with horizontal drift
4. Back/retry transitions: content drifts right (backward direction)
5. Height changes on mobile: smooth transition when content height changes between states
6. No horizontal scrollbar flash during content transitions
7. Overlay fades in/out smoothly

**If `layout` causes visual glitches** (jitter, incorrect positioning): remove the `layout` prop. Layers 1-3 work independently. This is explicitly noted as optional in the spec.

- [ ] **Step 4: Commit**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
git add src/components/ModemChecker.tsx
git commit -m "feat: add layout animation for smooth height transitions"
```

---

### Task 7: Final verification

- [ ] **Step 1: Run full test suite one final time**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
npx vitest run
```
Expected: All tests pass.

- [ ] **Step 2: Run build to verify no type errors**

```bash
cd /Users/jack/Projects/ModemChecker/.worktrees/subframe-ui
npx tsc -b && npx vite build
```
Expected: Clean build, no errors.
