import { Accordion } from "@/ui/components/Accordion";
import { Badge } from "@/ui/components/Badge";

interface Layer {
  name: string;
  portable: string;
  portableVariant: "success" | "warning" | "neutral";
  summary: string;
  details: string;
}

const LAYERS: Layer[] = [
  {
    name: "Data Layer",
    portable: "Directly portable",
    portableVariant: "success",
    summary: "70 modem records in Postgres with FTS + trigram search, 285 sourced references, confidence scoring.",
    details:
      "The schema, the data, and the research behind it. Moves to any relational DB. Each record encodes per-tech-type compatibility, WAN/WiFi specs, VDSL2 features, ISP lock status, and condition codes. All 70 records have documented research sources with type classification and access dates.",
  },
  {
    name: "Logic Layer",
    portable: "Directly portable",
    portableVariant: "success",
    summary: "Pure TypeScript functions \u2014 compatibility assessment, condition codes, speed analysis. ~40 lines, zero dependencies.",
    details:
      "assessCompatibility() takes a modem record, nbn tech type, and plan speed, then returns a structured verdict. No framework coupling, no side effects, no API calls. 11 dedicated tests cover all tech types, speed tiers, condition combinations, and edge cases. Copy-paste into any TypeScript project.",
  },
  {
    name: "Presentation Layer",
    portable: "Reference only",
    portableVariant: "neutral",
    summary: "13 React components built on Subframe, Framer Motion animations, complete state machine.",
    details:
      "The UI would be rebuilt on Belong\u2019s component library. The POC serves as a working reference for every state, interaction, and edge case \u2014 search, fuzzy matching, disambiguation, personalised verdict, error handling, no-match fallbacks, and render-crash recovery. 75 behavioural tests document expected behaviour.",
  },
];

export function ArchitectureLayers() {
  return (
    <div className="space-y-3">
      {LAYERS.map((layer, i) => (
        <Accordion key={layer.name} defaultOpen={i === 0}>
          <div className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-doc-border bg-doc-card p-4 transition-colors hover:bg-neutral-50">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-doc-text">{layer.name}</span>
              <Badge variant={layer.portableVariant}>{layer.portable}</Badge>
            </div>
            <Accordion.Chevron />
          </div>
          <Accordion.Content>
            <div className="rounded-b-lg border border-t-0 border-doc-border bg-doc-card px-4 pb-4 pt-2">
              <p className="mb-2 text-sm font-medium text-neutral-700">{layer.summary}</p>
              <p className="text-sm leading-relaxed text-neutral-500">{layer.details}</p>
            </div>
          </Accordion.Content>
        </Accordion>
      ))}
    </div>
  );
}
