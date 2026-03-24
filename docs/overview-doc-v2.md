# BYO Modem Tools — Compatibility Checker & Setup Guides

## Summary

BYO modem customers currently have no structured way to check whether their device will work with Belong nbn before conversion — and no modem-specific setup guidance afterward. Modem compatibility is a three-variable problem (technology type × hardware specs × ISP origin) and no existing touchpoint evaluates all three.

This is a working prototype that addresses both gaps: a **compatibility checker** and **step-by-step setup guides**, backed by a structured database of 70 modems. The data was produced by an adversarial AI research pipeline built on Claude — every record is independently researched, challenged, and adjudicated before it enters the database, with cited sources and documented confidence scores. The data is portable (individual JSON files, no vendor lock-in), the pipeline is reusable and auditable, and ongoing maintenance is minimal.

*Watch a 3-minute walkthrough of both tools:*

[Loom embed]

---

## What happens today

When a Belong customer selects "bring your own modem" during the conversion journey, they're told that not all modems are compatible and linked to a support page. That page provides general guidance, but it doesn't know the customer's nbn technology type, what ISP their modem came from, or which specific modem they have. It includes a list of "highly likely compatible" modems — but that assessment depends on the tech type, the speed of their selected plan, and whether the modem needs reconfiguration from a previous ISP.

After conversion, pre-connection emails link to generic BYO setup advice along the lines of "you may need to change your settings from PPPoE to DHCP." For non-technical customers, this isn't actionable. And when customers call or use live chat, support agents don't have structured modem data to draw on either.

*[Data that would strengthen this section: BYO modem support call volume, common call reasons in the first 48 hours post-activation, checkout behaviour at modem selection, bounce rate on the current BYO modem support page.]*

[Screenshot: current conversion journey "not all modems are compatible" message]
[Screenshot: current BYO modem support page]

---

## What this shows

### Compatibility checker

Designed for the consideration-to-conversion stage of the BYO journey. A customer searches for their modem by brand or model name. The tool returns a per-technology-type compatibility result with the specific conditions that apply — not just "yes" or "no," but what they'd need to change, whether their modem would bottleneck their plan speed, and whether it's missing mandatory features for their connection type. Each condition includes a plain-language explanation.

The tool handles real-world search behaviour: fuzzy matching ("archer" finds all TP-Link Archer models), multiple results with disambiguation, and clear feedback when a modem isn't in the database.

[Screenshot: modem search and selection]
[Screenshot: compatibility result showing conditions and speed assessment]
[Screenshot: a "compatible with conditions" result — the most common and most useful scenario]

### Setup guides

A separate, post-conversion tool designed to reduce support volume and ensure customers have a good initial experience with Belong. Once a customer is activated, step-by-step instructions walk them through physical connection, Wi-Fi setup, and any configuration changes specific to their modem and technology type. A built-in connection test at the end confirms they're online.

[Screenshot: setup guide step with modem-specific instructions]
[Screenshot: connection test — success state]

Both tools are fully functional demos — not design mockups. They query a real database, handle edge cases, and are deployed for testing.

**Try it:** [modemchecker.vercel.app](https://modemchecker.vercel.app)

---

## How the data works

**The database covers 70 of the best-selling and ISP-bundled modems in Australia**, each assessed against four nbn technology types (FTTP, FTTC, FTTN/B, HFC) — producing 280 individual compatibility ratings backed by 287+ cited sources.

Every modem record is produced by an adversarial AI research pipeline built on Claude. Three independent agents with opposing incentives process each record: one researches and structures the compatibility data, one actively tries to disprove every claim, and a third weighs the evidence from both sides before anything enters the database. This isn't a review step — it's a challenge process designed to catch errors, dead sources, and unsupported claims. The pipeline is fully auditable: every research finding, challenge, and adjudication decision is documented alongside the record it produced.

Each record carries a confidence score from 0–100. Every deduction is recorded with a specific reason — an expired source, an unverifiable spec, conflicting documentation. No record enters the database below 70/100.

14 modems have been through the full adversarial pipeline to date — sufficient to validate the methodology across a range of device types including ISP-supplied, retail, and end-of-life hardware. Of those, 13 were approved and 1 was initially rejected due to insufficient evidence on two data points (resolved with approximately 5 minutes of targeted research). The remaining records can be processed on demand — a single modem takes roughly 10 minutes through the full pipeline.

The full methodology, evidence hierarchy, and a complete sample of pipeline output are documented in the [Technical Companion Document].

<details>
<summary><strong>What compatibility factors are assessed?</strong></summary>

Each modem is evaluated against a structured set of criteria per nbn technology type. For FTTN/B (copper) connections, this includes VDSL2 support and mandatory line-stability features — vectoring, SRA, and the SOS/ROC features that nbn made mandatory in March 2022. For all tech types, the pipeline assesses WAN port speed relative to plan tiers, ISP protocol requirements (IPoE vs PPPoE), ISP lock status, and Wi-Fi capability per band.

These criteria are codified in a machine-readable requirements file — not prose — so every modem is assessed against the same standard. The condition code system captures every "yes, but" scenario: `SWITCH_TO_IPOE` (modem needs reconfiguration from a PPPoE ISP), `MISSING_SOS_ROC` (dropouts likely on copper), `WAN_PORT_LIMIT` (speed bottleneck), and seven others.

One area flagged for follow-up: the nbn compatibility requirements that the pipeline assesses against were assembled from public nbn documentation and industry sources. Validation of these requirements by an internal nbn domain expert would confirm that the pipeline is working from the right inputs — the pipeline itself and its outputs are high-confidence, but the requirements it assesses against would benefit from expert review.

See the [Technical Companion Document] for the complete condition code reference, evidence hierarchy, and confidence scoring methodology.

</details>

---

## What this data could enable

The same data that powers these two demos could feed several other touchpoints without additional research.

**Support agent tooling.** Give agents structured compatibility and setup data for BYO modem queries. Instead of generic guidance, an agent sees: "Customer is using a TP-Link Archer VR1600v on FTTN — compatible, but needs WAN settings changed from PPPoE to DHCP and lacks SOS/ROC — may experience dropouts on copper." This could be surfaced through existing agent tools without building any customer-facing UI.

**Personalised communications.** Setup guide URLs include parameters for modem model and technology type. Pre-connection emails or SMS could link directly to the guide that matches each customer's specific setup — not a generic "how to set up your BYO modem" page.

**Modem choice persistence.** If the conversion flow captures the customer's modem identifier alongside their plan and address, that information is available weeks later when they contact support. Agents get immediate context without asking the customer to identify their device again.

**Reusable methodology.** The research pipeline isn't modem-specific. Any domain where structured, high-confidence data needs to be assembled from scattered sources — device specifications, plan eligibility, troubleshooting knowledge — could use the same approach.

*[Data that would strengthen this section: current resolution time for BYO modem support queries, proportion of BYO customers who contact support within 48 hours of activation.]*

---

## What makes this portable

The data layer was designed to be moveable, not tied to the demo's tech stack.

- **Minimal custodianship** — the modem market moves slowly. New modems appear a few times per quarter. Existing records only need re-auditing when nbn requirements change or manufacturers release firmware updates that affect compatibility. This is not an asset that requires constant attention.
- **Individual JSON files, no vendor lock-in** — each modem is a standalone JSON record, version-controlled in git. They can be imported into DynamoDB, served from an internal API, or loaded into any structured data store. Supabase (Postgres) is used for the demo, but the canonical data lives in the JSON files. The research pipeline and setup guide content are equally portable.
- **Offline-capable setup guides** — guide content is bundled at build time as static JSON, not fetched from an API at runtime. When a customer disconnects from their home Wi-Fi to connect to their modem's network, the guide still works.
- **Low ongoing effort** — adding a new modem means running it through the same pipeline (~10 minutes per record). A quarterly refresh re-audits existing records for stale sources and changed specifications using the same adversarial process. The pipeline was built on Claude but the methodology could be adapted to other AI platforms.

---

## Where it stands

| Component | Status |
|-----------|--------|
| Modem database | 70 modems researched across 4 nbn tech types — individual JSON files, loaded into Supabase for the demo |
| Compatibility checker | Fully functional demo, deployed and testable |
| Setup guides | 15 guides complete, demonstrating the content pipeline — remaining modems can be generated on demand |
| Research pipeline | Operational, auditable, and reusable — can process new modems or re-audit existing records |
| Adversarial validation | 14 of 70 records through the full challenge pipeline, validating the methodology |

**What's ready:**

The compatibility data has been through extensive validation. The adversarial pipeline, confidence scoring, and cited source requirements were designed to produce data reliable enough to present to customers. 14 modems have completed the full adversarial challenge (research → skeptic → judge), validating the process across a representative range of device types. The remaining records can be processed on demand using the same batch orchestration. The setup guide content is at an earlier stage: the content pipeline and data contract are proven, but the guide content would benefit from review by a domain expert before customer-facing use.

**Known scope boundaries:**

- Compatibility is scoped to "can a customer connect to Belong nbn with this modem" — not an assessment of every feature a modem may offer (5G backup, mesh capability, etc.). This was a deliberate scoping decision: the tool answers the question customers are actually asking at the point of conversion.
- Setup guides cover initial connection — getting from "not connected" to "online" — not mesh networks, extenders, or advanced configuration.
- Compatibility is assessed from manufacturer specifications, regulatory filings, ISP documentation, and independent technical reviews. Physical modem hardware was not tested, nor would it be practical for 70 devices. The natural next step is review of the pipeline's nbn compatibility requirements by a domain expert, to confirm the assessment criteria are complete and accurate.

**What's portable, and what would need rebuilding:**

The data layer, the research pipeline, the UX and interaction design, the data contract, and the logic that translates modem records into compatibility assessments and setup steps — all of this carries over directly. The UI was built in React on Radix and Tailwind primitives — industry-standard foundations, but not Belong's component library. The component markup would need to be rebuilt and mapped to existing Belong components for production use. The interaction patterns, information architecture, and presentation logic would transfer as coded references.

**To take this further,** the data is ready. The compatibility data could start as a support agent tool — lower integration effort, no customer-facing UI required — before becoming customer-facing. Setup guides could follow the same path, with domain expert review of the generated content as a next step.

This was built as a personal exploration — testing whether AI-assisted research could produce modem compatibility data at a confidence level suitable for customer-facing use. The data quality processes are rigorous, but a domain expert review would surface areas for refinement — and that's by design. The goal was to demonstrate feasibility and validate the approach, not to produce a final production-ready dataset without expert input.

---

*Technical methodology, pipeline architecture, evidence hierarchy, and sample output are documented in the [Technical Companion Document].*
