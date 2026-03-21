# Setup Guides — Frontend Context & Decisions

> **Updated**: 2026-03-21 (end of initial build session)
> **Purpose**: Single source of truth for the setup guides feature in the ModemChecker frontend project. Captures all decisions from the initial build session to hand off to the data contract planning session.

---

## What we built

A `/setup` route in the ModemChecker Vite+React app (react-router-dom) that renders modem-specific setup guides. Separate from the existing `/` compatibility checker route — both share the Subframe design system, Tailwind config, and Supabase client. The compatibility checker code is untouched.

Currently renders with 8 example modems switchable via a dev menu at the bottom of the page. Tech type is also selectable via the dev menu (defaults to FTTP).

### Current step structure (hardcoded — needs to change)

4 fixed StepCard components: Connect → Log in → Configure → Verify. Data from the setup JSON drives the content *within* each step (port labels, credentials, nav paths, field names), but the step structure itself doesn't adapt per modem. This is the core problem the data contract needs to solve.

---

## Components in use

| Component | What it renders | Data source |
|---|---|---|
| ModemIdentityCard | Header showing which modem | brand, model, Supabase image |
| StepCard | Step container with expand/collapse + Framer Motion animation | Variant driven by step state (current/completed/upcoming) |
| DeviceConnectionCard | Modem image + port badge | `physical.*` |
| PortTypeBadge | Colored pill for port type (WAN, Ethernet, etc.) | `physical.wan_port_label/color`, `hasIcon` for icon-only ports |
| SubstepCardContainer | Credential/login card with 4 variants | `admin_panel.*`, mapped via `credential_type` |
| NavBreadcrumb | Admin panel navigation path pills with `hasHome` option | `wan_config.*.nav_path` split on " > " |
| NavBreadcrumb.Segment | Also has `setting-value` variant for target values | `wan_config.*.ipoe_label` |
| StepCard.ConditionalBlock | ISP switch callout | Currently hardcoded for PPPoE ISPs |
| Alert | Disclaimer + "can't log in?" helper | Static content |

### StepCard animation (sync-disabled)

StepCard is sync-disabled from Subframe because we added Framer Motion animations:
- Content height animates with `motion.div` + `height: "auto" / 0` and `overflow: hidden` (no stretching)
- CSS `transition-colors duration-300` on the card for background/border color fades
- Step number → check icon crossfade via `AnimatePresence`
- Completed steps are clickable (sets them as current step)

### Credential type → SubstepCardContainer variant mapping

| credential_type | Variant | What it shows |
|---|---|---|
| standard | login-base | URL + username + password |
| user_created | login-no-credentials | URL + "use your own credentials" |
| isp_sticker | login-no-pass | URL + username + "check sticker" |
| app_only | app-only | Smartphone icon + app name |

### Port label rendering logic

The `wan_port_label` is parsed to extract just the port type name for the badge. Color is included in the connection label text for accessibility:

```
"Connect to the blue [WAN] port"          — ASUS, TP-Link
"Connect to the yellow [Internet] port"   — Netgear, Linksys, D-Link
"Connect to the red [WAN] port"           — Telstra
"Connect to either [Ethernet] port"       — Eero (auto-sensing)
"Connect to the [🌐 Ethernet] port"       — Google Nest (icon badge, hasIcon variant)
```

Parsing: strip "Either " prefix, strip " port" suffix, strip " icon" suffix. `isIconPort` detected by `/icon/i` test on label. Color extracted from `wan_port_color` field.

---

## Key problems identified (for data contract)

### 1. Hardcoded steps don't work across modem types

Different modem archetypes need different step flows:

| Archetype | Step flow |
|---|---|
| **Web admin** (TP-Link, ASUS, D-Link) | Power on → Connect Ethernet → Connect to WiFi → Log in to admin panel → Navigate to settings → Change WAN type → Save → Verify |
| **App-only** (Eero, Google Nest) | Power on → Connect Ethernet → Download app → Create account → Follow wizard → (auto-detects, no config) → Verify |
| **Auto-detect** (modems with `auto_detects_ipoe: true`) | Power on → Connect Ethernet → Wait → Verify |
| **ISP-locked** (Telstra) | Power on → Connect Ethernet → Limited config → Possibly contact support |

Currently missing steps: "plug into power", "connect to your modem's WiFi before logging in".

### 2. Three distinct content layers

| Layer | Scope | Source | Example |
|---|---|---|---|
| **Infrastructure** | Per tech type, modem-independent | Belong/nbn domain knowledge (written once) | "Open the FTTP wall box, find UNI-D1", "HFC: power off NTD for 30 mins if switching routers", how to identify which UNI-D port is active |
| **Modem setup** | Per modem, tech-type-aware | Research pipeline | Admin panel credentials, nav paths, WAN field labels |
| **Troubleshooting** | Mix of both | Research + domain knowledge | "Check Internet LED", "Wrong port?", "Still showing PPPoE?", nbn box light status |

The research pipeline should only own Layer 2. Layers 1 and 3 are templated content the frontend assembles around the modem-specific data. This is important because we don't need to research "how to open an FTTP wall box" 69 times.

### 3. Troubleshooting flow needed

When a customer clicks "I'm not connected" at the end of the guide:
- **Tech-type dependent**: Is the nbn box showing the right lights? (FTTP customers may need to open a wall-mounted box)
- **Tech-type dependent**: Did you connect to the right port on the nbn box?
- **Modem-specific**: Is the Internet LED on? What colour?
- **Connection-specific**: HFC DHCP lease issue (30 min power cycle)
- **Config-specific**: Are PPPoE credentials still saved from a previous ISP?
- **Generic fallback**: Factory reset and try again, contact support

### 4. Proposed approach: step templates driven by modem characteristics

Rather than hardcoding steps or rendering `steps_ipoe` strings, define step templates the frontend knows how to render:

| Template | UI components | Data source |
|---|---|---|
| `power_on` | Simple instruction text | Static (same for all) |
| `physical_connection` | DeviceConnectionCard + PortTypeBadge | `physical.*` |
| `connect_wifi` | Simple instruction text | `admin_panel.default_ip` |
| `login_web` | SubstepCardContainer | `admin_panel.*` |
| `login_app` | SubstepCardContainer (app-only) | `admin_panel.app_name, app_store_links` |
| `navigate_and_configure` | NavBreadcrumb + field/value widget | `wan_config.[ethernet\|dsl].*` |
| `clear_pppoe` | ConditionalBlock | `wan_config.*.pppoe_clear_note` |
| `verify` | Instruction text + LED hint | Static + tech-type conditional |

Step sequence derived from modem characteristics:
```
if (app_only)  → power_on → physical_connection → login_app → (skip configure if auto_detects_ipoe) → verify
if (!app_only) → power_on → physical_connection → connect_wifi → login_web → navigate_and_configure → verify
```

### 5. `steps_ipoe` role

The flat `steps_ipoe` array is NOT used by the frontend UI. The structured fields (`admin_panel`, `wan_config`, `physical`) power the rich component rendering. `steps_ipoe` is useful for the assisted support channel (human or AI agent reading steps to a customer) and could be shown as an optional "View all steps" expandable plain-text list.

---

## Data shape (current schema)

```
setup
├── admin_panel
│   ├── default_ip            — "192.168.1.1"
│   ├── default_username      — "admin" | null (user_created/app_only)
│   ├── default_password      — "admin" | null
│   ├── alt_access            — "tplinkwifi.net" | null
│   ├── credential_type       — "standard" | "user_created" | "isp_sticker" | "app_only"
│   ├── app_only              — boolean (always explicit)
│   ├── app_name              — "eero" (only if app_only)
│   ├── app_store_links       — { ios, android } (only if app_only)
│   ├── auto_detects_ipoe     — boolean
│   ├── supports_https        — boolean
│   └── notes                 — string | null
├── wan_config
│   ├── ethernet              — present for ALL modems
│   │   ├── nav_path          — "Basic > Internet"
│   │   ├── connection_type_field — "Internet Connection Type"
│   │   ├── ipoe_label        — "Dynamic IP" | "Automatic IP" | "DHCP"
│   │   ├── save_button_label — "Save" | "Apply"
│   │   ├── pppoe_clear_note  — "Clear the 'Username' and 'Password' fields..."
│   │   └── steps_ipoe[]      — ordered step strings (support channel, not UI)
│   ├── dsl                   — ONLY for modem_routers
│   │   └── (same shape as ethernet)
│   ├── vlan_field            — "VLAN ID" | null
│   ├── vlan_nav_path         — string | null
│   └── vlan_notes            — string | null
├── physical
│   ├── wan_port_label        — "WAN" | "LAN4/WAN" | "Either Ethernet port"
│   ├── wan_port_color        — "blue" | "yellow" | "white (same as device)"
│   ├── wan_port_position     — "leftmost when viewed from rear"
│   ├── wan_port_icon         — "globe" | null
│   ├── wan_port_notes        — gotchas (dual-purpose ports, 2.5G confusion)
│   ├── dsl_port_*            — same fields, null for routers
│   ├── lan_ports             — "4 x Gigabit Ethernet"
│   ├── other_ports           — "1 x USB 3.0"
│   ├── reset_button          — "Recessed pinhole on rear panel"
│   └── reset_hold_seconds    — 10
├── factory_reset
│   ├── method                — full procedure
│   ├── restores_default_credentials — boolean
│   └── notes                 — warnings
├── firmware
│   ├── check_path            — admin panel path or "Automatic"
│   ├── auto_update_available — boolean
│   ├── download_url          — string | null
│   └── notes                 — string | null
├── setup_notes               — 2-5 sentence prose summary
├── manual_url                — string | null
├── setup_sources[]           — { url, type, description, accessed }
└── setup_confidence          — { score, notes }
```

### Potential schema gaps (for data contract to address)

- No "connect to WiFi" step data (SSID hint — usually on the modem label)
- No "plug into power" step (trivial but should be explicit)
- No field for whether factory reset is a prerequisite step
- `save_button_label` exists but isn't used in UI yet
- `pppoe_clear_note` exists but ISP switch text is currently hardcoded
- `wan_port_color` values are inconsistent ("blue" vs "white (same as device)") — needs normalisation for the color-in-text accessibility pattern
- No separation of port TYPE vs port LABEL in the data (e.g., "Either Ethernet port" mixes description with type)

---

## Edge cases from test findings

1. **Dual WAN paths on modem-routers**: VR1600v has completely different paths for Ethernet vs DSL
2. **"Delete and recreate" DSL flow**: Can't just change a dropdown — existing PPPoE connection must be deleted, new one created with VDSL modulation
3. **Port confusion**: VR1600v's WAN is "LAN4/WAN", ASUS 2.5G port looks like WAN but isn't
4. **Netgear question format**: "Does your connection require a login? → No" instead of a dropdown labelled "DHCP"
5. **ASUS has no factory defaults**: Setup wizard creates credentials
6. **HFC DHCP lease**: When switching routers on HFC, nbn NTD may need 30 minutes powered off (Layer 1 template concern)
7. **App-only devices**: Simplest setup, hardest to document — auto-detect IPoE, steps are mostly "plug in and wait"
8. **ISP-branded firmware**: Stops updating when used with Belong

---

## Example modems (in data/setup-guides/)

| File | Archetype | Tests |
|------|-----------|-------|
| `tp-link-archer-vr1600v.json` | Modem-router, dual WAN, standard creds, ISP-switch | Most complex — exercises all features |
| `asus-rt-ax86u.json` | Router, user_created creds, port confusion | Common retail device |
| `amazon-eero-6-plus.json` | App-only, auto-detects IPoE | Simplest flow |
| `google-nest-wifi-pro.json` | App-only mesh, icon port label | Similar to Eero |
| `telstra-smart-modem-gen-3.json` | ISP-branded, isp_sticker creds | Restricted admin |
| `d-link-dsl-2888a.json` | Modem-router, standard creds | EOL device |
| `netgear-nighthawk-rax50.json` | Router, question-style IPoE field | Netgear edge case |
| `linksys-velop-mx4200.json` | Mesh, user_created, HTTPS-only, auto-detects | Auto-detect flow |

---

## Domain facts

- **Belong uses IPoE/DHCP** — no VLAN tagging, no credentials. All customers use this.
- The **ISP switch conditional** (clear PPPoE username/password) is relevant for customers coming from PPPoE ISPs (TPG, iiNet, Internode, Vodafone, Dodo, iPrimus).
- **Tech type determines WAN config path**: `wan_config.ethernet` for FTTP/FTTC/HFC, `wan_config.dsl` for FTTN/FTTB.
- **DSL path only exists on modem-routers**. Standalone routers only have `wan_config.ethernet`.
- In production, **tech type will be known** (from service qualification or account data).
- **Modem images**: All 69 modems have WebP images in Supabase Storage, accessible via `getModemImageUrl(modemId)`.

---

## What the data contract doc needs to define

1. **Step templates** — every type of step the frontend can render, what data it needs, where it comes from (pipeline vs template)
2. **Step sequencing rules** — how templates assemble per modem type, driven by characteristics (`app_only`, `auto_detects_ipoe`, `device_type`, etc.)
3. **Infrastructure layer content** — per tech type, written once (FTTP wall box, HFC NTD, FTTN DSL filter, etc.)
4. **Troubleshooting decision tree** — what to show when setup fails
5. **Schema requirements** — exact fields the pipeline must produce, with types, validation rules, and normalisation requirements
6. **Validation matrix** — all 8 existing modems × all step templates = does the system produce a complete, accurate guide?
7. **Gaps and open questions** — fields we need that the current schema doesn't have, data normalisation needed
