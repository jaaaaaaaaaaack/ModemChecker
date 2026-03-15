# Belong Modem Information — Design Spec

## Problem

The BaseScreen asks users whether they want a Belong modem, but provides no information about the modem itself. At $132 (or $11/mo × 12), this is a considered purchase being presented as a blind yes/no choice.

## Design Principle

Three tiers of progressive disclosure:

1. **On-page summary** — closes the sale for the majority. Makes the detail sheet feel optional, not required.
2. **Detail sheet** — reassures the cautious 20–30%. Benefits-led, not spec-led.
3. **External link** — satisfies the deep researcher (10%). Links to belong.com.au product page.

## Modem Reference (DWA4135)

Source: belong.com.au/support/internet/getting-started/what-do-i-get-with-the-belong-modem

- Wi-Fi 6 (802.11ax), data rate up to 950Mbps
- WPA2/WPA3 security
- 4 × 1Gbps LAN ports, 1Gbps WAN port, USB 3.0
- Up to 12+ simultaneous device connections
- 24-month warranty
- Automatic firmware updates (pushed by Belong)
- Built-in parental controls
- 100% recycled packaging, 95% recycled plastic housing
- Security support committed until 31 Dec 2028

---

## Section 1: On-Page Modem Summary Block

### Page structure (top to bottom)

1. H2: "Modem selection"
2. **Modem summary block** (new — always visible)
3. Radio group: "Do you want to add a Belong modem?"
4. BYO section (reveals on "No" selection, unchanged)
5. Order summary card (unchanged)

### Modem summary block content

```
[modem image]

Belong Wi-Fi 6 Modem
$132 or $11/mo over 12 months

✓ Supports all Belong nbn plans
✓ Connect 12+ devices at once
✓ 24-month warranty

Learn more ›
```

### Content rationale

The three bullets address three purchase anxieties for a "just make it work" customer:

| Bullet | Anxiety addressed | Why this wording |
|--------|-------------------|------------------|
| Supports all Belong nbn plans | "Will it handle my plan speed?" | Implicitly covers compatibility + speed. Mirror image of what the BYO checker evaluates. |
| Connect 12+ devices at once | "Is it any good?" | Tangible, non-technical. Signals modern hardware without jargon. |
| 24-month warranty | "What if something goes wrong?" | Risk reduction. Matters more for a $132 purchase. |

### Deliberate omissions from on-page

- **Wi-Fi 6 as a bullet** — already in the product name where it acts as a quality signal. As a bullet it would be jargon for non-technical users.
- **Ports, USB, WPA3** — too technical. Sheet material.
- **Recycled materials** — nice but not decision-driving.
- **Setup/plug-and-play** — "supports all plans" implicitly covers "it just works."

---

## Section 2: Detail Sheet ("Learn more")

Opens in the existing BottomSheet component. Tapping "Learn more" on the summary block triggers it.

### Content

**Heading:** Belong Wi-Fi 6 Modem

**Intro:** A reliable, modern modem designed to get the most out of your Belong nbn plan.

**Speed & coverage**
Wi-Fi 6 delivers speeds up to 950Mbps — fast enough for all Belong nbn plans, including nbn1000. Supports 12+ simultaneous device connections, so everyone in the household can stream, game, and browse without competing for bandwidth.

**Security & updates**
WPA3 encryption keeps your network secure. Firmware updates are delivered automatically — you won't need to do a thing.

**What's included**
24-month warranty with troubleshooting support (live chat or phone). 4 ethernet ports for wired connections. USB 3.0 port. Built-in parental controls.

**External link:** "View full specifications on belong.com.au" → opens in new tab.

### Content rationale

- **Grouped by concern**, not by spec category: "will it be fast?", "is it secure?", "what do I get?"
- **Speed & coverage leads** — primary anxiety, mirrors what the compatibility checker evaluates for BYO.
- **Security & updates** — "you won't need to do a thing" reinforces low-effort positioning. WPA3 and auto-updates are genuinely differentiating vs. an old router.
- **What's included** — catch-all for tangible details. Spec-adjacent but framed as "what you get."
- **No images** — modem image already visible on-page. Sheet is text-focused.

---

## Section 3: Cross-Linking from Compatibility Results

When the BYO compatibility checker returns "not compatible", the ResultCard currently displays:

> "Add a Belong modem to your order, or purchase a different compatible modem before your connection date."

### Change

Make **"Add a Belong modem to your order"** a tappable link. Tapping it:

1. Closes the bottom sheet (same animation as "Done")
2. Scrolls the page to the modem summary block

No auto-selection of the "Yes" radio — the user makes that choice explicitly. No highlight/pulse animation on the target — the scroll itself is sufficient signal.

### What this is not

- Not an upsell card in the results
- Not a product mini-card
- Just dead text turned into useful wayfinding

---

## Out of Scope

- Payment method radio group (upfront vs. split) — acknowledged as part of the real flow but not being built in this prototype
- Modem image sourcing for the summary block (can use existing Supabase storage or a static asset)
- OrderCard pricing updates (currently shows "$0 upfront" — will need updating separately to reflect real pricing)
