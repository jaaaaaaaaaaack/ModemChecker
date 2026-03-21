# Setup Guides — Session Notes

> **Date**: 21 March 2026
> **Branch**: `feature/setup-guides` (branched from `feature/judge-skill`)
> **Status**: Schema validated, skill refined, UI patterns designed, ready for batch rollout

---

## What this feature is

BYO modem setup guides — modem-specific, step-by-step instructions for connecting a BYO modem to Belong's nbn IPoE service. The `setup` block is added to each modem's existing JSON record alongside the compatibility data.

Two target environments:
- **Self-service**: Embeddable widget shown after compatibility check. Customer knows their tech type (from SQ or login). Stepper UI with progressive disclosure.
- **Assisted support**: Agent (human or AI) walks customer through steps. Richer detail, linear flow.

---

## Progress

### Commits on this branch

| Commit | What |
|--------|------|
| `3082940` | Initial skill, schema, brand defaults file, design doc, 5 pilot records (VR1600v, RT-AX86U, Nest WiFi Pro, RAX50, Telstra Gen 3) |
| `74a51b5` | Added 7 new UI-driven fields to skill schema + tested on D-Link DSL-2888A and Linksys Velop MX4200 |
| `45efaff` | Added blocked-page fallback protocol + tested on Amazon Eero 6+ (app-only) |
| `223ed63` | Reordered fallback chain (PDFs first) based on test results, updated Eero 6+ with PDF-verified data |

### Modems with setup data (8 of 69)

| Modem | Archetype | Credential Type | Confidence | Key test |
|-------|-----------|----------------|------------|----------|
| TP-Link Archer VR1600v | Modem-router (dual WAN) | `standard` | 90 | DSL + Ethernet paths, SWITCH_TO_IPOE, delete-and-recreate flow |
| ASUS RT-AX86U | Standalone router | `user_created` | 85 | No factory defaults, setup wizard, brand default deviations |
| Google Nest WiFi Pro | Mesh, app-only | `app_only` | 80 | No web admin, auto-detects IPoE, Google Home app |
| Netgear Nighthawk RAX50 | Standalone router | `standard` | 65 | Question-style IPoE field ("Does your connection require a login? No") |
| Telstra Smart Modem Gen 3 | ISP-branded | `isp_sticker` | 70 | Custom firmware, per-unit sticker password |
| D-Link DSL-2888A | Modem-router (dual WAN) | `standard` | 75 | EOL device, blank default password, Settings > Internet nav |
| Linksys Velop MX4200 | Mesh router | `user_created` | 80 | HTTPS-only admin, auto-detects IPoE, linksyssmartwifi.com |
| Amazon Eero 6+ | Mesh, app-only | `app_only` | 88 | Auto-sensing ports, eero app, PDF fallback tested |

### Remaining: 61 modems without setup data

---

## Schema

The `setup` block is added to each modem's existing JSON file. Full schema is in the skill at `.agents/skills/BYO-modem-setup-researcher/SKILL.md` (Step 10).

### Key fields added in this session (post-pilot)

| Field | Purpose | Drives which UI pattern |
|-------|---------|----------------------|
| `admin_panel.credential_type` | Enum: `standard`, `user_created`, `isp_sticker`, `app_only` | Credential card variant |
| `admin_panel.app_only` | Boolean (always explicit, never omitted) | App setup step vs web admin step |
| `admin_panel.auto_detects_ipoe` | Boolean — does the device auto-configure for DHCP? | "No manual config needed" note vs full admin nav flow |
| `admin_panel.supports_https` | Boolean — does admin panel require HTTPS? | Browser security warning callout |
| `wan_config.*.save_button_label` | Exact text on save button ("Save", "Apply", etc.) | Instruction text accuracy |
| `wan_config.*.pppoe_clear_note` | Which PPPoE fields to clear, using exact labels | ISP switch conditional block content |
| `physical.wan_port_icon` | Icon description if port uses icon instead of text | Port identification callout |

---

## UI Design (Subframe)

Pattern library built in Subframe: https://app.subframe.com/c141bce6134a/design/4e59dcd3-722a-4ee0-9361-9fc3509727ed/edit

### Design decisions made

1. **Active step = brand-50 background + white sub-instruction cards.** The blue tint provides a persistent "you are here" signal when scrolling. White sub-cards inside create clean layering for breadcrumbs, field widgets, and instruction text.

2. **Step card states**: Completed (green check, collapsed), Active (brand-50, expanded), Upcoming (bordered circle, collapsed), Warning/conditional (amber), Optional (accent2/purple).

3. **Credential card is a distinct embedded component** — feels like a physical sticker/card. Has subtle border + shadow to differentiate from instruction sub-steps.

4. **Breadcrumb nav pills** — rounded-full, neutral-200 background, monospace text. Visually signals "this is a UI element to find" vs body text.

5. **ISP switch conditional** — "Coming from TPG/iiNet/Internode?" as an expandable section within the step, not a separate step.

### Components identified (not yet built)

| Component | Variants |
|-----------|----------|
| StepCard | completed, active, upcoming, warning, optional |
| CredentialCard | standard, user_created, isp_sticker, app_only |
| AdminNavStep | breadcrumb + field/value |
| PhysicalConnectionStep | text + optional port callout |
| AppSetupStep | app name + store links + sub-cards |
| ConditionalBlock | ISP switch, HFC reset |

---

## Key Files

| File | Purpose |
|------|---------|
| `.agents/skills/BYO-modem-setup-researcher/SKILL.md` | Research skill — the main deliverable |
| `criteria/brand_setup_defaults.json` | Brand-level default admin panel settings (starting points, not authoritative) |
| `docs/setup-guides-design.md` | Original design document (use cases, schema v1, phases) |
| `docs/setup-guides-test-run-findings.md` | Pilot learnings from first 3 modems |
| `docs/setup-guides-session-notes.md` | This file |
| `database/individual/*.json` | 8 records now have `setup` blocks |

---

## Learnings

### Research process

1. **Australian ISP setup guides are the best source.** Lightning IP, SpinTel, Tangerine, AGL, Swoop, and More all publish modem-specific setup guides for nbn. They have exact field labels, screenshots, and step-by-step flows. Search these before manufacturer pages.

2. **PDF manuals are the most reliable fallback when sites block WebFetch.** Tangerine, AGL, and More publish quick start guides as direct PDF downloads. These bypass bot protection entirely. The Read tool can parse PDFs page by page, including diagrams.

3. **Brand defaults deviate more than expected.** TP-Link DSL models use 192.168.1.1 (not 192.168.0.1). ASUS AX-series uses 192.168.50.1 (not 192.168.1.1). Linksys Velop uses linksyssmartwifi.com (not myrouter.local). The skill's "verify, don't copy" instruction is critical.

4. **Netgear's question-style field is a real edge case.** Instead of a dropdown labeled "DHCP", Netgear asks "Does your Internet connection require a login?" — answer "No". This needs its own UI rendering pattern.

5. **DSL modem-routers often require "delete and recreate"** when switching from PPPoE to IPoE. A simple dropdown change isn't enough — the existing PPPoE connection must be deleted and a new Dynamic IP connection created. The `steps_ipoe` array must capture this exact flow.

### Blocked pages fallback (validated)

| Fallback | Reliability | Notes |
|----------|-------------|-------|
| **PDF manual** | High | Direct downloads, no bot protection. AU ISP guides are nbn-specific. |
| **Alt pages** | Medium | Support/FAQ pages on same domain sometimes work when product page doesn't |
| **Google Cache** | Low | Returns JS errors for Zendesk-hosted sites (eero, some Netgear) |
| **Wayback Machine** | Blocked | WebFetch cannot access web.archive.org at all |

### UI design

1. **The active step needs the blue tint.** Expansion state alone isn't enough differentiation — the colour is a persistent "you are here" signal during scrolling.

2. **Sub-instruction cards should be borderless white** inside the blue container. Border + background contrast creates visual depth without busyness.

3. **The credential card is a distinct object type** — it's a reference (like a physical sticker) not an instruction. Subtle border + shadow differentiates it from instruction sub-cards.

4. **The field/value widget is the most valuable UI element for admin nav steps.** It lets customers visually match "find this label, select this value" at a glance without reading a sentence. Worth keeping even though it adds component complexity.

---

## What's next

### Immediate (batch rollout)

- Run the setup researcher on remaining 61 modems in batches of 5
- ~13 batch sessions, can be parallelised with sub-agents
- Expect ~10 minutes per modem, so ~2-3 hours of research time total

### After batch rollout

- Componentise the Subframe patterns into reusable components with variants
- Add `setup` JSONB column to Supabase `modems` table
- Sync all setup data to Supabase
- Build the frontend rendering logic (map `credential_type` → component variant, `nav_path` → breadcrumb pills, etc.)

### Data gaps to address later

| Gap | Impact | Priority |
|-----|--------|----------|
| Rear-panel images | Port identification visual (Option 2 side-by-side) | Medium — requires image pipeline expansion |
| `steps_structured` (typed step objects) | Cleaner mapping from data → UI sub-card variants | Medium — schema migration |
| nbn UNI-D port recommendation | Which port on the nTD to use | Low — may come from SQ API |
| App store links for all app-only devices | Store badges in app setup step | Low — trivial to add during batch |

---

## MEMORY.md updates needed

Add to the ModemChecker_Data MEMORY.md:

```
## Setup Guides Feature (as of 2026-03-21)

- Branch: `feature/setup-guides`
- Skill: `.agents/skills/BYO-modem-setup-researcher/SKILL.md`
- Schema: `setup` block added to individual modem JSON files
- 8 of 69 modems have setup data (see docs/setup-guides-session-notes.md)
- UI patterns designed in Subframe (not yet componentised)
- Blocked-page fallback protocol validated: PDFs first, Google Cache unreliable, Wayback blocked
- Brand defaults file: `criteria/brand_setup_defaults.json`
- Ready for batch rollout of remaining 61 modems
```
