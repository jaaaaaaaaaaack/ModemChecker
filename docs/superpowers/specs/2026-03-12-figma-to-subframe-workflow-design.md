# Figma-to-Subframe Workflow — Design Spec

## Problem

Agents building UI for this project bypass the Subframe design workflow and hand-code JSX directly. This produces components that are disconnected from the design system, can't be iterated in Subframe, and drift from the Figma source designs. We need an enforceable, documented pipeline that translates Figma designs into Subframe components with high fidelity, proper atomic structure, and exported code.

## Constraints

- **Figma is read-only reference** — designs live in Figma (file `yyeLxpgLuFDjWj7325id9s`), accessed via Figma Console MCP (screenshots + node inspection)
- **Subframe is the design SSoT** — all visual components are authored in Subframe (project `c141bce6134a`), which generates React + Tailwind code
- **Screenshot fidelity is primary** — visual appearance from Figma screenshots is the target. Node properties (px values, exact colors) are guides, not mandates. Adapt to the Subframe project's existing theme tokens.
- **Target audience: Claude agents** — the workflow docs and skill are agent instructions, not human process docs
- **Pragmatic component granularity** — shared primitives as reusable Subframe components, screen-level compositions that use them. Not full atomic design, not flat pages.

## Component Inventory

### Shared Primitives (Subframe components)

These are created as named, reusable components within the Subframe project. Changes propagate to all screens that use them.

| Component | Variants | Used In | Description |
|-----------|----------|---------|-------------|
| **PillButton** | `filled`, `outline` | Every screen | Pill-radius button. Filled: teal bg, white text. Outline: teal border/text, white bg. Supports disabled state. |
| **TextInput** | — | SearchInput screen | Text field with placeholder, rounded corners, focus state |
| **RadioCard** | `default`, `selected` | MultipleMatches, BaseScreen | Selectable card with radio indicator, label, optional subtitle. Selected: teal accent border + background tint. |
| **ConditionItem** | — | ResultCard (yes_but status) | Single condition row — label + description text |
| **StatusBadge** | `compatible`, `warning`, `incompatible` | ResultCard | Icon + colored heading. Green check / amber triangle / red X. |

### Screen Compositions (Subframe pages)

Each screen is a Subframe page that instantiates the shared primitives above.

| Screen | Primitives Used | Description |
|--------|----------------|-------------|
| **BaseScreen** | RadioCard, PillButton | "Modem selection" form with radio options, expandable compatibility section with "Check my modem" button |
| **SearchInput** | TextInput, PillButton | Bottom sheet content — illustration area, title, helper text, input field, Continue button |
| **LoadingState** | — | Spinner/animation + "Finding your modem..." text. Minimal, no shared primitives needed. |
| **MultipleMatches** | RadioCard, PillButton | Title, subtitle, scrollable list of RadioCards, "Help me identify" link, Back + Continue buttons |
| **ResultCard** | StatusBadge, ConditionItem, PillButton | Modem info display + compatibility status + condition list (if any) + Done button |
| **NoMatch** | PillButton | "No modem found" message with Try Again button |

### Code-Only (no Subframe design needed)

| Component | Reason |
|-----------|--------|
| **BottomSheet** | Structural/behavioral shell (portal, backdrop, slide animation). Pure code. |
| **ConditionList** | Behavioral wrapper — maps condition codes to ConditionItem renders. No visual design needed. |
| **useModemSearch** | React hook — state machine logic |
| **Supabase client/search** | Data layer |

## Workflow: 4-Phase Pipeline

### Phase 1: Figma Inventory

**Goal:** Capture complete visual reference and identify shared primitives.

**Process:**
1. Navigate to the Figma file and take screenshots of every design frame using `figma_take_screenshot` (node IDs from `memory/figma-nodes.md` or by navigating the Sheets section `3100:8632`)
2. For each screenshot, annotate: screen name, interactive elements present, visual patterns observed
3. Cross-reference all screenshots to identify repeated visual elements
4. Produce a **Component Inventory** table — mapping primitives to the screens they appear in, plus the full screen list

**Output:** Component inventory (like the tables above), plus saved Figma screenshots as visual targets for Phase 2-3.

**Rules:**
- No Subframe work happens in this phase
- If the Figma nodes doc is incomplete, explore the Figma file to find missing frames before proceeding
- Every screen in the UX flow (`docs/ux-flow.md`) must have a corresponding Figma screenshot

### Phase 2: Build Primitives

**Goal:** Create each shared component as a reusable Subframe component.

**Process:**
1. Check the Subframe project for existing components that match (avoid duplicates)
2. For each primitive, reference the Figma screenshot(s) where it appears as the visual target
3. Use `subframe:design` to create the component, describing it in terms of visual appearance — but adapting to the Subframe project's theme tokens (colors, typography, spacing)
4. After creation, verify the component exists via `get_component_info` or `list_components`
5. Build in dependency order — e.g., PillButton before RadioCard if RadioCard contains buttons

**Rules:**
- **Don't pixel-match Figma.** The screenshot is the visual target, but use Subframe's theme values. If Figma says 17px and the theme has a 16px step — use 16px.
- **Adapt implementation details.** Figma may use workarounds (overlaid rectangles, manual spacing) that should be expressed as proper Subframe properties (padding, gap, border).
- **Name components clearly.** Use the names from the inventory table (PillButton, RadioCard, etc.)

### Phase 3: Compose Screens

**Goal:** Build each screen as a Subframe page, composed from the Phase 2 primitives.

**Process:**
1. For each screen, reference its Figma screenshot as the layout/composition target
2. Use `subframe:design` to create a page, explicitly instructing it to use the named primitives from Phase 2
3. After creation, visually validate: use `design-review` skill or take a Subframe screenshot to compare against the Figma reference
4. Iterate if the composition is significantly off (max 2 revision passes per screen)

**Rules:**
- Screens must **reference/instantiate** the primitives, not duplicate their styling inline
- Layout (spacing, alignment, content order) should match the Figma screenshot's visual feel
- Content text (headings, labels, helper text) should match the Figma designs

### Phase 4: Export & Integrate

**Goal:** Generate code from Subframe and wire it into the project.

**Process:**
1. Use `subframe:develop` to export React + Tailwind code for each component and screen
2. Place exported components in `src/components/`
3. Wire props, event handlers, and state to the existing data layer (`useModemSearch` hook, types from `src/types.ts`, constants from `src/constants.ts`)
4. Run existing tests — they validate behavior (props, callbacks, accessibility roles), not markup structure, so they should pass with the new Subframe-generated markup
5. If tests fail due to markup assumptions (e.g., looking for specific class names), update the tests to be markup-agnostic

**Rules:**
- Subframe-exported code is the markup source of truth
- Don't hand-edit the visual structure of exported components — if it needs changing, go back to Subframe and re-export
- Behavioral wiring (onClick handlers, state management, conditional rendering) is added in code — this is expected and fine
- Several components already exist with hand-coded markup from a previous implementation pass. These should be **overwritten** by the Subframe exports, not merged with.

## Enforcement

### Project CLAUDE.md Rules

```
## UI Component Workflow
- NEVER hand-code component markup (JSX/TSX) for visual UI components
- ALL visual components must be designed in Subframe first, then exported via subframe:develop
- Use the figma-to-subframe skill when translating Figma designs into implementation
- Code-only components (BottomSheet shell, hooks, data layer) are exempt
- Tests validate behavior and props, not markup structure
```

These rules are applied in the project `CLAUDE.md`.

### Skill File

A `figma-to-subframe` skill (`skills/figma-to-subframe/SKILL.md`) encodes the full 4-phase pipeline with:
- Phase gates — each phase must complete before the next begins
- Tool sequences — exact MCP tools to use at each step
- Rules — what to do and what not to do
- The component inventory as a reference

### What This Workflow Does NOT Cover

- **Subframe theme setup** — the project theme (Belong colors, Plus Jakarta Sans, spacing scale) is already configured. Theme changes are a separate task.
- **Testing strategy** — existing tests cover component behavior. This workflow doesn't create new tests.
- **BottomSheet implementation** — the modal shell is code-only and outside this workflow.
