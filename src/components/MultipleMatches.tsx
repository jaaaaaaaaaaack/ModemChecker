import { useCallback, useRef, useState } from "react";
import { HeaderWithNavigation } from "@/ui/components/HeaderWithNavigation";
import { Button } from "../ui/components/Button";
import { LinkButton } from "../ui/components/LinkButton";
import { CardButton } from "../ui/components/CardButton";
import { getModemImageUrl } from "../lib/supabase";
import type { Modem } from "../types";

interface MultipleMatchesProps {
  modems: Modem[];
  onSelect: (modem: Modem) => void;
  onBack: () => void;
  onClose?: () => void;
}

export function MultipleMatches({ modems, onSelect, onBack, onClose }: MultipleMatchesProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el) setIsScrolled(el.scrollTop > 4);
  }, []);

  return (
    <div className="flex w-full flex-1 flex-col items-start gap-6 min-h-0">
      <div className="flex w-full flex-col items-start gap-3 flex-shrink-0">
        <HeaderWithNavigation
          title="Select your modem"
          variant="2-slot-blue"
          onClose={onClose}
        />
        <span className="whitespace-pre-wrap text-body font-body text-brand-800">
          We found multiple possible matches. Please select your device from the list below.
        </span>
      </div>
      <div className="relative flex flex-col flex-1 min-h-0 w-full">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 flex flex-col items-start gap-2 overflow-y-auto pl-1 -ml-1 pr-2 pb-2"
        >
          {modems.map((modem) => (
            <CardButton
              key={modem.id}
              role="button"
              tabIndex={0}
              image={getModemImageUrl(modem.id)}
              modelName={modem.model}
              brand={modem.brand}
              onClick={() => onSelect(modem)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(modem);
                }
              }}
              aria-label={`${modem.brand} ${modem.model}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            />
          ))}
        </div>
        {/* Scroll-aware top scrim — fades in when content scrolls beneath the heading */}
        <div
          aria-hidden="true"
          className={[
            "pointer-events-none absolute top-0 left-0 right-0 h-16",
            "transition-opacity duration-200",
            isScrolled ? "opacity-100" : "opacity-0",
          ].join(" ")}
          style={{
            background:
              "linear-gradient(to bottom, rgba(210, 250, 255, 0.92), transparent)",
          }}
        />
      </div>
      <div className="flex w-full items-center justify-between flex-shrink-0">
        <Button
          variant="brand-secondary"
          onClick={onBack}
        >
          Back
        </Button>
        <LinkButton variant="brand" onClick={() => {}}>
          I can't find my modem
        </LinkButton>
      </div>
    </div>
  );
}
