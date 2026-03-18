import { FeatherLayers, FeatherDatabase, FeatherPuzzle, FeatherClipboardCheck } from "@subframe/core";
import { IconWithBackground } from "@/ui/components/IconWithBackground";

interface ProductionCard {
  title: string;
  desc: string;
  icon: React.ReactNode;
  variant: "brand" | "neutral" | "success" | "warning";
}

const ITEMS: ProductionCard[] = [
  {
    title: "Build UI with Belong components",
    desc: "Rebuild on our component library. The POC is a working reference for states, interactions, and edge cases.",
    icon: <FeatherLayers />,
    variant: "brand",
  },
  {
    title: "Migrate the data",
    desc: "70 modem records and a search function. Move from Supabase to our internal database. The volume is trivial.",
    icon: <FeatherDatabase />,
    variant: "neutral",
  },
  {
    title: "Integrate into checkout",
    desc: "Decide on the presentation model (inline, modal, new tab) and wire it into the modem selection step.",
    icon: <FeatherPuzzle />,
    variant: "success",
  },
  {
    title: "Validate the compatibility criteria and review dataset",
    desc: "A review pass by someone closer to the nbn/support domain. Structured format makes this a review task with clear scope.",
    icon: <FeatherClipboardCheck />,
    variant: "warning",
  },
];

export function ProductionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {ITEMS.map((item) => (
        <div
          key={item.title}
          className="flex gap-4 rounded-lg border border-doc-border bg-white p-5"
        >
          <div className="flex-none">
            <IconWithBackground
              variant={item.variant}
              size="medium"
              icon={item.icon}
            />
          </div>
          <div>
            <h4 className="mb-1 text-sm font-bold text-doc-text">{item.title}</h4>
            <p className="text-sm leading-relaxed text-neutral-500">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
