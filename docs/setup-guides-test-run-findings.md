# Setup Guides — Test Run Findings

> **Date**: 20 March 2026
> **Modems tested**: TP-Link Archer VR1600v, ASUS RT-AX86U, Google Nest WiFi Pro
> **Branch**: `feature/setup-guides`

---

## Summary

Successfully researched and populated setup data for 3 modems covering different device archetypes:

| Modem | Archetype | Setup Confidence | Key Test |
|-------|-----------|-----------------|----------|
| TP-Link Archer VR1600v | Modem-router, ISP-supplied (TPG), VDSL2 | 90 | Dual WAN paths (Ethernet + DSL), SWITCH_TO_IPOE |
| ASUS RT-AX86U | Standalone router, retail | 85 | Ethernet-only path, no DSL, brand default deviations |
| Google Nest WiFi Pro | Mesh system, app-only | 80 | No web admin panel, auto-detection, app-based config |

Each took ~10 minutes of web research across 4-5 sources. Several important findings that affect the schema design and researcher skill.

---

## Finding 1: WAN config paths differ by tech type (schema change needed)

**Problem:** The original schema had a single `wan_config.nav_path` field. But the VR1600v (and likely all modem-routers with both DSL and Ethernet WAN) has **two completely different configuration paths** depending on the customer's nbn tech type:

| Tech type | Path | Complexity |
|-----------|------|-----------|
| FTTP / FTTC / HFC | Basic > Internet > change dropdown | Simple — one dropdown change |
| FTTN/B | Advanced > Network > DSL > delete all > add new | Complex — delete existing connection, create new one with VDSL modulation |

**Resolution:** Split `wan_config` into `wan_config.ethernet` and `wan_config.dsl`, each with their own `nav_path`, `steps_ipoe`, and field labels. This means `steps_ipoe` is also tech-type-specific.

**Impact on frontend:** The UI already knows the customer's tech type. It just needs to render the correct step set: `setup.wan_config.ethernet.steps_ipoe` for FTTP/FTTC/HFC, `setup.wan_config.dsl.steps_ipoe` for FTTN/B.

**Impact on standalone routers (no DSL):** These only have `wan_config.ethernet`. The `dsl` key would be absent. Clean and consistent.

**Confirmed by ASUS test:** The RT-AX86U only has `wan_config.ethernet` (no DSL). The pattern holds.

---

## Finding 2: Brand defaults are useful but need per-model verification

**TP-Link:** Brand defaults say `192.168.0.1`. VR1600v (DSL model) uses `192.168.1.1`. Root cause: TP-Link uses different subnets for different product categories (standalone routers vs DSL modem-routers).

**ASUS:** Brand defaults say `192.168.1.1`. RT-AX86U (AX-series) uses `192.168.50.1`. Root cause: ASUS migrated AX-series to a new default subnet. Also, brand defaults say `admin/admin` but ASUS routers have no factory default credentials — they require setup wizard credential creation.

**Google:** Brand defaults correctly identify this as app-only with no web admin panel.

**Recommendation:** Keep the brand defaults as a starting-point reference for the researcher, not as inheritable data. The researcher MUST verify per-model. Brand defaults are most useful for `ipoe_label` and `firmware_nav_path` which tend to be stable within a brand.

---

## Finding 3: Three distinct setup archetypes emerged

| Archetype | Admin Interface | WAN Config | Example |
|-----------|----------------|------------|---------|
| **Web admin** | IP + username/password, web browser | Manual: navigate menus, change dropdowns | TP-Link VR1600v, ASUS RT-AX86U |
| **App-only** | Mobile app, no web UI | Automatic (IPoE auto-detected) or app menu | Google Nest WiFi Pro, Eero |
| **ISP-locked** | Custom firmware, limited access | May not be changeable | Telstra Smart Modem (to test) |

The schema handles all three cleanly:
- **Web admin:** Full `admin_panel` + `wan_config` with nav paths and steps
- **App-only:** `admin_panel.app_only: true`, steps reference the app, most config is automatic
- **ISP-locked:** To be tested with Telstra Smart Modem Gen 3

---

## Finding 4: FTTN/B DSL setup requires "delete and recreate" not just "change dropdown"

For FTTN/B on the VR1600v, you can't just change a dropdown from PPPoE to Dynamic IP. You have to:
1. Delete ALL existing Internet connections
2. Add a NEW connection
3. Set DSL Modulation Type to VDSL
4. Set Internet Connection Type to Dynamic IP

This is a multi-step destructive action that the researcher skill needs to explicitly probe for.

---

## Finding 5: ISP guides are the best source for setup data

Most useful sources, ranked:
1. **Australian ISP help portals** (Lightning IP, iiNet, Pentanet, SpinTel, Tangerine) — step-by-step per-modem PPPoE-to-DHCP guides
2. **Manufacturer support FAQs** (ASUS AU, TP-Link AU) — official nav paths and procedures
3. **Community forums** (Whirlpool, SNBForums) — real-world confirmation, gotchas, edge cases
4. **Manufacturer user manuals** — physical layout, factory reset, but rarely cover ISP switching

**Key search queries for the researcher skill:**
```
# Admin defaults
"[brand] [model]" default admin password login IP address

# PPPoE to IPoE/DHCP configuration
"[brand] [model]" PPPoE to DHCP Dynamic IP setup nbn

# ISP-specific configuration guides (Australian ISPs)
"[model]" site:help.lip.net.au OR site:help.iinet.net.au OR site:help.pentanet.com.au
"[model]" setup nbn site:articles.spintel.net.au OR site:tangerine.com.au

# Physical port layout
"[brand] [model]" rear panel ports WAN DSL

# Factory reset
"[brand] [model]" factory reset button hold seconds

# Firmware update path
"[brand] [model]" firmware update admin menu path
```

---

## Finding 6: The LAN4/WAN dual-purpose port is a real UX issue

The VR1600v's WAN port is labeled "LAN4/WAN." Similarly, the RT-AX86U has a 2.5G port that LOOKS like it should be the WAN port (it's the first port from the left) but is actually LAN-only — the actual WAN port is the blue one next to it.

The `physical.wan_port_notes` field is essential for capturing these real-world confusions.

---

## Finding 7: App-only devices are the easiest setup — but hardest to document

Google Nest WiFi Pro auto-detects IPoE/DHCP. The setup is basically "plug in and wait." But documenting the app-based WAN settings change (for PPPoE→DHCP) is harder because:
- Google's support pages are hard to scrape (render client-side)
- The app UI can change with updates
- There's no stable URL to link to for "screenshot of the WAN settings screen"

The `app_only: true` flag and `app_name` / `app_store_links` fields handle this well at the schema level. For the researcher skill, the search should target ISP guides (SpinTel, Tangerine) which often have Google Nest setup guides with app screenshots.

---

## Finding 8: HFC NTD DHCP lease gotcha

From the Whirlpool RT-AC86U thread: when switching routers on HFC, the nbn NTD may need up to 30 minutes powered off to release the previous DHCP lease. This is a tech-type-specific tip that should be part of the Layer 1 (templated) setup guidance, not per-modem data.

**Action:** Add this to the frontend's FTTP/FTTC/HFC template: "If your router doesn't connect within 5 minutes on HFC, try turning off the nbn connection box for 30 minutes to release the old connection, then power it back on."

---

## Finding 9: Factory reset varies more than expected

| Device | Reset Method | Duration | Restores Credentials? |
|--------|-------------|----------|----------------------|
| TP-Link VR1600v | Pinhole rear panel | 10 sec | Yes (admin/admin) |
| ASUS RT-AX86U | Button rear panel | 5-10 sec | No (re-runs setup wizard) |
| Google Nest WiFi Pro | Circle on bottom | 12 sec | N/A (app-based, re-setup) |

The `factory_reset.restores_default_credentials` boolean is important — it tells the customer what to expect after a reset.

---

## Schema Changes (implemented in test records)

### Change: Split `wan_config` by connection method

```json
"wan_config": {
  "ethernet": {
    "nav_path": "...",
    "connection_type_field": "...",
    "ipoe_label": "...",
    "steps_ipoe": [...]
  },
  "dsl": {
    "nav_path": "...",
    "connection_type_field": "...",
    "ipoe_label": "...",
    "steps_ipoe": [...]
  },
  "vlan_field": "...",
  "vlan_nav_path": "...",
  "vlan_notes": "..."
}
```

**Rules:**
- `wan_config.ethernet` — present for ALL modems
- `wan_config.dsl` — present ONLY for modem-routers (`has_vdsl2_modem: true`)
- Frontend selects based on customer's tech type

### Addition: `admin_panel.app_only`, `app_name`, `app_store_links`

For app-only devices (Google, Eero), identifies the required app and links to stores.

### Addition: `manual_url` at top level of `setup`

Primary URL for user manual or support downloads page.

### Addition: `setup_sources[].description`

Short human description of each source's relevance.

---

## Remaining Pilot Modems

| Modem | Archetype | What it tests |
|-------|-----------|---------------|
| ~~TP-Link Archer VR1600v~~ | ~~Modem-router, ISP~~ | ~~Done~~ |
| ~~ASUS RT-AX86U~~ | ~~Standalone router~~ | ~~Done~~ |
| ~~Google Nest WiFi Pro~~ | ~~Mesh, app-only~~ | ~~Done~~ |
| Telstra Smart Modem Gen 3 | ISP-branded, locked | ISP-specific firmware, restricted admin |
| Netgear Nighthawk RAX50 | Standalone router | Different brand family, validates Netgear defaults |
