# Accessibility Audit Pass 1 — Design Spec

## Goal

Produce a findings report covering fundamental accessibility issues across the ModemChecker widget. This pass focuses on mechanical, verifiable criteria. No code changes — the report drives a subsequent fix plan.

## Scope

### In scope

| Category | WCAG criteria | What we check |
|---|---|---|
| Color contrast | 1.4.3 (AA) | Every text/background pair. 4.5:1 for normal text, 3:1 for large text (>=24px or >=18.66px bold) |
| Touch targets | 2.5.8 (AA) | Interactive element dimensions. 44x44px target, 24px minimum. Measured from Tailwind classes |
| Focus rings | 2.4.7 (AA) | `:focus-visible` styles on all interactive elements. Consistency of ring color, width, offset |
| Tab order | 2.4.3 (A) | Logical tab sequence per screen. No unreachable or out-of-order elements |
| Heading hierarchy | 1.3.1 (A) | No skipped levels in assembled DOM per screen. Correct nesting |
| Semantic HTML | 1.3.1 (A), 4.1.2 (A) | Buttons are `<button>`, inputs have `<label>`, images have `alt`, landmarks present |

### Out of scope (pass 2)

- Focus trapping and restoration in modals
- Screen reader announcements (`aria-live`, `aria-busy`)
- `aria-expanded`, `aria-describedby`, `aria-invalid`
- `prefers-reduced-motion` support
- Skip-to-content links
- Dark mode

## Approach: Layered Audit

### Layer 1 — Component audit

Audit each component for self-contained issues: contrast, touch targets, focus rings, semantic HTML.

**Order:** Subframe primitives (`src/ui/components/`) first, then owned page components (`src/components/`). Only components actually used in the app are audited.

**Subframe components to audit:**
- Button (sync-disabled)
- IconButton
- TextField
- RadioCardGroup (sync-disabled)
- CardButton
- LinkButton
- CheckerCard (sync-disabled)
- StatusItem (sync-disabled)
- IconWithBackground (sync-disabled)

**Owned components to audit:**
- ModemChecker (root orchestrator)
- BaseScreen
- SearchInput
- MultipleMatches
- ResultCard
- ConditionList
- BottomSheet
- LoadingState
- NoMatch
- SearchError
- ErrorBoundary
- ModemImage

### Layer 2 — Screen audit

Walk each screen in user-flow order. Check heading hierarchy, tab order, and landmark structure in the assembled DOM.

**Screens in order:**
1. BaseScreen (landing / default state)
2. BaseScreen (results state, with CompatibilityCard)
3. SearchInput (sheet open, search field focused)
4. LoadingState
5. MultipleMatches
6. ResultCard
7. NoMatch
8. SearchError

## Tagging

Each finding is tagged:

- **Ownership:** `owned` (we fix it) or `subframe` (flagged for upstream fix in Subframe, or sync-disable later)
- **Severity:**
  - `critical` — fails WCAG A, or interactive element unusable
  - `high` — fails WCAG AA, or significantly degraded experience
  - `medium` — suboptimal but functional (e.g. inconsistent focus rings)
  - `low` — minor, cosmetic, or edge case

## Report Output

Single markdown file at `docs/a11y-audit-pass1.md`, structured by category:

```
## Color Contrast
### Findings
- [owned|subframe] [severity] Component: description — ratio ✅/❌

## Touch Targets
### Findings
...

## Focus Rings
### Findings
...

## Tab Order
### Findings
...

## Heading Hierarchy
### Findings
...

## Semantic HTML & Landmarks
### Findings
...

## Summary
- Total issues (owned vs subframe breakdown)
- Priority breakdown (critical / high / medium / low)
```

Each finding includes: the specific component or screen, what's wrong, the measured value vs the requirement, and a brief note on what the fix would involve.

## What this does NOT include

- Automated tooling setup (axe-core, jest-axe). That may come as part of the fix plan.
- Any code changes. This is audit-only.
- Testing. The audit itself is the deliverable.
