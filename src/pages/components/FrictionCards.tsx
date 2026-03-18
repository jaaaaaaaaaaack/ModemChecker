import { FeatherShoppingCart, FeatherPhoneOff } from "@subframe/core";
import { IconWithBackground } from "@/ui/components/IconWithBackground";

interface FrictionPoint {
  label: string;
  description: string;
  variant: "warning" | "error";
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
}

const FRICTION_POINTS: FrictionPoint[] = [
  {
    label: "Before purchase",
    description:
      "Customers who want to bring their own modem land on a static FAQ page. It lists some compatible models, but can\u2019t tell them whether their specific modem will work with their specific connection type and plan speed. Uncertain customers abandon the BYO path entirely.",
    variant: "warning",
    icon: <FeatherShoppingCart />,
    borderColor: "border-l-warning-500",
    bgColor: "bg-warning-50/40",
  },
  {
    label: "After activation",
    description:
      "Customers who guessed wrong discover the problem after they\u2019ve signed up. They contact support for help configuring a modem that may not be compatible at all \u2014 or worse, they churn before ever reaching out.",
    variant: "error",
    icon: <FeatherPhoneOff />,
    borderColor: "border-l-error-500",
    bgColor: "bg-error-50/40",
  },
];

export function FrictionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {FRICTION_POINTS.map((point) => (
        <div
          key={point.label}
          className={`rounded-lg border border-doc-border border-l-[3px] ${point.borderColor} ${point.bgColor} p-5`}
        >
          <div className="mb-3 flex items-center gap-3">
            <IconWithBackground
              variant={point.variant}
              size="small"
              icon={point.icon}
            />
            <span className="text-sm font-bold tracking-wide uppercase text-doc-text">
              {point.label}
            </span>
          </div>
          <p className="text-[0.9rem] leading-relaxed text-neutral-600">
            {point.description}
          </p>
        </div>
      ))}
    </div>
  );
}
