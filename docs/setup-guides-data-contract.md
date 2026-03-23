# Setup Guides Data Contract

> **Version:** 1.0
> **Date:** 2026-03-21
> **Status:** Active

## 1. Purpose & Audience

This document is the contract between two projects:

- **ModemChecker** (this repo) — the frontend that renders setup guides
- **ModemChecker_Data** — the research pipeline that produces per-modem setup data

It defines exactly what the pipeline must produce so the frontend can render it without transformation. The pipeline produces render-ready structured data. The frontend assembles and sequences it. Neither project should transform the other's output.

**Audience:** Frontend developers implementing the rendering, data researchers populating records, and any agent working on either side.

**Replaces:** The implicit contract previously scattered across `docs/setup-guides-frontend-context.md` (section "Data shape the frontend reads"), `docs/setup-guides-session-notes.md` (schema overview), and `docs/setup-guides-test-run-findings.md` (schema changes). Those docs retain historical context but this document is now the single source of truth for data shape.

**Not in scope:** UI component design (see Subframe project `c141bce6134a`), research methodology (see `setup-researcher` SKILL.md in ModemChecker_Data), compatibility assessment logic (see `src/lib/compatibility.ts`).

---

## 2. Three Content Layers

Setup guides combine content from three layers with different owners:

| Layer | Owner | Scope | Source | Examples |
|-------|-------|-------|--------|----------|
| **Infrastructure** | Frontend | Per tech type, written once | Belong/nbn domain knowledge | FTTP wall box identification, HFC DHCP lease gotcha, FTTN DSL filter |
| **Modem Setup** | Pipeline | Per modem, tech-type-aware | Web research | Admin credentials, WAN config nav paths, port identification |
| **Troubleshooting** | Mixed | Per tech type + per modem | Domain knowledge + research | Tech-type: nbn box lights. Modem-specific: LED meanings, common gotchas |

**Ownership principle:** Infrastructure content lives in the frontend as hardcoded constants keyed by `NbnTechType`. It is NOT in the database. The pipeline never researches infrastructure steps — it only researches modem-specific content. Troubleshooting is split: tech-type troubleshooting is frontend-templated, modem-specific troubleshooting hints come from the pipeline via `setup.troubleshooting` (optional) and `setup_notes`.

---

## 3. Step Templates

The frontend defines 8 renderable step templates. Each is backed by Subframe components. The pipeline does not need to know about templates — it populates the structured fields that each template reads.

| Template ID | Title Pattern | UI Components | Data Fields Consumed | Layer | Trigger |
|---|---|---|---|---|---|
| `power_on` | "Plug in and power on your modem" | Static text | None | Infrastructure | Always first |
| `physical_connection` | "Connect your modem" | DeviceConnectionCard, PortTypeBadge | `physical.wan_port_label`, `.wan_port_color`, `.wan_port_position`, `.wan_port_icon`, `.wan_port_notes`; `physical.dsl_port_*` when tech type is FTTN/FTTB | Modem Setup | Always present |
| `connect_wifi` | "Connect to your modem's WiFi" | Static text + link | `admin_panel.default_ip` (for "your modem's network" context) | Infrastructure | `app_only === false` |
| `login_web` | "Log in to your modem" | SubstepCardContainer, Alert | `admin_panel.default_ip`, `.default_username`, `.default_password`, `.alt_access`, `.credential_type`, `.supports_https`, `.notes` | Modem Setup | `app_only === false` |
| `login_app` | "Set up with {app_name}" | SubstepCardContainer (app-only variant) | `admin_panel.app_name`, `.app_store_links` | Modem Setup | `app_only === true` |
| `navigate_and_configure` | "Update connection settings" | NavBreadcrumb, NavBreadcrumb.Segment (setting-value), StepCard.ConditionalBlock | `wan_config.[ethernet\|dsl].nav_path`, `.connection_type_field`, `.ipoe_label`, `.save_button_label`, `.pppoe_clear_note` | Modem Setup | `app_only === false AND auto_detects_ipoe === false` |
| `clear_pppoe` | "Coming from {ISP}?" | StepCard.ConditionalBlock | `wan_config.[ethernet\|dsl].pppoe_clear_note` | Modem Setup | **Not a standalone step.** Embedded as conditional block within `navigate_and_configure`. |
| `verify` | "Restart and check your connection" | Static text + conditional hints | `troubleshooting.internet_led_*` (optional) | Mixed | Always last |

**`clear_pppoe` is NOT a standalone step.** It is a conditional block within `navigate_and_configure` that appears for customers switching from PPPoE ISPs (TPG, iiNet, Internode, Vodafone, Dodo, iPrimus). This prevents the step count from varying per modem.

---

## 4. Step Sequencing Rules

**Core principle:** Sequencing is derived by the frontend from modem characteristics. The pipeline never outputs step order. This prevents sequencing disagreements between two systems and makes the frontend the single owner of presentation logic.

### Sequencing pseudocode

```
function getStepSequence(modem, techType):
  steps = [power_on, physical_connection]

  if modem.setup.admin_panel.app_only:
    steps.push(login_app)
    if !modem.setup.admin_panel.auto_detects_ipoe:
      steps.push(navigate_and_configure)  // rare for app-only
  else:
    steps.push(connect_wifi)
    steps.push(login_web)
    if !modem.setup.admin_panel.auto_detects_ipoe:
      steps.push(navigate_and_configure)

  steps.push(verify)
  return steps
```

### Driving fields

| Field | Role | Type |
|-------|------|------|
| `admin_panel.app_only` | Determines login method (app vs web) | `boolean`, always explicit |
| `admin_panel.auto_detects_ipoe` | Determines whether config step is needed | `boolean`, always explicit |
| `admin_panel.credential_type` | Determines SubstepCardContainer variant | `string` enum, always explicit |

### Tech type → WAN config selection

The `techType` parameter (from customer's service, not from modem data) selects which WAN config path to render:

- **FTTP, FTTC, HFC** → `wan_config.ethernet`
- **FTTN, FTTB** → `wan_config.dsl` (only exists on modem-routers with built-in DSL)

If the customer's tech type is FTTN/FTTB but the modem has no `wan_config.dsl` (i.e., it's a standalone router), the frontend shows a "this modem needs a separate DSL modem" notice instead of the configure step.

### Archetype resolution table

| Archetype | Example Modems | Resolved Steps | Count |
|---|---|---|---|
| Web admin, manual config | TP-Link VR1600v, ASUS RT-AX86U, Netgear RAX50, D-Link DSL-2888A | power_on → physical_connection → connect_wifi → login_web → navigate_and_configure → verify | 6 |
| Web admin, auto-detect | Linksys Velop MX4200 | power_on → physical_connection → connect_wifi → login_web → verify | 5 |
| App-only, auto-detect | Amazon Eero 6+, Google Nest WiFi Pro | power_on → physical_connection → login_app → verify | 4 |
| App-only, manual config | (hypothetical — no pilot modem) | power_on → physical_connection → login_app → navigate_and_configure → verify | 5 |
| ISP-locked (web admin) | Telstra Smart Modem Gen 3 | power_on → physical_connection → connect_wifi → login_web → navigate_and_configure → verify | 6 |

ISP-locked modems follow the same flow as web admin — the ISP lock is a warning/conditional within the login step, not a flow change.

---

## 5. Infrastructure Layer Content

This is the canonical source for per-tech-type static content. The frontend implements this verbatim. The pipeline does not produce or duplicate this content.

### FTTP (Fibre to the Premises)

**Physical connection:**
> Open the nbn connection box on your wall. Find the port labelled **UNI-D1** (or the port your ISP indicated is active). Connect an Ethernet cable from this port to your modem's WAN port.

**Troubleshooting hints:**
- Check the UNI-D port has a green light (active connection)
- If UNI-D1 doesn't work, try UNI-D2 — some installations use a different port
- The nbn connection box needs mains power; check it's plugged in

### FTTC (Fibre to the Curb)

**Physical connection:**
> Connect an Ethernet cable from the nbn connection device (NCD — the small box plugged into your phone socket) to your modem's WAN port.

**Troubleshooting hints:**
- NCD should show a solid green connection light
- The NCD draws power from the phone line; no separate power cable needed
- If NCD light is off, check the phone socket connection

### HFC (Hybrid Fibre Coaxial)

**Physical connection:**
> Connect an Ethernet cable from the nbn connection box (NTD — the black box with the coaxial cable) to your modem's WAN port.

**Troubleshooting hints:**
- **DHCP lease gotcha:** If your modem doesn't connect within 5 minutes, power off the nbn connection box (NTD) for **30 minutes** to release the previous router's DHCP lease, then power it back on. This is the most common issue when switching routers on HFC.
- Check the NTD has a solid green "Connection" light
- The NTD needs mains power; check it's plugged in

### FTTN / FTTB (Fibre to the Node / Building)

**Physical connection:**
> Connect a phone cable from your telephone wall socket to your modem's **DSL port**. If you have a telephone on the same line, use a DSL line filter or central splitter.

**Troubleshooting hints:**
- The DSL sync light on your modem should be solid (not flashing)
- DSL line filters are required on any phone socket sharing the line
- A central splitter at the first socket eliminates the need for per-socket filters
- FTTN/FTTB uses the phone cable (RJ11), not an Ethernet cable

---

## 6. Schema Specification

Every field the pipeline must produce for each modem's `setup` object. Fields are organized by sub-object. Each field specifies type, whether it's required, allowed values, and which step template consumes it.

### 6.1 `setup.admin_panel`

| Field | Type | Required | Allowed Values | Validation | Consumer |
|---|---|---|---|---|---|
| `default_ip` | `string` | Always | IPv4 address | Regex: `^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$` | `login_web`, `connect_wifi` |
| `default_username` | `string \| null` | Always | Any string or `null` | `null` when `credential_type` is `user_created` or `app_only` | `login_web` |
| `default_password` | `string \| null` | Always | Any string (including `""`) or `null` | `null` when `credential_type` is `user_created` or `app_only` | `login_web` |
| `alt_access` | `string \| null` | Always | **Bare hostname** or `null` | Must NOT start with `http://` or `https://`. Frontend adds protocol. | `login_web` |
| `credential_type` | `string` | **Always** | `"standard"`, `"user_created"`, `"isp_sticker"`, `"app_only"` | Never omitted. Must match credential data (see §8). | `login_web` variant selection |
| `app_only` | `boolean` | **Always** | `true`, `false` | Never omitted. `true` iff `credential_type === "app_only"`. | Step sequencing |
| `app_name` | `string \| null` | Conditional | App display name | Required when `app_only === true`, `null` otherwise | `login_app` |
| `app_store_links` | `{ ios: string, android: string } \| null` | Conditional | Valid URLs | Required when `app_only === true`, `null` otherwise | `login_app` |
| `auto_detects_ipoe` | `boolean` | **Always** | `true`, `false` | Never omitted. Default `false` if uncertain during research. | Step sequencing |
| `supports_https` | `boolean` | Always | `true`, `false` | Default `false` if undocumented. | `login_web` (protocol + HTTPS warning) |
| `notes` | `string \| null` | Optional | Free text | — | `login_web` (tooltips, fallback info) |

**Normalization rules:**
- **`alt_access`:** Strip any protocol prefix during research. Store bare hostname only. The frontend prepends `http://` or `https://` based on `supports_https`. Examples: `"tplinkwifi.net"` (correct), `"http://mygateway/"` (incorrect — normalize to `"mygateway"`).
- **`credential_type`:** Always populate explicitly. Never leave absent and expect the frontend to infer from null username/password fields.
- **`app_only`:** Always populate explicitly as `true` or `false`. Never omit to imply `false`.
- **`auto_detects_ipoe`:** Always populate explicitly. When research is inconclusive, use `false` (conservative — shows the config step rather than skipping it).

### 6.2 `setup.wan_config`

**Structure:**
```
wan_config
├── ethernet        (WanConfigPath — ALWAYS present)
├── dsl             (WanConfigPath — ONLY when modem has built-in VDSL2)
├── vlan_field      (string | null)
├── vlan_nav_path   (string | null)
└── vlan_notes      (string | null)
```

**Presence rules:**
- `wan_config.ethernet` — present on **every** modem with setup data. All modems can connect via Ethernet WAN (FTTP/FTTC/HFC).
- `wan_config.dsl` — present **only** when `wan.has_vdsl2_modem === true` in the modem's main record. Omit entirely when `false` (do not include with null-valued fields).

#### WanConfigPath fields (apply to both `ethernet` and `dsl`)

| Field | Type | Required | Validation | Consumer |
|---|---|---|---|---|
| `nav_path` | `string` | Always | Breadcrumb separator: ` > ` (space-arrow-space). No trailing separator. **One path only — no alternatives, no parenthetical qualifiers.** | `navigate_and_configure` (NavBreadcrumb) |
| `nav_path_notes` | `string \| null` | Always | Plain text note for alternative paths or qualifiers. Rendered below breadcrumb in caption style. | `navigate_and_configure` (helper text) |
| `connection_type_field` | `string` | Always | Exact label from modem's admin UI | `navigate_and_configure` (field label) |
| `ipoe_label` | `string` | Always | **Exact option text only** from modem's admin UI. No parenthetical explanations — those go in `ipoe_notes`. | `navigate_and_configure` (setting value chip) |
| `ipoe_notes` | `string \| null` | Always | Plain text explanation of the setting value, if needed. Rendered below the setting chip in caption style. | `navigate_and_configure` (helper text) |
| `save_button_label` | `string` | Always | Exact button text: `"Save"`, `"Apply"`, etc. | `navigate_and_configure` (instruction text) |
| `pppoe_clear_note` | `string \| null` | Always | Uses exact field labels from modem's admin UI. `null` when the IPoE setting change IS the PPPoE clear (e.g., Netgear "No" toggle), or when the modem is locked to IPoE. **Frontend only renders the conditional block when non-null.** | `clear_pppoe` (ConditionalBlock) |
| `steps_ipoe` | `string[]` | Always | Ordered, self-contained narrative steps | **NOT used by frontend UI** — support/agent channel only |

**`nav_path` separator contract:** The frontend splits on ` > ` (with spaces) to produce breadcrumb segments. The pipeline MUST use this exact separator. Example: `"Basic > Internet"` → breadcrumbs `["Basic", "Internet"]`.

**`nav_path` must contain exactly one path.** No alternative paths (e.g., `"Basic > Internet (or ADVANCED > Setup)"` is INVALID). No parenthetical qualifiers (e.g., `"Internet Access (broadband tab)"` is INVALID). If the modem has an alternative navigation path or a qualifying note, put it in `nav_path_notes`. The frontend renders `nav_path_notes` as plain caption text below the breadcrumb.

**`ipoe_label` must be the exact UI option text, nothing more.** No parenthetical explanations (e.g., `"No (DHCP is the default)"` is INVALID — use `"No"` with explanation in `ipoe_notes`). The frontend renders this value inside a setting-value chip — anything beyond the literal option text creates a messy chip. If the customer needs context about what the setting means, put it in `ipoe_notes`.

**`ipoe_label` known examples:**
- `"Dynamic IP"` (TP-Link)
- `"Automatic IP"` (ASUS)
- `"DHCP"` (Eero, Google Nest)
- `"Dynamic IP (DHCP)"` (D-Link — this IS the exact dropdown text)
- `"Automatic Configuration - DHCP"` (Linksys)
- `"No"` (Netgear — inverted question: "Does your connection require a login?")
- `"IPoE / DHCP / Dynamic"` (Telstra — ISP firmware may vary)
- `"IPoE / DHCP"` (Sagemcom)

Do NOT normalize these. The frontend renders them verbatim because the customer needs to match what they see on screen. But do NOT append explanations — use `ipoe_notes` for that.

**`pppoe_clear_note` conditional rendering:** The frontend only shows the PPPoE conditional block when this field is non-null. Set to `null` when:
- The modem auto-detects IPoE (`auto_detects_ipoe === true`)
- The modem is locked to IPoE (no PPPoE settings exist)
- Setting `ipoe_label` IS the PPPoE clear action (e.g., Netgear's "No" toggle — changing the setting to "No" already clears PPPoE, so the conditional block would duplicate the main instruction)

**`steps_ipoe` purpose:** This flat string array is for support agents and chat bots that guide customers through setup over the phone. The frontend UI does NOT render these — it uses the structured fields (`nav_path`, `connection_type_field`, `ipoe_label`, etc.) to build rich components (NavBreadcrumb, SubstepCardContainer). Both must be populated and consistent, but they serve different channels.

#### VLAN fields

| Field | Type | Required | Consumer |
|---|---|---|---|
| `vlan_field` | `string \| null` | Always | Not currently rendered. Future VLAN step. |
| `vlan_nav_path` | `string \| null` | Always | Not currently rendered. |
| `vlan_notes` | `string \| null` | Always | Not currently rendered. Document why VLAN is/isn't relevant. |

### 6.3 `setup.physical`

| Field | Type | Required | Allowed Values | Consumer |
|---|---|---|---|---|
| `wan_port_label` | `string` | Always | Free text. See parsing contract below. | `physical_connection` |
| `wan_port_color` | `string` | Always | **Closed enum:** `"blue"`, `"yellow"`, `"red"`, `"white"`, `"grey"`, `"green"`, `"black"` | `physical_connection` |
| `wan_port_position` | `string` | Always | Human-readable description | `physical_connection` |
| `wan_port_icon` | `string \| null` | Always | `"globe"`, `"ethernet"`, or `null` (text-labelled) | `physical_connection` |
| `wan_port_notes` | `string \| null` | Optional | Free text for gotchas, qualifiers | `physical_connection` (infoMessage) |
| `dsl_port_label` | `string \| null` | Conditional | Required when `wan.has_vdsl2_modem === true`, `null` otherwise | `physical_connection` (DSL tech types) |
| `dsl_port_color` | `string \| null` | Conditional | Same closed enum as `wan_port_color` | `physical_connection` |
| `dsl_port_position` | `string \| null` | Conditional | Human-readable description | `physical_connection` |
| `dsl_port_icon` | `string \| null` | Conditional | Same as `wan_port_icon` | `physical_connection` |
| `dsl_port_notes` | `string \| null` | Optional | Free text | `physical_connection` |
| `lan_ports` | `string` | Always | Free text, e.g., `"4 x Gigabit Ethernet"` | Not currently rendered |
| `other_ports` | `string` | Always | Free text | Not currently rendered |
| `reset_button` | `string` | Always | Location description | `factory_reset` reference |
| `reset_hold_seconds` | `number` | Always | Integer, typically 5-15 | `factory_reset` reference |

**`wan_port_color` normalization:** Must be a single bare color word from the allowed enum. Qualifiers go into `wan_port_notes`. This is a hard requirement — the frontend maps colors to PortTypeBadge variants (`blue`, `yellow`, `neutral`) and to connection instruction text ("Connect to the **blue**...").

Examples:
- `"blue"` — correct
- `"white (same as device)"` — incorrect. Use `"white"` and add "(same colour as the device)" to `wan_port_notes`.

**Frontend port label parsing contract:** The frontend performs light parsing of `wan_port_label` to extract the badge label:

1. Strip leading `"Either "` (detects auto-sensing ports)
2. Strip trailing `" port"`
3. Strip trailing `" icon"`
4. If `wan_port_icon` is set, override badge label to `"Ethernet"`

The pipeline should produce labels that survive this parsing cleanly. Known patterns:

| `wan_port_label` | `wan_port_icon` | Resulting badge | Connection prefix |
|---|---|---|---|
| `"WAN"` | `null` | "WAN" | "Connect to the {color}" |
| `"LAN4/WAN"` | `null` | "LAN4/WAN" | "Connect to the {color}" |
| `"Internet"` | `null` | "Internet" | "Connect to the {color}" |
| `"Either Ethernet port"` | `null` | "Ethernet" | "Connect to either" |
| `"Globe icon"` | `"globe"` | "Ethernet" (icon override) | "Connect to the {color}" |

### 6.4 `setup.factory_reset`

| Field | Type | Required | Consumer |
|---|---|---|---|
| `method` | `string` | Always | Troubleshooting flow |
| `restores_default_credentials` | `boolean` | Always | Troubleshooting (what to expect after reset) |
| `notes` | `string \| null` | Optional | Troubleshooting (edge cases, alternative methods) |

### 6.5 `setup.firmware`

| Field | Type | Required | Consumer |
|---|---|---|---|
| `check_path` | `string` | Always | Not currently rendered (future) |
| `auto_update_available` | `boolean` | Always | Not currently rendered |
| `download_url` | `string \| null` | Optional | Not currently rendered |
| `notes` | `string \| null` | Optional | Not currently rendered |

### 6.6 `setup.troubleshooting` (new — recommended extension)

This is a **new optional** object. The pipeline can add it during batch rollout or as a separate enrichment pass. The verify step works without it — the frontend falls back to generic "check your internet light" text.

| Field | Type | Required | Purpose |
|---|---|---|---|
| `internet_led_label` | `string \| null` | Optional | What the internet LED is called on this modem (`"Internet"`, `"WAN"`, `"Online"`, `"globe icon"`) |
| `internet_led_success` | `string \| null` | Optional | What success looks like (`"solid green"`, `"solid white"`) |
| `internet_led_failure` | `string \| null` | Optional | What failure looks like (`"off"`, `"solid red"`, `"flashing amber"`) |
| `common_issues` | `string[] \| null` | Optional | Modem-specific gotchas (e.g., `"The 2.5G port looks like the WAN port but is LAN-only on this model"`) |

### 6.7 Top-level `setup` fields

| Field | Type | Required | Consumer |
|---|---|---|---|
| `setup_notes` | `string` | Always | Agent/support context. Potential tooltip. |
| `manual_url` | `string \| null` | Optional | "View manual" link (manufacturer's page) |
| `manual_pdf_path` | `string \| null` | Optional | Supabase Storage path in `modem-manuals` bucket. Pipeline uploads during research; used for internal audit, adversarial validation, and customer "I need help" fallback. |
| `manual_pdf_pages` | `{ wan_config?: number, port_diagram?: number, factory_reset?: number } \| null` | Optional | Page numbers for key sections. Enables page-specific references in troubleshooting. |
| `setup_sources` | `SetupSource[]` | Always (min 2) | Not rendered in UI. Provenance record. |
| `setup_confidence` | `{ score: number, notes: string }` | Always | Rendering gate (see §8). |

**PDF manual archiving:** The pipeline should download and upload manufacturer manuals to the `modem-manuals` Supabase Storage bucket during research. This serves three purposes: (1) audit trail — source URLs die frequently, the PDF is the permanent record; (2) adversarial validation — a validation agent can re-check research claims against the archived PDF without re-fetching; (3) customer fallback — the "I need help" troubleshooting flow can link to the full manual. Store using the modem ID as filename (e.g., `tp-link-archer-vr1600v.pdf`). The `manual_pdf_pages` object lets the frontend or agent link to specific pages (e.g., "see page 37 of your modem's manual for WAN settings").

**`setup_sources[]` item schema:**

| Field | Type | Required | Allowed Values |
|---|---|---|---|
| `url` | `string` | Always | Valid URL |
| `type` | `string` | Always | `"manufacturer"`, `"isp"`, `"community"`, `"review"`, `"manual"` |
| `description` | `string` | Always | One-line description of what was found/confirmed |
| `accessed` | `string` | Always | ISO 8601 date (`YYYY-MM-DD`) |

---

## 7. Troubleshooting Decision Tree

Triggers when the customer clicks "I still need help" on the verify step. The frontend walks through checks in this order:

```
User clicks "I still need help"
│
├─ 1. Tech-type checks (Infrastructure layer — frontend templated)
│   ├─ All:  "Is your modem connected to the correct port on the nbn box?"
│   ├─ FTTP: "Is the light on your nbn wall box green?"
│   ├─ FTTC: "Is the NCD showing a solid green light?"
│   ├─ HFC:  "Power off the nbn connection box for 30 minutes, then power
│   │         it back on." (DHCP lease release)
│   └─ FTTN: "Is the DSL light on your modem solid (not flashing)?"
│
├─ 2. Modem-specific checks (Modem Setup layer — from pipeline data)
│   ├─ If troubleshooting.internet_led_label exists:
│   │   "Is the {internet_led_label} light on your modem {internet_led_success}?"
│   ├─ Else:
│   │   "Is the Internet/WAN light on your modem solid green?"
│   └─ "Are old ISP credentials still saved?" → uses pppoe_clear_note
│
├─ 3. Generic recovery (Infrastructure layer)
│   ├─ "Factory reset your modem and try the setup again"
│   │   Uses factory_reset.method, factory_reset.restores_default_credentials
│   └─ "Contact Belong support"
│
└─ 4. Modem-specific common issues (if troubleshooting.common_issues exists)
    └─ Display each item as a tip
```

---

## 8. Cross-Validation Rules

Consistency rules enforceable by both the pipeline (during research) and the frontend (as runtime guards or CI checks).

### Credential type consistency

| `credential_type` | `default_username` | `default_password` | `app_only` | `app_name` | `app_store_links` |
|---|---|---|---|---|---|
| `"standard"` | non-null string | non-null string (can be `""`) | `false` | `null` | `null` |
| `"user_created"` | `null` | `null` | `false` | `null` | `null` |
| `"isp_sticker"` | non-null string | `null` | `false` | `null` | `null` |
| `"app_only"` | `null` | `null` | `true` | non-null string | non-null object |

### WAN config consistency

| Condition | Rule |
|---|---|
| `wan.has_vdsl2_modem === true` | `wan_config.dsl` MUST exist |
| `wan.has_vdsl2_modem === false` | `wan_config.dsl` MUST NOT exist |
| `wan.has_vdsl2_modem === true` | `physical.dsl_port_label` MUST be non-null |
| `wan.has_vdsl2_modem === false` | All `physical.dsl_port_*` MUST be `null` |

### Device type consistency

| Condition | Rule |
|---|---|
| `device_type === "router"` | `wan.has_vdsl2_modem` MUST be `false` |
| `device_type === "modem_router"` | `wan.has_vdsl2_modem` can be `true` or `false` |

### Sequencing field completeness

If a step template will render for this modem, the data fields it consumes MUST all be present:

| Condition | Required fields |
|---|---|
| `app_only === false` | `admin_panel.default_ip` must be non-null |
| `app_only === false AND auto_detects_ipoe === false` | `wan_config.ethernet.nav_path`, `.connection_type_field`, `.ipoe_label`, `.save_button_label`, `.pppoe_clear_note` all non-null |
| `app_only === true` | `admin_panel.app_name` and `.app_store_links` must be non-null |

### Confidence score rendering gates

| Score | Frontend behaviour |
|---|---|
| `>= 80` | Render guide without disclaimer |
| `65 — 79` | Render guide with accuracy disclaimer banner |
| `< 65` | Do not render guide. Show "Contact support for setup help" instead. |

---

## 9. Validation Matrix

### 9.1 Step template coverage (8 pilot modems)

| Modem | power_on | physical | connect_wifi | login_web | login_app | navigate | verify | Notes |
|---|---|---|---|---|---|---|---|---|
| TP-Link Archer VR1600v | PASS | PASS | PASS | PASS | N/A | PASS | PASS | Most complex: dual WAN (ethernet + dsl), LAN4/WAN port |
| ASUS RT-AX86U | PASS | PASS | PASS | PASS | N/A | PASS | PASS | user_created creds, 2.5G port confusion note critical |
| Amazon Eero 6+ | PASS | PASS | N/A | N/A | PASS | N/A | PASS | Simplest flow. Auto-sensing ports, auto-detect IPoE. |
| Google Nest WiFi Pro | PASS | PASS | N/A | N/A | PASS | N/A | PASS | Globe icon port. Bottom-mounted. |
| D-Link DSL-2888A | PASS | PASS | PASS | PASS | N/A | PASS | PASS | Blank password (`""`). DSL requires delete-and-recreate. EOL. |
| Linksys Velop MX4200 | PASS | PASS | PASS | PASS | N/A | N/A | PASS | auto_detects_ipoe, HTTPS self-signed cert warning needed |
| Netgear Nighthawk RAX50 | PASS | PASS | PASS | PASS | N/A | PASS | PASS | Unusual ipoe_label ("No" — inverted question) |
| Telstra Smart Modem Gen 3 | PASS | PASS | PASS | PASS | N/A | PASS | PASS | isp_sticker creds. Lowest confidence (65). ISP firmware varies. |

### 9.2 Field presence gaps in pilot data

Fields that the contract requires as "always present" but are missing from some pilot JSON files. These need backfilling before batch rollout.

| Field | Eero | ASUS | TP-Link | D-Link | Linksys | Netgear | Telstra | Google Nest |
|---|---|---|---|---|---|---|---|---|
| `credential_type` | `"app_only"` | **MISSING** | **MISSING** | `"standard"` | `"user_created"` | **MISSING** | **MISSING** | **MISSING** |
| `app_only` | `true` | **MISSING** | **MISSING** | `false` | `false` | **MISSING** | **MISSING** | `true` |
| `auto_detects_ipoe` | `true` | **MISSING** | **MISSING** | `false` | `true` | **MISSING** | **MISSING** | **MISSING** |
| `supports_https` | `false` | **MISSING** | **MISSING** | `false` | `true` | **MISSING** | **MISSING** | **MISSING** |
| `save_button_label` | `"Save"` | **MISSING** | **MISSING** | `"Save"` | `"Save"` | **MISSING** | **MISSING** | **MISSING** |
| `pppoe_clear_note` | present | **MISSING** | **MISSING** | present | present | **MISSING** | **MISSING** | **MISSING** |
| `wan_port_icon` | `null` | **MISSING** | **MISSING** | `null` | `null` | **MISSING** | **MISSING** | **MISSING** |

**Summary:** Three files have all required fields: Eero, D-Link, and Linksys. Five files need backfilling: ASUS, TP-Link, Netgear, Telstra, and Google Nest — all missing `credential_type`, `auto_detects_ipoe`, `supports_https`, `save_button_label`, `pppoe_clear_note`, and `wan_port_icon`. Google Nest additionally has `app_only: true` but is missing the other fields. ASUS and TP-Link are the earliest-researched and have the most gaps.

### 9.3 Normalization issues in pilot data

| Issue | Affected files | Fix |
|---|---|---|
| `wan_port_color` contains qualifier | Eero (`"white (same as device)"`), Google Nest (`"white (same as device)"`) | Change to `"white"`, move qualifier to `wan_port_notes` |
| `alt_access` contains protocol | Telstra (`"http://mygateway/"`) | Change to `"mygateway"` |

---

## 10. Gaps & Open Questions

### Resolved in this document

1. **`steps_ipoe` is not rendered by the frontend UI** — it serves the support/agent channel only. Resolved.
2. **Step sequencing is frontend-derived, not stored in data.** No `step_order` field. Resolved.
3. **`wan_port_color` is a closed enum** of 7 values. Qualifiers go to notes. Resolved.
4. **`alt_access` stores bare hostname** — protocol is a frontend concern. Resolved.
5. **`credential_type`, `app_only`, `auto_detects_ipoe` are always explicit** — never omitted or inferred. Resolved.

### Open for future iteration

1. **`steps_structured` (typed step objects):** Should `steps_ipoe` be replaced with typed objects? Current answer: no. The flat strings serve support well. The frontend uses structured fields directly. Revisit if a third consumer emerges.

2. **Rear-panel port images (planned — Gemini extraction pipeline):** Three-stage pipeline to extract port identification images from archived PDF manuals:
   - **Stage 1 (done):** Research agent records `manual_pdf_pages.port_diagram` page number during research.
   - **Stage 2:** Extraction skill renders the full PDF page as an image and sends it to Gemini Flash with structured output prompt. Full-page extraction is preferred over cropping individual images — the surrounding text (diagram legends, callout descriptions like "1. WAN port (blue)") provides context that improves Gemini's accuracy. Gemini returns: port identification data (label, colour, position, type for each port), crop coordinates for the rear-panel diagram, and confidence.
   - **Stage 3:** Crop, resize to standard dimensions, convert to WebP, upload to `modem-images` bucket (or new `modem-port-diagrams` bucket). Add `setup.physical.port_diagram_url` field.
   - **Cost:** ~$0.15/modem (one Gemini Flash call with image + structured output). Under $11 for full database.
   - **Validation bonus:** Gemini's structured port data can be cross-checked against the text-based `physical.*` fields the research agent produced, flagging discrepancies automatically.
   - **Status:** Documented as planned enhancement. Build as batch job across archived PDFs first, then integrate into research pipeline if successful.

3. **Factory reset as prerequisite step:** Some ISP-branded modems benefit from a factory reset BEFORE setup. Current approach: handle as a warning within the login step, reading `factory_reset.notes`. Not a separate step template yet. Revisit if needed.

4. **WiFi SSID hint for `connect_wifi`:** The pipeline could capture the default SSID pattern (e.g., "TP-LINK_XXXX"). Low priority — "connect to your modem's WiFi" with "check the sticker" is sufficient.

5. **nbn UNI-D port recommendation:** Which port on the NTD to use. May come from service qualification API rather than modem data. Out of scope.

6. **`save_button_label` rendering:** Currently captured but not rendered by the frontend. The contract requires it so the pipeline captures it now; the frontend will render "Then click {save_button_label}" when ready.

---

## 11. TypeScript Interface Reference

Reference types for both projects. The pipeline produces JSON that validates against this shape. The frontend types it.

```typescript
// ---- Enums ----

type CredentialType = "standard" | "user_created" | "isp_sticker" | "app_only";

type PortColor = "blue" | "yellow" | "red" | "white" | "grey" | "green" | "black";

type PortIcon = "globe" | "ethernet";

type SourceType = "manufacturer" | "isp" | "community" | "review" | "manual";

// ---- Sub-objects ----

interface AdminPanel {
  default_ip: string;
  default_username: string | null;
  default_password: string | null;
  alt_access: string | null;
  credential_type: CredentialType;
  app_only: boolean;
  app_name: string | null;
  app_store_links: { ios: string; android: string } | null;
  auto_detects_ipoe: boolean;
  supports_https: boolean;
  notes: string | null;
}

interface WanConfigPath {
  nav_path: string;
  nav_path_notes: string | null;
  connection_type_field: string;
  ipoe_label: string;
  ipoe_notes: string | null;
  save_button_label: string;
  pppoe_clear_note: string | null;
  steps_ipoe: string[];
}

interface WanConfig {
  ethernet: WanConfigPath;
  dsl?: WanConfigPath;           // present only when wan.has_vdsl2_modem === true
  vlan_field: string | null;
  vlan_nav_path: string | null;
  vlan_notes: string | null;
}

interface PhysicalLayout {
  wan_port_label: string;
  wan_port_color: PortColor;
  wan_port_position: string;
  wan_port_icon: PortIcon | null;
  wan_port_notes: string | null;
  dsl_port_label: string | null;
  dsl_port_color: PortColor | null;
  dsl_port_position: string | null;
  dsl_port_icon: PortIcon | null;
  dsl_port_notes: string | null;
  lan_ports: string;
  other_ports: string;
  reset_button: string;
  reset_hold_seconds: number;
}

interface FactoryReset {
  method: string;
  restores_default_credentials: boolean;
  notes: string | null;
}

interface Firmware {
  check_path: string;
  auto_update_available: boolean;
  download_url: string | null;
  notes: string | null;
}

interface Troubleshooting {
  internet_led_label: string | null;
  internet_led_success: string | null;
  internet_led_failure: string | null;
  common_issues: string[] | null;
}

interface SetupSource {
  url: string;
  type: SourceType;
  description: string;
  accessed: string;              // ISO 8601 date: YYYY-MM-DD
}

interface SetupConfidence {
  score: number;                 // 0-100
  notes: string;
}

// ---- Root ----

interface ManualPdfPages {
  wan_config?: number;
  port_diagram?: number;
  factory_reset?: number;
}

interface SetupGuideData {
  admin_panel: AdminPanel;
  wan_config: WanConfig;
  physical: PhysicalLayout;
  factory_reset: FactoryReset;
  firmware: Firmware;
  troubleshooting?: Troubleshooting;
  setup_notes: string;
  manual_url: string | null;
  manual_pdf_path: string | null;
  manual_pdf_pages: ManualPdfPages | null;
  setup_sources: SetupSource[];
  setup_confidence: SetupConfidence;
}
```

---

## 12. Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-03-21 | Initial contract. 8 pilot modems validated. 8 step templates, normalization rules, cross-validation rules, rendering gates. New `troubleshooting` object proposed as optional extension. |
| 1.1 | 2026-03-22 | Added `manual_pdf_path` and `manual_pdf_pages` fields for PDF manual archiving. Pipeline downloads and uploads manuals to `modem-manuals` Supabase bucket during research for audit, adversarial validation, and customer fallback. Documented planned Gemini extraction pipeline for rear-panel port images (3-stage: page render → Gemini structured output → crop/upload). Content Voice guidelines formalized in research skill — `admin_panel.notes` recovery callout now auto-templated from `factory_reset.restores_default_credentials`. 15 modems validated (7 batch 2 added). |
