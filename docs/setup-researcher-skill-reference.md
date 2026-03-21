---
name: BYO-modem-setup-researcher
description: |
  Step-by-step research skill for adding setup guide data to modem records in the
  Belong nbn BYO Modem Compatibility Database. Produces a `setup` block inside
  each modem's existing JSON file in database/individual/.
  Prerequisite: the modem must already have a completed compatibility record.
---

# BYO Modem Setup Researcher Skill

## Role & Goal

You are a research agent adding setup guide data to the Belong nbn BYO modem compatibility database. Your job is to research how each modem is physically connected, how its admin panel is accessed, and what specific steps a customer must follow to configure it for Belong's IPoE/DHCP service.

**Accuracy is the highest priority.** A wrong admin IP means the customer can't log in. A wrong IPoE label means they select the wrong option. A wrong port colour means they plug into the wrong socket. When any of these happen, the customer calls support or gives up. When in doubt, document the uncertainty and reduce confidence.

**You never modify compatibility data.** You only add the `setup` block. The existing `compatibility`, `wan`, `wifi`, `general`, and `research` fields are the output of a separate, validated pipeline and must not be changed.

---

## Step 0: Session Setup (do this first, every time)

1. Read **`criteria/brand_setup_defaults.json`** — this is your starting-point reference for admin panel defaults per brand. These are directional, not authoritative — you MUST verify per-model.
2. Read **`docs/setup-guides-design.md`** — this is the schema reference for the `setup` block.
3. Identify your batch — pick up to 5 modems that have completed compatibility records in `database/individual/` but do NOT yet have a `setup` block.

> **Batch size rule:** Up to 5 modems per session. Never more.

> **Prerequisite check:** Before researching setup for a modem, verify the record exists and has `research.confidence_score >= 70`. Do not add setup data to records that haven't passed compatibility review.

---

## Step 1: Classify the Device

Read the existing modem record. Classify it into one of three archetypes — this determines your research strategy:

| Archetype | Characteristics | Research approach |
|-----------|----------------|-------------------|
| **Web admin** | Has a web-based admin panel (IP address + browser). Most routers and modem-routers. | Full research: admin IP, credentials, nav paths, field labels, step arrays |
| **App-only** | Configured via mobile app only. No web admin panel. Google Nest, Eero, some mesh systems. | Document app name + store links. Steps focus on physical connection. Most IPoE config is automatic. |
| **ISP-branded** | Custom firmware from ISP (Telstra, Optus, Vodafone). Admin UI differs from manufacturer stock. | Cannot use brand defaults. Must research the ISP-specific UI independently. Expect lower confidence. |

**How to classify:**
- `brand` is "Google" or "Amazon" (Eero) → **App-only**
- `isp_provided_by` is "Telstra", "Optus", or "Vodafone" → **ISP-branded**
- Everything else → **Web admin**

Edge cases:
- TPG/iiNet/Internode-supplied devices usually have **stock manufacturer firmware** pre-configured for PPPoE. Classify as **Web admin** and use the base manufacturer's brand defaults.
- Linksys Velop, Netgear Orbi — some mesh systems have a web admin panel AND an app. Classify as **Web admin** (the web panel is the reliable reference).

---

## Step 2: Load Brand Defaults (Web Admin only)

For web admin devices, load the brand's defaults from `criteria/brand_setup_defaults.json`. Note:
- `default_ip` — your starting hypothesis, to be verified
- `alt_access` — hostname alternative (e.g. routerlogin.net)
- `default_username` / `default_password` — may be wrong for specific models
- `ipoe_label` — what IPoE/DHCP is called in this brand's UI
- `wan_nav_path` — typical menu path to WAN settings
- `firmware_nav_path` — typical menu path to firmware update

**DO NOT copy brand defaults blindly.** They are a starting point. Every field must be verified by at least one per-model source. Known deviations discovered in pilot testing:

| Brand | Default file says | Reality for some models | Root cause |
|-------|------------------|------------------------|------------|
| TP-Link | `192.168.0.1` | `192.168.1.1` for DSL models (VR series) | TP-Link uses different subnets for router vs modem-router product lines |
| ASUS | `192.168.1.1` | `192.168.50.1` for AX-series | ASUS migrated newer models to new subnet |
| ASUS | `admin / admin` | No factory defaults — setup wizard forces credential creation | Modern ASUS firmware changed behaviour |
| Netgear | IPoE label: "Dynamic IP" | Actually "Does your connection require a login? → No" | Netgear uses a question format, not a dropdown label |

---

## Step 3: Research Admin Panel Access

### Search queries:
```
"[brand] [model]" default admin password login IP address
"[brand] [model]" default gateway address
```

### Extract and verify:
| Field | What to look for | Minimum sources |
|-------|-----------------|-----------------|
| `default_ip` | IP address that opens the admin panel | 2 independent sources (high-stakes — wrong IP = customer stuck at step 1) |
| `default_username` | Factory login username | 1 source + brand default agreement, OR 2 independent sources if deviating |
| `default_password` | Factory login password | Same as username |
| `alt_access` | Hostname alternative to the IP | 1 source is sufficient |
| `credential_type` | One of: `standard`, `user_created`, `isp_sticker`, `app_only` (see below) | Inferred from credentials research |
| `supports_https` | Does `https://[ip]` work for admin access? | 1 source is sufficient. Default to `false` if undocumented. |

### Credential type classification:

| Type | When to use | Example |
|------|------------|---------|
| `standard` | Device ships with known factory username + password | TP-Link admin/admin, Netgear admin/password |
| `user_created` | No factory defaults — setup wizard forces credential creation | ASUS routers, Synology routers |
| `isp_sticker` | Password is per-unit, printed on device sticker | Telstra, Optus, most ISP-branded devices |
| `app_only` | No web admin panel — configured via mobile app | Google Nest WiFi, Amazon Eero |

**Always set `credential_type` explicitly.** The UI uses this to pick the correct login card variant.

### For app-only devices:
Set `default_username`, `default_password` to `null`, `credential_type` to `"app_only"`, `app_only` to `true`. Add to `admin_panel`:
```json
"app_only": true,
"app_name": "Google Home",
"app_store_links": {
  "ios": "https://apps.apple.com/app/...",
  "android": "https://play.google.com/store/apps/details?id=..."
},
"auto_detects_ipoe": true
```
Note the default gateway IP if known (e.g. Google uses `192.168.86.1`) but clarify in `notes` that it doesn't host a web interface.

### For all non-app devices:
Set `app_only` to `false` explicitly. Never omit it — the UI branches on this field.

### auto_detects_ipoe:
Set to `true` if the device auto-detects IPoE/DHCP and requires no manual WAN configuration for Belong. This is common for app-only devices and some modern routers with auto-sensing WAN. Set to `false` for devices that require manual WAN type selection. If uncertain, set to `false` (conservative — manual instructions won't hurt).

### For ISP-branded devices:
Do NOT use manufacturer brand defaults. Search specifically:
```
"[ISP] [model]" admin login password
"[ISP] smart modem" admin panel settings
```
ISP-branded devices often use the Wi-Fi password from the device sticker. Document this in `admin_panel.notes`.

---

## Fetching Blocked Pages (use throughout all steps)

WebFetch will return 403 or empty/CSS-only content on some manufacturer and support sites (known: eero, Netgear, some TP-Link pages, ManualsLib). When this happens, use the following fallback chain before reducing confidence.

**Validated findings from testing:**
- Google Cache is unreliable for Zendesk-hosted support sites (returns JS error pages)
- Wayback Machine is completely blocked by WebFetch (cannot access `web.archive.org`)
- **PDF manuals are by far the most reliable fallback** — Australian ISP quick start guides (Tangerine, AGL, More, SpinTel) are especially useful because they're nbn-specific, have port diagrams, and are direct PDF downloads with no bot protection
- WebFetch can download PDFs, and the Read tool can parse them page by page — use `Read` with the `pages` parameter on the downloaded file

### Fallback 1: PDF manual and ISP quick start guides (try this FIRST)
```
WebSearch: "[brand] [model]" quick start guide filetype:pdf
WebSearch: "[brand] [model]" setup guide site:tangerine.com.au OR site:agl.com.au OR site:more.com.au
WebSearch: "[brand] [model]" manual filetype:pdf
WebSearch: "[brand] [model]" user guide site:[brand-domain]
```
PDF download links almost never have bot protection. Australian ISP guides (Tangerine, AGL, More, SpinTel) are the best source — they include nbn-specific connection diagrams per tech type (FTTP, FTTC, HFC), exact port layouts, LED colour tables, and step-by-step setup instructions with screenshots. Manufacturer manuals are also excellent for admin panel field labels and port diagrams.

**How to use PDFs:** WebFetch will download the file. Then use `Read` with `pages: "1-10"` (or similar) to view the content. PDFs with diagrams render as images that Claude can interpret directly.

### Fallback 2: Alternative pages on the same site
Manufacturer support sites often have multiple pages per model. If the product page is blocked, try:
- The support/downloads page for that model
- FAQ articles about WAN setup or factory reset
- The quick start guide (often a separate URL from the main product page)

### Fallback 3: Google Cache (unreliable but worth trying)
```
WebFetch: https://webcache.googleusercontent.com/search?q=cache:[original-url]
```
Google's cached version sometimes has the full page text. However, testing showed this returns JS error pages for Zendesk-hosted support sites (eero, some Netgear pages). Try it, but don't rely on it.

### Fallback 4: Wayback Machine (currently blocked — skip unless WebFetch changes)
`web.archive.org` is blocked by WebFetch. Do not attempt — it will fail silently. If WebFetch gains access to archive.org in the future, this becomes a viable fallback.

### When all fallbacks fail
If you cannot fetch the page content through any fallback:
- **Do NOT invent content.** Use only what WebSearch result snippets provide.
- Note the failure in `setup_confidence.notes` with the specific URL and error.
- Note which fallbacks you tried and their results.
- Reduce confidence by −5 per blocked primary source (manufacturer page, official manual).
- If the blocked source was the *only* source for a high-stakes field (`nav_path`, `ipoe_label`, `default_ip`), reduce by −10 and flag for human verification.

---

## Step 4: Research WAN Configuration Path

This is the most critical step. You need to find the exact click path a customer follows to change their WAN connection type to IPoE/DHCP.

### Search queries (in priority order):

**1. Australian ISP setup guides (best source — step-by-step with screenshots):**
```
"[model]" PPPoE to DHCP site:help.lip.net.au
"[model]" setup nbn site:help.iinet.net.au
"[model]" setup nbn site:help.pentanet.com.au
"[model]" setup nbn site:articles.spintel.net.au
"[model]" nbn setup guide site:swoop.com.au
"[model]" setup nbn site:support.myowntel.net.au
```

**2. Manufacturer support FAQs:**
```
"[brand] [model]" WAN connection type site:[brand-domain]
"[brand]" "WAN Connection Type" IPoE OR DHCP site:[brand-domain]
```

**3. Community confirmation:**
```
"[brand] [model]" IPoE OR DHCP OR "Dynamic IP" site:whirlpool.net.au
"[brand] [model]" configure nbn site:forums.whirlpool.net.au
```

**4. General:**
```
"[brand] [model]" change PPPoE to Dynamic IP DHCP WAN setup
```

### Extract:

| Field | What to look for | Stakes |
|-------|-----------------|--------|
| `nav_path` | Exact breadcrumb: e.g. "Advanced > Network > Internet" | High — wrong path = customer gets lost |
| `connection_type_field` | Label on the dropdown/field | High — customer needs to find this element |
| `ipoe_label` | What to select: "Dynamic IP", "Automatic IP", "No" | **Critical** — wrong selection = no internet |
| `save_button_label` | "Save", "Apply", "OK", "Apply Changes" — the exact text on the save button | Medium — wrong label = customer looks for wrong button |
| `pppoe_clear_note` | What the PPPoE fields are labeled: e.g. "Username" and "Password", or "PPPoE Username" | Medium — helps customers coming from PPPoE ISPs clear the right fields |

### CRITICAL: Check for dual WAN paths (modem-routers)

If `has_vdsl2_modem: true`, the device almost certainly has **two different configuration paths**:

| Connection | WAN path | Typical complexity |
|-----------|----------|-------------------|
| Ethernet (FTTP/FTTC/HFC) | Often under Basic or Internet settings | Simple — change one dropdown |
| DSL (FTTN/B) | Often under Advanced > Network > DSL | Complex — may require deleting existing connections and creating new ones |

**You MUST research both paths.** Store them separately:
```json
"wan_config": {
  "ethernet": { "nav_path": "...", "steps_ipoe": [...] },
  "dsl": { "nav_path": "...", "steps_ipoe": [...] }
}
```

If `has_vdsl2_modem: false`, only `wan_config.ethernet` applies. **Do not include `wan_config.dsl`.**

### Probe for "delete and recreate" flows

Many modem-routers cannot switch a DSL connection from PPPoE to Dynamic IP with a simple dropdown change. The existing connection must be **deleted** and a **new one created**. This is especially common on:
- TP-Link VR-series (confirmed in pilot)
- D-Link DSL models
- Some DrayTek models

If your source shows steps like "Delete All" → "Add" → configure, the `steps_ipoe` array must reflect this exact flow.

---

## Step 5: Write the steps_ipoe Array

Each step must be:
1. **Specific** — use the exact field labels and menu names from the modem's UI
2. **Sequenced** — in the order the customer performs them
3. **Self-contained** — include the login step and the save/apply step
4. **Unambiguous** — no room for misinterpretation

### Quality test — bad vs good:

| Bad | Good | Why |
|-----|------|-----|
| "Configure the modem for DHCP" | "Change 'Internet Connection Type' from 'PPPoE' to 'Dynamic IP'" | Exact field name and exact value |
| "Access the WAN settings" | "Click the 'Advanced' tab at the top, then expand 'Network' in the left sidebar and click 'DSL'" | Click-by-click navigation |
| "Log in to your modem" | "Open a web browser and go to http://192.168.1.1 (or http://tplinkwifi.net)" | Exact URL with alternative |
| "Enter your credentials" | "Log in with username 'admin' and password 'admin'" | Exact values |
| "Save your changes" | "Click 'Save' and wait 1-2 minutes for the modem to reconnect" | Includes expected wait time |

### Physical connection as first step

Every `steps_ipoe` array should start with the physical connection instruction, tailored to the WAN type:

- **Ethernet (FTTP/FTTC/HFC):** "Connect an Ethernet cable from the nbn connection box to the [colour] [label] port on the [position] of the [device]"
- **DSL (FTTN/B):** "Connect a phone cable from the telephone wall socket to the [colour] [label] port on the [position] of the modem"

---

## Step 6: Research Physical Layout

### Search queries:
```
"[brand] [model]" rear panel ports WAN DSL
"[brand] [model]" back panel port layout colour
"[brand] [model]" quick start guide port diagram
```

### Extract:

| Field | What to look for |
|-------|-----------------|
| `wan_port_label` | What the port is labeled: "WAN", "Internet", "LAN4/WAN", globe icon |
| `wan_port_color` | Concrete colour: blue, yellow, red, white |
| `wan_port_position` | Human description: "leftmost when viewed from rear" |
| `wan_port_icon` | If the port uses an icon instead of text: "globe", "ethernet", "chain link", or `null` if text-labeled |
| `wan_port_notes` | Any confusion risk (dual-purpose ports, 2.5G ports that look like WAN but aren't) |
| `dsl_port_*` | Same fields for DSL port (only for modem-routers), including `dsl_port_icon` |
| `lan_ports` | Count and speed: "4 x Gigabit Ethernet" |
| `other_ports` | USB, phone/VoIP ports |
| `reset_button` | Location: "recessed pinhole on rear panel" |
| `reset_hold_seconds` | Duration: typically 5-15 seconds. Default to 10 if undocumented. |

### Document port confusion risks

Port confusion is a real customer problem. Discovered in pilot testing:
- **TP-Link VR1600v:** WAN port labeled "LAN4/WAN" — dual-purpose port
- **ASUS RT-AX86U:** 2.5G port is first from left, looks like WAN, but is LAN-only
- **Google Nest WiFi Pro:** Ports on the **bottom** of the device, not the rear
- **Telstra Smart Modem Gen 3:** WAN port is **red** (most other brands use blue or yellow)

Always capture these in `wan_port_notes`.

---

## Step 7: Research Factory Reset and Firmware

### Factory reset:
```
"[brand] [model]" factory reset button hold seconds
```

| Field | Extract |
|-------|---------|
| `method` | Full procedure: location, tool needed, hold duration, LED behaviour |
| `restores_default_credentials` | `true` if reset restores factory admin/password. `false` if it re-runs setup wizard (ASUS) or requires app re-setup (Google, Eero). |
| `notes` | Warnings: "erases all settings including Wi-Fi name", "ISP-branded devices may re-lock" |

### Firmware:
```
"[brand] [model]" firmware update admin menu path
"[brand] [model]" firmware download site:[brand-domain]
```

| Field | Extract |
|-------|---------|
| `check_path` | Admin panel path: "ADVANCED > Administration > Firmware Update" |
| `auto_update_available` | Does the modem check online for updates? |
| `download_url` | Manufacturer's firmware/support page for this model |
| `notes` | ISP firmware won't update with other ISPs. Merlin alternatives. Known firmware issues. |

### Special cases:
- **App-only:** Firmware is automatic. Set `check_path` to "Automatic — no user action required", `download_url` to `null`.
- **ISP-branded:** Firmware controlled by ISP. Note that updates stop when used with another provider.

---

## Step 8: Find the Manual URL

```
"[brand] [model]" user manual support downloads site:[brand-domain]
"[brand] [model]" support downloads australia
```

Store the URL to the support/downloads landing page (more stable than a direct PDF link). Prefer the Australian (.com.au) version. Add to `setup.manual_url`.

---

## Step 9: Calculate Setup Confidence

Start at **100**, subtract:

| Issue | Deduction | Rationale |
|-------|-----------|-----------|
| No user manual or ISP setup guide found | −20 | Primary source for nav paths unavailable |
| Admin IP uncertain or has known variants across firmware | −5 | Customer may try wrong address |
| Admin nav path not verified by per-model source (brand default only) | −10 | Path may not match this model's UI |
| Default credentials unconfirmed for this model | −5 | May be wrong |
| IPoE label unconfirmed (using brand default only) | −5 | Customer may select wrong option |
| Physical port layout not verified (no image or diagram) | −5 | Can't confidently describe what customer sees |
| ISP-branded firmware with no public documentation | −15 | Custom admin UI is undocumented |
| App-only device with limited documentation | −10 | App UI can change without notice |
| Manual is for non-AU market variant | −10 | UI language or options may differ |
| Conflicting sources on a field value | −15 | Cannot determine correct answer |
| Manufacturer support pages couldn't be fetched — **after trying all fallbacks** (Google Cache, Wayback, PDF manual) | −5 | Content unverifiable |
| Blocked source was the only source for a high-stakes field (nav_path, ipoe_label, default_ip) | −10 | Critical field unverifiable — flag for human fetch |

**Minimum threshold: 65.** Below this, the guide risks actively misleading customers.

**Deep research round (if below 70):**
1. Search for technical manuals: `"[model]" manual filetype:pdf`
2. Search smaller Australian ISP guides (SpinTel, Tangerine, Swoop, Upstream Tech, MyOwnTel, Simply Broadband)
3. Check manufacturer community forums
4. Recalculate after findings

**Document every deduction** in `setup_confidence.notes` with the specific field and gap. "Score: 100 - 10 (nav path brand default only, not verified per-model) - 5 (IP ambiguity between 192.168.1.1 and 192.168.50.1) = 85."

---

## Step 10: Write the Setup Block

Add the `setup` object to the existing modem record. **Do not modify any other fields.**

```json
{
  "setup": {
    "admin_panel": {
      "default_ip": "192.168.1.1",
      "default_username": "admin",
      "default_password": "admin",
      "alt_access": "tplinkwifi.net",
      "credential_type": "standard",
      "app_only": false,
      "auto_detects_ipoe": false,
      "supports_https": false,
      "notes": "String or null"
    },
    "wan_config": {
      "ethernet": {
        "nav_path": "Basic > Internet",
        "connection_type_field": "Internet Connection Type",
        "ipoe_label": "Dynamic IP",
        "save_button_label": "Save",
        "pppoe_clear_note": "Clear the 'Username' and 'Password' fields if populated",
        "steps_ipoe": ["step 1", "step 2", "..."]
      },
      "dsl": {
        "nav_path": "Advanced > Network > DSL",
        "connection_type_field": "Internet Connection Type",
        "ipoe_label": "Dynamic IP",
        "save_button_label": "Save",
        "pppoe_clear_note": "Clear the 'Username' and 'Password' fields if populated",
        "steps_ipoe": ["step 1", "step 2", "..."]
      },
      "vlan_field": "VLAN ID or null",
      "vlan_nav_path": "path or null",
      "vlan_notes": "String or null"
    },
    "physical": {
      "wan_port_label": "WAN",
      "wan_port_color": "blue",
      "wan_port_position": "leftmost when viewed from rear",
      "wan_port_icon": "null or globe/ethernet/chain-link",
      "wan_port_notes": "String or null",
      "dsl_port_label": "DSL or null",
      "dsl_port_color": "grey or null",
      "dsl_port_position": "String or null",
      "dsl_port_icon": "null",
      "dsl_port_notes": "String or null",
      "lan_ports": "4 x Gigabit Ethernet",
      "other_ports": "1 x USB 3.0",
      "reset_button": "Recessed pinhole on rear panel",
      "reset_hold_seconds": 10
    },
    "factory_reset": {
      "method": "Full procedure description",
      "restores_default_credentials": true,
      "notes": "String or null"
    },
    "firmware": {
      "check_path": "Advanced > System Tools > Firmware Upgrade",
      "auto_update_available": true,
      "download_url": "https://... or null",
      "notes": "String or null"
    },
    "setup_notes": "2-5 sentences of prose: key gotchas, ISP context, anything a customer or agent should know.",
    "manual_url": "https://... or null",
    "setup_sources": [
      {
        "url": "https://...",
        "type": "isp",
        "description": "One-line description of what this source covers",
        "accessed": "2026-03-20"
      }
    ],
    "setup_confidence": {
      "score": 85,
      "notes": "Per-deduction breakdown."
    }
  }
}
```

### Schema rules:

- `wan_config.dsl` — **omit entirely** if `has_vdsl2_modem: false`. Do not include with null values.
- `dsl_port_*` fields — set all to `null` if `has_vdsl2_modem: false`.
- `admin_panel.default_username` / `default_password` — set to `null` if no factory defaults exist (ASUS setup wizard, app-only devices, Synology).
- `admin_panel.credential_type` — **always required**. One of: `standard`, `user_created`, `isp_sticker`, `app_only`.
- `admin_panel.app_only` — **always required**. Explicitly `true` or `false`, never omitted.
- `admin_panel.auto_detects_ipoe` — **always required**. `true` if no manual WAN config needed, `false` otherwise.
- `admin_panel.supports_https` — `true` or `false`. Default `false` if undocumented.
- For app-only devices — add `app_only: true`, `app_name`, and `app_store_links` to `admin_panel`.
- `wan_config.*.save_button_label` — exact text on the save/apply button. Research from the same source as `nav_path`.
- `wan_config.*.pppoe_clear_note` — describe which fields to clear when switching from PPPoE. Use exact field labels from the modem's UI.
- `physical.wan_port_icon` — set to icon description if port uses an icon instead of text label (e.g. `"globe"` for Google Nest). Set to `null` if text-labeled.
- `steps_ipoe` — always include the physical connection step first, the login step, the navigation, the setting change, and the save/apply step. Never assume the customer knows how to get in or that changes auto-save.
- `setup_sources[].type` — one of: `manufacturer`, `isp`, `community`, `review`, `manual`.
- `setup_sources[].description` — **required**. One-line description of what this source covers and why it was used.
- Dates: ISO 8601 format.

---

## Step 11: Cross-Validation (after all modems in batch)

Run these checks across all completed records before finishing:

### Admin panel consistency:
- Brand default IP matches documented default → good. Deviation is fine IF documented in `admin_panel.notes` with explanation.
- `default_username` and `default_password` are both null → `credential_type` must be `user_created` or `app_only`, and `notes` must explain why.
- `credential_type` matches the credential data: `standard` → both user+pass populated. `user_created` → both null. `isp_sticker` → username populated, password in notes. `app_only` → both null + `app_only: true`.
- `app_only` is explicitly set on every record (never missing).
- `auto_detects_ipoe` is set: `true` for app-only devices and confirmed auto-sensing routers, `false` for everything else.
- `alt_access` is populated for brands known to have one (TP-Link, ASUS, Netgear, Synology, Linksys).

### WAN config completeness:
- `has_vdsl2_modem: true` → `wan_config.dsl` must exist with its own `steps_ipoe`.
- `has_vdsl2_modem: false` → `wan_config.dsl` must NOT exist.
- Every `steps_ipoe` array starts with a physical connection or login step and ends with a save/wait step.
- `ipoe_label` is populated and specific — not a generic "DHCP" but the exact label from this modem's UI.
- `save_button_label` is populated for every wan_config path — "Save", "Apply", etc.
- `pppoe_clear_note` is populated with specific field labels from this modem's UI.

### Physical port consistency:
- `device_type: "modem_router"` → `dsl_port_label` should be populated.
- `device_type: "router"` → `dsl_port_*` should all be null.
- `wan_port_color` is a concrete colour word (blue, yellow, red, white), not "standard" or "N/A".

### Source quality:
- At least 2 sources per modem.
- At least 1 source is per-model specific (not just brand defaults or generic manufacturer FAQ).
- Source URLs are real (not made up or hallucinated).

### Confidence arithmetic:
- Score matches the deductions in `setup_confidence.notes`. Add up the deductions and verify.
- No modem below 65 without clear documentation of what's missing.

---

## Verification Questions

Before marking a modem complete, ask yourself these five questions. If you answer "no" or "unsure" to any, investigate further or reduce confidence accordingly.

1. **Could I follow these steps myself to get online?** Read the `steps_ipoe` array as if you were a non-technical customer sitting in front of this modem for the first time. Is anything missing, ambiguous, or out of order?

2. **If I type the default IP into a browser, will I see the admin panel?** Is the IP confirmed by a per-model source, or only by brand defaults? If only brand defaults, have you checked whether this model's product category (DSL vs non-DSL, mesh vs standalone) uses a different subnet?

3. **If the modem was previously on TPG (PPPoE), will these steps switch it to Belong (IPoE)?** Do the steps explicitly address clearing PPPoE credentials and selecting the correct IPoE/DHCP option? For DSL modem-routers, do the DSL-specific steps handle the "delete and recreate" flow?

4. **Could a customer identify the correct port from my description alone?** If I say "blue WAN port, second from left when viewed from rear," could they find it without a diagram? Have I warned about nearby ports that look similar but aren't WAN?

5. **If something goes wrong, do the factory reset instructions get them back to a known state?** Is the reset method documented with button location and hold duration? Do they know what credentials to use after a reset?

---

## Common Pitfalls

- **Copying brand defaults without verification.** The brand defaults file is a research accelerator, not a data source. Every field must be confirmed by at least one per-model source. IPs are wrong more often than anything else.

- **Netgear's "login required" field.** Netgear doesn't use a dropdown labeled "DHCP" or "Dynamic IP." It asks "Does your Internet connection require a login?" — select "No" for IPoE. If you write "change to DHCP" for a Netgear, the customer won't find that option.

- **ASUS has no factory default credentials.** ASUS routers force credential creation during initial setup. After factory reset, the setup wizard runs again. Do NOT write "log in with admin/admin" for any ASUS device.

- **Telstra/Optus password is per-unit.** ISP-branded devices use the Wi-Fi password printed on the bottom sticker. It is NOT "admin" or "Telstra." Every unit is different. Document this clearly.

- **Dual WAN paths on modem-routers.** Any device with `has_vdsl2_modem: true` likely has different admin panel paths for Ethernet WAN vs DSL. If you only document one path, customers on the wrong tech type get the wrong instructions. Always research both.

- **DSL setup often requires "delete and recreate."** Many modem-routers cannot switch a DSL connection from PPPoE to Dynamic IP with a dropdown. The existing connection must be deleted and a new one created with VDSL modulation selected. Probe for this specifically in your research.

- **App-only devices auto-detect IPoE.** Google Nest and Eero typically auto-configure for DHCP. Steps are mostly "plug in and wait." Only document manual WAN settings change for when the device was previously configured for PPPoE.

- **Ports on the bottom.** Google Nest WiFi Pro has its ports on the bottom, not the rear. Always describe port positions relative to where the customer will actually look.

- **"DHCP" means different things in WAN vs LAN context.** WAN-side DHCP = "get an IP from the ISP" (what we want). LAN-side DHCP = "give IPs to connected devices." Never confuse these in steps.

- **ISP-branded firmware stops updating.** Telstra/Optus firmware updates are pushed by the ISP. When the device is used with Belong, it stops receiving updates. Always note this in `firmware.notes`.

---

## Files Reference

| File | Purpose |
|------|---------|
| `database/individual/{id}.json` | **Input AND output** — read existing record, add `setup` block |
| `criteria/brand_setup_defaults.json` | Brand-level starting points (verify, don't trust) |
| `docs/setup-guides-design.md` | Schema reference and design decisions |
| `docs/setup-guides-test-run-findings.md` | Pilot learnings, known gotchas, validated search strategies |
| `docs/context_and_requirements.md` | Compatibility schema and condition codes |

## Quick Reference: IPoE Labels by Brand

| Brand | IPoE Label in Admin UI | Verification Status |
|-------|----------------------|---------------------|
| TP-Link | Dynamic IP | Confirmed (VR1600v pilot) |
| ASUS | Automatic IP | Confirmed (RT-AX86U pilot) |
| Netgear | "No" (answer to "Does your connection require a login?") | Confirmed (RAX50 pilot) |
| D-Link | DHCP Client | Brand default — unverified per-model |
| Linksys | Automatic Configuration - DHCP | Brand default — unverified per-model |
| DrayTek | DHCP | Brand default — unverified per-model |
| Synology | DHCP | Brand default — unverified per-model |
| Google | DHCP (in Google Home app) | Confirmed (Nest WiFi Pro pilot) |
| Amazon/Eero | Automatic (in Eero app) | Brand default — unverified per-model |
| Telstra | IPoE / DHCP / Dynamic (varies by firmware) | Partially confirmed (Gen 3 pilot — exact label uncertain) |

## Quick Reference: Belong Protocol

**Belong uses IPoE (DHCP / Dynamic IP).** No username. No password. No VLAN tagging.

The customer's modem WAN interface must be set to IPoE / DHCP / Dynamic IP / Automatic. That's it. If the modem was previously on a PPPoE ISP (TPG, iiNet, Internode, Vodafone, Dodo, iPrimus), the main task is switching the WAN connection type and clearing old credentials.

**IPoE ISPs** (modem likely works out of box): Telstra, Optus, Aussie Broadband, Superloop, Belong, Launtel
**PPPoE ISPs** (modem needs WAN reconfiguration): TPG, iiNet, Internode, Vodafone, Dodo, iPrimus
