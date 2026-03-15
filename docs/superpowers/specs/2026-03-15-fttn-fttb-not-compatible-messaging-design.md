# FTTN/FTTB "Not Compatible" Messaging — Design Spec

## Problem

When a user checks a device against an FTTN or FTTB connection type, 38 out of 70 modems show as "not compatible." These are all standalone routers or mesh systems without a built-in VDSL2 modem — they can't handle the DSL connection that FTTN/FTTB requires.

The current treatment (red X icon, "Modem is not compatible," generic description) feels like a dead end and implies the device is fundamentally broken. In reality, this is a connection-type issue — the same device works fine on FTTP, FTTC, and HFC. The incompatibility isn't Belong-specific either; any ISP on FTTN/FTTB requires a VDSL2 modem.

## Audience

This primarily affects people moving from an FTTP/HFC/FTTC address to an FTTN/FTTB address. Someone already on FTTN/FTTB almost certainly has a compatible modem, since they needed one to get online. This is a narrow but commercially valuable audience — moving house is a high-intent acquisition moment.

## Solution

Update the **presentation** of the not-compatible result when the tech type is FTTN or FTTB. No data model or assessment logic changes — `cardStatus` remains `"not-compatible"`, the UI layer handles the differentiation.

### Changes

#### 1. Icon: Red → Amber

Shift the StatusItem icon from the current `error-dark` treatment (red background, white X) to `warning-2` (amber background, dark icon). This signals "attention needed" rather than "rejected."

The icon glyph changes from `FeatherX` to `FeatherAlertTriangle` to reinforce the shift from error to guidance.

Title text color shifts from `text-error-900` (red) to `text-neutral-800` (dark neutral) to match the softer tone.

#### 2. Copy

**Heading (unchanged):** "Modem is not compatible"

This is the honest, direct answer to the user's question. No softening needed — the visual treatment and description do the reframing work.

**Description (updated):**

> This modem won't work with your home's nbn connection type. You can [add a Belong modem](), or use a different compatible modem.

Key copy decisions:
- **"Your home's nbn connection type"** — grounds the issue in their physical setup without naming the tech type (which the user saw once, several steps ago, and likely doesn't remember). Implies "this is about your connection, not your device being bad."
- **"Add a Belong modem"** — not an upsell. By this point the user has already seen the Belong modem card (with pricing and features) and actively declined it by selecting "No, I'll use my own modem." This is a reference to a choice they already have on the same page.
- **"Or use a different compatible modem"** — honest alternative. Avoids implying a Belong modem is the only option.

**CTA link:** "See our FAQs for more info."

#### 3. "Add a Belong modem" interaction

The "add a Belong modem" text in the description is a clickable link (using the existing `onAddBelongModem` callback pattern). It scrolls the user back to the Belong modem summary card on the base screen via the existing `modemSummaryRef`.

This works in both contexts:
- **Sheet results screen:** Closes the sheet and scrolls to the modem card.
- **Base screen results card:** Scrolls up to the modem card.

### Scope

- **Applies to:** Not-compatible results when `techType === "fttn"` (which covers both FTTN and FTTB, since FTTB maps to FTTN for lookups).
- **Does not apply to:** Not-compatible results on other tech types (hypothetical — currently no devices are incompatible with FTTP/FTTC/HFC). These retain the existing red treatment as a fallback.
- **No assessment layer changes.** `assessCompatibility()` still returns `cardStatus: "not-compatible"`. The presentation layer checks the tech type and adjusts copy and icon accordingly.

### Affected components

| Component | Change |
|---|---|
| `CheckerCard` (`src/ui/components/CheckerCard.tsx`) | Accept `techType` prop. When `status === "not-compatible"` and `techType === "fttn"`, render amber icon, updated copy, and scrollable "add a Belong modem" link. |
| `ResultCard` (`src/components/ResultCard.tsx`) | Pass `techType` through to `CheckerCard`. |
| `BaseScreen` (`src/components/BaseScreen.tsx`) | Pass `techType` through to `CheckerCard`. Wire `onAddBelongModem` to scroll to `modemSummaryRef`. |
| `StatusItem` (`src/ui/components/StatusItem.tsx`) | No changes needed — already supports the `warning` and `incompatible` statuses. The icon/color switch happens in `CheckerCard`. |

### What this does NOT include

- No new `cardStatus` values — this is a presentation concern, not a data model change.
- No visual diagram or animation explaining the modem chain.
- No "use your device as an extender" messaging — the FAQ handles setup guidance.
- No changes to the assessment logic in `src/lib/compatibility.ts`.
- No changes for compatible or partially-compatible (yes_but) results.
