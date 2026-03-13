# Sheet Animations — Design Spec

## Goal

Replace the current CSS keyframe animations with Framer Motion to achieve smooth, spring-based sheet open/close, animated content transitions between states (with directional awareness), and smooth height changes on mobile.

The animations should feel invisible — natural and cohesive, never decorative.

## Current State

- Sheet open/close: CSS `@keyframes` with fixed durations (300ms ease-out open, 200ms ease-in close). Separate keyframes for mobile (translateY) and desktop (translateX).
- Content transitions: None. Components mount/unmount instantly via conditional rendering in `ModemChecker.tsx`.
- Height changes: Instant. Sheet resizes to fit content with no animation.
- Manual `mounted` state in `BottomSheet.tsx` delays unmount during exit animation via `onAnimationEnd`.

## Design

### Layer 1: Sheet Open/Close

Replace CSS keyframe animations with Framer Motion `AnimatePresence` + `motion.div`.

**Overlay:** Opacity tween, ~250ms in, ~200ms out.

**Sheet panel:**
- **Open:** Spring animation — `damping: 30, stiffness: 300` (snappy, no bounce, settles in ~300ms). Mobile: `translateY(100%) → 0`. Desktop: `translateX(100%) → 0`.
- **Close:** Tween — `duration: 0.2, ease: "easeIn"`. Faster and more decisive than the spring entry.

**Desktop detection:** New `useMediaQuery` hook returns a boolean for `(min-width: 768px)`. Used to switch the motion axis between Y (mobile) and X (desktop). Since this is a client-only widget (no SSR), the hook reads `window.matchMedia` synchronously on initial render to avoid a flash of wrong-axis animation on desktop.

**What this replaces:**
- The `mounted` state + `useEffect` in `BottomSheet.tsx` — `AnimatePresence` handles delayed unmount natively.
- The `onAnimationEnd` callback.
- All `data-[state=open/closed]` animation classes.
- All 6 `@keyframes` in `index.css` (overlay-fade-in/out, sheet-slide-up/down, sheet-slide-in/out-right).

**Radix integration render tree:**

```tsx
<Dialog.Root open={open}>
  <AnimatePresence>
    {open && (
      <Dialog.Portal forceMount>
        <Dialog.Overlay forceMount asChild>
          <motion.div {/* overlay animation props */} />
        </Dialog.Overlay>
        <Dialog.Content forceMount asChild>
          <motion.div {/* sheet animation props */}>
            {children}
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    )}
  </AnimatePresence>
</Dialog.Root>
```

`Dialog.Root` is always rendered. `AnimatePresence` wraps the conditional `{open && ...}` block — it delays unmount until exit animations complete. `forceMount` on Portal/Overlay/Content tells Radix not to control mounting (we handle it). `asChild` on Overlay and Content merges Radix's accessibility props (data-state, aria attrs, focus trap, refs) onto the `motion.div` elements. `motion.div` accepts forwarded refs, so this works without a wrapper.

### Layer 2: Content Transitions

Wrap the state-switched content in `ModemChecker.tsx` with `AnimatePresence mode="wait"` and a keyed `motion.div`.

**Animation:** Fade (opacity 0→1) + horizontal drift (6px on the x-axis). `mode="wait"` ensures old content fully exits before new content enters — no overlap.

**Timing:**
- Exit: ~120ms tween
- Enter: ~180ms tween

**Directional awareness:** Content drifts in the direction of navigation. "Forward" transitions (advancing through the flow) exit left / enter from right. "Backward" transitions (reset, back, retry) exit right / enter from left.

This reinforces the mental model: "Continue" moves you forward through a horizontal flow, "Back" returns you.

**Overflow:** The content transition wrapper uses `overflow: hidden` to prevent horizontal scrollbar flash during the 6px x-axis drift.

### Layer 3: Direction Tracking

Extend `useModemSearch` to track transition direction alongside state.

**Step ordering** (by ordinal):

| Step | Ordinal |
|------|---------|
| idle | 0 |
| searching | 1 |
| multiple_matches | 2 |
| no_match | 2 |
| single_match | 3 |

Direction is derived by comparing the new step's ordinal to the previous step's ordinal:
- New > previous → `"forward"` (exit left, enter from right)
- New < previous → `"backward"` (exit right, enter from left)
- New === previous → `"forward"` (default, shouldn't happen in practice)

The hook exposes `direction` as a separate value alongside `state`. `ModemChecker.tsx` reads it to set the `custom` prop on the `motion.div`, which Framer Motion passes to the animation variants.

**Edge case — idle→idle:** When the sheet closes and re-opens, state goes idle→idle (same key). `AnimatePresence` does not animate when the key doesn't change, so the `direction` value is irrelevant in this case. No special handling needed.

### Layer 4: Height Smoothing (Mobile)

Add Framer Motion's `layout` prop to the content wrapper inside the sheet. When content swaps and the container height changes (e.g., short SearchInput → tall ResultCard), the height change is animated via FLIP rather than snapping.

- Only visually relevant on mobile (desktop side sheet is full-height).
- Uses a spring transition so height changes feel organic — same spring params as the sheet open.
- If `layout` causes issues with portal/fixed positioning, it can be removed without affecting Layers 1–3.

## Files

| File | Change |
|------|--------|
| `src/components/BottomSheet.tsx` | Replace CSS animations with motion components + AnimatePresence. Remove `mounted` state/`useEffect`/`onAnimationEnd`. |
| `src/components/ModemChecker.tsx` | Add `AnimatePresence mode="wait"` wrapper with directional keyed `motion.div` around content. Read `direction` from hook. |
| `src/hooks/useModemSearch.ts` | Track direction (forward/backward) based on step ordinal comparison. Expose `direction` in return value. |
| `src/hooks/useMediaQuery.ts` | New. ~10-line hook returning boolean for a CSS media query string. Reads `window.matchMedia` synchronously (no SSR). |
| `src/index.css` | Remove all 6 `@keyframes` blocks (overlay + sheet animations). |
| `src/types.ts` | Add `TransitionDirection` type (`"forward" | "backward"`). |

## Dependencies

- `framer-motion` — add to project dependencies. Adds ~32KB gzipped to the bundle. Acceptable for the animation quality gained; CSS-only was tried and rejected.

## Testing

Existing tests validate behavior and props, not animation. The `data-testid="sheet-overlay"` attribute must be preserved on the `motion.div` overlay element (Radix's `asChild` will merge it through). Verify all 7 BottomSheet tests pass after refactoring.

The state machine logic in `useModemSearch` gains a `direction` field — a small unit test can verify ordinal-based direction derivation if desired, but the logic is trivial (comparison of two numbers).

## Out of Scope

- Loading state micro-animations (choreographed circle entrances, etc.)
- Gesture-based sheet dismissal (drag to close)
- `prefers-reduced-motion` handling (follow-up task — Framer Motion provides a `useReducedMotion` hook that could disable transitions with minimal effort)
