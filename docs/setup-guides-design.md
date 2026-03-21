# Setup Guides — Design Document

> **Date**: 18 March 2026
> **Status**: Draft v1 — exploratory, on `feature/setup-guides` branch
> **Depends on**: Compatibility database (Phase 1, complete), existing condition codes

---

## 1. Problem

The modem compatibility checker tells customers *whether* their modem works with Belong nbn. It doesn't tell them *how to set it up*. The gap between "yes, compatible" and "connected and working" is where customers call support or abandon checkout.

Currently, condition codes like `SWITCH_TO_IPOE` surface as labels ("Reconfigure to IPoE") with no actionable instructions. The customer sees the label and has no idea what to do next.

---

## 2. Use Cases

### Self-service (primary)

Customer is in the Belong checkout flow. They've service-qualified (we know their tech type and plan), searched for their modem, and received a compatibility result. The setup guide appears as the natural next step: "Here's how to get your [Brand Model] connected."

The customer doesn't necessarily know which ISP they're coming from, and we don't ask. For ISP-branded devices (e.g., TPG-supplied VR1600v), we know the original ISP from the record. For retail devices, we frame the setup steps as verification ("check that your connection type is set to Automatic/DHCP") rather than assuming they need to change something.

For condition-specific steps (like SWITCH_TO_IPOE), the UI can use expandable sections: "Coming from TPG / iiNet / Internode?" — showing the relevant reconfiguration steps only when the customer self-identifies. This keeps the default guide clean while covering edge cases.

### Assisted support (secondary)

A support agent (human or AI) is helping a customer over the phone or chat. They know the tech type, plan, and modem model. The agent needs linear, step-by-step instructions they can walk through with the customer. The agent environment benefits from richer detail: admin panel IPs, exact menu paths, field labels.

### Future: address-based entry

Customer enters their address → service qualification API returns tech type → modem check → setup guide. Same data requirements as self-service; different entry point.

---

## 3. Information Architecture

Setup guidance has two layers.

### Layer 1: Tech-type-driven (generic, templatable)

These steps are identical regardless of modem model. They're fully derivable from existing data:

| Step | Driven by | Content |
|------|-----------|---------|
| Physical connection | `tech_type` + `wan.has_vdsl2_modem` | FTTP/FTTC/HFC: "Ethernet from nbn box → WAN port." FTTN/B: "Phone cable from wall socket → DSL port." |
| Power on | Universal | "Plug in, turn on, wait 2-5 minutes for lights to stabilise." |
| Check for firmware updates | Universal (always good advice) | "Log in to your modem's admin panel and check for firmware updates before configuring." |
| Protocol reconfiguration | `conditions[]` contains `SWITCH_TO_IPOE` | Trigger: show IPoE configuration steps. |
| VLAN check | `conditions[]` contains `DISABLE_VLAN` | Trigger: show VLAN disabling steps. |
| ISP lock warning | `is_isp_locked` / `ISP_LOCK` condition | "This modem may be locked to [ISP]. If it doesn't connect after setup, contact them." |
| Speed advisory | `wan_port_speed_mbps` + `wifi` | Already handled by frontend's `assessCompatibility()`. |

Layer 1 requires **no new research**. It's a rendering/templating concern in the frontend.

### Layer 2: Modem-specific (requires research)

This is the per-device data that makes the guide actually useful:

| Data Point | Why It Matters | Typical Source |
|-----------|---------------|----------------|
| Default admin IP | Customer needs to log in | User manual, manufacturer KB |
| Default credentials | Access the admin panel | User manual, manufacturer KB |
| Alternative admin URL | Some brands use hostnames | Manufacturer docs |
| WAN config nav path | Where to find the connection settings | User manual, admin panel docs |
| Connection type field label | What the dropdown/field is called | User manual screenshots |
| IPoE/DHCP option label | What "IPoE" is called in this modem's UI | Admin panel (varies: "Dynamic IP", "DHCP", "Automatic") |
| VLAN settings nav path | Where to disable VLAN (if applicable) | User manual |
| Physical port identification | WAN port label, colour, position; DSL port if applicable | Rear panel photos, manual diagrams |
| Factory reset procedure | Button location, hold duration | User manual |
| Firmware update nav path | Where to check/apply updates | Manufacturer support page |
| User manual URL | Reference for customer/agent | Manufacturer support/downloads page |

---

## 4. Schema Extension

Add a `setup` object to the modem JSON schema. All fields are optional — a modem with no setup data is still valid (it just won't render a setup guide).

```json
{
  "setup": {
    "admin_panel": {
      "default_ip": "192.168.0.1",
      "default_username": "admin",
      "default_password": "admin",
      "alt_access": "tplinkwifi.net",
      "notes": "If 'admin' doesn't work, try the Wi-Fi password printed on the modem's label"
    },
    "wan_config": {
      "nav_path": "Advanced > Network > Internet",
      "connection_type_field": "Internet Connection Type",
      "ipoe_label": "Dynamic IP",
      "vlan_field": "VLAN ID",
      "vlan_nav_path": "Advanced > Network > IPTV",
      "steps_ipoe": [
        "Log in to the admin panel",
        "Navigate to Advanced > Network > Internet",
        "Change 'Internet Connection Type' to 'Dynamic IP'",
        "Clear any Username and Password fields",
        "Set VLAN ID to blank or 0 (if visible)",
        "Click Save",
        "Wait 1-2 minutes for the modem to reconnect"
      ]
    },
    "physical": {
      "wan_port_label": "WAN",
      "wan_port_color": "blue",
      "wan_port_position": "leftmost when viewed from rear",
      "dsl_port_label": "DSL",
      "dsl_port_position": "rightmost when viewed from rear",
      "reset_button": "recessed pinhole on rear panel, right of power connector",
      "reset_hold_seconds": 10
    },
    "factory_reset": {
      "method": "Hold the Reset button for 10 seconds until all lights flash, then release",
      "restores_default_credentials": true,
      "notes": "Factory reset removes all custom settings including Wi-Fi name/password"
    },
    "firmware": {
      "check_path": "Advanced > System Tools > Firmware Upgrade",
      "auto_update_available": true,
      "download_url": "https://www.tp-link.com/au/support/download/archer-vr1600v/"
    },
    "setup_notes": "TPG-supplied units ship with PPPoE pre-configured. The WAN settings page will show 'PPPoE' with TPG credentials pre-filled. Change to 'Dynamic IP' and clear all credential fields.",
    "setup_sources": [
      {
        "url": "https://www.tp-link.com/au/support/download/archer-vr1600v/",
        "type": "manual",
        "accessed": "2026-03-18"
      },
      {
        "url": "https://whirlpool.net.au/wiki/tp-link_vr1600v",
        "type": "community",
        "accessed": "2026-03-18"
      }
    ],
    "setup_confidence": {
      "score": 85,
      "notes": "Admin panel defaults confirmed via manufacturer KB. Nav path confirmed via user manual PDF. IPoE label ('Dynamic IP') confirmed via Whirlpool community guides."
    }
  }
}
```

### Schema notes

- **`setup` is entirely optional.** A modem record without `setup` is valid — it just won't render setup guidance. This means we can add setup data incrementally.
- **`setup_sources` is separate from `research.sources`.** Different research, different sources. The manufacturer spec sheet that confirms VDSL2 support is not the same document as the user manual that shows the admin panel layout.
- **`setup_confidence` is separate from `research.confidence_score`.** A modem can have high compatibility confidence (specs well-documented) but low setup confidence (no manual found, admin paths unverified).
- **`steps_ipoe` is an ordered array of strings.** Each string is one step the customer follows. This is the primary output that both the self-service UI and the agent environment consume. Keeping steps as an array (not embedded in prose) makes them individually addressable and renderable.
- **`physical` fields use human-readable descriptions** ("leftmost when viewed from rear") rather than coordinates. These map to what a customer sees when they flip the modem around.
- **`wan_config.nav_path`** uses `>` as a separator (consistent with breadcrumb notation). This is the most compact way to describe "click this, then this, then this."

### Fields we're NOT including (yet)

| Field | Why not |
|-------|---------|
| Admin panel screenshots | Too hard to source reliably via automated research. Text paths are sufficient for v1. |
| LED indicator meanings | Useful but low priority. Adds significant research effort for marginal value. |
| LAN port details | Relevant for wired setup but not for the "get connected" scope. |
| QoS / DNS / Wi-Fi channel settings | Out of scope — this is "optimise" not "connect." |
| Per-firmware-version UI paths | Too much maintenance burden. Assume latest firmware; add "update firmware" as a universal first step. |

---

## 5. Brand-Level Defaults

Most admin panel data is consistent within a brand family. We can create a brand-defaults reference file that the BYO modem setup researcher inherits from, only researching deviations.

| Brand | Default IP | Alt Access | Default User | Default Pass | IPoE Label | WAN Nav Path (typical) |
|-------|-----------|------------|-------------|-------------|-----------|----------------------|
| TP-Link | 192.168.0.1 | tplinkwifi.net | admin | admin | Dynamic IP | Advanced > Network > Internet |
| ASUS | 192.168.1.1 | router.asus.com | admin | admin | Automatic IP | WAN > Internet Connection |
| Netgear | 192.168.1.1 | routerlogin.net | admin | password | — | Internet Setup |
| D-Link | 192.168.0.1 | — | admin | (blank) | DHCP Client | Setup > Internet |
| Linksys | 192.168.1.1 | myrouter.local | admin | admin | Automatic Configuration - DHCP | Connectivity > Internet Settings |
| DrayTek | 192.168.1.1 | — | admin | admin | DHCP | Internet Access Setup |
| Google/Nest | 192.168.86.1 | — | (Google Home app) | (Google Home app) | (automatic, no manual config) | (Google Home app only) |
| Amazon Eero | — | — | (Eero app) | (Eero app) | (automatic) | (Eero app only) |
| Synology | 192.168.1.1 | router.synology.com | — | — | — | Network Center > Internet |
| Telstra | 192.168.0.1 | — | admin | Telstra | — | (ISP-locked UI, varies) |
| Optus | 192.168.0.1 | — | admin | — | — | (ISP-locked UI) |

**Important patterns:**

- **App-only devices** (Google Nest, Eero, some mesh systems): These have no web admin panel. Configuration is done through the manufacturer's mobile app. The admin panel fields should be `null`, and setup steps should reference the app. The IPoE/DHCP setting is typically automatic with no user intervention required.
- **ISP-branded devices** (Telstra, Optus): These have customised firmware UIs that differ from the manufacturer's stock UI. They require per-model research — brand defaults don't apply.
- **Default password variations**: Some brands use the device's serial number or Wi-Fi password as the default admin password. This should be noted in `admin_panel.notes`.

This table becomes a reference file at `criteria/brand_setup_defaults.json`.

---

## 6. Research Process

### Separate skill, not extension

Setup research is a separate skill (`.agents/skills/BYO-modem-setup-researcher/SKILL.md`) because:

1. **Different sources.** Compatibility uses spec sheets; setup uses user manuals and KB articles.
2. **Different timing.** Setup research runs after a modem is approved in the compatibility pipeline. No point researching admin paths for a modem the judge rejects.
3. **Different validation.** Compatibility is validated by cross-referencing specs. Setup is validated by checking that documented paths match the actual admin UI.
4. **Different update cadence.** Hardware specs don't change. Admin UIs change with firmware updates.

### Research steps

1. **Check brand defaults** — load `criteria/brand_setup_defaults.json`, inherit applicable defaults
2. **Find the user manual** — manufacturer support/downloads page, search for PDF
3. **Extract admin panel defaults** — verify they match brand defaults or note deviations
4. **Map WAN configuration path** — trace the path to Internet/WAN settings in the manual
5. **Identify IPoE label** — what "Dynamic IP" / "DHCP" / "Automatic" is called in this modem's UI
6. **Document physical layout** — port labels, positions from manual diagrams or rear images
7. **Document factory reset** — from manual
8. **Write the steps_ipoe array** — ordered, actionable steps a customer can follow
9. **Calculate setup confidence** — deductions for missing manual, unverified paths, etc.

### Confidence scoring for setup data

Start at 100, subtract:

| Issue | Deduction |
|-------|-----------|
| No user manual found | -20 |
| Manual is for non-AU market variant | -10 |
| Admin nav path not verified by second source | -10 |
| Default credentials unconfirmed | -5 |
| IPoE label unconfirmed (using brand default) | -5 |
| Physical port layout not verified (no rear image or diagram) | -5 |
| App-only device with limited documentation | -10 |
| ISP-branded firmware with no public documentation | -15 |

Minimum threshold: **65** for setup data (lower than compatibility's 70, because wrong setup info sends someone to support rather than causing them to buy an incompatible modem).

### Skeptic/Judge extension

The existing skeptic and judge skills can be extended with a setup-specific section. The stakes are different:

- **High-stakes:** Default IP, IPoE label (wrong = customer can't follow the guide at all)
- **Medium-stakes:** Admin nav path (wrong = customer gets lost but might find it), firmware update path
- **Low-stakes:** Port colours, reset hold duration

For the initial experiment, setup data goes through a lighter review — the researcher's own confidence scoring is probably sufficient. Full skeptic/judge for setup can be added later if we find accuracy problems.

---

## 7. Rear Panel Images

Extend the existing image sourcer skill to support a second image type:

- **Search terms:** `{brand} {model} rear view ports` or `{brand} {model} back panel`
- **Naming convention:** `{modem-id}-rear.webp`
- **Storage:** Same Supabase `modem-images` bucket
- **Processing:** Same rembg pipeline, same 400px max dimension

Many review sites (PCMag, TechRadar, Gadget Guy AU) include rear panel photos as standard. User manuals almost universally have labeled port diagrams — these are potentially better than photos because they include labels.

This is a nice-to-have, not a blocker. Setup guides work without rear images.

---

## 8. Phased Approach

### Phase A: Schema + skill + pilot (this branch)

1. Define the schema extension (this document)
2. Create `criteria/brand_setup_defaults.json`
3. Write the BYO modem setup researcher skill (`.agents/skills/BYO-modem-setup-researcher/SKILL.md`)
4. Pilot on 5 modems — one per brand family:
   - TP-Link Archer VR1600v (modem_router, PPPoE ISP device, VDSL2)
   - ASUS RT-AX86U (standalone router, retail)
   - Google Nest WiFi Pro (mesh, app-only)
   - Telstra Smart Modem Gen 3 (ISP-branded, locked)
   - Netgear Nighthawk RAX50 (standalone router, retail)
5. Review pilot results, adjust schema and skill

### Phase B: Batch rollout

6. Run BYO modem setup researcher on all 69 records (batches of 5-10)
7. Extend image sourcer for rear panel images
8. Light skeptic review of setup data

### Phase C: Frontend integration

9. Update Supabase schema for `setup` column
10. Update frontend to render setup guides
11. Template engine for Layer 1 (tech-type-driven) steps

---

## 9. Open Questions

| # | Question | Current thinking |
|---|----------|-----------------|
| 1 | Should `steps_ipoe` be a flat array of strings, or structured objects with step type metadata? | Flat strings for now. We can always parse structure later if needed. YAGNI. |
| 2 | How do we handle app-only devices (Google, Eero) where there's no admin panel? | Set admin_panel fields to null, steps reference the app. These devices typically auto-detect IPoE so steps may just be "plug in and wait." |
| 3 | Should we store the manual PDF? | Not yet. Store the URL in `setup_sources`. Revisit if URLs start dying or if we want to do PDF extraction later. |
| 4 | How do we handle modems where the admin UI significantly changed between firmware versions? | Assume latest firmware. Add "update firmware first" as a universal step. Note major UI changes in `setup_notes`. |
| 5 | Should setup data live in the same JSON file or a separate file per modem? | Same file (`database/individual/{id}.json`). It's part of the modem record. Keeps the single-file-per-modem pattern. |
