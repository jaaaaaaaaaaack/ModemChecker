# Multiple Matches Screen — Design Polish (In Progress)

## Status: Brainstorming, mid-clarification. Needs fresh session with Refero MCP.

## The Problem

The "Multiple Matches Found" screen in the bottom sheet has several polish issues when the radio card list scrolls (3+ results):

### Issue 1: Scrollbar styling (minor)
- Browser-default white scrollbar is nearly invisible against the light blue/cyan gradient background (`bg-gradient-brand`)
- Scrollbar is flush against the right edge of the scroll container — should be inset ~16-24px from the sheet edge

### Issue 2: Back button chevron (minor, possibly Subframe-side)
- The `FeatherChevronLeft` icon inside `IconButton variant="neutral-primary" size="large"` appears optically off-center (shifted right)
- May need optical compensation via negative `margin-left` or a different icon
- The button variant itself may need changing — user wants to explore alternatives in Subframe

### Issue 3: Sticky footer treatment (main design question)
- The pinned footer (back button + Continue button) takes up significant vertical space
- **Hard edge at the bottom** where scrolling cards get clipped against the footer — feels unpolished
- **Hard edge at the top** when scrolled down — same clipping problem, which a bottom-only gradient wouldn't fix
- The footer is `flex-shrink-0 mt-auto pt-2` in `MultipleMatches.tsx`

## Key Files
- `src/components/MultipleMatches.tsx` — the screen component
- `src/components/BottomSheet.tsx` — sheet container (Radix Dialog + Framer Motion)
- `src/components/ModemChecker.tsx` — orchestrator with AnimatePresence transitions
- `src/ui/components/RadioCardGroup.tsx` — sync-disabled Subframe component
- `src/ui/components/IconButton.tsx` — back button component
- `src/ui/components/Button.tsx` — sync-disabled, Continue button
- `src/styles/gradients.css` — `bg-gradient-brand` and `bg-gradient-brand-compact`

## Screenshots
- `/tmp/multimatches_mobile.png` — mobile viewport (390×844), shows 4 cards with clipping
- `/tmp/multimatches_desktop.png` — desktop viewport (1280×900), side sheet with 7 visible cards

## Approaches Explored

### A: Single-tap cards + header back — REJECTED
- Move back button to header row next to title and × close
- Cards become tappable action items with right chevron (1 tap = select + advance)
- No footer at all
- **Rejected because:** Header row gets too crowded, especially at larger text sizes. Loses browse-before-commit capability.

### B: Keep two-step radio + gradient fade — PARTIALLY REJECTED
- Keep current radio + Continue pattern
- Add gradient mask at bottom edge where list meets footer
- **Problem:** Only solves bottom edge. When user scrolls down, the TOP edge has the same hard-clip issue. User called this out.

### C: Single-tap cards + inline back at bottom — UNDER CONSIDERATION
- Cards become single-tap action items (no radio, no Continue button)
- Back button is non-sticky, sits at bottom of scrollable list as text link
- × close covers the primary "escape" use case
- Header stays clean
- **Pros:** Maximum content space, no footer, simple
- **Cons:** Back button requires scrolling, less discoverable

## Accessibility Findings (discussed in session)

1. **Modal dialogs are isolated contexts** — heading hierarchy inside the sheet is independent from the page. No need for a persistent "Compatibility Checker" h1 banner.
2. **Current `<Dialog.Title className="sr-only">Modem search</Dialog.Title>`** is correct — gives the dialog its accessible name.
3. **Multi-step sheets are an established accessible pattern** — focus management on step change would be a good incremental improvement.
4. **Single-tap action cards are accessible** — semantically just `<button>` elements. Pattern shifts from "form submission" to "action list."
5. **Non-sticky back button at bottom of list** is WCAG-compliant but not ideal — keyboard users must tab through all cards to reach it. Mitigated by × close being always available.

## Next Step

**Use Refero MCP to search for real-world examples** of how other products handle:
- Scrollable lists inside constrained/modal containers
- Both-edge scroll fade/mask treatments
- Action card lists vs. radio selection patterns in bottom sheets

This research should inform whether we go with approach C, a refined version of B (with dual-edge gradient masks), or a new approach entirely.

After Refero research, finalize the approach → write formal spec → plan → implement.

## Visual Companion
- Server was running at `http://localhost:63748`
- Mockups in `.superpowers/brainstorm/8948-1773479714/`
- The comparison mockup (`multimatches-approaches.html`) shows all 3 approaches side by side
