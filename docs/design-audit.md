# Design System Audit

> Conducted 2026-03-28. Scope: all files in `src/ui/` and `src/components/`.

---

## 1. Component Inventory

### Subframe UI primitives (`src/ui/components/`) — 68 files

| Status | Count | Components |
|--------|-------|------------|
| **Used & unmodified** | 20 | Accordion, Alert, Avatar, Badge, CardButton, Dialog, Drawer, DropdownMenu, FeatureItem, IconButton, IconWithBackground, LinkButton, ModemIdentityCard, NavBreadcrumb, ProductCard, SidebarRailWithIcons, StatusItem, TextField, Tooltip |
| **Used & sync-disabled** | 9 | Button, CheckerCard, DeviceConnectionCard, HeaderWithNavigation, OrderCard, PortTypeBadge, RadioCardGroup, StepCard, SubstepCardContainer |
| **Unused (dead code)** | 39 | Accordion*, AreaChart, BarChart, Breadcrumbs, Calendar, Checkbox, CheckboxCard, CheckboxGroup, CodeWindow, ConfidenceTable, ContextMenu, CopyToClipboardButton, FullscreenDialog, InfoMessage, ItemCard, LineChart, Loader, ModernNavbar, ModernNavbarMobile, PieChart, Progress, RadioGroup, Select, ServiceCard, SettingsMenu, SidebarWithSections, SkeletonCircle, SkeletonText, Slider, StatsCard, StepHeader, Stepper, Switch, Table, Tabs, TextArea, Toast, ToggleGroup, TreeView, VerticalStepper |

57% of the UI directory is unused weight. These were auto-synced from Subframe but never consumed.

### Behavioural components (`src/components/`) — 27 files

| Category | Components |
|----------|------------|
| **Page orchestrators** | ModemChecker, SetupGuide, SetupGuideContent, SetupGuideInline, SetupLanding, SupportArticlePage |
| **Sheet screens** | SearchInput, LoadingState, MultipleMatches, ResultCard, SetupResultCard, NoMatch, SearchError, ModemInfoSheet, SetupGuideNotAvailable |
| **Structural** | Navbar, BottomSheet, BaseScreen, Login, ErrorBoundary |
| **Small composites** | DisclaimerCallout, InfoCallout, ConditionList, ModemImage, ModemSearchFlow |
| **Dev-only** | DevMenu, SetupDevMenu |

### Layout components (`src/ui/layouts/`) — 3 files

DefaultPageLayout, DialogLayout, DrawerLayout — all unused by the app.

---

## 2. Recurring Override Patterns

These are patterns where behavioural components consistently override UI component defaults. Each represents a variant or token that the design system should own instead.

### 2a. ~~Pill buttons~~ — RESOLVED (redundant overrides)

**Was:** `className="rounded-full"` on 6 call sites.

**Finding:** Button's base class already includes `rounded-full`. All overrides were no-ops. Removed in batch 3.

### 2b. Back buttons — `className="border-brand-200"` on `<IconButton variant="white">`

**3 call sites:** MultipleMatches, SetupResultCard, BaseScreen

The `white` variant IconButton needs a visible border in the branded context (sheet gradient backgrounds). The base `white` variant has neutral borders that vanish against the gradient.

**Recommendation:** Add a `brand-outline` or `ghost-brand` variant to IconButton. The pattern is: white fill, brand-200 border, FeatherChevronLeft with `-ml-0.5` optical nudge.

### 2c. Chevron optical nudge — `className="-ml-0.5"` on chevron icons

**3 call sites:** Same three back-button locations above.

FeatherChevronLeft needs -ml-0.5 to look optically centred within the IconButton. This is a permanent visual correction.

**Recommendation:** Bake the nudge into the back-button variant, or create a `BackButton` composite component.

### 2d. Footer action bar — `mt-auto md:mt-10 pt-2`

**5 call sites:** SearchInput, ResultCard, SetupResultCard, NoMatch, SearchError

Every sheet screen pins its footer buttons to the bottom on mobile (`mt-auto`) and adds a fixed gap on desktop (`md:mt-10`). This is structural, not decorative.

**Recommendation:** Extract a `SheetFooter` layout component that handles bottom-pinning and responsive spacing. This removes 5 identical className strings.

### 2e. Custom scrollbar styling — inline `style={{ scrollbarColor, scrollbarWidth }}`

**2 call sites:** ModemInfoSheet, MultipleMatches

Identical branded scrollbar treatment: `rgba(0, 150, 170, 0.3)` thumb on transparent track, `thin` width.

**Recommendation:** Extract to a CSS utility class (`scrollbar-brand`) in `gradients.css` or a new `utilities.css`. The mask-fade in ModemInfoSheet could become a separate `ScrollFade` wrapper.

### 2f. Brand callout boxes — hardcoded `border-brand-200 bg-brand-50` containers

**3 call sites:** SetupLanding (modem CTA), SetupGuideContent (×2, Wi-Fi credential blocks)

All use the same pattern: `rounded-md border border-solid border-brand-200 bg-brand-50 px-4 py-4`. This is a content callout distinct from Alert and InfoCallout.

**Recommendation:** This is close to `InfoCallout variant="bordered"` but uses brand-50 background instead of transparent, and doesn't include the info icon. Either extend InfoCallout with a `filled` variant, or recognise this as a `BrandCallout` component.

### 2g. Button size overrides — `className="h-12"` / `className="h-auto"`

**3 call sites:** BaseScreen (×2), SearchInput (TextField)

The Button `medium` size doesn't match the desired touch target (48px). `h-12` forces it.

**Recommendation:** Review whether Button's `large` size maps to h-12 already. If not, add an `xlarge` size or adjust `large` to be 48px (3rem). The `h-auto` on TextField is to prevent the component's default height from conflicting with flex layout — this is a Subframe bug workaround worth documenting.

---

## 3. Hardcoded Colours (Outside Theme Tokens)

| Colour | Where | What it's for |
|--------|-------|---------------|
| `#ecfdf5` | SetupLanding (×2) | "Active" badge green background |
| `#00b862` | SetupLanding | "Active" badge green text |
| `#114e5f` | Login | Form container dark teal |
| `#94d6ff`, `#d1f0ff` | PortTypeBadge | Ethernet port badge (blue) |
| `#ffd6de` | PortTypeBadge | Phone port badge (red) |
| `#ffffff29`, `#ffffff3d` | Button, IconButton | Inverse variant hover/active (semi-transparent white) |
| `#00000099` | Dialog | Overlay backdrop |
| `#00000066` | Drawer | Overlay backdrop |
| `rgba(0, 0, 0, ${overlayOpacity})` | BottomSheet | Dynamic overlay |
| `rgba(0, 150, 170, 0.3)` | ModemInfoSheet, MultipleMatches | Scrollbar thumb colour |
| `rgba(210, 250, 255, 0.92)` | MultipleMatches | Scroll scrim gradient |

**Recommendation:**
- **SetupLanding badges:** `#ecfdf5` / `#00b862` are Belong's "active" green. Add `success-50` and `success-600` semantic tokens (or use existing `color-secondary-400` consistently — the dot already uses it but the text doesn't).
- **Login `#114e5f`:** This is a darkened brand colour for the login form. Define as `brand-850` or use `color-primary-800` (already in theme).
- **PortTypeBadge:** The blue/red badge colours don't map to any theme scale. These are domain-specific and may be fine as-is since the component is sync-disabled anyway. If PortTypeBadge ever needs to re-sync, these would need to become tokens.
- **Overlay alphas:** `#00000099` (Dialog), `#00000066` (Drawer), dynamic (BottomSheet) — three different overlay opacities for the same concept. Standardise to one or two: `overlay-heavy` (60%) for sheets/dialogs, `overlay-light` (40%) for drawers.
- **Scrollbar/scrim:** Move to CSS utilities so the RGBA values aren't scattered across components.

---

## 4. Inline Style Objects

| File | What | Why it's inline |
|------|------|-----------------|
| BottomSheet:55 | `backgroundColor: rgba(0,0,0,${overlayOpacity})` | Dynamic prop — can't be a static Tailwind class |
| ModemInfoSheet:54-59 | `scrollbarColor`, `scrollbarWidth`, `maskImage` | No Tailwind equivalents for scrollbar-color or mask-image with dynamic values |
| MultipleMatches:43-45 | `scrollbarColor`, `scrollbarWidth` | Same as above (duplicate) |
| MultipleMatches:88-91 | `background: linear-gradient(...)` | Dynamic scroll scrim — could be CSS utility |
| StepCard:229 | `textWrap: "balance"` | Tailwind v4 has `text-balance` — could migrate |
| StepCard:256, 289 | `overflow: "hidden", width: "100%"` | Framer Motion animation containers — Tailwind equivalent exists (`overflow-hidden w-full`) |
| SetupGuideContent:131 | `overflow: "hidden", width: "100%"` | Same pattern |
| SetupGuideContent:610 | `animationDuration: "0.6s"` | CSS spinner speed override |
| LoadingState:9 | `animationDuration: "0.7s"` | CSS spinner speed override |

**Recommendation:**
- **StepCard `textWrap`:** Replace with Tailwind `text-balance` class.
- **StepCard/SetupGuideContent `overflow`:** Replace with `className="overflow-hidden w-full"` on the motion.div. Inline style adds no value here.
- **Spinner durations:** Define CSS custom properties `--spinner-duration-fast: 0.6s` and `--spinner-duration: 0.7s`, or a Tailwind utility `animate-spin-fast`.
- **Scrollbar styles:** Extract to CSS utility (see 2e above).
- **BottomSheet overlay:** Inline style is justified — dynamic prop value.
- **Mask-image:** Inline style is justified — dynamic gradient based on scroll position.

---

## 5. Hand-Built Components (No Subframe Equivalent)

These components were built from scratch rather than exported from Subframe:

| Component | Why it's hand-built | Risk |
|-----------|-------------------|------|
| **Navbar** | Custom navigation with Belong branding, popover menu, iOS safe-area handling | High — no design system ownership. Button styles use raw Tailwind (`text-body-bold font-body-bold`), popover uses inline conditional classes. |
| **BottomSheet** | Radix Dialog + Framer Motion + responsive mobile/desktop modes | Acceptable — complex animation logic doesn't fit Subframe's static export model. |
| **InfoCallout** | Simple branded callout with icon | Should be a Subframe component — it's pure visual UI. |
| **ModemImage** | Image with skeleton placeholder, fade-in, error handling | Acceptable — behavioural component with state machine. |
| **LoadingState** | CSS border-spinner + message | Could be a Subframe component, but very simple. |
| **Login** | Form with Subframe components but page layout is hand-coded | The `bg-[#114e5f]` form container is the only issue. |

**Recommendation:**
- **Navbar:** Design in Subframe (or create a definitive spec) and extract. Currently the only place with raw `<button>` elements and manually-assembled styling.
- **InfoCallout:** Promote to Subframe. It's used in 3 places and wraps a clear design pattern (icon + text in a bordered or borderless container). The `variant="bordered"` version is the brand callout discussed in 2f — they should merge.
- **LoadingState:** Consider whether the Subframe `Loader` component (currently unused) serves this purpose. If not, at minimum the spinner should be a shared primitive since two different spinners exist (LoadingState's 0.7s, SetupGuideContent's 0.6s).

---

## 6. Sync-Disabled Components — Modification Summary

These 9 components can never re-sync from Subframe without manual merge work. Here's what was changed and why:

| Component | Changes | Justifiable? |
|-----------|---------|-------------|
| **Button** | 14+ colour variants added | Yes — but the variant explosion (40+ combos) suggests the design system needs a principled colour system. Many variants may be unused. |
| **RadioCardGroup** | Removed explicit `checked` prop (Radix bug fix) | Yes — Subframe's generated code had a bug. |
| **StepCard** | Added Framer Motion animated expand/collapse, conditional blocks, text-balance | Yes — complex interactive behaviour. The animation logic doesn't belong in Subframe. |
| **SubstepCardContainer** | Added variant-conditional visibility, modem credential display, app download buttons | Partially — the variants could be Subframe-managed, but credential display logic is behavioural. |
| **CheckerCard** | Added Framer Motion stagger animations, conditional rendering | Yes — same rationale as StepCard. |
| **DeviceConnectionCard** | Added `min-w-[240px]` | Questionable — this is a single layout constraint. Could be applied via className at the call site. |
| **HeaderWithNavigation** | Variant-specific styling | Partially — variant definitions could live in Subframe. |
| **OrderCard** | Mobile-specific border overrides | Questionable — responsive overrides could be applied at the call site. |
| **PortTypeBadge** | Hardcoded hex colours for port types | Yes — domain-specific colours that Subframe's theme doesn't cover. |

**Recommendation:**
- **DeviceConnectionCard** and **OrderCard** could potentially be re-synced if their overrides are moved to call-site classNames.
- **Button** needs a variant audit (section 7 below).
- The remaining 6 have legitimate reasons to stay sync-disabled.

---

## 7. Button Variant Audit

The Button component has 14 named colour variants. Based on actual usage across the codebase:

| Variant | Used? | Where |
|---------|-------|-------|
| `brand-primary` | Yes | ResultCard, SetupResultCard, SearchInput, BaseScreen, SetupGuideNotAvailable |
| `brand-secondary` | Yes | NoMatch, SearchError |
| `brand-tertiary` | Yes | BaseScreen ("Check your modem") |
| `cyan-tertiary` | Yes | SetupLanding (×2), SetupGuideContent |
| `neutral-primary` | Yes | ModemInfoSheet (close button on IconButton) |
| `neutral-secondary` | ? | Not found in components |
| `neutral-tertiary` | ? | Not found in components |
| `destructive-primary` | No | |
| `destructive-secondary` | No | |
| `destructive-tertiary` | No | |
| `green-tertiary` | ? | Not confirmed |
| `purple-tertiary` | ? | Not confirmed |
| `pink-tertiary` | ? | Not confirmed |
| `inverse` | Yes | Button + IconButton (Login context) |
| `option-1` | Yes | IconButton only (Login arrow) |
| `secondary-inverse` | ? | Not confirmed |
| `white` | Yes | IconButton only (back buttons, close buttons) |

At least 5-6 variants appear to be unused. The destructive set is likely speculative (no delete actions exist in the app). Several tertiary colour variants may have been added for future flexibility but aren't consumed.

**Recommendation:** Audit which variants are actually rendered. Remove unused variants to simplify maintenance. The sync-disabled Button is the highest-maintenance component in the system.

---

## 8. Dead Code Candidates

### 39 unused UI components

Full list in section 1. These add ~80KB of source to the build tree. Vite's tree-shaking may eliminate them from the production bundle, but they still:
- Clutter the editor's file tree
- Create false positives in codebase searches
- Will break on future Subframe syncs (requiring resolution of conflicts in files nobody uses)

**Recommendation:** Delete all 39 unused components. If any are needed later, re-sync from Subframe at that time.

### 3 unused layout components

`DefaultPageLayout`, `DialogLayout`, `DrawerLayout` in `src/ui/layouts/`. None are imported anywhere.

**Recommendation:** Delete.

### Unused `SidebarRailWithIcons`

Used only in `DefaultPageLayout` (which is itself unused). Transitive dead code.

**Recommendation:** Delete with the layouts.

---

## 9. Recommendations Summary

### Quick wins — DONE

| # | Action | Commit |
|---|--------|--------|
| 1 | Delete 41 unused UI components + 3 layouts | `22e4dc1` |
| 2 | Replace inline styles with Tailwind equivalents (text-balance, overflow, scrollbar, spinners) | `861d8ac` |
| 3 | Remove 8 redundant `rounded-full` overrides (Button/IconButton already pill-shaped) | `905c482` |
| 4 | Extract `SheetFooter` component for bottom-pinned action bars | `f1b0a5b` |
| 5 | Add `brand-outline` variant to IconButton for back buttons | `2914714` |
| 6 | Replace hardcoded hex colours in SetupLanding with theme tokens | `e8ac19e` |
| 7 | Standardise overlay opacities with `bg-overlay` / `bg-overlay-heavy` utilities | `fa36cfb` |
| 8 | Prune 19 unused Button colour variants (280 → 140 lines) | `b7ce2b8` |
| 9 | Replace Login hardcoded hex with theme token | `720d982` |

### Remaining recommendations

| # | Action | Impact | Notes |
|---|--------|--------|-------|
| 10 | InfoCallout `filled` variant | Would consolidate brand-50/brand-200 callout containers | Skipped — containers have varied children (headings, buttons, credentials) that don't fit InfoCallout's icon+text pattern |
| 11 | Design Navbar in Subframe (or write a definitive spec) | Only hand-built visual component with no design system ownership | Larger effort |
| 12 | Evaluate un-sync-disabling DeviceConnectionCard and OrderCard | Reduces sync-disabled count from 10 to 8 | Their overrides could move to call sites |
| 13 | Unify spinner primitives into a shared component | Two different spinners exist (fast/slow, different sizes) | CSS utilities created but a `Spinner` component would be cleaner |

### Where overrides still make sense

These inline styles or overrides are justified and should stay:

- **BottomSheet overlay** — dynamic opacity prop requires inline style
- **ModemInfoSheet mask-image** — dynamic scroll-based gradient requires inline style
- **BottomSheet className array** — responsive mobile/desktop layout with spring overshoot compensation is too complex for a single Tailwind class
- **Framer Motion animation containers** in StepCard/CheckerCard — animation logic is inherently imperative
- **PortTypeBadge hardcoded colours** — domain-specific port-type colours with no theme equivalent
- **Navbar safe-area padding** — `env(safe-area-inset-top)` is a platform-level concern

---

## 10. Proposed Component Hierarchy (Post-Cleanup)

```
src/ui/components/          ← 27 components (down from 68)
  Sync-disabled (10):
    Button, CheckerCard, DeviceConnectionCard, HeaderWithNavigation,
    IconButton, OrderCard, PortTypeBadge, RadioCardGroup, StepCard,
    SubstepCardContainer

  Unmodified:
    Alert, Avatar, Badge, CardButton, Dialog, Drawer, DropdownMenu,
    FeatureItem, IconWithBackground, LinkButton, ModemIdentityCard,
    NavBreadcrumb, ProductCard, StatusItem, TextField, Tooltip

src/components/             ← 28 behavioural composites (code-owned)
  Navbar, BottomSheet, BaseScreen, Login, ErrorBoundary,
  ModemChecker, SetupGuide, SetupGuideContent, SetupGuideInline,
  SetupLanding, SupportArticlePage,
  ModemSearchFlow, SearchInput, LoadingState, MultipleMatches,
  ResultCard, SetupResultCard, NoMatch, SearchError,
  ModemInfoSheet, SetupGuideNotAvailable,
  InfoCallout, DisclaimerCallout, ConditionList,
  ModemImage, SheetFooter, DevMenu, SetupDevMenu

src/styles/
  gradients.css             ← Gradients + shared utilities
                              (scrollbar-brand, overlays, spinner speeds)
```
