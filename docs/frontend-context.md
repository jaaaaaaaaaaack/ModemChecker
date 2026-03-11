# Belong nbn Modem Compatibility Checker — Frontend Context

## Purpose

Build an embeddable widget (React + Vite) that lets a user check whether their existing modem/router is compatible with Belong nbn. The widget is designed to live inside Belong's checkout flow or support pages. A user types in their modem model name, sees a clear compatibility result for their nbn tech type, and is told what (if anything) they need to do.

---

## Form Factor

- React + Vite — no SSR required, self-contained SPA component
- Embeddable via `<script>` tag or as an npm package into a host site
- Should look polished as a standalone page during development, but be designed as a widget (fixed max-width, no global layout dependencies)

---

## Supabase Backend

All data lives in a production Supabase project. The frontend queries it directly via the public REST API (RLS is enabled with public SELECT-only policies — no auth needed).

| Key | Value |
|-----|-------|
| Project ID | mgkdulkdngifkzpgzofk |
| Region | ap-northeast-1 (Tokyo) |
| URL | https://mgkdulkdngifkzpgzofk.supabase.co |
| Publishable (anon) key | (Jack to provide — get from Supabase dashboard → Project Settings → API) |
| RLS | Enabled — public SELECT only, no writes |

### Tables

#### `modems` (70 rows)

Primary table. Key columns:

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT (PK) | Slug e.g. `tp-link-archer-vr1600v` |
| brand | TEXT | e.g. `TP-Link` |
| model | TEXT | e.g. `Archer VR1600v` |
| alternative_names | TEXT[] | Search aliases |
| device_type | ENUM | `router`, `modem_router`, `modem` |
| isp_provided_by | TEXT | e.g. `TPG`, `Telstra`, `null` |
| is_isp_locked | BOOLEAN | |
| compatibility | JSONB | See schema below |
| wan | JSONB | WAN port speed, VDSL2 details |
| wifi | JSONB | Wi-Fi standard, bands, speeds |
| general | JSONB | Release year, still_sold, EOL, manufacturer URL |
| research_notes | TEXT | Internal notes (probably not shown in UI) |
| search_vector | TSVECTOR | GIN-indexed for full-text search |

#### `compatibility` JSONB shape

```json
{
  "fttp": { "status": "yes|no|yes_but", "conditions": ["CODE1", "CODE2"] },
  "fttc": { "status": "yes|no|yes_but", "conditions": [] },
  "fttn": { "status": "yes|no|yes_but", "conditions": ["MISSING_SOS_ROC"] },
  "hfc":  { "status": "yes|no|yes_but", "conditions": [] }
}
```

#### `wan` JSONB shape

```json
{
  "has_vdsl2_modem": true,
  "wan_port_speed_mbps": 1000,
  "vdsl2": {
    "profiles": ["17a"],
    "supports_vectoring": true,
    "supports_sra": true,
    "supports_sos": true,
    "supports_roc": true
  }
}
```

#### `wifi` JSONB shape

```json
{
  "wifi_standard": "Wi-Fi 5 (802.11ac)",
  "wifi_generation": 5,
  "bands": ["2.4GHz", "5GHz"],
  "max_speed_mbps": {
    "theoretical_combined": 1600,
    "per_band": { "2.4ghz": 300, "5ghz": 1300 }
  }
}
```

#### `general` JSONB shape

```json
{
  "release_year": 2019,
  "still_sold": false,
  "end_of_life": false,
  "manufacturer_url": "https://..."
}
```

#### `modem_sources` (285 rows)

Research sources per modem. Columns: `modem_id`, `url`, `type`, `accessed`, `title`, `notes`. Probably not needed in the widget UI, but available.

---

## Recommended Supabase Queries

### Full-text search (primary search method)

```sql
SELECT id, brand, model, alternative_names, device_type, isp_provided_by, is_isp_locked, compatibility, wan, wifi, general
FROM modems
WHERE search_vector @@ plainto_tsquery('english', 'tp-link archer vr1600v')
ORDER BY ts_rank(search_vector, plainto_tsquery('english', 'tp-link archer vr1600v')) DESC
LIMIT 10;
```

Via Supabase JS client:

```js
const { data } = await supabase
  .from('modems')
  .select('id, brand, model, alternative_names, device_type, isp_provided_by, is_isp_locked, compatibility, wan, wifi, general')
  .textSearch('search_vector', query, { type: 'plain', config: 'english' })
  .limit(10);
```

### Fetch single modem by ID

```js
const { data } = await supabase
  .from('modems')
  .select('*')
  .eq('id', modemId)
  .single();
```

---

## Business Logic

### nbn Technology Types

The widget receives the user's nbn tech type as a prop from the host page (which has already resolved it via an address lookup). The widget does not ask the user to select it. The 4 possible values are:

| Tech Type | Connection | Description |
|-----------|-----------|-------------|
| FTTP | Fibre to the Premises | Fibre all the way — no DSL modem needed |
| FTTC | Fibre to the Curb | Short copper tail — no DSL modem needed |
| FTTN/B | Fibre to the Node/Building | Longer copper — requires VDSL2 modem |
| HFC | Hybrid Fibre Coaxial | Cable — no DSL modem needed |

> For FTTN/B, the modem must have a built-in VDSL2 modem. A router-only device will show as incompatible.

### Compatibility Statuses

Three possible statuses per tech type:

| Status | Meaning | UI Treatment |
|--------|---------|-------------|
| `yes` | Fully compatible, no action needed | ✅ Green — compatible |
| `yes_but` | Compatible but requires action/note | 🟡 Yellow/amber — compatible with caveats |
| `no` | Not compatible | ❌ Red — not compatible |

### Condition Codes

When status is `yes_but` or `no`, one or more condition codes explain why. Show human-readable messages for each:

| Code | Human Label | When to Show |
|------|-------------|-------------|
| `SWITCH_TO_IPOE` | Reconfigure to IPoE | Modem came from a PPPoE ISP (TPG, iiNet, Dodo, Vodafone, iPrimus, Internode). Must switch from PPPoE to IPoE/DHCP. |
| `DISABLE_VLAN` | Disable VLAN tagging | Some ISP configs use VLAN tagging incompatible with Belong. |
| `ISP_LOCK` | May be ISP-locked | Device may be locked to original ISP — check before purchasing. |
| `MISSING_SOS_ROC` | Missing SOS/ROC support | Critical for FTTN/B since March 2022 — may cause dropouts. |
| `WAN_PORT_LIMIT` | WAN port speed bottleneck | 100 Mbps WAN port will cap speeds on nbn 100+ plans. |
| `NEEDS_2_5G_WAN` | 2.5G WAN recommended | For nbn 500/1000 plans, a 1 Gbps WAN port will be a bottleneck. |
| `FIRMWARE_UPDATE` | Firmware update required | Must update firmware before use with Belong. |
| `BRIDGE_MODE` | Requires bridge mode | Must be configured in bridge mode (typically because it has a built-in modem). |
| `NO_VOIP` | No VoIP support | Device doesn't support VoIP if needed. |
| `EOL` | End of life | Device is no longer supported — security/compatibility risk. |

### Belong Uses IPoE (Important)

Belong uses IPoE/DHCP — NOT PPPoE. This means:

- No username/password login required
- No VLAN tagging needed
- Modems from PPPoE ISPs (TPG, iiNet, etc.) will need reconfiguration (`SWITCH_TO_IPOE`)
- Modems from IPoE ISPs (Telstra, Optus, Aussie Broadband, Superloop, Belong itself) work without reconfiguration

### WAN Speed Guidance

Useful for showing "will your modem bottleneck your plan":

| WAN Port | Plan Tier | Result |
|----------|-----------|--------|
| 100 Mbps | nbn 25 / nbn 50 | ✅ Sufficient |
| 100 Mbps | nbn 100+ | ⚠️ Bottleneck |
| 1 Gbps | nbn 500 / nbn 1000 | ⚠️ Slight bottleneck (~940 Mbps max) |
| 2.5 Gbps | nbn 500 / nbn 1000 | ✅ Sufficient |

---

## Suggested User Flow

**Step 1 — Modem search:** User types their modem brand + model. Live search against Supabase full-text index. Show a dropdown of matching results (brand + model + device_type badge).

**Step 2 — Result:** Show a clear compatibility verdict for the user's nbn tech type (passed in as a prop — not selected by the user):
- Large status indicator (yes / yes_but / no)
- List of condition cards for any applicable codes
- Device summary (brand, model, device type, WAN speed, Wi-Fi specs if relevant)
- Optional: confidence score indicator (most are 85–95)

**Not found fallback:** If no match, show a "We don't have data on this modem yet" message and optionally a link to Belong support.

---

## Device Types & Icons

| Type | Description |
|------|-------------|
| `router` | Router (no built-in modem; incompatible with FTTN/B) |
| `modem_router` | Modem + router combo (most common; works with all tech types if VDSL2 capable) |
| `modem` | Standalone modem only (rare; 1 record: DrayTek Vigor 130) |

---

## Product Images

- **Status:** Not complete — only ~2/70 images downloaded
- Images will be stored at a URL TBD (likely Supabase Storage or CDN)
- For now, the widget should gracefully handle missing images (placeholder/fallback)
- Image column does not yet exist in the `modems` table — will be added

---

## Design References

(Jack to provide Figma links)

---

## Project File Locations

| Path | Contents |
|------|---------|
| `/Users/jack/Projects/ModemChecker-Data/` | Data project (JSON, scripts, Supabase migrations) |
| `/Users/jack/Projects/ModemChecker-Data/database/modem_database.json` | Full 70-record JSON database |
| `/Users/jack/Projects/ModemChecker-Data/docs/context_and_requirements.md` | Original full spec (538 lines) — detailed reference |
| `/Users/jack/Projects/ModemChecker-Data/docs/belong_nbn_compatibility_research.md` | IPoE/compatibility research findings |
| `/Users/jack/Projects/ModemChecker-Data/supabase/migrations/001_create_modem_schema.sql` | Full Supabase schema SQL |
| `/Users/jack/Projects/ModemChecker/` | Frontend project root (empty — start here) |
