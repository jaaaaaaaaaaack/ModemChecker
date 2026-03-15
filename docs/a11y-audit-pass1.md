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

### Findings

_Pending audit_

---

## Accessible Names

WCAG 4.1.2 (A): All interactive elements must have an accessible name.

### Findings

_Pending audit_

---

## Roles & Semantics

WCAG 1.3.1 (A), 4.1.2 (A): Correct use of native elements, ARIA roles, labels, alt text, landmarks.

### Findings

_Pending audit_

---

## Heading Hierarchy

WCAG 1.3.1 (A): No skipped heading levels in assembled DOM per screen.

### Findings

_Pending audit_

---

## Tab Order

WCAG 2.4.3 (A): Logical tab sequence per screen, no unreachable or out-of-order elements.

### Findings

_Pending audit_

---

## Landmarks

WCAG 1.3.1 (A): Appropriate use of semantic landmark elements.

### Findings

_Pending audit_

---

## Summary

_Pending audit completion_
