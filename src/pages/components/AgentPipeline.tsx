import { FeatherSearch, FeatherShieldQuestion, FeatherGavel } from "@subframe/core";
import { IconWithBackground } from "@/ui/components/IconWithBackground";

interface Agent {
  role: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  variant: "brand" | "error" | "success";
}

const AGENTS: Agent[] = [
  {
    role: "Researcher",
    label: "Gather",
    description: "Finds specs, reviews, and compatibility data from manufacturer sites, forums, and ISP documentation.",
    icon: <FeatherSearch />,
    variant: "brand",
  },
  {
    role: "Skeptic",
    label: "Challenge",
    description: "Actively seeks counter-evidence. Its only job is to find holes in the researcher\u2019s claims.",
    icon: <FeatherShieldQuestion />,
    variant: "error",
  },
  {
    role: "Judge",
    label: "Decide",
    description: "Weighs both sides, assigns a confidence score (min 70/100), and documents every deduction.",
    icon: <FeatherGavel />,
    variant: "success",
  },
];

export function AgentPipeline() {
  return (
    <div className="relative">
      {/* Agent cards row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {AGENTS.map((agent, i) => (
          <div key={agent.role} className="relative flex flex-col">
            {/* Arrow connector (between cards, sm+ only) */}
            {i < AGENTS.length - 1 && (
              <div className="pointer-events-none absolute -right-[calc(0.5rem+8px)] top-1/2 z-10 hidden -translate-y-1/2 sm:block">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-brand-300">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            <div className="flex flex-1 flex-col rounded-lg border border-doc-border bg-white p-4">
              <div className="mb-3 flex items-center gap-3">
                <IconWithBackground
                  variant={agent.variant}
                  size="medium"
                  icon={agent.icon}
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-doc-muted">
                    {agent.label}
                  </p>
                  <p className="text-sm font-bold text-doc-text">
                    {agent.role}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-neutral-500">
                {agent.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
