# Figma → Subframe UI Build — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Translate the Figma modem checker designs into Subframe components and screens, export code, and wire into the existing data layer to produce a working widget.

**Architecture:** 4-phase pipeline per the `figma-to-subframe` skill — Figma inventory → Subframe primitives → Subframe screen compositions → code export & integration. The data layer (types, constants, hooks, Supabase client) is already built. Existing behavioral tests define the component contracts.

**Tech Stack:** Figma Console MCP (screenshots), Subframe MCP (design + export), React 19, Tailwind CSS 4, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-03-12-figma-to-subframe-workflow-design.md`

**Skill:** `skills/figma-to-subframe/SKILL.md` — MUST be invoked before any visual component work.

---

## Chunk 1: Figma Inventory (Phase 1)

### Task 1: Discover Missing Figma Node IDs

The `figma-nodes.md` reference is incomplete — only the top-level frames and the MultipleMatches detail are documented. The Sheets section (3100:8632) children are listed as "TBD".

**Files:**
- Modify: `~/.claude/projects/-Users-jack-Projects-ModemChecker/memory/figma-nodes.md` (Claude project memory, NOT the repo root)

- [ ] **Step 1: Connect to Figma**

Verify Figma Console MCP is connected:
```
figma_get_status
```
If not connected, ask user to run:
```bash
open -a Figma --args --remote-debugging-port=9222
```
Then enable the Desktop Bridge plugin in Figma.

- [ ] **Step 2: Navigate to the Sheets section and enumerate children**

Use `figma_navigate` to go to section `3100:8632`, then use `figma_execute` to enumerate all child frames:
```javascript
const section = figma.getNodeById("3100:8632");
if (section && "children" in section) {
  return section.children.map(c => ({
    id: c.id, name: c.name, type: c.type,
    width: "width" in c ? c.width : null,
    height: "height" in c ? c.height : null
  }));
}
```

- [ ] **Step 3: Update figma-nodes.md with discovered node IDs**

Add all discovered sheet frames to the Sheets Section table. Map each frame to the corresponding UX flow screen (SearchInput, LoadingState, MultipleMatches, ResultCard variants, NoMatch).

### Task 2: Screenshot All Design Frames

**Files:**
- None (screenshots are used as visual reference, not saved to repo)

- [ ] **Step 1: Screenshot each top-level frame**

Take screenshots of the known frames:
```
figma_take_screenshot(node_id="3108:7665")  → BaseScreen (no BYO)
figma_take_screenshot(node_id="3100:8430")  → BaseScreen (BYO selected)
figma_take_screenshot(node_id="3114:20863") → Results (compatible, inline)
figma_take_screenshot(node_id="3114:21060") → Results (incompatible, inline)
```

- [ ] **Step 2: Screenshot each sheet frame**

Using the node IDs discovered in Task 1, screenshot each sheet frame:
```
figma_take_screenshot(node_id="<search-input-id>")
figma_take_screenshot(node_id="<loading-state-id>")
figma_take_screenshot(node_id="3100:8305")  → MultipleMatches (known)
figma_take_screenshot(node_id="<result-compatible-id>")
figma_take_screenshot(node_id="<result-warning-id>")
figma_take_screenshot(node_id="<result-incompatible-id>")
figma_take_screenshot(node_id="<no-match-id>")
```

- [ ] **Step 3: Annotate each screenshot**

For each screenshot, note:
- Screen name (mapped to UX flow step)
- Interactive elements (buttons, inputs, radio cards, links)
- Visual patterns (colors, typography, spacing, shared elements)

- [ ] **Step 4: Cross-reference and confirm Component Inventory**

Compare observed shared elements against the inventory in the spec. Confirm or update:

| Primitive | Variants | Screens Used In |
|-----------|----------|-----------------|
| PillButton | filled, outline | Every screen |
| TextInput | — | SearchInput |
| RadioCard | default, selected | MultipleMatches, BaseScreen |
| ConditionItem | — | ResultCard (yes_but) |
| StatusBadge | compatible, warning, incompatible | ResultCard |

Verify every screen in `docs/ux-flow.md` has a corresponding screenshot.

---

## Chunk 2: Subframe Primitives (Phase 2)

### Task 3: Check Existing Subframe State

- [ ] **Step 1: List existing components**

```
@subframe list_components (project c141bce6134a)
```

Note which primitives already exist (from earlier sessions). Do not duplicate.

- [ ] **Step 2: List existing pages**

```
@subframe list_pages (project c141bce6134a)
```

Note which screen compositions already exist.

- [ ] **Step 3: Check theme**

```
@subframe get_theme (project c141bce6134a)
```

Verify Belong teal, green (success), amber (warning), red (error) tokens and Plus Jakarta Sans are configured. If missing, flag to user — theme setup is a separate task.

### Task 4: Create PillButton Component

**Dependencies:** None (base primitive)

- [ ] **Step 1: Design PillButton in Subframe**

Invoke `subframe:design`. Design brief:

> Create a reusable **PillButton** component with two variants: `filled` and `outline`.
>
> Visual target: [reference Figma screenshots showing buttons — the Continue and Back buttons visible across all screens]
>
> - **Filled:** Brand teal background, white text, full pill radius
> - **Outline:** Transparent background, brand teal border and text, full pill radius
> - **Disabled state:** Reduced opacity, non-interactive
> - Use the project's existing theme tokens for colors and typography
> - Horizontal padding generous (24-32px), vertical ~12px

- [ ] **Step 2: Verify creation**

```
@subframe list_components → confirm PillButton exists
```

### Task 5: Create TextInput Component

**Dependencies:** None

- [ ] **Step 1: Design TextInput in Subframe**

Invoke `subframe:design`. Design brief:

> Create a reusable **TextInput** component.
>
> Visual target: [reference Figma SearchInput screenshot showing the text field]
>
> - Rounded corners (xl radius)
> - Light border, focus state with brand color ring
> - Placeholder text support
> - Full-width by default
> - Use theme tokens

- [ ] **Step 2: Verify creation**

```
@subframe list_components → confirm TextInput exists
```

### Task 6: Create RadioCard Component

**Dependencies:** None

- [ ] **Step 1: Design RadioCard in Subframe**

Invoke `subframe:design`. Design brief:

> Create a reusable **RadioCard** component with two states: `default` and `selected`.
>
> Visual target: [reference Figma MultipleMatches screenshot (3100:8305) and BaseScreen showing radio options]
>
> - Card container with light background, rounded corners, border
> - Left-aligned radio indicator (circle, filled when selected)
> - Label text (modem name / option title), optional subtitle
> - **Default:** Neutral border and background
> - **Selected:** Brand teal accent border, light brand tint background, filled radio dot
> - Clickable entire card area
> - Use theme tokens

- [ ] **Step 2: Verify creation**

```
@subframe list_components → confirm RadioCard exists
```

### Task 7: Create ConditionItem Component

**Dependencies:** None

- [ ] **Step 1: Design ConditionItem in Subframe**

Invoke `subframe:design`. Design brief:

> Create a reusable **ConditionItem** component.
>
> Visual target: [reference Figma ResultCard screenshot showing yes_but state with condition rows]
>
> - Light gray background card/row
> - Bold label text
> - Regular description text below label
> - Subtle rounded corners
> - Use theme tokens

- [ ] **Step 2: Verify creation**

```
@subframe list_components → confirm ConditionItem exists
```

### Task 8: Create StatusBadge Component

**Dependencies:** None

- [ ] **Step 1: Design StatusBadge in Subframe**

Invoke `subframe:design`. Design brief:

> Create a reusable **StatusBadge** component with three variants: `compatible`, `warning`, `incompatible`.
>
> Visual target: [reference Figma ResultCard screenshots showing all three states]
>
> - Icon + heading text, horizontally aligned
> - **compatible:** Green checkmark icon, green heading text
> - **warning:** Amber warning triangle icon, amber heading text
> - **incompatible:** Red X icon, red heading text
> - Use theme success/warning/error color tokens

- [ ] **Step 2: Verify creation**

```
@subframe list_components → confirm StatusBadge exists
```

### Task 8b: Phase Gate — Verify All Primitives Exist

- [ ] **Step 1: Confirm all 5 primitives in Subframe**

```
@subframe list_components (project c141bce6134a)
```

Verify ALL of these exist: PillButton, TextInput, RadioCard, ConditionItem, StatusBadge. Do NOT proceed to Phase 3 until all 5 are confirmed. If any are missing, go back and create them.

---

## Chunk 3: Subframe Screen Compositions (Phase 3)

### Task 9: Compose SearchInput Screen

- [ ] **Step 1: Design SearchInput page in Subframe**

Invoke `subframe:design`. Design brief:

> Create a **SearchInput** screen page. This is bottom sheet content (not the sheet itself).
>
> Visual target: [reference Figma SearchInput sheet screenshot]
>
> - Illustration/graphic area at top (placeholder space)
> - Title: "Find your modem's model name/number"
> - Subtitle/helper text about checking the sticker on the device
> - Use the **TextInput** component for the search field. Placeholder text: "e.g. TP-Link Archer VR1600v"
> - Use the **PillButton** (filled variant) for the "Continue" button
> - Vertical layout with comfortable spacing

- [ ] **Step 2: Validate against Figma**

Invoke `design-review` skill with parity mode, comparing the Subframe page screenshot against the Figma SearchInput screenshot. If significantly off, iterate (max 2 passes).

### Task 10: Compose LoadingState Screen

- [ ] **Step 1: Design LoadingState page in Subframe**

Invoke `subframe:design`. Design brief:

> Create a **LoadingState** screen page. Bottom sheet content.
>
> Visual target: [reference Figma LoadingState sheet screenshot]
>
> - Centered layout
> - Spinner or animated indicator (Subframe animation if available)
> - Text: "Finding your modem..."
> - Minimal, clean design

- [ ] **Step 2: Validate against Figma**

Invoke `design-review` or compare screenshots visually.

### Task 11: Compose MultipleMatches Screen

- [ ] **Step 1: Design MultipleMatches page in Subframe**

Invoke `subframe:design`. Design brief:

> Create a **MultipleMatches** screen page. Bottom sheet content.
>
> Visual target: [reference Figma MultipleMatches screenshot (3100:8305)]
>
> - Title: "Multiple matches found"
> - Subtitle explaining to select the correct model
> - Scrollable list of **RadioCard** components (one per modem result)
> - "Help me identify my modem" text link below the list
> - Footer with two buttons: **PillButton** (outline) for "Back", **PillButton** (filled) for "Continue"
> - Continue button should appear disabled when nothing is selected

- [ ] **Step 2: Validate against Figma**

Invoke `design-review` or compare screenshots. Iterate if needed.

### Task 12: Compose ResultCard Screen

- [ ] **Step 1: Design ResultCard page in Subframe**

Invoke `subframe:design`. Design brief:

> Create a **ResultCard** screen page. Bottom sheet content. Design for the `yes_but` state (most complex variant — the other states are subsets of this layout).
>
> Visual target: [reference Figma ResultCard screenshots for all three states]
>
> - Modem info section: brand and model in a card
> - **StatusBadge** component showing compatibility status
> - List of **ConditionItem** components (visible in `yes_but` state; hidden in `yes` and `no` states — the design should allow this section to be conditionally hidden)
> - **PillButton** (filled) for "Done" at the bottom — this closes the sheet
> - Clean vertical layout
>
> The three states differ only in StatusBadge variant and whether ConditionItems are shown. The `yes` state: green badge, no conditions. The `no` state: red badge, no conditions. The `yes_but` state: amber badge, conditions visible.

- [ ] **Step 2: Validate against Figma**

Compare against all three result state screenshots. The design should accommodate all states through content visibility, not separate layouts.

### Task 13: Compose NoMatch Screen

- [ ] **Step 1: Design NoMatch page in Subframe**

Invoke `subframe:design`. Design brief:

> Create a **NoMatch** screen page. Bottom sheet content.
>
> Visual target: [reference Figma NoMatch sheet screenshot]
>
> - Title: "No modem found"
> - Descriptive text advising to check spelling or device sticker
> - **PillButton** (filled) for "Try again"
> - Centered, simple layout

- [ ] **Step 2: Validate against Figma**

Compare screenshots. This is a simple screen — one pass should suffice.

### Task 14: Compose BaseScreen

- [ ] **Step 1: Design BaseScreen page in Subframe**

Invoke `subframe:design`. Design brief:

> Create a **BaseScreen** page. This is NOT a bottom sheet — it's the main page form section.
>
> Visual target: [reference Figma BaseScreen screenshots (3108:7665 and 3100:8430)]
>
> - Section title: "Modem selection"
> - Question: "Do you rent a Belong modem?"
> - Two **RadioCard** options:
>   - "Yes, I have a Belong modem"
>   - "No, I have my own compatible modem"
> - When BYO selected: expandable section with "Modem compatibility" heading, explainer text, and **PillButton** (filled) "Check my modem"
> - Clean form layout

- [ ] **Step 2: Validate against Figma**

Compare both states (no selection, BYO selected) against the two Figma screenshots.

---

## Chunk 4: Export & Code Integration (Phase 4)

### Task 15: Export All Components from Subframe

- [ ] **Step 1: Export primitives**

Invoke `subframe:develop` for each primitive component:
- PillButton
- TextInput
- RadioCard
- ConditionItem
- StatusBadge

- [ ] **Step 2: Export screens**

Invoke `subframe:develop` for each screen:
- SearchInput
- LoadingState
- MultipleMatches
- ResultCard
- NoMatch
- BaseScreen

- [ ] **Step 3: Place exports in src/components/**

Save each exported component to `src/components/`. Overwrite any existing hand-coded files with the same names. Do NOT commit yet — the exports are raw markup without behavioral wiring. Each subsequent task will commit the component after wiring.

### Task 15b: Map Exported Prop Interfaces

Before wiring behavior, inspect each exported component's props to understand what Subframe generated.

- [ ] **Step 1: Document the prop mapping**

For each exported component, read the file and note:
- What props does it accept? (e.g., Subframe may use `title` instead of `label`, `onClick` instead of `onPress`)
- What DOM elements are used? (e.g., native `<input type="radio">` vs custom div)
- What text content is hardcoded vs prop-driven?

Create a quick reference mapping expected behavioral props to Subframe export props. For example:

```
PillButton:    onClick → onClick (match), label → children or text (check)
RadioCard:     label → ?? , selected → ?? , onClick → ??
ConditionItem: label → title? , description → text?
StatusBadge:   variant → type? status?
```

This mapping informs Tasks 16-22. Adjust wiring code to use the actual prop names from the exports.

### Task 16: Wire SearchInput Behavior

**Files:**
- Modify: `src/components/SearchInput.tsx`
- Test: `tests/components/SearchInput.test.tsx`

The Subframe export provides markup. We need to wire:
- `onSearch` callback prop
- Form submission (button click + Enter key)
- Empty input guard

- [ ] **Step 1: Add props and behavior to SearchInput**

Wire the exported Subframe markup:
- Accept `onSearch: (query: string) => void` prop
- Track input value with `useState`
- On form submit (button click or Enter), trim input, call `onSearch` if non-empty
- Connect the TextInput to the state, PillButton to submit

- [ ] **Step 2: Run existing tests**

```bash
npx vitest run tests/components/SearchInput.test.tsx
```

Expected: All 4 tests pass. The tests check:
- Heading text matching `/find your modem/i`
- Input placeholder matching `/e\.g\./i`
- Button text matching `/continue/i`
- `onSearch` called with value on submit
- Not called when empty
- Enter key submission

If tests fail on markup selectors (placeholder regex, heading text), update the Subframe markup to use the expected text, or update tests to match the new text if the Figma design uses different wording.

- [ ] **Step 3: Commit**

```bash
git add src/components/SearchInput.tsx tests/components/SearchInput.test.tsx
git commit -m "feat: wire SearchInput behavior to Subframe export"
```

### Task 17: Wire MultipleMatches Behavior

**Files:**
- Modify: `src/components/MultipleMatches.tsx`
- Test: `tests/components/MultipleMatches.test.tsx`

Wire:
- `modems: Modem[]`, `onSelect: (modem: Modem) => void`, `onBack: () => void` props
- RadioCard selection state
- Continue button disabled until selection

- [ ] **Step 1: Add props and behavior**

Wire the exported Subframe markup:
- Accept props: `modems`, `onSelect`, `onBack`
- Map `modems` array to RadioCard instances showing `brand` + `model`
- Track selected modem with `useState<Modem | null>(null)`
- RadioCard click sets selection
- Continue PillButton disabled when `selected === null`
- Continue click calls `onSelect(selected)`
- Back PillButton calls `onBack`

- [ ] **Step 2: Run existing tests**

```bash
npx vitest run tests/components/MultipleMatches.test.tsx
```

Expected: All 4 tests pass. Tests check:
- Heading matching `/multiple matches/i`
- All modem models rendered
- Continue button disabled until selection
- `onSelect` called with correct modem
- `onBack` called on back button

- [ ] **Step 3: Commit**

```bash
git add src/components/MultipleMatches.tsx tests/components/MultipleMatches.test.tsx
git commit -m "feat: wire MultipleMatches behavior to Subframe export"
```

### Task 18: Wire ResultCard + ConditionList Behavior

**Files:**
- Modify: `src/components/ResultCard.tsx`, `src/components/ConditionList.tsx`
- Test: `tests/components/ResultCard.test.tsx`, `tests/components/ConditionList.test.tsx`

The ConditionList is code-only (not a Subframe component) — it maps condition codes to ConditionItem renders.

- [ ] **Step 1: Rebuild ConditionList using Subframe ConditionItem**

```typescript
// src/components/ConditionList.tsx
import type { ConditionCode } from "../types";
import { CONDITION_LABELS } from "../constants";
// Import ConditionItem from Subframe export
import { ConditionItem } from "./ConditionItem";

interface Props {
  conditions: ConditionCode[];
}

export function ConditionList({ conditions }: Props) {
  if (conditions.length === 0) return null;
  return (
    <div>
      {conditions.map((code) => (
        <ConditionItem
          key={code}
          label={CONDITION_LABELS[code].label}
          description={CONDITION_LABELS[code].description}
        />
      ))}
    </div>
  );
}
```

Note: Adjust the ConditionItem import and props to match whatever Subframe actually exports. The above is a template — the real prop names come from the export.

- [ ] **Step 2: Wire ResultCard with StatusBadge + ConditionList**

Wire the exported Subframe markup:
- Accept `modem: Modem`, `techType: TechType`, and `onDone: () => void` props
- Look up `modem.compatibility[techType]` → `{ status, conditions }`
- Use `STATUS_CONFIG[status]` for heading text
- Render StatusBadge with the appropriate variant
- Render ConditionList with `conditions` (hidden when conditions is empty)
- Display `modem.brand` and `modem.model`
- "Done" PillButton at bottom calls `onDone`

- [ ] **Step 3: Run existing tests**

```bash
npx vitest run tests/components/ResultCard.test.tsx tests/components/ConditionList.test.tsx
```

Expected: All 6 tests pass (4 ResultCard + 2 ConditionList).

- [ ] **Step 4: Commit**

```bash
git add src/components/ResultCard.tsx src/components/ConditionList.tsx src/components/ConditionItem.tsx src/components/StatusBadge.tsx tests/components/ResultCard.test.tsx tests/components/ConditionList.test.tsx
git commit -m "feat: wire ResultCard and ConditionList to Subframe exports"
```

### Task 19: Wire LoadingState Behavior

**Files:**
- Modify: `src/components/LoadingState.tsx`
- Test: `tests/components/LoadingState.test.tsx`

- [ ] **Step 1: Wire LoadingState**

Ensure the Subframe export includes:
- Text matching `/finding your modem/i`
- An element with `role="status"` on the spinner/indicator

If the export doesn't include `role="status"`, add it to the spinner element.

- [ ] **Step 2: Run existing tests**

```bash
npx vitest run tests/components/LoadingState.test.tsx
```

Expected: Both tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/LoadingState.tsx
git commit -m "feat: wire LoadingState to Subframe export"
```

### Task 20: Wire NoMatch Behavior

**Files:**
- Create: `src/components/NoMatch.tsx`
- Create: `tests/components/NoMatch.test.tsx`

- [ ] **Step 1: Write failing tests for NoMatch**

```typescript
// tests/components/NoMatch.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NoMatch } from "../../src/components/NoMatch";

describe("NoMatch", () => {
  it("renders no match heading", () => {
    render(<NoMatch onRetry={() => {}} />);
    expect(screen.getByText(/no modem found/i)).toBeInTheDocument();
  });

  it("calls onRetry when try again button clicked", async () => {
    const onRetry = vi.fn();
    render(<NoMatch onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/components/NoMatch.test.tsx
```

Expected: FAIL — NoMatch not found or not wired.

- [ ] **Step 3: Wire NoMatch behavior**

Wire the Subframe export:
- Accept `onRetry: () => void` prop
- PillButton "Try again" calls `onRetry`

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/components/NoMatch.test.tsx
```

Expected: Both tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/NoMatch.tsx tests/components/NoMatch.test.tsx
git commit -m "feat: add NoMatch component with Subframe export"
```

### Task 21: Wire BottomSheet (Code-Only, Keep Existing)

The BottomSheet is code-only — no Subframe design needed. The existing implementation should work. Verify tests still pass.

- [ ] **Step 1: Run BottomSheet tests**

```bash
npx vitest run tests/components/BottomSheet.test.tsx
```

Expected: All 4 tests pass. If they fail, the BottomSheet was likely untouched by the export process — investigate.

---

## Chunk 5: Root Wiring & Integration

### Task 22: Wire BaseScreen Behavior

**Files:**
- Create: `src/components/BaseScreen.tsx` (from Subframe export)
- Create: `tests/components/BaseScreen.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/components/BaseScreen.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BaseScreen } from "../../src/components/BaseScreen";

describe("BaseScreen", () => {
  it("renders modem selection heading", () => {
    render(<BaseScreen onCheckModem={() => {}} />);
    expect(screen.getByText(/modem selection/i)).toBeInTheDocument();
  });

  it("shows check my modem button when BYO selected", async () => {
    render(<BaseScreen onCheckModem={() => {}} />);
    await userEvent.click(screen.getByText(/no, i have my own/i));
    expect(screen.getByRole("button", { name: /check my modem/i })).toBeInTheDocument();
  });

  it("calls onCheckModem when check button clicked", async () => {
    const onCheck = vi.fn();
    render(<BaseScreen onCheckModem={onCheck} />);
    await userEvent.click(screen.getByText(/no, i have my own/i));
    await userEvent.click(screen.getByRole("button", { name: /check my modem/i }));
    expect(onCheck).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/components/BaseScreen.test.tsx
```

- [ ] **Step 3: Wire BaseScreen behavior**

Wire the Subframe export:
- Accept `onCheckModem: () => void` prop
- Optional `verifiedModem?: { brand: string; model: string }` prop for showing confirmation text
- Track radio selection with `useState`
- Show expanded compatibility section when BYO radio is selected
- "Check my modem" PillButton calls `onCheckModem`

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/components/BaseScreen.test.tsx
```

Expected: All 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/BaseScreen.tsx tests/components/BaseScreen.test.tsx
git commit -m "feat: add BaseScreen component with Subframe export"
```

### Task 23: Create ModemChecker Root Component

**Files:**
- Create: `src/components/ModemChecker.tsx`
- Create: `tests/components/ModemChecker.test.tsx`

This is the orchestrator that wires the state machine to the screen components.

- [ ] **Step 1: Write failing tests**

```typescript
// tests/components/ModemChecker.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModemChecker } from "../../src/components/ModemChecker";

// Mock the search to control state transitions
vi.mock("../../src/lib/search", () => ({
  searchModems: vi.fn(),
}));

import { searchModems } from "../../src/lib/search";
const mockSearch = vi.mocked(searchModems);

describe("ModemChecker", () => {
  it("renders base screen with modem selection", () => {
    render(<ModemChecker techType="fttp" />);
    expect(screen.getByText(/modem selection/i)).toBeInTheDocument();
  });

  it("opens bottom sheet when check my modem is clicked", async () => {
    render(<ModemChecker techType="fttp" />);
    await userEvent.click(screen.getByText(/no, i have my own/i));
    await userEvent.click(screen.getByRole("button", { name: /check my modem/i }));
    expect(screen.getByText(/find your modem/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/components/ModemChecker.test.tsx
```

- [ ] **Step 3: Implement ModemChecker**

```typescript
// src/components/ModemChecker.tsx
import { useState } from "react";
import type { Modem, TechType } from "../types";
import { useModemSearch } from "../hooks/useModemSearch";
import { BaseScreen } from "./BaseScreen";
import { BottomSheet } from "./BottomSheet";
import { SearchInput } from "./SearchInput";
import { LoadingState } from "./LoadingState";
import { MultipleMatches } from "./MultipleMatches";
import { ResultCard } from "./ResultCard";
import { NoMatch } from "./NoMatch";

interface Props {
  techType: TechType;
}

export function ModemChecker({ techType }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [verifiedModem, setVerifiedModem] = useState<Pick<Modem, "brand" | "model"> | undefined>();
  const { state, search, selectModem, reset } = useModemSearch();

  const handleClose = () => {
    setSheetOpen(false);
    reset();
  };

  const handleDone = () => {
    // Store the verified modem BEFORE resetting search state
    if (state.step === "single_match") {
      setVerifiedModem({ brand: state.modem.brand, model: state.modem.model });
    }
    setSheetOpen(false);
    reset();
  };

  return (
    <>
      <BaseScreen
        onCheckModem={() => setSheetOpen(true)}
        verifiedModem={verifiedModem}
      />
      <BottomSheet open={sheetOpen} onClose={handleClose}>
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
          <ResultCard modem={state.modem} techType={techType} onDone={handleDone} />
        )}
        {state.step === "no_match" && <NoMatch onRetry={reset} />}
      </BottomSheet>
    </>
  );
}
```

Note: This is a reference implementation. Adjust imports and prop names to match whatever Subframe actually exports. The structure (state machine → screen rendering) is the important part. Key details:
- `verifiedModem` is stored in its own state, not derived from the search state machine. This ensures it persists after the sheet closes and `reset()` clears the search state.
- `handleDone` captures the modem info before resetting. `handleClose` (backdrop/X dismiss) does not set verified — the user must click "Done" to confirm.

- [ ] **Step 4: Run tests**

```bash
npx vitest run tests/components/ModemChecker.test.tsx
```

Expected: Both tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/ModemChecker.tsx tests/components/ModemChecker.test.tsx
git commit -m "feat: add ModemChecker root component wiring state to screens"
```

### Task 24: Update App Entry Point

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Wire App to ModemChecker**

```typescript
// src/App.tsx
import { ModemChecker } from "./components/ModemChecker";

function App() {
  return <ModemChecker techType="fttp" />;
}

export default App;
```

The `techType` is hardcoded for now. A dev-only selector can be added later.

- [ ] **Step 2: Run full test suite**

```bash
npx vitest run
```

Expected: All tests pass. The total should include existing tests plus new ones for NoMatch, BaseScreen, and ModemChecker. Exact count depends on whether any tests were added or modified during wiring.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire App entry point to ModemChecker"
```

### Task 25: Manual Dev Server Verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify in browser**

Open the dev URL. Check:
- BaseScreen renders with radio options
- Selecting BYO shows "Check my modem" button
- Clicking it opens the bottom sheet with SearchInput
- (Full flow requires Supabase anon key — flag to user if `.env` is not configured)

- [ ] **Step 3: Commit any fixes**

If minor adjustments were needed, commit them.

```bash
git add -u
git commit -m "fix: minor adjustments from manual verification"
```
