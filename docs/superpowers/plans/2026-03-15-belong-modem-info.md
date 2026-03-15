# Belong Modem Info Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add modem product information to the BaseScreen (on-page summary + detail sheet) and cross-link from incompatible BYO results.

**Architecture:** Three changes: (1) a hardcoded modem summary block in BaseScreen, (2) a new `ModemInfoSheet` component rendered in a second BottomSheet instance, (3) a cross-link callback from CheckerCard's incompatible state through to ModemChecker. All modem content is static/hardcoded — no data layer.

**Tech Stack:** React, Framer Motion (existing BottomSheet), Subframe components (FeatureItem — needs sync), Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-03-15-belong-modem-info-design.md`

**Note:** The accepted Subframe design (page `92e348a3` for on-page, `39b3fb0e` for sheet) deviates from the spec in some content details. The Subframe designs are the source of truth for copy — the spec captures the content *intent* and *rationale*.

---

## Chunk 1: Foundation — Sync, Gradient, Modem Info Sheet

### Task 1: Sync FeatureItem from Subframe

**Files:**
- Create: `src/ui/components/FeatureItem.tsx` (via CLI sync)

- [ ] **Step 1: Sync the FeatureItem component**

```bash
npx @subframe/cli@latest sync FeatureItem -p c141bce6134a
```

- [ ] **Step 2: Verify the component was synced and inspect its props**

```bash
ls src/ui/components/FeatureItem.tsx
```

Expected: file exists. Open the file and confirm it accepts `icon`, `title`, `description`, and `variant` props. If prop names differ, update Task 3's code accordingly.

- [ ] **Step 3: Commit**

```bash
git add src/ui/components/FeatureItem.tsx
git commit -m "chore: sync FeatureItem component from Subframe"
```

---

### Task 2: Add purple accent gradient utilities

**Files:**
- Modify: `src/styles/gradients.css`

The brand gradient goes from `rgba(195, 249, 255, 1)` (cyan) to white. The accent2 gradient mirrors this structure using the purple accent2 palette: `accent2-100` is `rgb(237 227 255)` and `accent2-200` is `rgb(227 211 255)`.

- [ ] **Step 1: Add accent2 gradient utilities to gradients.css**

Append after the existing `bg-gradient-brand-compact` utility:

```css
/* Accent2 (purple) gradient: mirrors brand gradient structure for the modem info sheet.
 * Full gradient transitions from accent2-100 to white. */
@utility bg-gradient-accent2 {
  background-color: #FFFFFF;
  background-image: linear-gradient(
    180deg,
    rgba(237, 227, 255, 1) 0%,
    rgba(248, 245, 255, 1) 100%
  );
}

/* Compact accent2 gradient: transitions over the first ~300px, then settles to white.
 * Used on the desktop side sheet. */
@utility bg-gradient-accent2-compact {
  background-color: #FFFFFF;
  background-image: linear-gradient(
    180deg,
    rgba(237, 227, 255, 1) 0%,
    rgba(245, 240, 255, 1) 120px,
    rgba(252, 250, 255, 1) 240px,
    rgba(255, 255, 255, 1) 320px
  );
}
```

- [ ] **Step 2: Verify dev server loads without errors**

```bash
npm run build
```

No build errors expected.

- [ ] **Step 3: Commit**

```bash
git add src/styles/gradients.css
git commit -m "feat: add accent2 (purple) gradient utilities for modem info sheet"
```

---

### Task 3: Create ModemInfoSheet component

**Files:**
- Create: `src/components/ModemInfoSheet.tsx`
- Create: `tests/components/ModemInfoSheet.test.tsx`

This is a static content component rendered inside a BottomSheet. It displays the modem product info from the Subframe design: heading, intro, four FeatureItem cards, external link, and close button. Content follows the accepted Subframe design (page `39b3fb0e`).

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/components/ModemInfoSheet.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModemInfoSheet } from "../../src/components/ModemInfoSheet";

describe("ModemInfoSheet", () => {
  it("renders the modem heading and intro", () => {
    render(<ModemInfoSheet onClose={() => {}} />);
    expect(screen.getByText("Belong Wi-Fi 6 Modem")).toBeInTheDocument();
    expect(
      screen.getByText(/fast and reliable modem/i)
    ).toBeInTheDocument();
  });

  it("renders all four feature sections", () => {
    render(<ModemInfoSheet onClose={() => {}} />);
    expect(screen.getByText("The speed your home needs")).toBeInTheDocument();
    expect(screen.getByText("Connect the whole house")).toBeInTheDocument();
    expect(screen.getByText("Support and warranty")).toBeInTheDocument();
    expect(screen.getByText("Safe and secure")).toBeInTheDocument();
  });

  it("renders the external link to belong.com.au", () => {
    render(<ModemInfoSheet onClose={() => {}} />);
    expect(
      screen.getByText(/View full details on belong.com.au/i)
    ).toBeInTheDocument();
  });

  it("calls onClose when Close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ModemInfoSheet onClose={onClose} />);
    // Target the full-width "Close" button at the bottom (not the X icon button)
    const buttons = screen.getAllByRole("button", { name: /close/i });
    await user.click(buttons[buttons.length - 1]);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when dismiss (X) button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ModemInfoSheet onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/components/ModemInfoSheet.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write the ModemInfoSheet component**

```tsx
// src/components/ModemInfoSheet.tsx
import { FeatureItem } from "@/ui/components/FeatureItem";
import { LinkButton } from "@/ui/components/LinkButton";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import {
  FeatherZap,
  FeatherWifi,
  FeatherHeart,
  FeatherShield,
  FeatherX,
} from "@subframe/core";

const BELONG_SUPPORT_URL =
  "https://www.belong.com.au/support/internet/getting-started/what-do-i-get-with-the-belong-modem";

interface ModemInfoSheetProps {
  onClose: () => void;
}

export function ModemInfoSheet({ onClose }: ModemInfoSheetProps) {
  return (
    <div className="flex w-full flex-1 flex-col items-start gap-6 min-h-0">
      {/* Header */}
      <div className="flex w-full items-start justify-between">
        <img
          className="h-28 w-36 flex-none object-cover"
          src="https://res.cloudinary.com/subframe/image/upload/v1773555007/uploads/11901/q3kxnpvkqcjl8176het5.png"
          alt="Belong Wi-Fi 6 Modem"
        />
        <IconButton
          variant="neutral-primary"
          size="large"
          icon={<FeatherX />}
          onClick={onClose}
          aria-label="Dismiss"
        />
      </div>

      {/* Title + intro */}
      <div className="flex flex-col items-start gap-2">
        <span className="text-h2 font-h2 text-color-accent2-800">
          Belong Wi-Fi 6 Modem
        </span>
        <span className="text-body-bold font-body-bold text-color-accent2-800">
          A fast and reliable modem designed to get the most out of your Belong
          nbn plan.
        </span>
      </div>

      {/* Feature cards */}
      <div className="flex w-full flex-col items-start gap-2">
        <FeatureItem
          icon={<FeatherZap />}
          title="The speed your home needs"
          description="The Belong modem delivers speeds up to 950Mbps, fast enough for all Belong nbn plans — including ultra fast fibre."
          variant="card"
        />
        <FeatureItem
          icon={<FeatherWifi />}
          title="Connect the whole house"
          description="Supports 12+ simultaneous device connections, so everyone in the household can stream, game, and scroll seamlessly."
          variant="card"
        />
        <FeatureItem
          icon={<FeatherHeart />}
          title="Support and warranty"
          description="24-month warranty with troubleshooting support (live chat or phone)."
          variant="card"
        />
        <FeatureItem
          icon={<FeatherShield />}
          title="Safe and secure"
          description="Customisable parental controls built-in. Encryption keeps your network secure, and security updates are delivered automatically — you won't need to do a thing."
          variant="card"
        />
      </div>

      {/* Footer */}
      <div className="flex w-full flex-col items-start gap-8 mt-auto">
        <LinkButton
          variant="brand"
          icon={null}
          onClick={() => window.open(BELONG_SUPPORT_URL, "_blank", "noopener")}
        >
          View full details on belong.com.au
        </LinkButton>
        <Button
          className="h-12 w-full flex-none"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/components/ModemInfoSheet.test.tsx
```

Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ModemInfoSheet.tsx tests/components/ModemInfoSheet.test.tsx
git commit -m "feat: add ModemInfoSheet component with product info content"
```

---

## Chunk 2: BaseScreen Summary Block + Sheet Wiring

### Task 4: Add modem summary block to BaseScreen

**Files:**
- Modify: `src/components/BaseScreen.tsx`
- Modify: `tests/components/BaseScreen.test.tsx`

Insert the modem summary block between the H2 heading and the RadioCardGroup. Add an optional `onLearnMore` callback prop to open the modem info sheet. Also add intro text: "You can choose to add a Belong modem, or use your own compatible modem."

The existing tests render `<BaseScreen onCheckModem={() => {}} />` with inline props (no `defaultProps` object). `onLearnMore` must be optional (`onLearnMore?`) so existing tests continue to work without changes.

- [ ] **Step 1: Write the failing tests**

Add these tests to `tests/components/BaseScreen.test.tsx` (after the existing tests, inside the `describe` block). Use the same inline prop pattern as existing tests:

```tsx
it("renders the modem summary block with product name and price", () => {
  render(<BaseScreen onCheckModem={() => {}} />);
  expect(screen.getByText("Belong Modem")).toBeInTheDocument();
  expect(
    screen.getByText("$132 upfront, or $11/month over 12 months")
  ).toBeInTheDocument();
});

it("renders the three benefit bullets", () => {
  render(<BaseScreen onCheckModem={() => {}} />);
  expect(screen.getByText("Supports all Belong nbn plans")).toBeInTheDocument();
  expect(screen.getByText(/Connect to 12\+ devices/)).toBeInTheDocument();
  expect(screen.getByText("24-month warranty")).toBeInTheDocument();
});

it("calls onLearnMore when Learn more link is clicked", async () => {
  const onLearnMore = vi.fn();
  render(<BaseScreen onCheckModem={() => {}} onLearnMore={onLearnMore} />);
  await userEvent.click(screen.getByText("Learn more"));
  expect(onLearnMore).toHaveBeenCalledOnce();
});
```

- [ ] **Step 2: Run tests to verify the new ones fail**

```bash
npx vitest run tests/components/BaseScreen.test.tsx
```

Expected: new tests FAIL (content not found). Existing tests still PASS.

- [ ] **Step 3: Update BaseScreen component**

Add `onLearnMore` as an **optional** prop to the interface:

```tsx
interface BaseScreenProps {
  onCheckModem: () => void;
  onLearnMore?: () => void;  // NEW — optional
  verifiedModem?: Modem;
  techType: TechType;
  planSpeedMbps: number;
  nbnTechType: NbnTechType;
  planId: string;
  onOpenDevMenu: () => void;
}
```

Add `onLearnMore` to the destructuring and `FeatherCheck` to imports:

```tsx
import { FeatherCheck, FeatherChevronRight, FeatherRouter } from "@subframe/core";
```

Insert the intro text and modem summary block inside the existing `gap-3` div, between the H2 `<span>` and `<RadioCardGroup>`. The current structure is:

```tsx
<div className="flex w-full flex-col items-start gap-3">
  <span className="text-h2 font-h2 text-brand-800">Modem selection</span>
  {/* INSERT NEW CONTENT HERE */}
  <RadioCardGroup ... />
</div>
```

New content to insert:

```tsx
<span className="text-body font-body text-default-font">
  You can choose to add a Belong modem, or use your own
  compatible modem.
</span>
<div className="flex w-full flex-col items-start gap-3 rounded-md bg-color-accent2-100 px-4 py-4">
  <div className="flex w-full items-start gap-4">
    <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
      <span className="text-h4-button-500 font-h4-button-500 text-color-accent2-800">
        Belong Modem
      </span>
      <span className="text-body font-body text-default-font">
        $132 upfront, or $11/month over 12 months
      </span>
    </div>
    <img
      className="h-20 w-28 flex-none rounded-md object-cover"
      src="https://res.cloudinary.com/subframe/image/upload/v1773555007/uploads/11901/q3kxnpvkqcjl8176het5.png"
      alt="Belong Modem"
    />
  </div>
  <div className="flex flex-col items-start gap-1">
    <div className="flex items-center gap-2">
      <FeatherCheck className="text-h4-button-500 font-h4-button-500 text-color-accent2-800" />
      <span className="text-body font-body text-default-font">
        Supports all Belong nbn plans
      </span>
    </div>
    <div className="flex items-center gap-2">
      <FeatherCheck className="text-h4-button-500 font-h4-button-500 text-color-accent2-800" />
      <span className="text-body font-body text-default-font">
        Connect to 12+ devices at once
      </span>
    </div>
    <div className="flex items-center gap-2">
      <FeatherCheck className="text-h4-button-500 font-h4-button-500 text-color-accent2-800" />
      <span className="text-body font-body text-default-font">
        24-month warranty
      </span>
    </div>
  </div>
  <LinkButton icon={null} iconRight={null} onClick={onLearnMore}>
    Learn more
  </LinkButton>
</div>
```

- [ ] **Step 4: Run all BaseScreen tests**

```bash
npx vitest run tests/components/BaseScreen.test.tsx
```

Expected: all 9 tests PASS (6 existing + 3 new).

- [ ] **Step 5: Commit**

```bash
git add src/components/BaseScreen.tsx tests/components/BaseScreen.test.tsx
git commit -m "feat: add modem summary block to BaseScreen with Learn more trigger"
```

---

### Task 5: Wire modem info sheet into ModemChecker

**Files:**
- Modify: `src/components/BottomSheet.tsx`
- Modify: `src/components/ModemChecker.tsx`
- Modify: `tests/components/ModemChecker.test.tsx`

Add a `gradient` prop to BottomSheet to switch between brand (cyan) and accent2 (purple) gradients. Add a second BottomSheet instance in ModemChecker for modem info. ModemChecker manages `modemInfoOpen` state independently from `sheetOpen`.

- [ ] **Step 1: Add gradient and title props to BottomSheet**

In `src/components/BottomSheet.tsx`:

Add a lookup object above the component (Tailwind requires full class names at build time — no template literals):

```tsx
const GRADIENT_CLASSES = {
  brand: { full: "bg-gradient-brand", compact: "md:bg-gradient-brand-compact" },
  accent2: { full: "bg-gradient-accent2", compact: "md:bg-gradient-accent2-compact" },
} as const;
```

Update the interface:

```tsx
interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  gradient?: "brand" | "accent2";
  title?: string;
}
```

Update the component to destructure the new props and use the lookup:

```tsx
export function BottomSheet({ open, onClose, children, gradient = "brand", title = "Modem search" }: BottomSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const axis = isDesktop ? "x" : "y";
  const gradientConfig = GRADIENT_CLASSES[gradient];
```

Update the motion.div `className` array — replace the two hardcoded gradient classes:

```tsx
className={[
  // Base
  `fixed z-50 ${gradientConfig.full} shadow-xl overflow-hidden outline-none`,
  "flex flex-col min-h-[70vh]",
  // Mobile: bottom sheet
  "inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl p-5 pb-8",
  // Desktop: side sheet
  "md:inset-y-0 md:right-0 md:left-auto",
  `${gradientConfig.compact} md:w-[480px] md:max-h-none md:rounded-none md:p-6`,
].join(" ")}
```

Update the Dialog.Title:

```tsx
<Dialog.Title className="sr-only">{title}</Dialog.Title>
```

- [ ] **Step 2: Write the failing test for ModemChecker**

Add to `tests/components/ModemChecker.test.tsx`:

```tsx
it("opens modem info sheet when Learn more is clicked", async () => {
  const user = userEvent.setup();
  render(<ModemChecker />);
  await user.click(screen.getByText("Learn more"));
  expect(screen.getByText("Belong Wi-Fi 6 Modem")).toBeInTheDocument();
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx vitest run tests/components/ModemChecker.test.tsx
```

Expected: FAIL — "Learn more" click doesn't open the sheet yet.

- [ ] **Step 4: Wire up ModemChecker**

Add state and the second BottomSheet. In `src/components/ModemChecker.tsx`:

Add import:
```tsx
import { ModemInfoSheet } from "./ModemInfoSheet";
```

Add state:
```tsx
const [modemInfoOpen, setModemInfoOpen] = useState(false);
```

Pass `onLearnMore` to BaseScreen:
```tsx
<BaseScreen
  onCheckModem={() => setSheetOpen(true)}
  onLearnMore={() => setModemInfoOpen(true)}
  verifiedModem={verifiedModem}
  // ... rest of existing props
/>
```

Add second BottomSheet after the existing one (and after the DevMenu):
```tsx
<BottomSheet
  open={modemInfoOpen}
  onClose={() => setModemInfoOpen(false)}
  gradient="accent2"
  title="Belong modem information"
>
  <ModemInfoSheet onClose={() => setModemInfoOpen(false)} />
</BottomSheet>
```

- [ ] **Step 5: Run all ModemChecker tests**

```bash
npx vitest run tests/components/ModemChecker.test.tsx
```

Expected: all tests PASS.

- [ ] **Step 6: Run the full test suite**

```bash
npx vitest run
```

Expected: all 110+ tests PASS. No regressions — existing BottomSheet usage doesn't pass `gradient`, defaults to "brand".

- [ ] **Step 7: Commit**

```bash
git add src/components/BottomSheet.tsx src/components/ModemChecker.tsx tests/components/ModemChecker.test.tsx
git commit -m "feat: wire modem info sheet with accent2 gradient BottomSheet variant"
```

---

## Chunk 3: Cross-Link from Incompatible Results

### Task 6: Add cross-link callback to CheckerCard and ResultCard

**Files:**
- Modify: `src/ui/components/CheckerCard.tsx`
- Modify: `src/components/ResultCard.tsx`
- Modify: `tests/components/ResultCard.test.tsx`

When the modem is incompatible, the StatusItem description should contain a tappable "Add a Belong modem to your order" link that triggers an `onAddBelongModem` callback. The link only renders when `onAddBelongModem` is provided — this prevents the on-page `CheckerCard` (in BaseScreen, which doesn't pass the callback) from rendering a non-functional link.

**Note:** `StatusItem`'s `description` prop is already typed as `React.ReactNode`, so no changes needed to StatusItem itself.

- [ ] **Step 1: Write the failing test**

Add to `tests/components/ResultCard.test.tsx`:

```tsx
it("renders 'Add a Belong modem' as a link when incompatible and calls onAddBelongModem", async () => {
  const onAddBelongModem = vi.fn();
  const modem = makeModem({
    compatibility: {
      fttp: { status: "no", conditions: [] },
      fttc: { status: "no", conditions: [] },
      fttn: { status: "no", conditions: [] },
      hfc: { status: "no", conditions: [] },
    },
  });
  render(
    <ResultCard
      modem={modem}
      techType="fttp"
      onAddBelongModem={onAddBelongModem}
    />
  );
  const link = screen.getByText(/Add a Belong modem/i);
  expect(link).toBeInTheDocument();
  await userEvent.click(link);
  expect(onAddBelongModem).toHaveBeenCalledOnce();
});

it("does not render cross-link when onAddBelongModem is not provided", () => {
  const modem = makeModem({
    compatibility: {
      fttp: { status: "no", conditions: [] },
      fttc: { status: "no", conditions: [] },
      fttn: { status: "no", conditions: [] },
      hfc: { status: "no", conditions: [] },
    },
  });
  render(<ResultCard modem={modem} techType="fttp" />);
  expect(screen.queryByText(/Add a Belong modem/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/components/ResultCard.test.tsx
```

Expected: FAIL — new tests fail, existing tests still pass.

- [ ] **Step 3: Add onAddBelongModem prop to CheckerCard.ResultsCard**

In `src/ui/components/CheckerCard.tsx`:

Add `onAddBelongModem?: () => void` to `ResultsCardProps`:

```tsx
interface ResultsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  // ... existing props
  onAddBelongModem?: () => void;
}
```

Add it to the destructuring in `ResultsCard`. Update the incompatible StatusItem's `description` — only render the link when the callback is provided:

```tsx
description={
  status === "not-compatible"
    ? onAddBelongModem
      ? (
          <>
            <button
              type="button"
              className="inline cursor-pointer border-none bg-transparent p-0 text-brand-800 underline hover:no-underline"
              onClick={(e) => {
                e.stopPropagation();
                onAddBelongModem();
              }}
            >
              Add a Belong modem to your order
            </button>
            , or purchase a different compatible modem before your connection date.
          </>
        )
      : "Add a Belong modem to your order, or purchase a different compatible modem before your connection date."
    : undefined
}
```

Also add `onAddBelongModem?: () => void` to `CheckerCardRootProps` and thread it to the internal `<ResultsCard>`:

```tsx
<ResultsCard
  // ... existing props
  onAddBelongModem={onAddBelongModem}
/>
```

- [ ] **Step 4: Add onAddBelongModem prop to ResultCard**

In `src/components/ResultCard.tsx`, add `onAddBelongModem?: () => void` to `ResultCardProps` and pass it through:

```tsx
interface ResultCardProps {
  modem: Modem;
  techType: TechType;
  planSpeedMbps?: number;
  onDone?: () => void;
  onReset?: () => void;
  onAddBelongModem?: () => void;
}

// In the component, destructure it and pass through:
<CheckerCard.ResultsCard
  // ... existing props
  onAddBelongModem={onAddBelongModem}
/>
```

- [ ] **Step 5: Run tests**

```bash
npx vitest run tests/components/ResultCard.test.tsx
```

Expected: all tests PASS (existing + 2 new).

- [ ] **Step 6: Commit**

```bash
git add src/ui/components/CheckerCard.tsx src/components/ResultCard.tsx tests/components/ResultCard.test.tsx
git commit -m "feat: add cross-link from incompatible results to Belong modem section"
```

---

### Task 7: Wire cross-link through ModemChecker with scroll

**Files:**
- Modify: `src/components/ModemChecker.tsx`
- Modify: `src/components/BaseScreen.tsx`

When `onAddBelongModem` fires: close the checker sheet, clear `verifiedModem`, reset search state, and scroll to the modem summary block.

- [ ] **Step 1: Add ref prop to BaseScreen**

In `src/components/BaseScreen.tsx`, add a `modemSummaryRef` prop:

```tsx
interface BaseScreenProps {
  // ... existing props
  modemSummaryRef?: React.RefObject<HTMLDivElement | null>;
}
```

Add it to the destructuring and attach it to the modem summary block container:

```tsx
<div ref={modemSummaryRef} className="flex w-full flex-col items-start gap-3 rounded-md bg-color-accent2-100 px-4 py-4">
```

- [ ] **Step 2: Wire in ModemChecker**

In `src/components/ModemChecker.tsx`:

Add `useRef` to the React import:
```tsx
import { useState, useRef } from "react";
```

Add the ref:
```tsx
const modemSummaryRef = useRef<HTMLDivElement>(null);
```

Add the handler:
```tsx
const handleAddBelongModem = () => {
  setSheetOpen(false);
  setVerifiedModem(undefined);
  reset();
  // Scroll after sheet close animation settles
  setTimeout(() => {
    modemSummaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 350);
};
```

Pass the ref to BaseScreen:
```tsx
<BaseScreen
  modemSummaryRef={modemSummaryRef}
  // ... rest of existing props
/>
```

Pass `onAddBelongModem` to ResultCard (it's only rendered when `state.step === "single_match"`):
```tsx
{state.step === "single_match" && (
  <ResultCard
    modem={state.modem}
    techType={techType}
    planSpeedMbps={planSpeedMbps}
    onDone={handleDone}
    onReset={handleCheckAnother}
    onAddBelongModem={handleAddBelongModem}
  />
)}
```

- [ ] **Step 3: Run the full test suite**

```bash
npx vitest run
```

Expected: all tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/ModemChecker.tsx src/components/BaseScreen.tsx
git commit -m "feat: wire cross-link scroll from incompatible results to modem summary"
```

---

### Task 8: Manual verification

- [ ] **Step 1: Start dev server and verify on-page summary**

```bash
npm run dev
```

Open http://localhost:5173/. Verify:
- Modem summary block appears between heading and radio group
- Image, product name, price, three bullets, and "Learn more" link all render
- "Learn more" opens the purple accent2 gradient sheet with feature cards

- [ ] **Step 2: Verify cross-link flow**

1. Select "No, I'll use my own modem"
2. Click "Check your modem"
3. Search for an incompatible modem (e.g. search "Kaon" and select a result)
4. Verify "Add a Belong modem to your order" is a clickable link in the incompatible result
5. Click it — sheet should close, page should scroll to modem summary block
6. Verify `verifiedModem` was cleared (no modem showing in BYO section)

- [ ] **Step 3: Verify no regressions**

1. Existing checker flow works (search → results → done → verified modem shows on page)
2. BYO section still reveals/hides on radio selection
3. Compatible results don't show the "Add a Belong modem" link as a button
4. Desktop side-sheet variant uses compact gradient
5. Both sheets can open/close independently

- [ ] **Step 4: Final commit if any tweaks were needed**
