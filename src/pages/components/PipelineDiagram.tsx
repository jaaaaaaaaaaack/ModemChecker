import { Badge } from "@/ui/components/Badge";

interface StageProps {
  name: string;
  subtitle: string;
  variant: "brand" | "neutral";
}

function Stage({ name, subtitle, variant }: StageProps) {
  return (
    <div
      className={`flex min-w-[100px] flex-col items-center rounded-lg border px-3 py-2.5 text-center ${
        variant === "brand"
          ? "border-brand-200 bg-brand-50"
          : "border-neutral-200 bg-neutral-50"
      }`}
    >
      <span className="text-[0.8rem] font-semibold text-doc-text">{name}</span>
      <span className="mt-0.5 text-[0.65rem] text-doc-muted">{subtitle}</span>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center text-doc-muted">
      <div className="h-px w-4 bg-neutral-300 sm:w-6" />
      <div className="border-y-[4px] border-l-[6px] border-y-transparent border-l-neutral-300" />
    </div>
  );
}

export function PipelineDiagram() {
  return (
    <div className="rounded-lg border border-doc-border bg-doc-card p-5">
      {/* Main flow */}
      <div className="flex flex-wrap items-center justify-center gap-y-3">
        <Stage name="Researcher" subtitle="Claude Sonnet" variant="brand" />
        <Arrow />
        <Stage name="Skeptic" subtitle="Claude Sonnet" variant="brand" />
        <Arrow />
        <Stage name="Judge" subtitle="Claude Opus" variant="brand" />
        <Arrow />
        <Stage name="Assembler" subtitle="Deterministic" variant="neutral" />
        <Arrow />
        <Stage name="Publisher" subtitle="Supabase" variant="neutral" />
      </div>

      {/* Revision loop annotation */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <Badge variant="neutral">Revision loop</Badge>
        <span className="text-xs text-doc-muted">
          Judge can return records to Researcher (max 2 rounds)
        </span>
      </div>
    </div>
  );
}
