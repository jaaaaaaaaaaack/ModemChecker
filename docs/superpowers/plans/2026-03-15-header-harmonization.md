# Header Harmonization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace three inconsistent header patterns across bottom sheet screens with a single `HeaderWithNavigation` Subframe component, and move MultipleMatches back button from header to bottom bar.

**Architecture:** Sync the new `HeaderWithNavigation` component from Subframe, sync-disable it, add behavioral props (`onClose`). Update `SearchInput`, `MultipleMatches`, and `ModemInfoSheet` to use it. MultipleMatches restructured to use a two-slot header + pinned bottom bar with Back button and help link.

**Tech Stack:** React, Subframe, Vitest, Testing Library

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/ui/components/HeaderWithNavigation.tsx` | Create (sync from Subframe, then sync-disable) | Shared sheet header — 4 variants, `onClose` prop |
| `src/components/SearchInput.tsx` | Modify | Replace hand-coded header with `HeaderWithNavigation` |
| `src/components/MultipleMatches.tsx` | Modify | Replace three-slot header with two-slot, move back button to bottom bar |
| `src/components/ModemInfoSheet.tsx` | Modify | Replace hand-coded header with `HeaderWithNavigation` |
| `tests/components/MultipleMatches.test.tsx` | Modify | Update back button test (now in bottom bar, not header) |
| `tests/components/SearchInput.test.tsx` | Verify passes (no changes expected) | — |
| `tests/components/ModemInfoSheet.test.tsx` | Modify | Update dismiss button aria-label (`"Dismiss"` → `"Close"`) |

---

## Chunk 1: Sync and enhance HeaderWithNavigation

### Task 1: Sync HeaderWithNavigation from Subframe

**Files:**
- Create: `src/ui/components/HeaderWithNavigation.tsx`

- [ ] **Step 1: Sync the component from Subframe**

Run: `cd /Users/jack/Projects/ModemChecker && npx subframe sync`

This will pull `HeaderWithNavigation` into `src/ui/components/HeaderWithNavigation.tsx`.

- [ ] **Step 2: Verify the file was created**

Run: `ls src/ui/components/HeaderWithNavigation.tsx`

Expected: file exists.

- [ ] **Step 3: Add sync-disable marker and behavioral props**

Add `// @subframe/sync-disable` as the first line.

Then modify the component to accept an `onClose` prop and wire it to the close `IconButton`. Make the close button render conditionally (only when `onClose` is provided). Add `aria-label="Close"` to the close button.

The interface should become:

```tsx
interface HeaderWithNavigationRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  variant?: "option-1" | "image" | "2-slot-blue" | "2-slot-purple";
  onClose?: () => void;
  className?: string;
}
```

The close `IconButton` should be wrapped in a conditional:

```tsx
{onClose ? (
  <IconButton
    variant={/* existing variant logic */}
    size={variant === "image" ? "large" : undefined}
    icon={<FeatherX />}
    onClick={onClose}
    aria-label="Close"
  />
) : null}
```

**Note:** No dedicated unit test for `HeaderWithNavigation` — the `onClose` behavior is covered by consumer tests in SearchInput, MultipleMatches, and ModemInfoSheet. This matches the project pattern where Subframe UI components are tested through their consumers.

- [ ] **Step 4: Verify build compiles**

Run: `cd /Users/jack/Projects/ModemChecker && npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/ui/components/HeaderWithNavigation.tsx
git commit -m "feat: sync HeaderWithNavigation from Subframe and add onClose prop"
```

---

## Chunk 2: Update SearchInput

### Task 2: Replace SearchInput header with HeaderWithNavigation

**Files:**
- Modify: `src/components/SearchInput.tsx`
- Test: `tests/components/SearchInput.test.tsx` (verify, no changes expected)

- [ ] **Step 1: Run SearchInput tests to confirm green baseline**

Run: `cd /Users/jack/Projects/ModemChecker && npx vitest run tests/components/SearchInput.test.tsx --reporter=verbose`

Expected: 6 tests pass.

- [ ] **Step 2: Update SearchInput to use HeaderWithNavigation**

In `src/components/SearchInput.tsx`:

1. Add import: `import { HeaderWithNavigation } from "@/ui/components/HeaderWithNavigation";`
2. Remove `FeatherX` from the `@subframe/core` import (keep `FeatherChevronRight` — it's still used by the Continue button). Remove the `IconButton` import entirely.
3. Replace the header `<div>` block (lines 30–42 — the flex row with heading span + conditional IconButton) with:

```tsx
<HeaderWithNavigation
  title="Search for your modem"
  variant="2-slot-blue"
  onClose={onClose}
/>
```

Keep the description `<span>` below it unchanged.

- [ ] **Step 3: Run SearchInput tests**

Run: `cd /Users/jack/Projects/ModemChecker && npx vitest run tests/components/SearchInput.test.tsx --reporter=verbose`

Expected: all 6 tests pass. The tests find the close button via `aria-label="Close"` which we added to `HeaderWithNavigation`. The heading text "Search for your modem" is passed as `title` prop.

- [ ] **Step 4: Commit**

```bash
git add src/components/SearchInput.tsx
git commit -m "refactor: use HeaderWithNavigation in SearchInput"
```

---

## Chunk 3: Update MultipleMatches

### Task 3: Replace MultipleMatches header and move back button to bottom bar

This is the largest change. The three-slot header (back + title + close) becomes a two-slot header (title + close). The back button moves to a pinned bottom bar alongside an "I can't find my modem" link.

**Files:**
- Modify: `src/components/MultipleMatches.tsx`
- Modify: `tests/components/MultipleMatches.test.tsx`

- [ ] **Step 1: Run MultipleMatches tests to confirm green baseline**

Run: `cd /Users/jack/Projects/ModemChecker && npx vitest run tests/components/MultipleMatches.test.tsx --reporter=verbose`

Expected: 8 tests pass.

- [ ] **Step 2: Update the test for back button location**

In `tests/components/MultipleMatches.test.tsx`, update the back button test. The back button is now a `<Button>` in the bottom bar (not an `IconButton` in the header). Change:

```tsx
it("calls onBack when inline back button is clicked", async () => {
  const onBack = vi.fn();
  render(
    <MultipleMatches modems={modems} onSelect={() => {}} onBack={onBack} />
  );
  const backButton = screen.getByLabelText(/back/i);
  await userEvent.click(backButton);
  expect(onBack).toHaveBeenCalledOnce();
});
```

To:

```tsx
it("calls onBack when bottom bar Back button is clicked", async () => {
  const onBack = vi.fn();
  render(
    <MultipleMatches modems={modems} onSelect={() => {}} onBack={onBack} />
  );
  await userEvent.click(screen.getByRole("button", { name: /^back$/i }));
  expect(onBack).toHaveBeenCalledOnce();
});
```

Also update the help link test — the text changes from "Help me identify my modem" to "I can't find my modem":

```tsx
it("renders the help link", () => {
  render(
    <MultipleMatches modems={modems} onSelect={() => {}} onBack={() => {}} />
  );
  expect(
    screen.getByText(/i can't find my modem/i)
  ).toBeInTheDocument();
});
```

- [ ] **Step 3: Run the updated tests to verify they fail**

Run: `cd /Users/jack/Projects/ModemChecker && npx vitest run tests/components/MultipleMatches.test.tsx --reporter=verbose`

Expected: the help link test FAILS (text "Help me identify my modem" no longer matches "I can't find my modem"). The back button test may still pass since the new query `getByRole("button", { name: /^back$/i })` can match the old `IconButton` with `aria-label="Back"` — that's fine, it will break when the component changes in Step 4. Other tests still pass.

- [ ] **Step 4: Rewrite MultipleMatches component**

Replace the entire content of `src/components/MultipleMatches.tsx` with:

```tsx
import { useCallback, useRef, useState } from "react";
import { HeaderWithNavigation } from "@/ui/components/HeaderWithNavigation";
import { Button } from "../ui/components/Button";
import { LinkButton } from "../ui/components/LinkButton";
import { CardButton } from "../ui/components/CardButton";
import { getModemImageUrl } from "../lib/supabase";
import type { Modem } from "../types";

interface MultipleMatchesProps {
  modems: Modem[];
  onSelect: (modem: Modem) => void;
  onBack: () => void;
  onClose?: () => void;
}

export function MultipleMatches({ modems, onSelect, onBack, onClose }: MultipleMatchesProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el) setIsScrolled(el.scrollTop > 4);
  }, []);

  return (
    <div className="flex w-full flex-1 flex-col items-start gap-6 min-h-0">
      <div className="flex w-full flex-col items-start gap-3 flex-shrink-0">
        <HeaderWithNavigation
          title="Select your modem"
          variant="2-slot-blue"
          onClose={onClose}
        />
        <span className="whitespace-pre-wrap text-body font-body text-brand-800">
          We found multiple possible matches. Please select your device from the list below.
        </span>
      </div>
      <div className="relative flex flex-col flex-1 min-h-0 w-full">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 flex flex-col items-start gap-2 overflow-y-auto pl-1 -ml-1 pr-2 pb-2"
        >
          {modems.map((modem) => (
            <CardButton
              key={modem.id}
              role="button"
              tabIndex={0}
              image={getModemImageUrl(modem.id)}
              modelName={modem.model}
              brand={modem.brand}
              onClick={() => onSelect(modem)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(modem);
                }
              }}
              aria-label={`${modem.brand} ${modem.model}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            />
          ))}
        </div>
        {/* Scroll-aware top scrim — fades in when content scrolls beneath the heading */}
        <div
          aria-hidden="true"
          className={[
            "pointer-events-none absolute top-0 left-0 right-0 h-16",
            "transition-opacity duration-200",
            isScrolled ? "opacity-100" : "opacity-0",
          ].join(" ")}
          style={{
            background:
              "linear-gradient(to bottom, rgba(210, 250, 255, 0.92), transparent)",
          }}
        />
      </div>
      <div className="flex w-full items-center justify-between flex-shrink-0">
        <Button
          variant="brand-secondary"
          onClick={onBack}
        >
          Back
        </Button>
        <LinkButton variant="brand" onClick={() => {}}>
          I can't find my modem
        </LinkButton>
      </div>
    </div>
  );
}
```

Key changes from the old version:
- Header: `HeaderWithNavigation` replaces the three-slot flex row
- Removed: `FeatherChevronLeft`, `FeatherX`, `IconButton` imports
- Removed: inline font overrides on heading (now uses component's `text-h2 font-h2` tokens)
- Back button: moved from header to pinned bottom bar as `<Button variant="brand-secondary">`
- Help link: moved from inside scroll area to bottom bar, text changed to "I can't find my modem"

- [ ] **Step 5: Run MultipleMatches tests**

Run: `cd /Users/jack/Projects/ModemChecker && npx vitest run tests/components/MultipleMatches.test.tsx --reporter=verbose`

Expected: all 8 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/MultipleMatches.tsx tests/components/MultipleMatches.test.tsx
git commit -m "refactor: use HeaderWithNavigation in MultipleMatches, move back button to bottom bar"
```

---

## Chunk 4: Update ModemInfoSheet

### Task 4: Replace ModemInfoSheet header with HeaderWithNavigation

**Files:**
- Modify: `src/components/ModemInfoSheet.tsx`
- Modify: `tests/components/ModemInfoSheet.test.tsx`

- [ ] **Step 1: Run ModemInfoSheet tests to confirm green baseline**

Run: `cd /Users/jack/Projects/ModemChecker && npx vitest run tests/components/ModemInfoSheet.test.tsx --reporter=verbose`

Expected: 5 tests pass.

- [ ] **Step 2: Update the dismiss button test**

The current test finds the X button via `aria-label="Dismiss"`. The `HeaderWithNavigation` component uses `aria-label="Close"`. Update the test:

Change:
```tsx
it("calls onClose when dismiss (X) button is clicked", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(<ModemInfoSheet onClose={onClose} />);
  await user.click(screen.getByRole("button", { name: /dismiss/i }));
  expect(onClose).toHaveBeenCalledOnce();
});
```

To:
```tsx
it("calls onClose when header close (X) button is clicked", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(<ModemInfoSheet onClose={onClose} />);
  await user.click(screen.getByLabelText("Close"));
  expect(onClose).toHaveBeenCalledOnce();
});
```

- [ ] **Step 3: Run the updated test to verify it fails**

Run: `cd /Users/jack/Projects/ModemChecker && npx vitest run tests/components/ModemInfoSheet.test.tsx --reporter=verbose`

Expected: the modified test FAILS (no element with aria-label "Close" — the old one uses "Dismiss"). Other tests still pass.

- [ ] **Step 4: Update ModemInfoSheet to use HeaderWithNavigation**

In `src/components/ModemInfoSheet.tsx`:

1. Add import: `import { HeaderWithNavigation } from "@/ui/components/HeaderWithNavigation";`
2. Remove imports that are no longer needed: `IconButton`, `FeatherX`
3. Replace the header `<div>` block (lines 25–37 — the flex row with img + IconButton) with:

```tsx
<HeaderWithNavigation variant="image" onClose={onClose} />
```

- [ ] **Step 5: Run ModemInfoSheet tests**

Run: `cd /Users/jack/Projects/ModemChecker && npx vitest run tests/components/ModemInfoSheet.test.tsx --reporter=verbose`

Expected: all 5 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/ModemInfoSheet.tsx tests/components/ModemInfoSheet.test.tsx
git commit -m "refactor: use HeaderWithNavigation in ModemInfoSheet"
```

---

## Chunk 5: Full verification and cleanup

### Task 5: Run full test suite and verify

**Files:** None (verification only)

- [ ] **Step 1: Run full test suite**

Run: `cd /Users/jack/Projects/ModemChecker && npx vitest run --reporter=verbose`

Expected: all 122 tests pass (count may change if tests were added/removed). Zero failures.

- [ ] **Step 2: Run TypeScript type check**

Run: `cd /Users/jack/Projects/ModemChecker && npx tsc --noEmit`

Expected: no type errors.

- [ ] **Step 3: Verify dev server runs**

Run: `cd /Users/jack/Projects/ModemChecker && npx vite build`

Expected: build completes without errors.

- [ ] **Step 4: Commit any remaining changes (if needed)**

If any lint/format changes were required:
```bash
git add -A && git commit -m "chore: post-harmonization cleanup"
```

---

## Summary of behavioral changes

| Screen | Before | After |
|---|---|---|
| **SearchInput** | Hand-coded header, `brand-secondary` close, `text-h2 font-h2 text-color-primary-701` | `HeaderWithNavigation variant="2-slot-blue"`, `brand-secondary` close, `text-h2 font-h2 text-brand-800` |
| **MultipleMatches** | Three-slot header with inline font overrides, back in header | Two-slot `HeaderWithNavigation`, back button pinned at bottom with "I can't find my modem" link |
| **ModemInfoSheet** | Hand-coded image + `neutral-primary` large close | `HeaderWithNavigation variant="image"`, same visual result |
| **ResultCard** | No close button | No change (bottom bar has Close + Check another modem) |
| **NoMatch** | No close button | No change (bottom bar has Try a new search) |
| **SearchError** | No close button | No change (bottom bar has Try again + Start a new search) |
