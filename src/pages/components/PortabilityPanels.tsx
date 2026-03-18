import { Badge } from "@/ui/components/Badge";

interface PanelProps {
  title: string;
  badgeLabel: string;
  badgeVariant: "success" | "warning" | "neutral";
  bgClass: string;
  borderClass: string;
  items: string[];
}

function Panel({
  title,
  badgeLabel,
  badgeVariant,
  bgClass,
  borderClass,
  items,
}: PanelProps) {
  return (
    <div className={`rounded-lg border ${borderClass} ${bgClass} p-4`}>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-semibold text-doc-text">{title}</span>
        <Badge variant={badgeVariant}>{badgeLabel}</Badge>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2.5 text-sm text-neutral-600">
            <span
              className={`mt-[5px] block h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                badgeVariant === "success"
                  ? "bg-success-500"
                  : badgeVariant === "warning"
                    ? "bg-warning-500"
                    : "bg-neutral-400"
              }`}
            />
            <span className="leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PortabilityPanels() {
  return (
    <div className="space-y-3">
      <Panel
        title="Directly portable"
        badgeLabel="Use as-is"
        badgeVariant="success"
        bgClass="bg-success-50"
        borderClass="border-success-200"
        items={[
          "Modem data and schema (70 records, JSONB columns, import into any Postgres DB)",
          "Compatibility assessment function (~40 lines, pure TypeScript, zero imports beyond project types)",
          "Condition codes, labels, and speed warning copy (a constants file)",
          "Type definitions (Modem, SearchState, CompatibilityAssessment, ConditionCode)",
          "Product images (70 WebP files, ~8\u201310 KB each)",
        ]}
      />
      <Panel
        title="Needs adaptation"
        badgeLabel="Rebuild required"
        badgeVariant="warning"
        bgClass="bg-warning-50"
        borderClass="border-warning-200"
        items={[
          "UI components (rebuild on our component library; POC is a complete reference)",
          "Data access layer (POC queries Supabase directly; production uses internal API)",
          "Presentation model (bottom sheet, modal, inline \u2014 logic is presentation-agnostic)",
        ]}
      />
      <Panel
        title="POC-only"
        badgeLabel="Don\u2019t carry forward"
        badgeVariant="neutral"
        bgClass="bg-neutral-50"
        borderClass="border-neutral-200"
        items={[
          "Framer Motion animations, Subframe design tokens, Vercel deploy config, dev menu",
        ]}
      />
    </div>
  );
}
