import { Badge } from "@/ui/components/Badge";

interface StageCardProps {
  number: number;
  role: string;
  model: string;
  modelVariant: "brand" | "warning" | "neutral";
  accentClass: string;
  children: React.ReactNode;
}

function StageCard({
  number,
  role,
  model,
  modelVariant,
  accentClass,
  children,
}: StageCardProps) {
  return (
    <div
      className={`rounded-lg border border-doc-border bg-doc-card ${accentClass}`}
    >
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-doc-muted">
            {number}
          </span>
          <span className="text-sm font-semibold text-doc-text">{role}</span>
          <Badge variant={modelVariant}>{model}</Badge>
        </div>
        <div className="text-sm leading-relaxed text-neutral-600">
          {children}
        </div>
      </div>
    </div>
  );
}

export function PipelineStageCards() {
  return (
    <div className="space-y-3">
      <StageCard
        number={1}
        role="Researcher"
        model="Claude Sonnet"
        modelVariant="brand"
        accentClass="border-l-[3px] border-l-brand-300"
      >
        Gathers evidence per modem: manufacturer specs, regulatory filings,
        community reports. Produces a structured JSON record with per-tech-type
        compatibility, conditions, and confidence scoring. Minimum 2 independent
        sources for critical claims (VDSL2 features, ISP lock, WAN speed).
      </StageCard>

      <StageCard
        number={2}
        role="Skeptic"
        model="Claude Sonnet"
        modelVariant="warning"
        accentClass="border-l-[3px] border-l-warning-300"
      >
        Actively tries to <em>disprove</em> the researcher&rsquo;s claims.
        Checks every cited URL, searches for counter-evidence, and runs internal
        consistency checks. Each finding gets a verdict: confirmed, weakened,
        contested, disproven, or inconclusive. The skeptic{" "}
        <strong>never modifies records</strong> &mdash; only produces reports.
      </StageCard>

      <StageCard
        number={3}
        role="Judge"
        model="Claude Opus"
        modelVariant="neutral"
        accentClass="border-l-[3px] border-l-neutral-300"
      >
        Weighs evidence from both sides.{" "}
        <strong>No web access by design</strong> &mdash; evaluates quality of
        evidence, doesn&rsquo;t do its own research. Three dispositions:
        approved (enters DB), revision needed (back to researcher with specific
        directives), or rejected.
      </StageCard>
    </div>
  );
}
