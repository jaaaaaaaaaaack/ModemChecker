# ModemChecker Pitch: Why This Isn't "Just a Vibe-Coded Prototype"

## The Problem We're Solving

Every customer who brings their own modem into a Belong nbn signup is a support risk. They don't know if their device will work, they don't know if it needs reconfiguring, and neither do our frontline staff without digging through spec sheets. The result: failed activations, unnecessary truck rolls, and churn before the first bill.

The Modem Compatibility Checker is an embeddable widget that gives customers a definitive answer *during checkout* — before they commit.

## The Data: This Is the Hard Part, and It's Done Right

This isn't a ChatGPT-generated list of modems. The database behind this widget is a **structured, source-cited research dataset** covering **70 modems** with **285 individually tracked research sources**.

Every modem record captures:

- **Hardware specs** — WAN port speed, VDSL2 profile support (including vectoring, SRA, SOS, and ROC capabilities), Wi-Fi standard/generation, per-band throughput figures
- **Compatibility per nbn tech type** — individual assessments for FTTP, FTTC, FTTN/B, and HFC, each with a status (`yes` / `yes_but` / `no`) and specific condition codes explaining *why*
- **ISP provenance** — which ISP originally provided the modem, whether it's ISP-locked, and whether it needs reconfiguration (PPPoE to IPoE)
- **Lifecycle data** — release year, whether it's still sold, end-of-life status

The `modem_sources` table stores the URL, title, access date, and notes for every source consulted per modem — that's **285 citations across 70 devices** (~4 sources per modem on average). This isn't vibes. This is auditable research with a paper trail.

## The Condition Code System: Domain Knowledge, Codified

The compatibility engine doesn't just say "yes" or "no". It encodes **10 specific condition codes** that map real-world ISP switching and hardware limitation scenarios:

| Code | What It Captures |
|------|-----------------|
| `SWITCH_TO_IPOE` | Modem came from a PPPoE ISP (TPG, iiNet, Dodo, etc.) — needs DHCP reconfiguration |
| `MISSING_SOS_ROC` | Lacks SOS/ROC support critical for FTTN/B stability since the March 2022 nbn change |
| `WAN_PORT_LIMIT` | 100 Mbps WAN port will cap speeds on nbn 100+ plans |
| `ISP_LOCK` | Device may be firmware-locked to its original ISP |
| `BRIDGE_MODE` | Built-in modem requires bridge mode configuration |
| `EOL` | Manufacturer has end-of-lifed the device — security risk |
| `DISABLE_VLAN` | VLAN tagging from previous ISP needs to be turned off |
| `FIRMWARE_UPDATE` | Must update firmware before use with Belong |
| `NO_VOIP` | Device doesn't support VoIP if needed |
| `NEEDS_2_5G_WAN` | 1 Gbps WAN port will bottleneck nbn 500/1000 plans |

These aren't generic warnings — they're derived from understanding Belong's specific IPoE/DHCP architecture and how each modem's hardware and firmware interacts with each nbn technology type.

## The Compatibility Engine: Typed, Tested, Deterministic

The frontend isn't just displaying data — it runs a **real-time compatibility assessment** (`assessCompatibility()`) that cross-references:

1. The modem's compatibility status for the user's specific nbn tech type
2. The user's plan speed vs. the modem's WAN port speed (wan-bottleneck detection)
3. The modem's best Wi-Fi band throughput vs. plan speed (wifi-bottleneck detection)
4. Setup conditions filtered from speed conditions (which are handled by runtime assessment instead)

This is covered by **18 test files** including dedicated test suites for:
- Compatibility assessment logic (10 test cases covering every status/speed/condition permutation)
- Search behaviour (tiered full-text search with trigram similarity fallback, abort signal handling)
- Type safety (compile-time guarantees that types match the database schema)
- Every condition code has a verified label and description mapping

## Search: Two-Tier, Typo-Tolerant

The search layer isn't a naive string match. It uses:

1. **PostgreSQL full-text search** via a GIN-indexed `tsvector` column as the primary tier
2. **Trigram similarity fallback** (`search_modems_fuzzy` RPC) when full-text returns nothing — so "tplink archer" still finds "TP-Link Archer"

Both tiers support request cancellation via `AbortSignal` to prevent race conditions during rapid typing.

## Architecture: Production-Grade, Not Prototype-Grade

- **Supabase backend** with RLS (row-level security) enabled — public SELECT-only, no write access exposed
- **TypeScript throughout** — the `Modem` type mirrors the database schema exactly, enforced by tests
- **Embeddable widget** — designed to drop into checkout flows via `<script>` tag or npm package, not a standalone app that needs its own infrastructure
- **Component test coverage** across all UI states: search, loading, single match, multiple matches, no match, error, and the bottom sheet interaction layer

## What This Means for the Business

This widget can sit in the checkout flow and:
- **Reduce support tickets** by telling customers upfront if their modem needs reconfiguration
- **Prevent failed activations** by catching incompatible devices before signup
- **Increase BYO modem confidence** — customers who know their device works are more likely to convert
- **Give support staff a tool** — the same data can power internal lookup tools

---

**TL;DR for the sceptics:** The "vibe-coded" part is the UI shell. The substance — 70 modems, 285 cited sources, 10 domain-specific condition codes, typed compatibility assessment with speed-aware bottleneck detection, two-tier fuzzy search, 18 test suites — that's engineering.
