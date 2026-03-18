import { FeatherMonitorSmartphone, FeatherHeadset, FeatherStethoscope } from "@subframe/core";
import { IconWithBackground } from "@/ui/components/IconWithBackground";

interface ApplicationCard {
  title: string;
  desc: string;
  icon: React.ReactNode;
  variant: "brand" | "neutral" | "warning";
  accentBorder: string;
}

const APPLICATIONS: ApplicationCard[] = [
  {
    title: "Self-service tool",
    desc: "An embeddable widget with Service Qualification \u2014 customer enters their address, then runs the compatibility check. Lives on a support page or BYO landing page.",
    icon: <FeatherMonitorSmartphone />,
    variant: "brand",
    accentBorder: "border-t-brand-400",
  },
  {
    title: "Agent tools",
    desc: "Contact centre agents get specific, data-driven compatibility advice \u2014 including the exact troubleshooting step (\u201Cswitch from PPPoE to IPoE mode\u201D).",
    icon: <FeatherHeadset />,
    variant: "neutral",
    accentBorder: "border-t-neutral-400",
  },
  {
    title: "Support & diagnosis",
    desc: "For existing customers with issues, diagnose whether the modem is a factor \u2014 especially FTTN customers with modems lacking SOS/ROC support.",
    icon: <FeatherStethoscope />,
    variant: "warning",
    accentBorder: "border-t-warning-500",
  },
];

export function ApplicationCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {APPLICATIONS.map((card) => (
        <div
          key={card.title}
          className={`rounded-lg border border-doc-border border-t-[3px] ${card.accentBorder} bg-white p-5`}
        >
          <div className="mb-3">
            <IconWithBackground
              variant={card.variant}
              size="medium"
              icon={card.icon}
            />
          </div>
          <h4 className="mb-1.5 text-sm font-bold text-doc-text">{card.title}</h4>
          <p className="text-sm leading-relaxed text-neutral-500">{card.desc}</p>
        </div>
      ))}
    </div>
  );
}
