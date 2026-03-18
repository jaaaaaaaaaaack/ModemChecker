import { Badge } from "@/ui/components/Badge";

interface Finding {
  text: React.ReactNode;
}

interface CaseStudyProps {
  modem: string;
  confidence: number;
  confidenceVariant: "success" | "warning" | "brand";
  findings: Finding[];
}

function CaseStudy({
  modem,
  confidence,
  confidenceVariant,
  findings,
}: CaseStudyProps) {
  return (
    <div className="rounded-lg border border-doc-border bg-doc-card">
      <div className="border-b border-doc-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-doc-text">{modem}</span>
          <Badge variant={confidenceVariant}>
            Confidence {confidence}
          </Badge>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="space-y-2">
          {findings.map((f, i) => (
            <div key={i} className="flex gap-2.5 text-sm text-neutral-600">
              <span className="mt-[5px] block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" />
              <span className="leading-relaxed">{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CaseStudies() {
  return (
    <div className="mt-8">
      <h4 className="mb-3 text-sm font-bold text-doc-text">
        What the pipeline has caught
      </h4>
      <div className="space-y-3">
        <CaseStudy
          modem="Belong 4353 (Sagemcom F@ST 4353-A)"
          confidence={70}
          confidenceVariant="warning"
          findings={[
            {
              text: "3 of 12 cited sources had gone dead (403/404) within weeks of research",
            },
            {
              text: "SOS/ROC support presented as confirmed but was actually inferred from chipset capabilities",
            },
            {
              text: "An undocumented VLAN tagging limitation was discovered",
            },
            {
              text: "Wi-Fi speed ambiguity: hardware 3\u00D73 (1300 Mbps) but firmware-limited to 2\u00D72 (867 Mbps)",
            },
          ]}
        />
        <CaseStudy
          modem="DrayTek Vigor 2765"
          confidence={82}
          confidenceVariant="brand"
          findings={[
            {
              text: "Whirlpool thread with FTTN dropout reports predating the SOS/ROC firmware fix",
            },
            {
              text: (
                <>
                  Skeptic&rsquo;s own evidence resolved an open question:
                  confirmed SOS/ROC enabled by default since firmware V4.4.1+
                </>
              ),
            },
            {
              text: "One of four cited sources returned 403 \u2014 key claim corroborated elsewhere, -2 deduction",
            },
          ]}
        />
      </div>
    </div>
  );
}
