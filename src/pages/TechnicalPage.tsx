import { DocLayout } from "./components/DocLayout";
import { Section } from "./components/Section";
import { CompatibilitySimulator } from "./components/CompatibilitySimulator";
import { ModemBrowser } from "./components/ModemBrowser";
import { CodeBlock } from "./components/CodeBlock";
import { DocTOC } from "./components/DocTOC";
import { navigateTo } from "../hooks/useHashRoute";
import { Table } from "@/ui/components/Table";
import { Badge } from "@/ui/components/Badge";
import { Progress } from "@/ui/components/Progress";
import { PipelineDiagram } from "./components/PipelineDiagram";
import { PipelineStageCards } from "./components/PipelineStageCards";
import { CaseStudies } from "./components/CaseStudies";
import { PortabilityPanels } from "./components/PortabilityPanels";
import { SearchTierDiagram } from "./components/SearchTierDiagram";
import { IntegrationItems } from "./components/IntegrationItems";
import { SchemaFeatures } from "./components/SchemaFeatures";

const TOC_ITEMS = [
  { id: "architecture", label: "Architecture" },
  { id: "data-layer", label: "Data Layer" },
  { id: "research-pipeline", label: "Research Pipeline" },
  { id: "compatibility-logic", label: "Compatibility Logic" },
  { id: "condition-codes", label: "Condition Codes" },
  { id: "search", label: "Search Strategy" },
  { id: "browse", label: "Modem Database" },
  { id: "portability", label: "Portability" },
  { id: "tests", label: "Test Coverage" },
  { id: "integration", label: "Integration Path" },
];

const EXAMPLE_RECORD = `{
  "id": "tp-link-archer-vr1600v",
  "brand": "TP-Link",
  "model": "Archer VR1600v",
  "alternative_names": ["VR1600v", "TP-Link VR1600v"],
  "device_type": "modem_router",
  "isp_provided_by": "TPG",
  "is_isp_locked": false,

  "compatibility": {
    "fttp": { "status": "yes_but", "conditions": ["SWITCH_TO_IPOE"] },
    "fttc": { "status": "yes_but", "conditions": ["SWITCH_TO_IPOE"] },
    "fttn": { "status": "yes_but", "conditions": ["SWITCH_TO_IPOE"] },
    "hfc":  { "status": "yes_but", "conditions": ["SWITCH_TO_IPOE"] }
  },

  "wan": {
    "has_vdsl2_modem": true,
    "wan_port_speed_mbps": 1000,
    "vdsl2": {
      "profiles": ["17a"],
      "supports_vectoring": true,
      "supports_sra": true,
      "supports_sos": true,
      "supports_roc": true
    }
  },

  "wifi": {
    "wifi_standard": "Wi-Fi 5 (802.11ac)",
    "wifi_generation": 5,
    "bands": ["2.4GHz", "5GHz"],
    "max_speed_mbps": {
      "theoretical_combined": 1600,
      "per_band": { "2.4ghz": 300, "5ghz": 1300 }
    }
  }
}`;

const ASSESS_FN = `function assessCompatibility(
  modem: Modem,
  techType: TechType,        // "fttp" | "fttc" | "fttn" | "hfc"
  planSpeedMbps: number       // e.g. 100, 500, 880
): CompatibilityAssessment {
  const compat = modem.compatibility[techType];

  // 1. Check tech compatibility
  if (compat.status === "no") {
    return { cardStatus: "not-compatible", ... };
  }

  // 2. Assess WAN speed (hard bottleneck)
  if (wanSpeed < planSpeedMbps) → speedWarning: "wan-bottleneck"

  // 3. Assess WiFi speed (soft bottleneck)
  if (bestBand < planSpeedMbps × 2) → speedWarning: "wifi-bottleneck"

  // 4. Filter speed-related condition codes (superseded by runtime calc)
  // 5. Determine card status: speed-warning > callout > compatible

  return { cardStatus, speedWarning, setupConditions };
}`;

const CONDITION_CODES = [
  ["SWITCH_TO_IPOE", "Reconfigure to IPoE", "Modem from a PPPoE ISP (TPG, iiNet, Dodo, Vodafone, iPrimus, Internode)"],
  ["DISABLE_VLAN", "Disable VLAN tagging", "Previous ISP config used VLAN tagging incompatible with Belong"],
  ["ISP_LOCK", "May be ISP-locked", "Device locked to original ISP\u2019s network"],
  ["MISSING_SOS_ROC", "Missing SOS/ROC", "FTTN/FTTB only \u2014 mandatory since March 2022, absence causes dropouts"],
  ["WAN_PORT_LIMIT", "WAN port bottleneck", "Static flag \u2014 superseded at runtime by speed assessment"],
  ["NEEDS_2_5G_WAN", "2.5G WAN recommended", "Static flag \u2014 superseded at runtime by speed assessment"],
  ["FIRMWARE_UPDATE", "Firmware update required", "Known firmware issues; update before use"],
  ["BRIDGE_MODE", "Requires bridge mode", "Must be configured in bridge mode"],
  ["NO_VOIP", "No VoIP support", "No VoIP passthrough if customer needs home phone"],
  ["EOL", "End of life", "No longer supported \u2014 security and compatibility risk"],
] as const;

const CONFIDENCE_SCORES = [
  { range: "90\u2013100", status: "Verified", variant: "success" as const, value: 95, meaning: "All claims confirmed via manufacturer + independent source" },
  { range: "70\u201389", status: "Approved", variant: "brand" as const, value: 80, meaning: "Documented gaps \u226430 points. All claims survived adversarial challenge." },
  { range: "50\u201369", status: "Blocked", variant: "warning" as const, value: 60, meaning: "Too many unverified claims. Sent back for re-research." },
  { range: "<50", status: "Rejected", variant: "error" as const, value: 30, meaning: "Incomplete or conflicting data. Excluded from database." },
] as const;

export default function TechnicalPage() {
  return (
    <DocLayout>
      {/* TOC sidebar — positioned to the right of the 780px content column on xl screens */}
      <div className="pointer-events-none fixed inset-0 top-14 z-40 hidden xl:block">
        <div className="mx-auto flex max-w-[780px] justify-end">
          <div className="pointer-events-auto -mr-[200px] w-[160px] pl-8 pt-8">
            <DocTOC items={TOC_ITEMS} />
          </div>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <Section id="hero" noDivider>
        <p className="mb-3 text-[0.8rem] font-bold uppercase tracking-[0.06em] text-brand-600">
          Technical Deep-Dive
        </p>
        <h1 className="font-serif text-[2.5rem] font-bold leading-[1.15] tracking-[-0.02em] text-doc-text sm:text-[2.8rem]">
          Architecture &amp; Data Model
        </h1>
        <p className="mt-4 text-[1.15rem] leading-relaxed text-doc-muted">
          How the data was built, how the logic works, and what&rsquo;s portable.
          Companion to the{" "}
          <button
            onClick={() => navigateTo("overview")}
            className="font-semibold text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
          >
            overview
          </button>.
        </p>
      </Section>

      {/* ===== ARCHITECTURE ===== */}
      <Section id="architecture" label="Architecture" title="Three-layer architecture">
        <p className="mb-6 text-neutral-600 leading-relaxed">
          Understanding which parts are the real asset and which are scaffolding is the most
          important thing in this document.
        </p>
        <div className="overflow-x-auto">
          <Table
            header={
              <Table.HeaderRow>
                <Table.HeaderCell>Layer</Table.HeaderCell>
                <Table.HeaderCell>What&rsquo;s in the POC</Table.HeaderCell>
                <Table.HeaderCell>What&rsquo;s portable</Table.HeaderCell>
              </Table.HeaderRow>
            }
          >
            <Table.Row>
              <Table.Cell>
                <span className="text-sm font-medium text-doc-text">Data</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm text-neutral-600">70 modem records in Supabase with FTS + trigram search</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm text-neutral-600">The schema, the data, and the research. Moves to any relational DB.</span>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <span className="text-sm font-medium text-doc-text">Logic</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm text-neutral-600">Pure TypeScript &mdash; compatibility assessment, condition codes, speed analysis</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm text-neutral-600">Directly portable. Zero framework dependencies. ~40 lines.</span>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <span className="text-sm font-medium text-doc-text">Presentation</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm text-neutral-600">React components on Subframe, Framer Motion animations</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm text-neutral-600">Reference implementation. States and interactions transfer; components rebuilt.</span>
              </Table.Cell>
            </Table.Row>
          </Table>
        </div>
      </Section>

      {/* ===== DATA LAYER ===== */}
      <Section id="data-layer" label="Data" title="The data layer">
        <p className="mb-4 text-neutral-600 leading-relaxed">
          The database contains <strong>70 modems</strong> selected across five priority tiers:
          ISP-provided devices (Telstra, Optus, TPG, ABB, Belong), current retail bestsellers
          (TP-Link Archer, ASUS RT-AX, Netgear Nighthawk), popular older models, mesh systems
          (eero, Nest, Deco, Orbi), and niche/professional devices (DrayTek, Synology).
        </p>

        <h3 className="mb-3 mt-8 text-sm font-bold text-doc-text">Example record</h3>
        <p className="mb-4 text-sm text-neutral-600">
          The TP-Link Archer VR1600v &mdash; a VDSL2 modem-router commonly provided by TPG:
        </p>
        <CodeBlock language="json">{EXAMPLE_RECORD}</CodeBlock>

        <SchemaFeatures />

        <div className="mt-8 space-y-3 text-sm text-neutral-600">
          <h3 className="font-bold text-doc-text">Confidence scoring</h3>
          <p>
            Every record carries a confidence score (0&ndash;100) using a deduction model. Score starts at 100
            and is reduced only for specific, documented gaps:
          </p>
          <div className="overflow-x-auto">
            <Table
              header={
                <Table.HeaderRow>
                  <Table.HeaderCell>Score</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Indicator</Table.HeaderCell>
                  <Table.HeaderCell>Meaning</Table.HeaderCell>
                </Table.HeaderRow>
              }
            >
              {CONFIDENCE_SCORES.map((row) => (
                <Table.Row key={row.range}>
                  <Table.Cell>
                    <span className="text-sm">{row.range}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={row.variant}>{row.status}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="w-20">
                      <Progress value={row.value} />
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-neutral-600">{row.meaning}</span>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table>
          </div>
          <p className="text-xs text-doc-muted">
            Current database range: 70&ndash;100, average 83.8. No record enters below 70.
          </p>
        </div>
      </Section>

      {/* ===== RESEARCH PIPELINE ===== */}
      <Section id="research-pipeline" label="Research" title="The adversarial research pipeline">
        <p className="mb-4 text-neutral-600 leading-relaxed">
          AI language models are useful for research tasks &mdash; they can read spec sheets, cross-reference
          sources, and extract structured data faster than manual research. But they also hallucinate and
          over-assert confidence. A single-pass &ldquo;ask the AI&rdquo; approach produces data that{" "}
          <em>looks</em> authoritative but has no systematic error control.
        </p>
        <p className="mb-6 text-neutral-600 leading-relaxed">
          The adversarial pipeline uses <strong>three agents with structurally opposed incentives</strong>:
        </p>

        <PipelineDiagram />

        <div className="mt-6">
          <PipelineStageCards />
        </div>

        <CaseStudies />
      </Section>

      {/* ===== COMPATIBILITY LOGIC ===== */}
      <Section id="compatibility-logic" label="Logic" title="The compatibility assessment function">
        <p className="mb-4 text-neutral-600 leading-relaxed">
          The core logic is a single pure function &mdash; ~40 lines of TypeScript with no dependencies:
        </p>
        <CodeBlock language="typescript">{ASSESS_FN}</CodeBlock>

        <h3 className="mb-3 mt-8 text-sm font-bold text-doc-text">Worked example</h3>
        <p className="mb-4 text-sm text-neutral-600 leading-relaxed">
          <strong>Scenario:</strong> A customer on nbn 500 (FTTP) with a TP-Link Archer VR1600v (1000 Mbps WAN, Wi-Fi 5, 1300 Mbps best band).{" "}
          WAN: 1000 &ge; 500 &rarr; OK. WiFi: 1300 &ge; 1000 (2&times; plan) &rarr; OK.
          Conditions: SWITCH_TO_IPOE &rarr; <strong>callout</strong>. Compatible, but needs IPoE reconfiguration.
        </p>

        <h3 className="mb-3 mt-8 text-sm font-bold text-doc-text">Try it yourself</h3>
        <CompatibilitySimulator />
      </Section>

      {/* ===== CONDITION CODES ===== */}
      <Section id="condition-codes" label="Conditions" title="The ten condition codes">
        <div className="overflow-x-auto">
          <Table
            header={
              <Table.HeaderRow>
                <Table.HeaderCell>Code</Table.HeaderCell>
                <Table.HeaderCell>Label</Table.HeaderCell>
                <Table.HeaderCell>When it fires</Table.HeaderCell>
              </Table.HeaderRow>
            }
          >
            {CONDITION_CODES.map(([code, label, desc]) => (
              <Table.Row key={code}>
                <Table.Cell>
                  <code className="whitespace-nowrap rounded bg-neutral-100 px-2 py-1 font-mono text-xs text-doc-text">
                    {code}
                  </code>
                </Table.Cell>
                <Table.Cell>
                  <span className="text-sm font-medium text-doc-text">{label}</span>
                </Table.Cell>
                <Table.Cell>
                  <span className="text-sm text-neutral-600">{desc}</span>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table>
        </div>
      </Section>

      {/* ===== SEARCH ===== */}
      <Section id="search" label="Search" title="Two-tier search strategy">
        <p className="mb-5 text-neutral-600 leading-relaxed">
          Customers don&rsquo;t always know their exact modem model. &ldquo;Tp link archer&rdquo; is more
          common than &ldquo;TP-Link Archer VR1600v.&rdquo; The search handles this with two tiers:
        </p>

        <SearchTierDiagram />

        <p className="text-sm text-neutral-600 leading-relaxed">
          Each search creates an{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs">AbortController</code>.
          New searches abort previous requests, and the response handler checks{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs">signal.aborted</code> before
          updating state to prevent stale results from overwriting fresh ones.
        </p>
      </Section>

      {/* ===== BROWSE THE DATABASE ===== */}
      <Section id="browse" label="Database" title="Browse the modem database">
        <p className="mb-6 text-neutral-600 leading-relaxed">
          All {24} modem records from the documentation subset. Click any row to expand details.
          The full database has 70 records across all priority tiers.
        </p>
        <ModemBrowser />
      </Section>

      {/* ===== PORTABILITY ===== */}
      <Section id="portability" label="Portability" title="What transfers directly">
        <PortabilityPanels />
      </Section>

      {/* ===== TEST COVERAGE ===== */}
      <Section id="tests" label="Testing" title="Test coverage">
        <p className="mb-4 text-neutral-600 leading-relaxed">
          <strong>135 tests</strong> across 20 test files. All passing. Tests are behavioural &mdash;
          they validate what components do, not how they&rsquo;re structured.
        </p>
        <div className="overflow-x-auto">
          <Table
            header={
              <Table.HeaderRow>
                <Table.HeaderCell>Area</Table.HeaderCell>
                <Table.HeaderCell>Files</Table.HeaderCell>
                <Table.HeaderCell>Tests</Table.HeaderCell>
                <Table.HeaderCell>What&rsquo;s tested</Table.HeaderCell>
              </Table.HeaderRow>
            }
          >
            <Table.Row>
              <Table.Cell>
                <span className="text-sm font-medium text-doc-text">Components &amp; UI</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm text-neutral-600">13</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm text-neutral-600">75</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm text-neutral-600">State rendering, user interactions, error states, prop variations</span>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <span className="text-sm font-medium text-doc-text">Hooks</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm text-neutral-600">2</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm text-neutral-600">22</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm text-neutral-600">State machine transitions, direction tracking, abort lifecycle</span>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <span className="text-sm font-medium text-doc-text">Logic</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm text-neutral-600">3</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm text-neutral-600">25</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm text-neutral-600">Compatibility assessment, search tiers, image preloading</span>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <span className="text-sm font-medium text-doc-text">Types &amp; constants</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm text-neutral-600">2</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm text-neutral-600">6</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm text-neutral-600">Schema completeness, config coverage</span>
              </Table.Cell>
            </Table.Row>
          </Table>
        </div>
      </Section>

      {/* ===== INTEGRATION PATH ===== */}
      <Section id="integration" label="Integration" title="Integration path">
        <IntegrationItems />
      </Section>

      {/* Footer */}
      <footer className="mx-auto mt-16 max-w-[780px] border-t border-doc-border px-6 pt-6 text-center text-xs text-doc-light">
        BYO Modem Compatibility Checker &mdash; Technical Architecture &bull; March 2026
      </footer>
    </DocLayout>
  );
}
