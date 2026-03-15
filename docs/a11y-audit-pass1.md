# Accessibility Audit — Pass 1

**Date:** 2026-03-15
**Scope:** Color contrast, touch targets, focus rings, accessible names, roles & semantics, heading hierarchy, tab order, landmarks
**Spec:** `docs/superpowers/specs/2026-03-15-a11y-audit-pass1-design.md`

---

## Color Contrast

WCAG 1.4.3 (AA): 4.5:1 for normal text, 3:1 for large text (≥24px or ≥18.66px bold).

### Method

Extracted all color token RGB values from `src/ui/theme.css` and gradient definitions from `src/styles/gradients.css`. Identified every text-color/background-color pair in all Subframe UI components (`src/ui/components/`) and owned page components (`src/components/`). Calculated WCAG contrast ratios using the relative luminance formula (sRGB linearization, `L = 0.2126R + 0.7152G + 0.0722B`, ratio = `(L1 + 0.05) / (L2 + 0.05)`).

**Typography reference (from theme.css):**
| Token | Size | Weight | Large text? |
|---|---|---|---|
| `text-h1` | 40px | 700 | Yes |
| `text-h2` / `text-h2-500` | 28px | 700 / 500 | Yes (28px ≥ 24px) |
| `text-h3-700` / `text-h3-500` | 22px | 700 / 500 | Yes (700wt) / No (500wt) |
| `text-h4-button-700` / `text-h4-button-500` | 19px | 700 / 500 | Yes (700wt) / No (500wt) |
| `text-body-bold` | 16px | 600 | No |
| `text-body` | 16px | 400 | No |
| `text-caption-bold` | 14px | 700 | No |
| `text-caption` | 14px | 500 | No |

**Gradient backgrounds used as sheet containers:**
| Gradient | Top color | Bottom color | Used in |
|---|---|---|---|
| `bg-gradient-brand` | `rgb(195, 249, 255)` | `rgb(240, 253, 255)` | BottomSheet (mobile) |
| `bg-gradient-brand-compact` | `rgb(195, 249, 255)` → white by 320px | same | BottomSheet (desktop) |
| `bg-gradient-accent2` | `rgb(237, 227, 255)` | `rgb(248, 245, 255)` | ModemInfoSheet |

**Total pairs audited:** 149 (6 failures, 0 borderline, 4 disabled-exempt, 139 passing)

### Failures

- [subframe-disabled] high **Button** (brand-secondary, active state): `brand-950` on `brand-800` — 2.2:1 (needs 4.5:1; 16px, 600wt, normal text) ❌ — Active state is transient (~100ms) but still fails. `quick-win`: swap active text to `brand-200` (5.8:1 on brand-800).
- [subframe] high **TextField** (placeholder text): `neutral-400` on `white` — 2.5:1 (needs 4.5:1; 16px, 400wt, normal text) ❌ — WCAG applies to placeholder text. Common industry pattern but technically fails. `quick-win`: swap to `neutral-500` (4.7:1).
- [subframe] high **TextField** (error icon): `error-500` on `white` — 3.7:1 (needs 4.5:1; 16px, 400wt, normal text) ❌ — `quick-win`: swap to `error-600` (4.7:1) or `error-700` (6.3:1).
- [subframe-disabled] high **StatusItem** (on-dark title variants): `brand-50` on gradient bg — 1.1:1 (needs 4.5:1; 16px, 400wt, normal text) ❌ — The `compatible-on-dark`, `warning-on-dark`, and `info-on-dark` variants set `text-brand-50` but are designed for dark parent backgrounds (e.g. `brand-800` where ratio is 7.0:1). **Not currently used in the app.** If used on the gradient sheet bg they would fail catastrophically. Document as risk for future use.
- [subframe-disabled] high **IconWithBackground** (success-dark variant): `neutral-0` on `success-600` — 3.8:1 (needs 4.5:1; 14px, 400wt, normal text) ❌ — Icon is decorative (paired with text label in StatusItem) so functional impact is low, but the icon itself fails. `quick-win`: swap bg to `success-700` (5.5:1) or `success-800` (7.7:1).
- [owned] high **ErrorBoundary** (Reload button): `white` on `brand-600` — 3.7:1 (needs 4.5:1; 14px, 500wt, normal text) ❌ — `quick-win`: swap bg to `brand-700` (5.4:1) or `brand-800` (7.3:1).

### Disabled States (WCAG-exempt)

Disabled controls are exempt from WCAG 1.4.3 per SC exception for "inactive user interface components." Documented for awareness only.

- [subframe-disabled] **Button** (disabled text): `neutral-600` on `neutral-200` — 6.2:1 — passes anyway
- [subframe-disabled] **Button** (disabled icon): `neutral-400` on `neutral-200` — 2.0:1 — would fail if not exempt
- [subframe] **IconButton** (disabled icon): `neutral-400` on `neutral-100` — 2.3:1 — would fail if not exempt
- [subframe] **LinkButton** (disabled text): `neutral-400` on `white` — 2.5:1 — would fail if not exempt

### Passing — Subframe Components

<details>
<summary>Button.tsx — 36 variant/state pairs audited, 35 pass, 1 fail (listed above)</summary>

- [subframe-disabled] pass **Button** (brand-primary default): `brand-50` on `brand-800` — 7.0:1 ✅
- [subframe-disabled] pass **Button** (brand-primary active): `brand-300` on `brand-800` — 5.0:1 ✅
- [subframe-disabled] pass **Button** (brand-primary hover): `brand-50` on `brand-950` — 15.3:1 ✅
- [subframe-disabled] pass **Button** (brand-primary icon): `white` on `brand-800` — 7.3:1 ✅
- [subframe-disabled] pass **Button** (brand-secondary default): `brand-800` on `white` — 7.3:1 ✅
- [subframe-disabled] pass **Button** (brand-secondary hover): `brand-900` on `brand-200` — 9.5:1 ✅
- [subframe-disabled] pass **Button** (brand-tertiary default): `brand-800` on `brand-200` — 5.8:1 ✅
- [subframe-disabled] pass **Button** (brand-tertiary active): `brand-800` on `brand-50` — 7.0:1 ✅
- [subframe-disabled] pass **Button** (neutral-primary default): `neutral-700` on `neutral-100` — 9.5:1 ✅
- [subframe-disabled] pass **Button** (neutral-primary active): `neutral-200` on `neutral-700` — 8.2:1 ✅
- [subframe-disabled] pass **Button** (neutral-secondary default): `neutral-600` on `white` — 7.8:1 ✅
- [subframe-disabled] pass **Button** (neutral-secondary active): `neutral-200` on `color-neutral-800` — 7.6:1 ✅
- [subframe-disabled] pass **Button** (neutral-tertiary default): `neutral-700` on `white` — 10.4:1 ✅
- [subframe-disabled] pass **Button** (destructive-primary default): `brand-50` on `error-600` — 4.5:1 ✅
- [subframe-disabled] pass **Button** (destructive-primary hover): `error-50` on `error-900` — 8.7:1 ✅
- [subframe-disabled] pass **Button** (destructive-primary active): `error-900` on `error-200` — 6.8:1 ✅
- [subframe-disabled] pass **Button** (destructive-secondary default): `error-700` on `error-50` — 5.7:1 ✅
- [subframe-disabled] pass **Button** (destructive-secondary active): `error-100` on `error-700` — 5.2:1 ✅
- [subframe-disabled] pass **Button** (destructive-tertiary default): `error-800` on `error-200` — 5.7:1 ✅
- [subframe-disabled] pass **Button** (destructive-tertiary hover): `error-50` on `error-700` — 5.7:1 ✅
- [subframe-disabled] pass **Button** (destructive-tertiary active): `white` on `error-900` — 9.6:1 ✅
- [subframe-disabled] pass **Button** (inverse): `white` on `brand-800` — 7.3:1 ✅
- [subframe-disabled] pass **Button** (secondary-inverse default): `brand-300` on `brand-800` — 5.0:1 ✅
- [subframe-disabled] pass **Button** (secondary-inverse hover): `brand-800` on `brand-300` — 5.0:1 ✅
- [subframe-disabled] pass **Button** (option-1 default): `brand-800` on `white` — 7.3:1 ✅
- [subframe-disabled] pass **Button** (cyan-primary default): `white` on `color-primary-601` — 5.1:1 ✅
- [subframe-disabled] pass **Button** (cyan-primary active): `color-primary-101` on `color-primary-701` — 6.2:1 ✅
- [subframe-disabled] pass **Button** (cyan-secondary default): `color-primary-701` on `white` — 7.5:1 ✅
- [subframe-disabled] pass **Button** (cyan-tertiary default): `color-primary-801` on `color-primary-201` — 8.1:1 ✅
- [subframe-disabled] pass **Button** (green-primary default): `white` on `color-secondary-601` — 5.0:1 ✅
- [subframe-disabled] pass **Button** (green-secondary default): `color-secondary-701` on `white` — 7.4:1 ✅
- [subframe-disabled] pass **Button** (green-tertiary default): `color-secondary-801` on `color-secondary-201` — 8.3:1 ✅
- [subframe-disabled] pass **Button** (purple-primary default): `white` on `color-accent2-601` — 6.2:1 ✅
- [subframe-disabled] pass **Button** (purple-secondary default): `color-accent2-701` on `white` — 9.0:1 ✅
- [subframe-disabled] pass **Button** (purple-tertiary default): `color-accent2-801` on `color-accent2-201` — 8.5:1 ✅
- [subframe-disabled] pass **Button** (pink-primary default): `white` on `color-accent3-601` — 6.0:1 ✅
- [subframe-disabled] pass **Button** (pink-secondary default): `color-accent3-701` on `white` — 8.7:1 ✅
- [subframe-disabled] pass **Button** (pink-tertiary default): `color-accent3-801` on `color-accent3-201` — 8.3:1 ✅

</details>

<details>
<summary>IconButton.tsx — 14 variant/state pairs audited, all pass</summary>

- [subframe] pass **IconButton** (neutral-tertiary default): `neutral-700` on `white` — 10.4:1 (large text, needs 3:1) ✅
- [subframe] pass **IconButton** (neutral-tertiary hover): `neutral-700` on `neutral-100` — 9.5:1 ✅
- [subframe] pass **IconButton** (neutral-primary default): `neutral-700` on `neutral-100` — 9.5:1 ✅
- [subframe] pass **IconButton** (brand-secondary default): `brand-700` on `brand-50` — 5.2:1 ✅
- [subframe] pass **IconButton** (brand-secondary hover): `brand-700` on `brand-100` — 4.8:1 ✅
- [subframe] pass **IconButton** (brand-primary): `white` on `brand-600` — 3.7:1 (large text, needs 3:1) ✅
- [subframe] pass **IconButton** (brand-tertiary default): `brand-700` on `white` — 5.4:1 ✅
- [subframe] pass **IconButton** (brand-tertiary hover): `brand-700` on `brand-50` — 5.2:1 ✅
- [subframe] pass **IconButton** (neutral-secondary default): `brand-800` on `white` — 7.3:1 ✅
- [subframe] pass **IconButton** (neutral-secondary active): `brand-100` on `brand-700` — 4.8:1 ✅
- [subframe] pass **IconButton** (destructive-tertiary default): `error-700` on `white` — 6.3:1 ✅
- [subframe] pass **IconButton** (destructive-secondary): `error-700` on `error-50` — 5.7:1 ✅
- [subframe] pass **IconButton** (destructive-primary): `white` on `error-600` — 4.7:1 (large text, needs 3:1) ✅
- [subframe] pass **IconButton** (option-1): `brand-700` on `brand-200` — 4.3:1 (large text, needs 3:1) ✅

</details>

<details>
<summary>TextField.tsx — 7 pairs audited, 5 pass, 2 fail (listed above)</summary>

- [subframe] pass **TextField** (input text): `default-font` on `white` — 17.9:1 ✅
- [subframe] pass **TextField** (icon): `subtext-color` on `white` — 4.7:1 ✅
- [subframe] pass **TextField** (label): `default-font` on `white` — 17.9:1 ✅
- [subframe] pass **TextField** (help text): `subtext-color` on `white` — 4.7:1 ✅
- [subframe] pass **TextField** (error help text): `error-700` on `white` — 6.3:1 ✅

</details>

<details>
<summary>RadioCardGroup.tsx — 6 pairs audited, all pass</summary>

- [subframe-disabled] pass **RadioCardGroup** (label default): `default-font` on `white` — 17.9:1 ✅
- [subframe-disabled] pass **RadioCardGroup** (description default): `neutral-500` on `white` — 4.7:1 ✅
- [subframe-disabled] pass **RadioCardGroup** (label checked): `default-font` on `brand-50` — 17.4:1 ✅
- [subframe-disabled] pass **RadioCardGroup** (description checked): `neutral-500` on `brand-50` — 4.6:1 ✅
- [subframe-disabled] pass **RadioCardGroup** (group label): `brand-800` on `white` — 7.3:1 ✅
- [subframe-disabled] pass **RadioCardGroup** (group helpText): `subtext-color` on `white` — 4.7:1 ✅

</details>

<details>
<summary>CardButton.tsx — 5 pairs audited, all pass</summary>

- [subframe] pass **CardButton** (modelName): `default-font` on `white` — 17.9:1 ✅
- [subframe] pass **CardButton** (brand text): `neutral-500` on `white` — 4.7:1 ✅
- [subframe] pass **CardButton** (chevron default): `brand-700` on `white` — 5.4:1 ✅
- [subframe] pass **CardButton** (chevron hover): `brand-800` on `color-primary-100` — 5.9:1 ✅
- [subframe] pass **CardButton** (chevron active): `white` on `color-primary-700` — 9.6:1 ✅

</details>

<details>
<summary>LinkButton.tsx — 12 pairs audited, all pass</summary>

- [subframe] pass **LinkButton** (neutral default): `brand-800` on `white` — 7.3:1 ✅
- [subframe] pass **LinkButton** (neutral hover): `brand-800` on `color-primary-50` — 6.6:1 ✅
- [subframe] pass **LinkButton** (brand default): `brand-800` on `white` — 7.3:1 ✅
- [subframe] pass **LinkButton** (brand hover): `brand-900` on `color-primary-50` — 10.7:1 ✅
- [subframe] pass **LinkButton** (neutral icon default): `neutral-700` on `white` — 10.4:1 ✅
- [subframe] pass **LinkButton** (neutral icon hover): `brand-700` on `color-primary-50` — 4.9:1 ✅
- [subframe] pass **LinkButton** (brand icon default): `brand-700` on `white` — 5.4:1 ✅
- [subframe] pass **LinkButton** (brand icon hover): `brand-700` on `color-primary-50` — 4.9:1 ✅
- [subframe] pass **LinkButton** (inverse default): `brand-200` on `brand-800` — 5.8:1 ✅
- [subframe] pass **LinkButton** (inverse hover): `brand-50` on `brand-800` — 7.0:1 ✅
- [subframe] pass **LinkButton** (small brand default): `brand-700` on `white` — 5.4:1 ✅
- [subframe] pass **LinkButton** (small brand hover): `brand-900` on `color-primary-50` — 10.7:1 ✅

</details>

<details>
<summary>CheckerCard.tsx — 7 pairs audited, all pass</summary>

- [subframe-disabled] pass **CheckerCard** (heading): `color-primary-700` on `color-primary-50` — 8.7:1 (large text) ✅
- [subframe-disabled] pass **CheckerCard** (disclaimer caption): `brand-900` on `color-primary-50` — 10.7:1 ✅
- [subframe-disabled] pass **CheckerCard** (disclaimer body): `brand-800` on `color-primary-50` — 6.6:1 ✅
- [subframe-disabled] pass **CheckerCard.ResultsCard** (modemName): `default-font` on `white` — 17.9:1 ✅
- [subframe-disabled] pass **CheckerCard.ResultsCard** (modemName speed-warning): `color-neutral-900` on `white` — 17.6:1 ✅
- [subframe-disabled] pass **CheckerCard.ResultsCard** (brand text): `subtext-color` on `white` — 4.7:1 ✅
- [subframe-disabled] pass **CheckerCard.ResultsCard** (inline link): `brand-800` on `white` — 7.3:1 ✅

</details>

<details>
<summary>StatusItem.tsx — 3 active-use pairs audited, all pass; 1 unused variant fails (listed above)</summary>

- [subframe-disabled] pass **StatusItem** (compatible title): `default-font` on `white` — 17.9:1 ✅
- [subframe-disabled] pass **StatusItem** (incompatible title): `error-900` on `white` — 9.6:1 ✅
- [subframe-disabled] pass **StatusItem** (description): `subtext-color` on `white` — 4.7:1 ✅

</details>

<details>
<summary>IconWithBackground.tsx — 16 variant pairs audited, 15 pass, 1 fail (listed above)</summary>

- [subframe-disabled] pass **IconWithBackground** (brand): `brand-900` on `brand-200` — 9.5:1 ✅
- [subframe-disabled] pass **IconWithBackground** (neutral): `neutral-700` on `neutral-200` — 8.2:1 ✅
- [subframe-disabled] pass **IconWithBackground** (error): `error-800` on `error-100` — 6.7:1 ✅
- [subframe-disabled] pass **IconWithBackground** (success): `success-800` on `success-100` — 6.8:1 ✅
- [subframe-disabled] pass **IconWithBackground** (warning): `warning-800` on `warning-100` — 6.4:1 ✅
- [subframe-disabled] pass **IconWithBackground** (dark-brand): `brand-100` on `brand-800` — 6.5:1 ✅
- [subframe-disabled] pass **IconWithBackground** (neutral-dark): `neutral-50` on `neutral-600` — 7.5:1 ✅
- [subframe-disabled] pass **IconWithBackground** (error-dark): `error-50` on `error-800` — 7.3:1 ✅
- [subframe-disabled] pass **IconWithBackground** (warning-2): `neutral-900` on `warning-300` — 12.4:1 ✅
- [subframe-disabled] pass **IconWithBackground** (accent): `color-accent2-50` on `color-accent2-600` — 5.6:1 ✅
- [subframe-disabled] pass **IconWithBackground** (brand-outline): `brand-700` on `white` — 5.4:1 ✅
- [subframe-disabled] pass **IconWithBackground** (accent-1): `color-accent2-700` on `color-accent2-100` — 7.8:1 ✅
- [subframe-disabled] pass **IconWithBackground** (accent-2): `color-accent2-700` on `color-accent2-50` — 8.6:1 ✅
- [subframe-disabled] pass **IconWithBackground** (error-on-dark): `error-800` on `error-200` — 5.7:1 ✅
- [subframe-disabled] pass **IconWithBackground** (success-on-dark): `success-800` on `success-200` — 6.0:1 ✅

</details>

<details>
<summary>OrderCard.tsx — 8 pairs audited, all pass</summary>

- [subframe-disabled] pass **OrderCard** (heading): `brand-800` on `white` — 7.3:1 (large text) ✅
- [subframe-disabled] pass **OrderCard** (section labels): `brand-800` on `white` — 7.3:1 ✅
- [subframe-disabled] pass **OrderCard** (service address text): `default-font` on `white` — 17.9:1 ✅
- [subframe-disabled] pass **OrderCard** (icons): `brand-800` on `white` — 7.3:1 ✅
- [subframe-disabled] pass **OrderCard** (offer text): `default-font` on `color-accent2-101` — 14.5:1 ✅
- [subframe-disabled] pass **OrderCard** (modem price): `neutral-600` on `white` — 7.8:1 ✅
- [subframe-disabled] pass **OrderCard** (total price): `neutral-700` on `white` — 10.4:1 ✅
- [subframe-disabled] pass **OrderCard** (labels): `brand-800` on `white` — 7.3:1 ✅

</details>

<details>
<summary>SettingsMenu.tsx — 3 pairs audited, all pass</summary>

- [subframe] pass **SettingsMenu** (item label default): `default-font` on `white` — 17.9:1 ✅
- [subframe] pass **SettingsMenu** (item label hover): `default-font` on `neutral-100` — 16.4:1 ✅
- [subframe] pass **SettingsMenu** (item label selected): `default-font` on `brand-100` — 16.0:1 ✅

</details>

### Passing — Owned Components

<details>
<summary>SearchInput.tsx — 3 pairs, all pass</summary>

- [owned] pass **SearchInput** (heading on gradient): `color-primary-701` on gradient-brand-top — 6.5:1 (large text) ✅
- [owned] pass **SearchInput** (body text on gradient): `default-font` on gradient-brand-top — 15.6:1 ✅
- [owned] pass **SearchInput** (field label on gradient): `color-primary-701` on gradient-brand-top — 6.5:1 ✅

</details>

<details>
<summary>MultipleMatches.tsx — 2 pairs, all pass</summary>

- [owned] pass **MultipleMatches** (heading on gradient): `brand-900` on gradient-brand-top — 10.3:1 (large text) ✅
- [owned] pass **MultipleMatches** (body text on gradient): `brand-800` on gradient-brand-top — 6.3:1 ✅

</details>

<details>
<summary>ResultCard.tsx — 2 pairs, all pass</summary>

- [owned] pass **ResultCard** (heading on gradient): `color-primary-700` on gradient-brand-top — 8.3:1 (large text) ✅
- [owned] pass **ResultCard** (disclaimer on gradient): `default-font` on gradient-brand-top — 15.6:1 ✅

</details>

<details>
<summary>LoadingState.tsx — 2 pairs, all pass</summary>

- [owned] pass **LoadingState** (spinner icon): `brand-600` on gradient-brand-top — 3.2:1 (24px, large text) ✅
- [owned] pass **LoadingState** (heading text): `brand-800` on gradient-brand-top — 6.3:1 (large text) ✅

</details>

<details>
<summary>NoMatch.tsx — 2 pairs, all pass</summary>

- [owned] pass **NoMatch** (heading on gradient): `brand-900` on gradient-brand-top — 10.3:1 (large text) ✅
- [owned] pass **NoMatch** (body text on gradient): `default-font` on gradient-brand-top — 15.6:1 ✅

</details>

<details>
<summary>SearchError.tsx — 2 pairs, all pass</summary>

- [owned] pass **SearchError** (heading on gradient): `brand-900` on gradient-brand-top — 10.3:1 (large text) ✅
- [owned] pass **SearchError** (body text on gradient): `default-font` on gradient-brand-top — 15.6:1 ✅

</details>

<details>
<summary>BaseScreen.tsx — 7 pairs, all pass</summary>

- [owned] pass **BaseScreen** (heading): `brand-800` on `neutral-50` — 7.0:1 (large text) ✅
- [owned] pass **BaseScreen** (body text): `default-font` on `neutral-50` — 17.2:1 ✅
- [owned] pass **BaseScreen** (Belong Modem label): `color-accent2-800` on `color-accent2-100` — 12.2:1 ✅
- [owned] pass **BaseScreen** (feature text on accent2): `default-font` on `color-accent2-100` — 14.5:1 ✅
- [owned] pass **BaseScreen** (check icons on accent2): `color-accent2-800` on `color-accent2-100` — 12.2:1 ✅
- [owned] pass **BaseScreen** (subheading): `brand-800` on `neutral-50` — 7.0:1 (large text) ✅
- [owned] pass **BaseScreen** (BYO body text): `default-font` on `neutral-50` — 17.2:1 ✅

</details>

<details>
<summary>ErrorBoundary.tsx — 2 pairs pass, 1 fail (listed above)</summary>

- [owned] pass **ErrorBoundary** (heading): `default-font` on `white` — 17.9:1 ✅
- [owned] pass **ErrorBoundary** (description): `subtext-color` on `white` — 4.7:1 ✅

</details>

<details>
<summary>Components with no additional text/bg pairs</summary>

- **ModemChecker.tsx** — orchestrator only, delegates all rendering to child components
- **ConditionList.tsx** — wrapper that renders StatusItem components (already audited)
- **BottomSheet.tsx** — sets gradient bg but text rendering is in children
- **ModemImage.tsx** — image element with skeleton placeholder (`neutral-100`), no text

</details>

### Quick-win Summary

| # | Component | Fix | Effort |
|---|---|---|---|
| 1 | ErrorBoundary | Change Reload button `bg-brand-600` to `bg-brand-800` | Trivial (owned) |
| 2 | TextField | Change placeholder `text-neutral-400` to `text-neutral-500` | Low (subframe, synced) |
| 3 | TextField | Change error icon `text-error-500` to `text-error-700` | Low (subframe, synced) |
| 4 | IconWithBackground | Change success-dark bg `bg-success-600` to `bg-success-700` | Low (subframe-disabled) |
| 5 | Button | Change brand-secondary active text to `text-brand-200` | Low (subframe-disabled) |
| 6 | StatusItem | No fix needed now (on-dark variants unused) — document risk | None |

---

## Touch Targets

WCAG 2.5.8 (AA): 44×44px target, 24px minimum.

### Method

Extracted Tailwind height/width/padding classes from each interactive element's root `<button>` or clickable `<div>`. Calculated effective touch target dimensions. For text-only elements with no explicit height, estimated based on font-size line-height from theme.css tokens (`text-body` = 16px/20px, `text-caption` = 14px/17px, `text-h3-700` = 22px/28px).

**Tailwind size reference:** `h-6`=24px, `h-8`=32px, `h-9`=36px, `h-10`=40px, `h-11`=44px, `h-12`=48px, `h-14`=56px, `h-24`=96px. `p-1`=4px, `p-2`=8px, `p-3`=12px, `p-4`=16px.

### Failures

#### Critical (below 24px on at least one axis)

- [subframe] critical **LinkButton** (medium, default): ~content-width x ~20px — no `min-height`, no vertical padding, height determined solely by `text-body` line-height (~20px). Target 44x44px. `quick-win`: add `min-h-11` to root button. ❌
- [subframe] critical **LinkButton** (small): ~content-width x ~17px — `text-caption` line-height (~17px), no vertical padding. Target 44x44px. `quick-win`: add `min-h-11` to root button. ❌
- [subframe-disabled] critical **CheckerCard.ResultsCard** (inline "Add a Belong modem" button): ~content-width x ~20px — `p-0 border-none bg-transparent` inline `<button>`, height = body text line-height (~20px), no padding or min-height. Target 44x44px. `quick-win`: add `min-h-11 px-1` or wrap in a larger tap target area. ❌

#### High (24-43px)

- [subframe] high **IconButton** (small): 24x24px — `h-6 w-6`. Meets the 24px absolute minimum but far below 44x44px target. `quick-win`: add `min-h-11 min-w-11` (visual size unchanged, touch area expanded). ❌
- [subframe] high **IconButton** (medium, default): 32x32px — `h-8 w-8`. Target 44x44px. `quick-win`: add `min-h-11 min-w-11`. ❌
- [subframe] high **IconButton** (large): 40x40px — `h-10 w-10`. Target 44x44px. `quick-win`: add `min-h-11 min-w-11`. ❌
- [subframe-disabled] high **Button** (small): content-width x 36px — `h-9`, `px-4`. Width is content-dependent but typically >44px. Height is below target. `quick-win`: change `h-9` to `h-11` for small variant. ❌
- [subframe] high **LinkButton** (large): ~content-width x ~28px — `text-h3-700` line-height (~28px), no vertical padding. Target 44x44px. `quick-win`: add `min-h-11` to root button. ❌
- [subframe] high **SettingsMenu.Item**: full-width x 32px — `h-8`, `px-3 py-1`. Target 44x44px. `quick-win`: change `h-8` to `h-11`. ❌

#### Contextual findings in page components

- [owned] high **SearchInput**: Close `IconButton` uses default size (32x32px) — inherits IconButton medium finding above. ❌
- [owned] critical **SearchInput**: "Help me find the model name" `LinkButton` uses medium default (~20px tall) — inherits LinkButton critical finding. ❌
- [owned] high **MultipleMatches**: Back `IconButton` has `className="h-8 w-8"` with `size="large"` — the className overrides the large size back to 32x32px. Target 44x44px. `quick-win`: change to `h-11 w-11`. ❌
- [owned] high **MultipleMatches**: Close `IconButton` has `className="h-8 w-8"` with `size="large"` — same issue as Back button, 32x32px. `quick-win`: change to `h-11 w-11`. ❌
- [owned] critical **MultipleMatches**: "Help me identify my modem" `LinkButton` (medium, ~20px tall) — inherits LinkButton critical finding. ❌
- [owned] critical **ResultCard**: "Check another modem" `LinkButton` (medium, ~20px tall) — inherits LinkButton critical finding. ❌
- [owned] critical **NoMatch**: "Read the modem compatibility FAQs" `LinkButton` (medium, ~20px tall) — inherits LinkButton critical finding. ❌
- [owned] critical **BaseScreen**: "Learn more" `LinkButton` (medium, ~20px tall) in Belong Modem info box — inherits LinkButton critical finding. ❌
- [owned] critical **BaseScreen**: "Modem compatibility FAQs" `LinkButton` (medium, brand variant, ~20px tall) in BYO section — inherits LinkButton critical finding. ❌
- [owned] critical **CheckerCard**: "Check another modem" `LinkButton` (hidden, brand variant) — inherits LinkButton critical finding. Currently hidden (`className="hidden"`) so no runtime impact, but would fail if shown. ❌
- [owned] critical **CheckerCard**: "Learn more in our FAQs" `LinkButton` (neutral, ~20px tall) in not-compatible state — inherits LinkButton critical finding. ❌

### Passing (44px or above)

<details>
<summary>All elements meeting the 44x44px target</summary>

- [subframe-disabled] pass **Button** (medium, default): content-width x 48px — `h-12`, `px-8`. 48px height >= 44px target. ✅
- [subframe-disabled] pass **Button** (large): content-width x 56px — `h-14`, `px-8`. 56px height >= 44px target. ✅
- [subframe] pass **TextField** (input container): full-width x 48px — `h-12`, `px-2`. 48px height >= 44px target. ✅
- [subframe-disabled] pass **RadioCardGroup.RadioCard**: full-width x ~84px — `py-4` (32px vertical padding) + body text content (~20px) + radio indicator (24px). Well above 44px target. ✅
- [subframe] pass **CardButton**: full-width x 96px — `h-24`, `px-4 py-4`. 96px height >= 44px target. ✅
- [subframe-disabled] pass **OrderCard** (used as interactive in BaseScreen): full-width x ~200px+ — `px-4 py-4` + substantial content. Well above 44px target. ✅
- [owned] pass **SearchInput** "Continue" `Button` (medium): inherits Button medium = 48px tall. ✅
- [owned] pass **BaseScreen** "Check your modem" `Button` (medium): `h-12` = 48px. ✅
- [owned] pass **BaseScreen** "Back" `Button` (medium): `h-12` = 48px. ✅
- [owned] pass **BaseScreen** "Start checkout" `Button` (medium): `h-12` = 48px. ✅
- [owned] pass **CheckerCard** "Check your/another modem" `Button` (medium): inherits Button medium = 48px. ✅
- [owned] pass **ResultCard** "Close" `Button` (medium): inherits Button medium = 48px. ✅
- [owned] pass **NoMatch** "Try a new search" `Button` (medium): inherits Button medium = 48px. ✅
- [owned] pass **SearchError** "Try again" `Button` (medium): inherits Button medium = 48px. ✅
- [owned] pass **SearchError** "Start a new search" `Button` (medium): inherits Button medium = 48px. ✅
- [owned] pass **MultipleMatches** `CardButton` items: inherits CardButton = 96px. ✅

</details>

### Quick-win Summary

| # | Component | Current | Fix | Effort |
|---|---|---|---|---|
| 1 | LinkButton (all sizes) | No height/padding (~17-28px) | Add `min-h-11` to root `<button>` | Low (subframe, synced) |
| 2 | IconButton (all sizes) | 24-40px square | Add `min-h-11 min-w-11` to root `<button>`, keep visual size with inner icon wrapper | Low (subframe, synced) |
| 3 | Button (small) | `h-9` = 36px | Change to `h-11` = 44px | Low (subframe-disabled) |
| 4 | MultipleMatches Back/Close | `h-8 w-8` className override | Change to `h-11 w-11` in className | Trivial (owned) |
| 5 | SettingsMenu.Item | `h-8` = 32px | Change to `h-11` = 44px | Low (subframe, synced) |
| 6 | CheckerCard inline button | `p-0` inline text button (~20px) | Add `min-h-11 px-1` or replace with LinkButton (once LinkButton is fixed) | Medium (subframe-disabled) |

---

## Focus Rings

WCAG 2.4.7 (AA): All interactive elements must have a visible focus indicator.

### Method

Read every interactive component and searched for `focus-visible:`, `focus-within:`, `focus:`, `outline`, and `ring` in Tailwind classes. Assessed whether each component has a visible focus indicator and whether the ring appearance (color, width, offset) is consistent across the component set.

**Tailwind v4 preflight behavior:** `@import "tailwindcss"` includes preflight, which does NOT strip `:focus-visible` outlines from native elements. Buttons and inputs get the browser's default `outline` on `:focus-visible` unless explicitly removed. However, `<div>` elements with `tabIndex` or `role="button"` do NOT get browser default focus rings -- they must be styled explicitly.

**Established ring pattern (from RadioCardGroup.RadioCard):** `ring-2 ring-brand-600 ring-offset-2` -- 2px brand-colored ring with 2px offset. This is the consistency target for all components.

### Failures

- [subframe-disabled] high **Button**: No `focus-visible` styles. Relies on browser default `:focus-visible` outline (typically a thin blue or black line). While visible, it is inconsistent with the `ring-2 ring-brand-600 ring-offset-2` pattern used elsewhere. The `rounded-full` shape makes the default rectangular outline particularly jarring. `quick-win`: add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2` to the root `<button>`. ❌
- [subframe] high **IconButton**: No `focus-visible` styles. Same issue as Button -- browser default outline is inconsistent with ring pattern. `quick-win`: add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2` to the root `<button>`. ❌
- [subframe] high **LinkButton**: No `focus-visible` styles. `<button>` with `border-none bg-transparent` -- browser default outline shows but is inconsistent with ring pattern. `quick-win`: add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2` to the root `<button>`. ❌
- [subframe] high **CardButton**: No focus styles at all. Root element is a `<div>`, not a `<button>`, so it receives no browser default focus indicator. In MultipleMatches, the caller adds `role="button" tabIndex={0}` and explicit `focus-visible:ring-*` classes via `className` -- this works but the fix lives in the consumer, not the component. If CardButton is used elsewhere without those classes, focus will be invisible. `quick-win`: add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2` to the root `<div>` in the component itself, and remove the duplicate from MultipleMatches. ❌
- [subframe] high **SettingsMenu.Item**: No focus styles. Root element is a `<div>` with `cursor-pointer` -- no `tabIndex`, no `role`, no focus indicator. If made keyboard-accessible (which it should be), it would need explicit focus ring styles. `quick-win`: change to `<button>` or add `tabIndex={0} role="menuitem"` + `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2`. ❌
- [subframe-disabled] high **CheckerCard** (inline "Add a Belong modem" button): `<button>` with `border-none bg-transparent p-0` -- no `focus-visible` styles. Browser default outline will appear but is inconsistent and very tight against the inline text. `quick-win`: add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 rounded-sm` to the inline `<button>`. ❌
- [owned] high **ErrorBoundary** (Reload button): Plain `<button>` with `rounded-full` -- no `focus-visible` styles. Browser default outline is visible but inconsistent. `quick-win`: add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2`. ❌
- [subframe-disabled] medium **OrderCard** (used as interactive in BaseScreen): `<div>` with `onClick` and `cursor-pointer` className added by BaseScreen. No `tabIndex`, no `role`, no focus styles. Currently not keyboard-accessible at all. If made accessible, would need focus ring. ❌
- [subframe] medium **TextField.Input**: The `<input>` has `outline-none`, which suppresses the browser default focus indicator. The parent container uses `group-focus-within:border-brand-primary` to change the border color on focus, providing a visual cue. However, this border-color change is subtle (1px border goes from `neutral-300` to `brand-primary`) and does not meet the ring-2 consistency pattern. The container does NOT add `ring-*` classes on focus. Partially accessible but inconsistent. ❌

### Passing

- [subframe-disabled] pass **RadioCardGroup.RadioCard**: `focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-600 focus-within:ring-offset-2` on the inner `<button>`. Uses `focus-within:` (not `focus-visible:`) because the Radix `RadioGroup.Item` manages focus on the wrapping element. This is correct -- the ring appears when the radio card receives keyboard focus. This is the reference pattern for the codebase. ✅
- [owned] pass **MultipleMatches** (CardButton wrappers): Adds `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2` via `className` on each CardButton instance. Matches the reference pattern. Note: this compensates for CardButton's own lack of focus styles. ✅
- [owned] pass **BottomSheet** (Dialog.Content): `outline-none` on the modal container. This is correct -- the dialog container itself should not show a focus ring; focus should be on interactive children inside. ✅

### Consistency Analysis

Only 2 out of 10 interactive component types have explicit focus ring styles. The established pattern is `ring-2 ring-brand-600 ring-offset-2`, but it appears in only RadioCardGroup.RadioCard (component-level) and MultipleMatches CardButton usage (consumer-level). All other components rely on the browser's default `:focus-visible` outline (for `<button>` elements) or have no focus indicator at all (for `<div>` elements used as buttons).

The TextField uses a different approach entirely: a border-color change via `focus-within` on the container, rather than a ring. This is a common pattern for text fields but is visually inconsistent with the ring-based approach used elsewhere.

### Quick-win Summary

| # | Component | Fix | Effort |
|---|---|---|---|
| 1 | Button | Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2` to root `<button>` | Low (subframe-disabled) |
| 2 | IconButton | Same focus-visible ring classes on root `<button>` | Low (subframe, synced) |
| 3 | LinkButton | Same focus-visible ring classes on root `<button>` | Low (subframe, synced) |
| 4 | CardButton | Same focus-visible ring classes on root `<div>`, remove duplicate from MultipleMatches | Low (subframe, synced + owned) |
| 5 | SettingsMenu.Item | Change to `<button>` element + add focus-visible ring classes | Medium (subframe, synced) |
| 6 | CheckerCard inline button | Add focus-visible ring classes + `rounded-sm` to the inline `<button>` | Low (subframe-disabled) |
| 7 | ErrorBoundary Reload | Add focus-visible ring classes to the `<button>` | Trivial (owned) |
| 8 | TextField | Add `focus-within:ring-2 focus-within:ring-brand-600 focus-within:ring-offset-2` to container `<div>` alongside existing border change | Low (subframe, synced) |
| 9 | OrderCard (BaseScreen) | Add `tabIndex={0} role="button"` + focus-visible ring classes when used as interactive | Medium (owned + subframe-disabled) |

---

## Accessible Names

WCAG 4.1.2 (A): All interactive elements must have an accessible name.

### Method

Read every interactive component (Subframe primitives in `src/ui/components/` and owned page components in `src/components/`) and checked that each interactive element has a programmatically determinable accessible name via one of: visible text content, `aria-label`, associated `<label>`, or `alt` attribute (for images).

**Interactive element types audited:** `<button>`, `<input>`, `<div role="button">`, `<div>` with `onClick`/`cursor-pointer`, `<img>`, `<a>`.

### Failures

#### Icon-only buttons missing `aria-label`

- [subframe] high **IconButton**: The component renders a `<button>` with only an icon (no text content). It does NOT provide a default `aria-label` -- it relies on callers passing one via `...otherProps`. All current usages in the codebase DO pass `aria-label` (SearchInput: "Close", MultipleMatches: "Back"/"Close", ModemInfoSheet: "Dismiss"), so there is no runtime violation today. However, the component itself does not enforce or warn about missing labels. Low risk as long as all future callers remember to set it. No fix needed now. `informational`

#### Images missing `alt`

- [subframe] high **CardButton**: The `<img>` element (rendered when `image` prop is provided) has no `alt` attribute at all. Screen readers will announce the image URL. In MultipleMatches, the parent passes `aria-label` on the `<div>` wrapper, which provides context at the button level, but the `<img>` itself still lacks `alt`. `quick-win`: add `alt={String(modelName ?? "")}` to the `<img>` element. ❌

#### Inputs missing labels

- [owned] medium **SearchInput**: The `TextField.Input` is wrapped by a `<TextField>` component whose root is a `<label>` element -- good. However, the `label` prop is set to an empty string (`label=""`), which means there is no visible `<span>` label text inside the `<label>`. The `<label>` element still wraps the `<input>`, so it IS programmatically associated (implicit label association). But the accessible name is derived from the label's text content, which is empty. The text "Brand, model name, or model number" sits in a separate `<span>` OUTSIDE the `<TextField>` component, so it is NOT part of the label association. Screen readers will announce the placeholder text as a fallback, which is suboptimal. `quick-win`: move "Brand, model name, or model number" into the `TextField`'s `label` prop instead of a separate `<span>`, or add `aria-label="Brand, model name, or model number"` to the `<TextField.Input>`. ❌

#### Interactive `<div>` elements missing accessible names

- [subframe-disabled] high **OrderCard** (used as interactive in BaseScreen): The `<div>` root receives `onClick` and `className="cursor-pointer"` from BaseScreen, making it behave as an interactive element. But it has no `role`, `tabIndex`, or `aria-label`. Sighted users see "Order summary" as a heading, but there is no accessible name for the interactive control itself. Related to the Roles & Semantics finding (the element needs `role="button"` and `tabIndex={0}` to be keyboard-accessible at all). `quick-win`: add `role="button" tabIndex={0} aria-label="Edit order settings"` in BaseScreen's `<OrderCard>` usage. ❌

- [subframe] medium **SettingsMenu.Item**: The `<div>` root has `cursor-pointer` but no `role`, `tabIndex`, or `aria-label`. It has visible text via the `label` prop, which would serve as the accessible name IF the element were a `<button>` or had `role="button"`. Since it has no semantic role, the accessible name is moot -- the element is not recognized as interactive by assistive technology at all. Fixing the role (separate Roles & Semantics issue) would also fix the name. `informational`

#### Decorative images / icons

- [owned] medium **LoadingState**: The `FeatherLoader` icon is purely decorative (the "Finding your modem..." text provides the information). The SVG icon has no `aria-hidden="true"` attribute. The `<div>` container has `role="status"` which is correct, and the text content provides the accessible name for the status region. The icon is not a critical issue since it's presentational, but adding `aria-hidden="true"` to the icon would be best practice. ❌

- [owned] medium **BaseScreen** (Belong Modem info box): Three `FeatherCheck` icons are used decoratively alongside text ("Supports all Belong nbn plans", etc.). These SVG icons have no `aria-hidden="true"`. They are presentational -- the text conveys the meaning. Low impact but adding `aria-hidden="true"` would prevent screen readers from announcing "check" or the SVG path data. ❌

- [subframe-disabled] medium **OrderCard**: The `FeatherHome` and `FeatherZap` icons are decorative (used alongside "Service address" and nbn tech type text). No `aria-hidden="true"`. Same low-impact issue. ❌

#### DevMenu custom buttons

- [owned] medium **DevMenu**: Plan selection and tech type selection use raw `<button>` elements with visible text content (e.g. "nbn 100", "FTTP"). These have accessible names via their text content. However, the currently-selected state is only communicated visually (via border/background color). There is no `aria-pressed`, `aria-selected`, or equivalent. Screen reader users cannot determine which plan/tech type is currently selected. `quick-win`: add `aria-pressed={planId === plan.id}` to each plan button and `aria-pressed={nbnTechType === tech.id}` to each tech type button. ❌

- [owned] medium **DevMenu**: The backdrop overlay `<motion.div>` has `onClick={onClose}` but no accessible name, role, or keyboard access. This is acceptable -- it's a click-away-to-dismiss pattern, and the Escape key handler provides keyboard dismissal. `informational`

### Passing

<details>
<summary>Buttons with text content (accessible name from visible text)</summary>

- [subframe-disabled] pass **Button**: All usages have visible text `children` providing the accessible name. The component renders a native `<button>` element. ✅
- [owned] pass **SearchInput** "Continue" button: visible text "Continue". ✅
- [owned] pass **ResultCard** "Close" button: visible text "Close". ✅
- [owned] pass **ResultCard** "Check another modem" LinkButton: visible text "Check another modem". ✅
- [owned] pass **NoMatch** "Try a new search" button: visible text "Try a new search". ✅
- [owned] pass **NoMatch** "Read the modem compatibility FAQs." LinkButton: visible text. ✅
- [owned] pass **SearchError** "Try again" / "Start a new search" buttons: visible text. ✅
- [owned] pass **ErrorBoundary** "Reload" button: visible text "Reload". ✅
- [owned] pass **BaseScreen** "Check your modem" / "Back" / "Start checkout" buttons: visible text. ✅
- [owned] pass **BaseScreen** "Learn more" / "Modem compatibility FAQs" LinkButtons: visible text. ✅
- [subframe-disabled] pass **CheckerCard** "Check your modem" / "Check another modem" buttons: visible text. ✅
- [subframe-disabled] pass **CheckerCard** "Learn more in our FAQs." LinkButton: visible text. ✅
- [subframe-disabled] pass **CheckerCard** inline "Add a Belong modem to your order" button: visible text. ✅
- [owned] pass **ModemInfoSheet** "View full details on belong.com.au" / "Close" buttons: visible text. ✅
- [owned] pass **DevMenu** "Close" button: visible text "Close". ✅
- [owned] pass **MultipleMatches** "Help me identify my modem" LinkButton: visible text. ✅

</details>

<details>
<summary>Icon-only buttons with aria-label (all current usages)</summary>

- [owned] pass **SearchInput** close `IconButton`: `aria-label="Close"`. ✅
- [owned] pass **MultipleMatches** back `IconButton`: `aria-label="Back"`. ✅
- [owned] pass **MultipleMatches** close `IconButton`: `aria-label="Close"`. ✅
- [owned] pass **ModemInfoSheet** close `IconButton`: `aria-label="Dismiss"`. ✅

</details>

<details>
<summary>Images with alt text</summary>

- [owned] pass **ModemImage**: Requires `alt` as a mandatory prop (`alt: string`). All usages provide meaningful alt text. ✅
- [subframe-disabled] pass **RadioCardGroup.RadioCard** (image): Uses `ModemImage` with `alt={String(label ?? "Modem")}`. ✅
- [subframe-disabled] pass **CheckerCard.ResultsCard** (image): Uses `ModemImage` with `alt={String(modemName ?? "Modem")}`. ✅
- [owned] pass **BaseScreen** (Belong Modem image): `alt="Belong Modem"`. ✅
- [owned] pass **ModemInfoSheet** (Belong Modem image): `alt="Belong Wi-Fi 6 Modem"`. ✅

</details>

<details>
<summary>Form inputs with label association</summary>

- [subframe] pass **TextField**: Root element is a `<label>`, which implicitly associates any child `<input>` elements. When the `label` prop is provided with text content, the accessible name is clear. The component pattern is correct. ✅
- [subframe-disabled] pass **RadioCardGroup.RadioCard**: Radix `RadioGroup.Item` provides ARIA semantics automatically. The `label` prop text serves as the accessible name. ✅

</details>

<details>
<summary>Interactive divs with aria-label</summary>

- [owned] pass **MultipleMatches** CardButton wrappers: Each CardButton receives `role="button" tabIndex={0} aria-label={modem.brand + " " + modem.model}`. ✅

</details>

<details>
<summary>Dialog/modal accessible names</summary>

- [owned] pass **BottomSheet**: Uses Radix `Dialog.Title` with `className="sr-only"` providing a visually hidden but accessible dialog title. Default: "Modem search", configurable via `title` prop. The `aria-describedby={undefined}` correctly suppresses the default Radix description warning when no `Dialog.Description` is present. ✅

</details>

<details>
<summary>Status regions</summary>

- [owned] pass **LoadingState**: `<div role="status">` container with text content "Finding your modem..." provides the accessible name for the live region. ✅

</details>

<details>
<summary>Non-interactive elements (no accessible name needed)</summary>

- **StatusItem**: Non-interactive `<div>`. Text content is visible. ✅
- **IconWithBackground**: Non-interactive decorative container. ✅
- **FeatureItem**: Non-interactive `<div>`. Text content is visible. ✅
- **ConditionList**: Non-interactive wrapper rendering StatusItem children. ✅
- **ModemChecker**: Orchestrator, no direct interactive elements. ✅

</details>

### Quick-win Summary

| # | Component | Fix | Effort |
|---|---|---|---|
| 1 | CardButton | Add `alt={String(modelName ?? "")}` to the `<img>` element | Trivial (subframe, synced) |
| 2 | SearchInput | Move "Brand, model name, or model number" into `TextField`'s `label` prop, or add `aria-label` to `TextField.Input` | Trivial (owned) |
| 3 | OrderCard (BaseScreen usage) | Add `role="button" tabIndex={0} aria-label="Edit order settings"` | Trivial (owned) |
| 4 | DevMenu (plan/tech buttons) | Add `aria-pressed={isSelected}` to each toggle button | Trivial (owned) |
| 5 | LoadingState icon | Add `aria-hidden="true"` to `FeatherLoader` | Trivial (owned) |
| 6 | BaseScreen check icons | Add `aria-hidden="true"` to `FeatherCheck` icons | Low (owned) |
| 7 | OrderCard icons | Add `aria-hidden="true"` to `FeatherHome` and `FeatherZap` | Low (subframe-disabled) |

---

## Roles & Semantics

WCAG 1.3.1 (A), 4.1.2 (A): Correct use of native elements, ARIA roles, labels, alt text, landmarks.

### Method

Reviewed every component listed in the audit scope for: correct HTML element usage on interactive elements, ARIA role/tabIndex/keyboard handler completeness on `<div>`/`<span>` with click handlers, correct existing ARIA attributes, `alt` on `<img>` elements, and accessible submit mechanisms on `<form>` elements.

### Findings — Interactive elements

- [subframe] critical **CardButton**: Root `<div>` has `cursor-pointer` and accepts `onClick` via `...otherProps` spread, but the component itself does not provide `role="button"`, `tabIndex={0}`, or a keyboard handler. Consumers must add all three manually (as MultipleMatches does). The component should be a `<button>` or at minimum include `role="button"`, `tabIndex={0}`, and an `onKeyDown` for Enter/Space. `quick-win` if adding role+tabIndex; better fix is changing root to `<button>`.

- [subframe-disabled] high **OrderCard**: Root `<div>` extends `HTMLDivElement` props. In BaseScreen (line 190-199), it receives `onClick={onOpenDevMenu}` with `cursor-pointer` and `active:scale-[0.99]` classes but has no `role`, `tabIndex`, or keyboard handler — it is completely invisible to assistive technology as an interactive element. `quick-win` — add `role="button"` and `tabIndex={0}` at the call site in BaseScreen, plus an `onKeyDown` for Enter/Space. Better fix: change the root element to `<button>` since it's sync-disabled.

- [subframe] critical **SettingsMenu.Item**: `<div>` root has `cursor-pointer`, `hover:bg-neutral-100`, and `active:bg-neutral-50` indicating interactivity, but no `role`, `tabIndex`, or keyboard handler. Not currently imported/used in the app, but the component is broken for accessibility if used. Should be a `<button>`. `quick-win`

- [owned] medium **DevMenu backdrop**: The `<motion.div>` overlay (line 41-48) has `onClick={onClose}` but no role or keyboard attributes. This is acceptable for a dismissal overlay — keyboard users close via Escape (handled on line 29). However, the overlay is currently focusable by default (divs are not, so this is technically fine). Adding `aria-hidden="true"` would be a minor improvement to signal that this is not interactive content. `informational`

- [owned] high **DevMenu sheet**: The `<motion.div>` sheet (line 50-108) acts as a modal dialog but lacks `role="dialog"`, `aria-modal="true"`, and an accessible label (`aria-label`). It also has no focus trap — Tab can escape the sheet into background content. The Escape handler is manual (via `useEffect`) rather than using a dialog primitive. Contrast with BottomSheet which correctly uses Radix Dialog for all of this.

- [owned] low **DevMenu plan/tech buttons**: The `<button>` elements (lines 64, 86) for plan and tech type selection function as toggle buttons but lack `aria-pressed` to communicate selected state. The visual `border-brand-500 bg-color-primary-50` style communicates selection visually but not programmatically.

### Findings — ARIA attributes (existing)

- [owned] ok **BottomSheet `aria-modal="true"`**: Correctly set on `Dialog.Content` via `asChild`. Radix Dialog also sets this internally, so the explicit attribute is redundant but not harmful.

- [owned] ok **BottomSheet `aria-describedby={undefined}`**: Correctly suppresses the Radix Dialog warning about missing description. Since the sheet content varies by step, there is no single static description. This is the documented Radix pattern.

- [owned] ok **BottomSheet `Dialog.Title`**: Present with `className="sr-only"` — correctly provides an accessible name for the dialog while remaining visually hidden. Configurable via `title` prop (defaults to "Modem search").

- [owned] ok **LoadingState `role="status"`**: Correct. This is an implicit `aria-live="polite"` region, so screen readers will announce "Finding your modem..." when the component appears. Appropriate for a loading indicator.

- [owned] ok **MultipleMatches CardButton usage**: Each CardButton instance correctly receives `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space), `aria-label`, and `focus-visible` ring styles. This compensates for CardButton's lack of built-in accessibility.

- [owned] ok **SearchInput close IconButton**: Has `aria-label="Close"`.

- [owned] ok **MultipleMatches back/close IconButtons**: Both have `aria-label` ("Back" and "Close").

- [owned] ok **ModemInfoSheet dismiss IconButton**: Has `aria-label="Dismiss"`.

### Findings — Images

- [subframe] high **CardButton `<img>`**: The `<img>` element (line 43) has no `alt` attribute. When a modem image is provided, screen readers will fall back to the file path/URL, which is not meaningful. Should use the `modelName` prop value as `alt` text. `quick-win`

- [owned] ok **ModemImage**: Requires `alt` prop (TypeScript enforced) and passes it to the `<img>` element. All call sites provide meaningful alt text.

- [owned] ok **BaseScreen Belong Modem image**: Has `alt="Belong Modem"`.

- [owned] ok **ModemInfoSheet image**: Has `alt="Belong Wi-Fi 6 Modem"`.

- [owned] ok **CheckerCard.ResultsCard ModemImage**: Uses `String(modemName ?? "Modem")` as alt text.

### Findings — Forms

- [owned] ok **SearchInput `<form>`**: Wraps input and submit button in a `<form>` with `onSubmit`. The submit button uses `type="submit"`. Enter key submission works natively via form semantics.

- [owned] ok **Button `type` defaults**: The Button component defaults `type="button"` (line 65), preventing accidental form submission. SearchInput explicitly overrides to `type="submit"` for the Continue button.

### Findings — Native element usage (good patterns)

- [subframe-disabled] ok **Button**: Uses native `<button>` element with proper `disabled` support.
- [subframe] ok **IconButton**: Uses native `<button>` element with `type="button"` default.
- [subframe] ok **LinkButton**: Uses native `<button>` element with `type="button"` default. Despite the name suggesting a link, this is semantically correct as it triggers actions rather than navigation.
- [subframe-disabled] ok **RadioCardGroup.RadioCard**: Uses `<button>` inside `SubframeCore.RadioGroup.Item` with `asChild`. Radix RadioGroup provides correct `role="radio"` and `aria-checked` attributes.
- [subframe] ok **TextField**: Uses `<label>` as root element, which correctly associates with the child `<input>` for click-to-focus behavior.
- [owned] ok **ErrorBoundary reload button**: Uses native `<button>` element.

### Summary

| Severity | Count | Quick-wins |
|---|---|---|
| Critical | 2 | 2 |
| High | 3 | 2 |
| Medium | 1 | 0 |
| Low | 1 | 0 |
| OK (verified correct) | 14 | — |

**Top priorities:**
1. CardButton: change `<div>` to `<button>` (or add role+tabIndex+keyDown) — affects MultipleMatches screen
2. OrderCard in BaseScreen: add role+tabIndex+keyDown to the click handler usage (or change root to `<button>`)
3. CardButton `<img>`: add `alt` attribute using `modelName` prop
4. DevMenu: replace custom sheet with Radix Dialog (or add `role="dialog"` + `aria-modal` + focus trap + `aria-label`)
5. SettingsMenu.Item: change `<div>` to `<button>` (not currently used, low urgency)

---

## Heading Hierarchy

WCAG 1.3.1 (A): No skipped heading levels in assembled DOM per screen.

### Method

Traced every heading element (`<h1>`–`<h6>`) and every visual heading (non-heading element styled with `text-h*` Tailwind tokens) through the assembled DOM for each screen. Radix `Dialog.Title` renders as `<h2>` by default.

**Key context:**
- The widget is embeddable — it has no `<h1>` of its own. The host page is expected to provide the `<h1>`.
- BottomSheet is a modal dialog. Its `Dialog.Title` (sr-only `<h2>`) provides the accessible name. Heading hierarchy inside a modal is technically independent from the page, but should still be internally consistent.
- All "headings" in the codebase are `<span>` elements with `text-h*` Tailwind classes — **none** are semantic heading elements (`<h1>`–`<h6>`).

### Findings

#### Cross-cutting issue: No semantic headings anywhere

- [owned] **high** Every screen uses `<span>` elements with visual heading classes (`text-h2`, `text-h3-700`, `text-h4-button-500`) instead of semantic heading elements (`<h2>`, `<h3>`, `<h4>`). Screen readers cannot navigate by heading, and the document outline is completely flat. This affects **all 9 screens** below.

The only true heading element in the entire widget is the Radix `Dialog.Title` (`<h2>`, sr-only) inside BottomSheet. Everything else is a `<span>`.

---

### Screen: BaseScreen (landing — idle, no modem selected)

**Context:** Renders outside the BottomSheet, directly on the page.

Semantic headings: _(none)_

Visual headings (all `<span>`):
| Element | Class | Content | Expected level |
|---|---|---|---|
| `<span>` | `text-h2` | "Modem selection" | h2 |
| `<span>` | `text-h4-button-500` | "Belong Modem" | h3 or h4 |
| `<span>` | `text-h2` | "Order summary" (in OrderCard) | h2 |

- [owned] **high** `<span class="text-h2">Modem selection</span>` — visual heading, not semantic. Should be `<h2>`. **quick-win**
- [subframe-disabled] **medium** `<span class="text-h4-button-500">Belong Modem</span>` in the Belong modem info box — visually functions as a subheading but is a `<span>`. Could be `<h3>`.
- [subframe-disabled] **medium** `<span class="text-h2">Order summary</span>` in OrderCard — visual heading, not semantic. Should be `<h2>`. **quick-win**

---

### Screen: BaseScreen (results — BYO selected, modem verified)

**Context:** Same as landing, plus the BYO section with CheckerCard in `state="results"`.

Visual headings (all `<span>`, additional to landing):
| Element | Class | Content | Expected level |
|---|---|---|---|
| `<span>` | `text-h3-700` | "Modem compatibility" | h3 |
| `<span>` | `text-h3-700` | "Compatibility results" (in CheckerCard) | h3 |

- [owned] **high** `<span class="text-h3-700">Modem compatibility</span>` — visual heading, not semantic. Should be `<h3>` (nested under "Modem selection"). **quick-win**
- [subframe-disabled] **medium** `<span class="text-h3-700">Compatibility results</span>` in CheckerCard — visual heading, not semantic. Should be `<h3>`. **quick-win**

---

### Screen: Search step (BottomSheet + SearchInput)

**Context:** Inside BottomSheet modal dialog.

Semantic headings:
| Element | Level | Content | Source |
|---|---|---|---|
| `Dialog.Title` | h2 | "Modem search" | BottomSheet (sr-only) |

Visual headings (all `<span>`):
| Element | Class | Content | Expected level |
|---|---|---|---|
| `<span>` | `text-h2` | "Search for your modem" | h2 (visually) |

- [owned] **high** `<span class="text-h2">Search for your modem</span>` — visual heading, not semantic. Should be a heading element. If made `<h2>`, it would be a sibling of the sr-only `Dialog.Title` `<h2>`, which is acceptable. Alternatively, make it `<h3>` to nest under the dialog title. **quick-win**
- [owned] **low** The sr-only `Dialog.Title` (`<h2>`) and the visual heading both convey "search" semantics — slightly redundant but not harmful. The Dialog.Title serves as the accessible dialog name (via `aria-labelledby`), while the visual heading provides on-screen context. Both can coexist.

---

### Screen: LoadingState (BottomSheet + LoadingState)

**Context:** Inside BottomSheet modal dialog.

Semantic headings:
| Element | Level | Content | Source |
|---|---|---|---|
| `Dialog.Title` | h2 | "Modem search" | BottomSheet (sr-only) |

Visual headings (all `<span>`):
| Element | Class | Content | Expected level |
|---|---|---|---|
| `<span>` | `text-h3-700` | "Finding your modem..." | h3 |

- [owned] **medium** `<span class="text-h3-700">Finding your modem...</span>` — visual heading, not semantic. The `role="status"` on the parent div means screen readers will announce the text content, so the lack of a heading element has reduced impact here. Still should be `<h3>` for heading navigation consistency. **quick-win**

---

### Screen: MultipleMatches (BottomSheet + MultipleMatches)

**Context:** Inside BottomSheet modal dialog.

Semantic headings:
| Element | Level | Content | Source |
|---|---|---|---|
| `Dialog.Title` | h2 | "Modem search" | BottomSheet (sr-only) |

Visual headings (all `<span>`):
| Element | Class | Content | Expected level |
|---|---|---|---|
| `<span>` | inline styles (28px/700) | "Select your modem" | h2 (visually) |

- [owned] **high** `<span>Select your modem</span>` — uses raw inline font styles (`text-[28px] font-[700]`) matching `text-h2` sizing. Not a semantic heading. Should be `<h3>` (under the dialog's `<h2>`). **quick-win**

Note: CardButton items show modem model/brand with `text-h4-button-500` on model names, but these are list item labels, not document headings — appropriate as `<span>`.

---

### Screen: ResultCard (BottomSheet + ResultCard + CheckerCard.ResultsCard)

**Context:** Inside BottomSheet modal dialog. ResultCard renders CheckerCard.ResultsCard.

Semantic headings:
| Element | Level | Content | Source |
|---|---|---|---|
| `Dialog.Title` | h2 | "Modem search" | BottomSheet (sr-only) |

Visual headings (all `<span>`):
| Element | Class | Content | Expected level |
|---|---|---|---|
| `<span>` | `text-h2` | "Compatibility results" | h2 (visually) |

- [owned] **high** `<span class="text-h2">Compatibility results</span>` in ResultCard — visual heading, not semantic. Should be `<h3>` (under the dialog's `<h2>`). **quick-win**

Note: StatusItem titles use `text-body` / `text-body-bold` — these are list item labels, not headings. Appropriate as `<span>`.

---

### Screen: NoMatch (BottomSheet + NoMatch)

**Context:** Inside BottomSheet modal dialog.

Semantic headings:
| Element | Level | Content | Source |
|---|---|---|---|
| `Dialog.Title` | h2 | "Modem search" | BottomSheet (sr-only) |

Visual headings (all `<span>`):
| Element | Class | Content | Expected level |
|---|---|---|---|
| `<span>` | `text-h2` | "No modem found" | h2 (visually) |

- [owned] **high** `<span class="text-h2">No modem found</span>` — visual heading, not semantic. Should be `<h3>` (under the dialog's `<h2>`). **quick-win**

---

### Screen: SearchError (BottomSheet + SearchError)

**Context:** Inside BottomSheet modal dialog.

Semantic headings:
| Element | Level | Content | Source |
|---|---|---|---|
| `Dialog.Title` | h2 | "Modem search" | BottomSheet (sr-only) |

Visual headings (all `<span>`):
| Element | Class | Content | Expected level |
|---|---|---|---|
| `<span>` | `text-h2` | "Something went wrong" | h2 (visually) |

- [owned] **high** `<span class="text-h2">Something went wrong</span>` — visual heading, not semantic. Should be `<h3>` (under the dialog's `<h2>`). **quick-win**

---

### Screen: ErrorBoundary (crash fallback)

**Context:** Replaces entire widget content. Renders outside any dialog.

Semantic headings: _(none)_

Visual headings (all `<span>`):
| Element | Class | Content | Expected level |
|---|---|---|---|
| `<span>` | `text-body-bold` | "Something went wrong" | — |

- [owned] **low** `<span class="text-body-bold">Something went wrong</span>` — styled as bold body text, not a visual heading. In this minimal crash fallback, adding a semantic heading is nice-to-have but low priority since users rarely see this screen.

---

### Screen: ModemInfoSheet (BottomSheet + ModemInfoSheet)

**Context:** Inside BottomSheet modal dialog (accent2 gradient). Not in the main modem-search flow but reachable from BaseScreen "Learn more".

Semantic headings:
| Element | Level | Content | Source |
|---|---|---|---|
| `Dialog.Title` | h2 | "Belong modem information" | BottomSheet (sr-only) |

Visual headings (all `<span>`):
| Element | Class | Content | Expected level |
|---|---|---|---|
| `<span>` | `text-h2` | "Belong Wi-Fi 6 Modem" | h2 (visually) |
| `<span>` | `text-h4-button-500` | "The speed your home needs" | h4 (visually) |
| `<span>` | `text-h4-button-500` | "Connect the whole house" | h4 (visually) |
| `<span>` | `text-h4-button-500` | "Support and warranty" | h4 (visually) |
| `<span>` | `text-h4-button-500` | "Safe and secure" | h4 (visually) |

- [owned] **high** `<span class="text-h2">Belong Wi-Fi 6 Modem</span>` — visual heading, not semantic. Should be `<h3>`. **quick-win**
- [subframe] **medium** FeatureItem titles (`text-h4-button-500`) — visual subheadings, not semantic. If the parent heading were `<h3>`, these should be `<h4>`. Would also require a skipped-level fix if made `<h4>` without an intervening `<h3>` — but since the parent is `<h3>`, going to `<h4>` skips nothing. **quick-win** (4 instances, one component change)

---

### Summary

| Severity | Count | Description |
|---|---|---|
| **high** | 9 | Visual headings using `<span>` instead of semantic heading elements across all main screens |
| **medium** | 5 | Subframe component visual headings not semantic (OrderCard, CheckerCard, FeatureItem, Belong Modem box) |
| **low** | 2 | ErrorBoundary fallback heading, Dialog.Title redundancy |

**Quick wins (12):** All high-severity items and most medium items can be fixed by changing `<span>` to the appropriate heading element (`<h2>`, `<h3>`, or `<h4>`) while keeping the same CSS classes. No structural refactoring needed.

**Recommended heading structure:**

For **BaseScreen** (page context):
```
<h2> "Modem selection"
  <h3> "Belong Modem" (info box)
  <h3> "Modem compatibility" (BYO section, when visible)
    <h4> "Compatibility results" (CheckerCard, when modem verified)
<h2> "Order summary" (OrderCard)
```

For **BottomSheet screens** (modal context, Dialog.Title is the `<h2>`):
```
<h2 sr-only> "Modem search" (Dialog.Title — already exists)
  <h3> Screen heading ("Search for your modem" / "Select your modem" / etc.)
```

---

## Tab Order

WCAG 2.4.3 (A): Logical tab sequence per screen, no unreachable or out-of-order elements.

### Method

Traced every focusable element (native `<button>`, `<input>`, `<a>`, elements with `tabIndex`, Radix primitives) in DOM source order for each screen. Compared DOM order to visual layout order (top-to-bottom, left-to-right). Searched codebase for any `tabIndex` values > 0 (none found). Verified hidden elements (`className="hidden"` / `display: none`) are excluded from tab order.

**General notes:**
- All BottomSheet screens are wrapped in a Radix `Dialog.Content` which provides focus trapping — Tab cycles within the dialog when open. This is correct behavior.
- Radix RadioGroup items use arrow keys (not Tab) to navigate between options — Tab moves into/out of the group as a single stop. This is correct.
- No `tabIndex` values > 0 found anywhere in the codebase.
- The only explicit `tabIndex={0}` is on CardButton `<div>` elements in MultipleMatches, which is necessary since `<div>` is not natively focusable.

### Findings

#### Screen 1: BaseScreen (landing — idle, no BYO selection)

Tab sequence: LinkButton "Learn more" → RadioCard "Yes, I want a Belong modem" (arrow keys between options) → OrderCard div → Button "Back" → Button "Start checkout"

- `subframe-disabled` `high` **OrderCard is an interactive `<div>` with `onClick` but no `role`, `tabIndex`, or `onKeyDown`**. It receives `onClick={onOpenDevMenu}` via spread props onto a plain `<div>`. Keyboard users cannot reach or activate it. (Note: currently this opens the dev menu — even in production this card pattern would need to be keyboard-accessible if it has a click handler.) `quick-win`
- No other issues. RadioCardGroup correctly receives focus as a single tab stop with arrow-key navigation between items.

#### Screen 2: BaseScreen (landing — BYO selected, no verified modem)

Tab sequence: LinkButton "Learn more" → RadioCard group (arrow keys) → Button "Check your modem" → LinkButton "Modem compatibility FAQs" → OrderCard div → Button "Back" → Button "Start checkout"

- `subframe-disabled` `high` **OrderCard keyboard inaccessibility** — same issue as Screen 1. `quick-win`
- Tab order matches visual layout. BYO section animates in below the radio group and its interactive elements appear in correct DOM/visual order.

#### Screen 3: BaseScreen (landing — BYO selected, with verified modem)

Tab sequence: LinkButton "Learn more" → RadioCard group (arrow keys) → [CheckerCard internals: inline "Add a Belong modem" button (only if not-compatible) → LinkButton "Learn more in our FAQs" (only if not-compatible) → Button "Check another modem"] → LinkButton "Modem compatibility FAQs" → OrderCard div → Button "Back" → Button "Start checkout"

- `subframe-disabled` `high` **OrderCard keyboard inaccessibility** — same issue as Screens 1-2. `quick-win`
- `subframe-disabled` `medium` **CheckerCard has a hidden LinkButton** (`className="hidden"`, line 342). This uses `display: none` which correctly excludes it from the tab order. No issue.
- CheckerCard.ResultsCard inline "Add a Belong modem" `<button>` inside the StatusItem description (line 197-206) is a native `<button>` — correctly focusable and keyboard-accessible.

#### Screen 4: Search step (BottomSheet + SearchInput)

Tab sequence: IconButton "Close" (X) → TextField.Input (text input) → LinkButton "Help me find the model name" → Button "Continue"

- `owned` `high` **Close button appears before the heading text but visually sits to the right of it**. The DOM order is: heading `<span>` (not focusable), then IconButton Close. Since the heading is not focusable, the Close button is the first tab stop. Visually, the heading is left and Close is right — but since there are no focusable elements before Close, the tab order is acceptable. The text input follows naturally below. No issue.
- Tab order matches visual top-to-bottom flow: close → input → help link → submit. This is logical.
- Radix Dialog focus trap keeps Tab cycling within the sheet. Correct.

#### Screen 5: LoadingState (BottomSheet + LoadingState)

Tab sequence: (no interactive elements inside LoadingState)

- No focusable elements within the loading content. The Radix Dialog container itself is focusable (it receives initial focus). This is acceptable — there is nothing for the user to interact with during loading.
- No issues.

#### Screen 6: MultipleMatches (BottomSheet + MultipleMatches)

Tab sequence: IconButton "Back" → IconButton "Close" (X) → CardButton modem 1 → CardButton modem 2 → ... → CardButton modem N → LinkButton "Help me identify my modem"

- `owned` `medium` **Back button (left) and Close button (right) are in correct visual L-to-R DOM order** — Back is first in DOM and visually left, Close is second and visually right. Correct.
- `subframe` `medium` **CardButton is a `<div>` with `role="button"` and `tabIndex={0}`** — this is the correct pattern for a non-native interactive element. The `onKeyDown` handler supports Enter and Space. Focus ring styling is applied via `focus-visible:ring-2`. No issue.
- Tab order matches visual layout: header buttons → scrollable card list (top to bottom) → help link at bottom.
- No issues found.

#### Screen 7: ResultCard (BottomSheet + ResultCard)

Tab sequence: [CheckerCard.ResultsCard internals: inline "Add a Belong modem" button (only if not-compatible) → LinkButton "Learn more in our FAQs" (only if not-compatible)] → LinkButton "Check another modem" → Button "Close"

- Tab order matches visual layout. The results card content appears above the action buttons. The "Check another modem" link is visually left, "Close" button is visually right — DOM order matches.
- No issues found.

#### Screen 8: NoMatch (BottomSheet + NoMatch)

Tab sequence: LinkButton "Read the modem compatibility FAQs." → Button "Try a new search"

- Tab order matches visual layout: FAQ link above, action button below.
- No issues found.

#### Screen 9: SearchError (BottomSheet + SearchError)

Tab sequence: Button "Try again" → Button "Start a new search"

- Tab order matches visual layout: primary action on top, secondary below.
- No issues found.

#### Screen 10: ErrorBoundary

Tab sequence: button "Reload"

- Single native `<button>` element. Correctly focusable and keyboard-accessible.
- No issues found.

### Summary Table

| # | Screen | Issues | Severity |
|---|--------|--------|----------|
| 1 | BaseScreen (landing) | OrderCard not keyboard-accessible | high |
| 2 | BaseScreen (BYO, no modem) | OrderCard not keyboard-accessible | high |
| 3 | BaseScreen (BYO, verified modem) | OrderCard not keyboard-accessible | high |
| 4 | Search step | None | — |
| 5 | LoadingState | None | — |
| 6 | MultipleMatches | None | — |
| 7 | ResultCard | None | — |
| 8 | NoMatch | None | — |
| 9 | SearchError | None | — |
| 10 | ErrorBoundary | None | — |

**Total issues: 1 unique issue (OrderCard keyboard inaccessibility) affecting 3 screens.**

The fix is to add `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler (Enter/Space) to the OrderCard root `<div>` in `BaseScreen.tsx`, or wrap it in a `<button>`. Tagged `quick-win` since the change is localized to the OrderCard usage in BaseScreen.

---

## Landmarks

WCAG 1.3.1 (A): Appropriate use of semantic landmark elements.

**Context:** This is an embeddable widget, not a standalone page. The host page provides its own `<main>`, `<header>`, `<footer>`, etc. Landmark expectations are therefore lighter — we check for reasonable semantic structure within the widget boundary, not a full page scaffold. The key question is whether screen reader users can orient themselves within the widget using landmark navigation.

### Method

Searched all owned components (`src/components/`) and Subframe UI components (`src/ui/components/`) for HTML5 landmark elements (`<main>`, `<section>`, `<header>`, `<footer>`, `<nav>`, `<aside>`, `<article>`) and ARIA landmark roles (`role="main"`, `role="banner"`, `role="navigation"`, `role="contentinfo"`, `role="complementary"`, `role="region"`, `role="search"`). Also checked `<form>` elements for accessible names (a `<form>` is only a landmark if it has an accessible name via `aria-label` or `aria-labelledby`).

**What was found:** Zero landmark elements or landmark roles in any owned page component. The only landmark-adjacent elements in the codebase are:
- `<nav>` in `SidebarWithSections.tsx` and `SidebarRailWithIcons.tsx` — Subframe library components not used by any screen.
- `role="status"` on `LoadingState` — this is a live region role, not a landmark. Correct usage.
- `role="dialog"` on BottomSheet's `Dialog.Content` (via Radix) — dialog is not a landmark role per se, but it creates a modal context that screen readers announce. This is correct and appropriate.

### Findings

#### Root: App + ModemChecker

`App.tsx` renders `<ErrorBoundary><ModemChecker /></ErrorBoundary>`. `ModemChecker.tsx` renders a fragment (`<>...</>`) wrapping `BaseScreen`, `DevMenu`, and two `BottomSheet` instances. There is no wrapping landmark element (`<main>`, `<section>`, etc.) around the widget.

- [owned] **medium** **No widget-level landmark.** The entire widget renders without any landmark region. A screen reader user navigating by landmarks would skip over the widget entirely. Wrapping the widget root in a `<section>` or `<div role="region">` with an `aria-label` (e.g., "Modem selection") would make the widget discoverable via landmark navigation. **quick-win** — add to `ModemChecker.tsx` or `App.tsx`.

#### Screen 1: BaseScreen (landing)

`BaseScreen` renders a plain `<div>` container. Within it:
- The "Modem selection" heading + intro text has no enclosing landmark.
- The Belong Modem info box (`bg-color-accent2-100`) is a plain `<div>`.
- The `RadioCardGroup` is a Radix RadioGroup (no landmark role).
- The BYO "Modem compatibility" section (conditionally rendered) is a `<motion.div>`.
- The footer buttons ("Back" / "Continue") sit in a plain `<div>`.
- `OrderCard` is a plain `<div>`.

No `<section>`, `<header>`, `<footer>`, or `<nav>` elements are used.

- [owned] **low** **No `<section>` or region for the BYO compatibility area.** The BYO section is a distinct functional region that appears/disappears based on user selection. Wrapping it in a `<section aria-label="Modem compatibility">` would help screen reader users understand the page structure, but since the content is short and linear, this is a nice-to-have. **quick-win**
- [owned] **low** **Footer buttons have no `<footer>` or landmark.** The "Back" and "Continue" buttons at the bottom of BaseScreen could be wrapped in a `<footer>` or given `role="contentinfo"`, but since this is a widget (not a page), and there are only two buttons in a linear flow, this is low priority.

#### Screen 2: BaseScreen (results — BYO selected, verified modem)

Same structure as Screen 1 with the addition of `CheckerCard` (Subframe component) in the BYO section. No additional landmarks.

- Same issues as Screen 1 apply.

#### Screen 3: Search step (BottomSheet + SearchInput)

`BottomSheet` renders a Radix `Dialog.Content` (provides `role="dialog"` and `aria-modal="true"`). Inside, `SearchInput` renders a `<form>` element.

- [owned] **low** **`<form>` lacks accessible name — not a search landmark.** The `<form>` in `SearchInput` has no `aria-label` or `aria-labelledby`. Per ARIA spec, a `<form>` without an accessible name is not exposed as a landmark. Adding `aria-label="Search for your modem"` or `role="search"` would make it a landmark, improving discoverability within the dialog. **quick-win**

Note: The dialog itself provides good structural context via `Dialog.Title` ("Modem search") and `aria-modal="true"`. The form is the only content in the dialog, so the lack of a form/search landmark is minor.

#### Screen 4: LoadingState (BottomSheet + LoadingState)

Inside the dialog, `LoadingState` renders a `<div role="status">`. This is a live region, not a landmark, and is correctly used to announce the loading state to screen readers.

- No landmark issues. The dialog provides sufficient structural context.

#### Screen 5: MultipleMatches (BottomSheet + MultipleMatches)

Inside the dialog, `MultipleMatches` renders a flat `<div>` structure with header, scrollable card list, and help link. No landmarks used.

- [owned] **low** **Card list could be a `<ul>` with list semantics** rather than landmark — but this is a heading hierarchy / list semantics issue, not a landmark issue. No landmark findings for this screen.
- The dialog provides sufficient structural context.

#### Screen 6: ResultCard (BottomSheet + ResultCard)

Inside the dialog, `ResultCard` renders a `<div>` with heading, `CheckerCard.ResultsCard`, disclaimer text, and action buttons. No landmarks.

- No landmark issues. The dialog provides sufficient structural context.

#### Screen 7: NoMatch (BottomSheet + NoMatch)

Inside the dialog, `NoMatch` renders a `<div>` with heading, description text, FAQ link, and retry button. No landmarks.

- No landmark issues. Content is short and linear within the dialog.

#### Screen 8: SearchError (BottomSheet + SearchError)

Inside the dialog, `SearchError` renders a `<div>` with heading, description, and two action buttons. No landmarks.

- No landmark issues. Content is short and linear within the dialog.

#### Screen 9: ErrorBoundary (crash fallback)

When triggered, `ErrorBoundary` renders a `<div>` with error message and reload button. No landmarks. This replaces the entire widget content.

- [owned] **low** **Crash fallback has no landmark wrapper.** If the widget root gets a landmark (per the medium-severity item above), the ErrorBoundary fallback would render inside it, inheriting that context. No separate action needed for ErrorBoundary specifically.

#### Screen 10: ModemInfoSheet (BottomSheet + ModemInfoSheet)

Inside a separate `BottomSheet` dialog (accent2 gradient), `ModemInfoSheet` renders a `<div>` with image, title, feature list (`FeatureItem` components), and footer buttons. No landmarks.

- No landmark issues. The dialog provides sufficient structural context via `Dialog.Title` ("Belong modem information").

### Summary

| Severity | Count | Screen(s) | Description |
|---|---|---|---|
| **medium** | 1 | App / ModemChecker (all screens) | No widget-level landmark — screen reader landmark navigation skips the entire widget |
| **low** | 1 | SearchInput (search step) | `<form>` has no accessible name, so it is not exposed as a search/form landmark |
| **low** | 1 | BaseScreen | BYO compatibility section has no `<section>` landmark |
| **low** | 1 | BaseScreen | Footer buttons have no `<footer>` landmark |
| **low** | 1 | ErrorBoundary | No landmark in crash fallback (resolved if widget root gets a landmark) |

**Total: 5 items (1 medium, 4 low)**

**Quick wins (3):**
1. **Widget-level landmark** — Wrap `ModemChecker` return in `<section aria-label="Modem selection">` (or `<div role="region" aria-label="Modem selection">`). One-line change in `ModemChecker.tsx`. Fixes the medium-severity item and implicitly covers ErrorBoundary's fallback if moved to wrap inside `App.tsx`.
2. **Search form landmark** — Add `aria-label="Search for your modem"` to the `<form>` in `SearchInput.tsx`. One attribute addition.
3. **BYO section landmark** — Change the BYO `<motion.div>` wrapper to `<motion.section aria-label="Modem compatibility">` in `BaseScreen.tsx`. One element change.

**Assessment:** The landmark situation is reasonable for an embedded widget. The BottomSheet dialog screens benefit from Radix's `role="dialog"` and `aria-modal`, which provide clear structural context to screen readers. The main gap is the lack of a top-level landmark to make the widget itself discoverable via landmark navigation — a single wrapping `<section>` would resolve this. The remaining items are low-severity improvements that would enhance navigation within the widget but are not critical given the widget's compact, linear layout.

---

## Summary

### Findings by category

| Category | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| Color Contrast | — | 6 | — | — | 6 |
| Touch Targets | 3 | 6 | — | — | 9 (+11 inherited) |
| Focus Rings | — | 7 | 2 | — | 9 |
| Accessible Names | — | 2 | 5 | — | 7 |
| Roles & Semantics | 2 | 3 | 1 | 1 | 7 |
| Heading Hierarchy | — | 9 | 5 | 2 | 16 |
| Tab Order | — | 1 | — | — | 1 |
| Landmarks | — | — | 1 | 4 | 5 |
| **Total** | **5** | **34** | **14** | **7** | **60** |

Note: Some components appear in multiple categories (e.g. OrderCard has findings in touch targets, focus rings, accessible names, roles & semantics, tab order, and heading hierarchy). The counts above are per-category, not deduplicated. The 11 "inherited" touch target findings are page components that use undersized Subframe primitives — fixing the root component fixes all inherited instances.

### Findings by ownership

| Ownership | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| **Owned** | — | 15 | 6 | 5 | 26 |
| **Subframe (sync-disabled)** | 1 | 9 | 5 | — | 15 |
| **Subframe (synced)** | 4 | 10 | 3 | 2 | 19 |
| **Total** | **5** | **34** | **14** | **7** | **60** |

### Quick wins

~30 items tagged as `quick-win` across all categories. Most are single CSS class additions, attribute additions, or HTML element swaps. See per-section quick-win summary tables for details.

### Top priorities

1. **Heading hierarchy (all screens)** — Zero semantic headings in the entire widget. Every heading is a `<span>` with visual styling. Screen readers cannot navigate by heading. Fix: change `<span>` to `<h2>`/`<h3>`/`<h4>` — all 12 quick-wins. **Highest impact, lowest effort.**

2. **Focus rings (7 components)** — Button, IconButton, LinkButton, CardButton, SettingsMenu.Item, CheckerCard inline button, and ErrorBoundary all lack explicit focus ring styles. Most rely on browser defaults; `<div>`-based buttons get none. Fix: add `focus-visible:ring-2 ring-brand-600 ring-offset-2` to match the established RadioCard pattern. All quick-wins.

3. **Touch targets — LinkButton (5+ screens)** — No `min-height` at all. Medium variant is ~20px tall, small is ~17px (both below 24px minimum). Used in SearchInput, MultipleMatches, ResultCard, NoMatch, BaseScreen. Fix: add `min-h-11` to LinkButton root. One change, fixes all instances.

4. **Touch targets — IconButton (3 variants)** — All three size variants (24px, 32px, 40px) are below the 44px target. Used for close/back buttons in SearchInput, MultipleMatches, ModemInfoSheet. Fix: add `min-h-11 min-w-11` to IconButton root.

5. **CardButton semantics** — Root `<div>` has no `role`, `tabIndex`, or keyboard handler. Consumers (MultipleMatches) compensate manually, but the component is broken by default. Fix: change root to `<button>` or add role+tabIndex+onKeyDown.

6. **OrderCard keyboard accessibility** — Interactive `<div>` with `onClick` but no `role`, `tabIndex`, or keyboard handler. Appears in BaseScreen on all 3 states. Completely invisible to assistive technology. Fix: add `role="button"` + `tabIndex={0}` + `onKeyDown` at BaseScreen call site.

7. **Color contrast — ErrorBoundary** — Reload button white text on `brand-600` is 3.7:1 (needs 4.5:1). Quick-win: swap to `brand-800`.

### Systemic patterns

- **Subframe generates `<span>` for all headings** — this is a design system issue. Every heading in the widget comes from Subframe-synced or Subframe-patterned components using `<span class="text-h*">`. A fix in Subframe (or a convention to use heading elements) would prevent this from recurring.

- **Subframe interactive components lack focus ring styles** — Button, IconButton, and LinkButton all rely on browser defaults. Adding a standard focus ring to the Subframe base components would fix ~7 findings at once.

- **LinkButton has no height constraint** — the most widespread touch target issue. One `min-h-11` addition to LinkButton fixes ~10 downstream findings.
