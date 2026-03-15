# FTTN/FTTB Not-Compatible Messaging Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the not-compatible result for FTTN/FTTB to use amber visual treatment and connection-type-aware copy instead of the current red dead-end messaging.

**Architecture:** Presentation-only changes. Resync StatusItem from Subframe (amber icon already updated there), then add a `techType` prop to CheckerCard so it can render FTTN-specific copy. Wire `onAddBelongModem` in BaseScreen to scroll to the modem summary card.

**Tech Stack:** React, Vitest, Subframe CLI, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-15-fttn-fttb-not-compatible-messaging-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/ui/components/StatusItem.tsx` | Resync from Subframe | Amber icon background + neutral title for `incompatible` status |
| `src/ui/components/CheckerCard.tsx` | Modify | Accept `techType` prop, render FTTN-specific copy when not-compatible |
| `src/components/ResultCard.tsx` | Modify | Pass `techType` through to `CheckerCard.ResultsCard` |
| `src/components/BaseScreen.tsx` | Modify | Pass `techType` to `CheckerCard`, create local `onAddBelongModem` scroll handler |
| `tests/ui/CheckerCard.test.tsx` | Modify | Add tests for FTTN-specific not-compatible copy |
| `tests/components/ResultCard.test.tsx` | Modify | Update incompatible test to pass `techType: "fttn"` and verify new copy |
| `tests/components/BaseScreen.test.tsx` | Modify | Add test for `onAddBelongModem` scroll behaviour |

---

## Task 1: Resync StatusItem from Subframe

The user has already updated the `incompatible` StatusItem variant in Subframe to use amber (`warning-2`) background with neutral title text. This task syncs that change into the codebase.

**Files:**
- Resync: `src/ui/components/StatusItem.tsx`

- [ ] **Step 1: Run Subframe sync**

```bash
npx subframe sync
```

Verify `StatusItem.tsx` was updated. Key changes to look for:
- `variant` for `status === "incompatible"` changed from `"error-dark"` to `"warning-2"`
- Title class for `status === "incompatible"` changed from `"text-error-900"` to `"text-neutral-800"`

If the sync pulls in other component changes, review them — only StatusItem should have meaningful changes. CheckerCard is sync-disabled and won't be affected.

- [ ] **Step 2: Run tests to verify nothing breaks**

```bash
npx vitest run --reporter=verbose
```

Expected: All 128 tests pass. The StatusItem visual changes don't affect text-based test assertions.

- [ ] **Step 3: Commit**

```bash
git add src/ui/
git commit -m "Resync StatusItem from Subframe: amber treatment for incompatible status"
```

---

## Task 2: Add techType prop to CheckerCard + conditional FTTN copy

**Files:**
- Modify: `src/ui/components/CheckerCard.tsx`
- Test: `tests/ui/CheckerCard.test.tsx`

- [ ] **Step 1: Write failing tests for FTTN-specific not-compatible copy**

Add these tests to `tests/ui/CheckerCard.test.tsx`:

```tsx
it("renders FTTN-specific description when not-compatible and techType is fttn", () => {
  render(
    <CheckerCard.ResultsCard
      status="not-compatible"
      modemName="Eero 6+"
      brand="Amazon"
      techType="fttn"
    />
  );
  expect(
    screen.getByText(/won\u2019t work with your home\u2019s nbn connection type/i)
  ).toBeInTheDocument();
  expect(
    screen.getByText(/use a different compatible modem/i)
  ).toBeInTheDocument();
});

it("renders default not-compatible description when techType is not fttn", () => {
  render(
    <CheckerCard.ResultsCard
      status="not-compatible"
      modemName="Some Modem"
      brand="Acme"
      techType="fttp"
    />
  );
  expect(
    screen.queryByText(/won\u2019t work with your home\u2019s nbn connection type/i)
  ).not.toBeInTheDocument();
  expect(
    screen.getByText(/purchase a different compatible modem/i)
  ).toBeInTheDocument();
});

it("renders 'add a Belong modem' as a clickable link in FTTN not-compatible", () => {
  const onAddBelongModem = vi.fn();
  render(
    <CheckerCard.ResultsCard
      status="not-compatible"
      modemName="Eero 6+"
      brand="Amazon"
      techType="fttn"
      onAddBelongModem={onAddBelongModem}
    />
  );
  const link = screen.getByRole("button", { name: /add a belong modem/i });
  expect(link).toBeInTheDocument();
});

it("renders updated FAQ link text for FTTN not-compatible", () => {
  render(
    <CheckerCard.ResultsCard
      status="not-compatible"
      modemName="Eero 6+"
      brand="Amazon"
      techType="fttn"
    />
  );
  expect(
    screen.getByText(/see our faqs for more info/i)
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/ui/CheckerCard.test.tsx --reporter=verbose
```

Expected: 4 new tests FAIL (techType prop doesn't exist yet).

- [ ] **Step 3: Add techType prop and conditional copy to CheckerCard**

In `src/ui/components/CheckerCard.tsx`:

1. Add the import for `TechType`:

```tsx
import type { ConditionCode, SpeedWarning, TechType } from "../../types";
```

2. Add `techType` to `ResultsCardProps` interface:

```tsx
interface ResultsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: "compatible" | "not-compatible" | "speed-warning" | "callout";
  modemName?: React.ReactNode;
  brand?: React.ReactNode;
  image?: string;
  techType?: TechType;
  conditions?: ConditionCode[];
  speedWarningType?: SpeedWarning["type"] | null;
  onAddBelongModem?: () => void;
  className?: string;
}
```

3. Destructure `techType` in the ResultsCard component (default `undefined`):

```tsx
  {
    status = "compatible",
    modemName,
    brand,
    image,
    techType,
    conditions = [],
    speedWarningType = null,
    onAddBelongModem,
    className,
    ...otherProps
  }: ResultsCardProps,
```

4. Add a derived boolean before the return:

```tsx
  const isFttnIncompatible = status === "not-compatible" && techType === "fttn";
```

5. Replace the not-compatible StatusItem description block (lines 192–211) with:

```tsx
                description={
                  status === "not-compatible"
                    ? isFttnIncompatible
                      ? onAddBelongModem
                        ? (
                            <>
                              This modem won{"\u2019"}t work with your home
                              {"\u2019"}s nbn connection type. You can{" "}
                              <button
                                type="button"
                                className="inline cursor-pointer border-none bg-transparent p-0 text-brand-800 underline hover:no-underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddBelongModem();
                                }}
                              >
                                add a Belong modem
                              </button>
                              , or use a different compatible modem.
                            </>
                          )
                        : "This modem won\u2019t work with your home\u2019s nbn connection type. You can add a Belong modem, or use a different compatible modem."
                      : onAddBelongModem
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

6. Update the FAQ link text conditionally (lines 217–226):

```tsx
            {status === "not-compatible" && (
              <motion.div
                className="flex flex-col items-start pl-7"
                variants={statusItemVariants}
              >
                <LinkButton variant="neutral">
                  {isFttnIncompatible
                    ? "See our FAQs for more info."
                    : "Learn more in our FAQs."}
                </LinkButton>
              </motion.div>
            )}
```

7. Add `techType` to `CheckerCardRootProps` interface and destructure it, then pass through to `ResultsCard`:

```tsx
interface CheckerCardRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  state?: "results" | "default";
  modemName?: React.ReactNode;
  brand?: React.ReactNode;
  status?: "compatible" | "not-compatible" | "speed-warning" | "callout";
  image?: string;
  techType?: TechType;
  conditions?: ConditionCode[];
  speedWarningType?: SpeedWarning["type"] | null;
  onButtonClick?: () => void;
  onAddBelongModem?: () => void;
  className?: string;
}
```

Destructure `techType` and pass it to `<ResultsCard>`:

```tsx
          <ResultsCard
            ...existing props...
            techType={techType}
          />
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/ui/CheckerCard.test.tsx --reporter=verbose
```

Expected: All tests pass (existing + 4 new).

- [ ] **Step 5: Commit**

```bash
git add src/ui/components/CheckerCard.tsx tests/ui/CheckerCard.test.tsx
git commit -m "Add FTTN-specific not-compatible copy to CheckerCard"
```

---

## Task 3: Thread techType through ResultCard

**Files:**
- Modify: `src/components/ResultCard.tsx`
- Test: `tests/components/ResultCard.test.tsx`

- [ ] **Step 1: Write failing test for FTTN-specific copy in ResultCard**

Add to `tests/components/ResultCard.test.tsx`:

```tsx
it("shows FTTN-specific description when modem is incompatible on fttn", () => {
  const modem = makeModem({
    compatibility: {
      fttp: { status: "yes", conditions: [] },
      fttc: { status: "yes", conditions: [] },
      fttn: { status: "no", conditions: [] },
      hfc: { status: "yes", conditions: [] },
    },
    wan: { has_vdsl2_modem: false, wan_port_speed_mbps: 1000 },
  });
  render(<ResultCard modem={modem} techType="fttn" />);
  expect(
    screen.getByText(/won\u2019t work with your home\u2019s nbn connection type/i)
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/components/ResultCard.test.tsx --reporter=verbose
```

Expected: New test FAILS (techType not passed through to CheckerCard.ResultsCard).

- [ ] **Step 3: Pass techType to CheckerCard.ResultsCard**

In `src/components/ResultCard.tsx`, add `techType` to the `<CheckerCard.ResultsCard>` props:

```tsx
      <CheckerCard.ResultsCard
        status={assessment.cardStatus}
        modemName={modem.model}
        brand={modem.brand}
        image={getModemImageUrl(modem.id)}
        conditions={assessment.setupConditions}
        speedWarningType={assessment.speedWarning?.type ?? null}
        onAddBelongModem={onAddBelongModem}
        techType={techType}
      />
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/components/ResultCard.test.tsx --reporter=verbose
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/ResultCard.tsx tests/components/ResultCard.test.tsx
git commit -m "Thread techType from ResultCard to CheckerCard.ResultsCard"
```

---

## Task 4: Wire onAddBelongModem + techType in BaseScreen

**Files:**
- Modify: `src/components/BaseScreen.tsx`
- Test: `tests/components/BaseScreen.test.tsx`

- [ ] **Step 1: Write failing tests**

Add to `tests/components/BaseScreen.test.tsx`:

```tsx
it("shows FTTN-specific not-compatible description for verified modem on fttn", async () => {
  const modem = makeModem({
    compatibility: {
      fttp: { status: "yes", conditions: [] },
      fttc: { status: "yes", conditions: [] },
      fttn: { status: "no", conditions: [] },
      hfc: { status: "yes", conditions: [] },
    },
    wan: { has_vdsl2_modem: false, wan_port_speed_mbps: 1000 },
  });
  render(
    <BaseScreen
      onCheckModem={vi.fn()}
      verifiedModem={modem}
      techType="fttn"
      planSpeedMbps={500}
      nbnTechType="fttn"
      planId="nbn500"
      onOpenDevMenu={vi.fn()}
    />
  );
  await userEvent.click(screen.getByText(/no, i'll use my own modem/i));
  expect(
    screen.getByText(/won\u2019t work with your home\u2019s nbn connection type/i)
  ).toBeInTheDocument();
});

it("scrolls to modem summary when 'add a Belong modem' is clicked", async () => {
  const modem = makeModem({
    compatibility: {
      fttp: { status: "yes", conditions: [] },
      fttc: { status: "yes", conditions: [] },
      fttn: { status: "no", conditions: [] },
      hfc: { status: "yes", conditions: [] },
    },
    wan: { has_vdsl2_modem: false, wan_port_speed_mbps: 1000 },
  });
  const scrollIntoViewMock = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoViewMock;

  // Create a ref so the scroll handler has a target element
  const ref = { current: document.createElement("div") };
  render(
    <BaseScreen
      modemSummaryRef={ref}
      onCheckModem={vi.fn()}
      verifiedModem={modem}
      techType="fttn"
      planSpeedMbps={500}
      nbnTechType="fttn"
      planId="nbn500"
      onOpenDevMenu={vi.fn()}
    />
  );
  await userEvent.click(screen.getByText(/no, i'll use my own modem/i));
  await userEvent.click(
    screen.getByRole("button", { name: /add a belong modem/i })
  );
  expect(scrollIntoViewMock).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/components/BaseScreen.test.tsx --reporter=verbose
```

Expected: Both new tests FAIL.

- [ ] **Step 3: Add techType and onAddBelongModem to BaseScreen's CheckerCard**

In `src/components/BaseScreen.tsx`:

1. Add a local scroll handler inside the `BaseScreen` component function body (not a new prop — this handler is defined locally alongside the existing `selection` state, using the `modemSummaryRef` prop that's already available):

```tsx
  const handleAddBelongModem = () => {
    modemSummaryRef?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
```

2. Pass `techType` and `onAddBelongModem` to the `<CheckerCard>` render (around line 157):

```tsx
                        <CheckerCard
                          state="results"
                          status={assessment.cardStatus}
                          speedWarningType={
                            assessment.speedWarning?.type ?? null
                          }
                          conditions={assessment.setupConditions}
                          modemName={verifiedModem.model}
                          brand={verifiedModem.brand}
                          image={getModemImageUrl(verifiedModem.id)}
                          onButtonClick={onCheckModem}
                          techType={techType}
                          onAddBelongModem={handleAddBelongModem}
                        />
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/components/BaseScreen.test.tsx --reporter=verbose
```

Expected: All tests pass.

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run --reporter=verbose
```

Expected: All tests pass (128 existing + new tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/BaseScreen.tsx tests/components/BaseScreen.test.tsx
git commit -m "Wire techType and onAddBelongModem in BaseScreen for FTTN copy"
```

---

## Task 5: Final verification

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run --reporter=verbose
```

Expected: All tests pass.

- [ ] **Step 2: Manual verification with dev server**

```bash
npm run dev
```

1. Open http://localhost:5173/
2. In the dev menu, set tech type to **FTTN** (or **FTTB**)
3. Select "No, I'll use my own modem"
4. Click "Check your modem" → search for a router without VDSL2 (e.g., "Eero", "Google Nest", "TP-Link Archer AX73")
5. Verify the result shows:
   - **Amber icon** (not red)
   - **"Modem is not compatible"** heading
   - **"This modem won't work with your home's nbn connection type. You can add a Belong modem, or use a different compatible modem."** description
   - **"add a Belong modem"** is a clickable link
   - **"See our FAQs for more info."** link
6. Click "add a Belong modem" → verify it scrolls up to the Belong modem summary card
7. Switch dev menu to **FTTP** → repeat with an incompatible modem (hypothetical — may not find one, but verify existing compatible/speed-warning/callout results still look correct)

- [ ] **Step 3: Commit any final fixes if needed**
