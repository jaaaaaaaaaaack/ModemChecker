---
name: figma-to-subframe
description: Translate Figma designs into Subframe components with high visual fidelity and proper component structure. Use when building UI from Figma reference designs — covers the full pipeline from screenshot inventory through primitive creation, screen composition, and code export. MUST be used before any visual component work. Triggers on "build the UI", "implement the designs", "create components from Figma", or any task involving translating Figma visuals into Subframe/code.
---

# Figma → Subframe Pipeline

Translate Figma reference designs into Subframe components, then export code. Four sequential phases — each must complete before the next begins.

## Prerequisites

Before starting, verify:
1. Figma Console MCP is connected (`figma_get_status`). If not, ask user to launch Figma with `open -a Figma --args --remote-debugging-port=9222` and enable the Desktop Bridge plugin.
2. Subframe MCP is authenticated (`list_components` or `list_pages` should respond).
3. A Figma node reference exists — check the Claude project memory directory for `figma-nodes.md` (typically at the path shown in CLAUDE.md under "Key References"). This file may be incomplete; that's handled in Phase 1.

## Hard Rules

- **NEVER hand-code component markup (JSX/TSX).** All visual components come from Subframe export.
- **Screenshots are the visual target.** Don't pixel-match Figma node properties — adapt to Subframe's theme tokens.
- **Primitives are Subframe components.** Shared elements must be reusable components, not copy-pasted styling.
- **Phase gates are enforced.** Complete each phase fully before moving to the next.

## Phase 1: Figma Inventory

**Goal:** Capture visual reference, identify shared primitives.

1. Load known Figma node IDs from the project's `figma-nodes.md` reference
2. If node IDs are missing or marked TBD, navigate to the parent section (e.g. Sheets section) using `figma_navigate` and enumerate children via `figma_get_file_data` or `figma_execute` to discover frame IDs. Update the node reference doc with any new IDs found.
3. `figma_take_screenshot` for each design frame — save/reference these as visual targets
4. Annotate each screenshot: screen name, interactive elements, visual patterns
5. Cross-reference all screenshots — identify elements that repeat across 2+ screens
6. Produce a **Component Inventory** table:

```
| Primitive     | Variants          | Screens Used In          |
|---------------|-------------------|--------------------------|
| PillButton    | filled, outline   | Search, Results, NoMatch |
| RadioCard     | default, selected | MultipleMatches, Base    |
```

Plus the full list of screens to compose. See the design spec at `docs/superpowers/specs/2026-03-12-figma-to-subframe-workflow-design.md` for the complete reference inventory.

**Gate:** Inventory table complete. Every screen from the UX flow doc has a screenshot. Move to Phase 2.

## Phase 2: Build Primitives

**Goal:** Create each shared primitive as a reusable Subframe component.

1. Check Subframe project for existing components (`list_components`) — don't duplicate
2. Order primitives by dependency (e.g., Button before RadioCard if RadioCard contains a button)
3. For each primitive:
   a. Reference the Figma screenshot(s) where it appears
   b. Invoke `subframe:design` skill — describe the visual target but instruct to use the project's existing theme tokens
   c. Verify creation via `get_component_info` or `list_components`

**Adaptation rules:**
- Figma says 17px, theme has 16px → use 16px
- Figma uses color hex → map to nearest theme token
- Figma uses layout hacks (overlaid rects, manual spacing) → express as proper padding/gap/border
- Name components using the inventory names (PillButton, RadioCard, etc.)

**Gate:** All primitives from inventory exist as Subframe components. Move to Phase 3.

## Phase 3: Compose Screens

**Goal:** Build each screen as a Subframe page using Phase 2 primitives.

1. For each screen:
   a. Reference its Figma screenshot as layout target
   b. Invoke `subframe:design` — explicitly name the primitives to use (e.g., "use PillButton for the continue action, RadioCard for each option")
   c. Validate: invoke the `design-review` skill (e.g. `/design-review parity` with Figma screenshot vs Subframe screenshot) to check fidelity. If `design-review` is unavailable, visually compare screenshots yourself and note discrepancies.
   d. If significantly off, iterate (max 2 revision passes per screen)

**Rules:**
- Screens **instantiate** primitives — they must not duplicate primitive styling inline
- Layout, spacing, and content order should match the Figma screenshot's visual feel
- Heading/label text should match Figma content

**Gate:** All screens created and visually validated. Move to Phase 4.

## Phase 4: Export & Integrate

**Goal:** Generate code and wire into project.

1. Invoke `subframe:develop` skill to export code for components and screens
2. Place exports in `src/components/`
3. Wire props, event handlers, state to existing data layer (hooks, types, constants)
4. Run tests — they validate behavior, not markup. If tests fail on markup assumptions (specific classes, element structure), update tests to be markup-agnostic.

**Rules:**
- Exported Subframe code is the markup source of truth
- Don't hand-edit visual structure — change in Subframe, re-export
- Adding behavioral wiring (onClick, conditional rendering, state) in code is expected and fine
- If hand-coded components already exist at the target paths, **overwrite** them with Subframe exports. Do not merge.

## Resuming Mid-Pipeline

If resuming work across sessions:
1. Check what Subframe components/pages already exist (`list_components`, `list_pages`)
2. Compare against the component inventory to determine which phase you're in
3. Pick up from the current phase — don't redo completed work
