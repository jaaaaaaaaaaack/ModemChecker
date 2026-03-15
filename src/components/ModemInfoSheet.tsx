import { useCallback, useRef, useState } from "react";
import { FeatureItem } from "@/ui/components/FeatureItem";
import { LinkButton } from "@/ui/components/LinkButton";
import { Button } from "@/ui/components/Button";
import { HeaderWithNavigation } from "@/ui/components/HeaderWithNavigation";
import {
  FeatherZap,
  FeatherWifi,
  FeatherSmile,
  FeatherShield,
  FeatherHeart,
} from "@subframe/core";

const BELONG_SUPPORT_URL =
  "https://www.belong.com.au/support/internet/getting-started/what-do-i-get-with-the-belong-modem";

interface ModemInfoSheetProps {
  onClose: () => void;
}

export function ModemInfoSheet({ onClose }: ModemInfoSheetProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el) setIsScrolled(el.scrollTop > 4);
  }, []);

  return (
    <div className="flex w-full flex-1 flex-col items-start min-h-0">
      {/* Pinned header — close button always accessible */}
      <div className="flex w-full flex-shrink-0 pb-6">
        <HeaderWithNavigation variant="image" onClose={onClose} />
      </div>

      {/* Scrollable content — everything below the header flows naturally */}
      <div className="relative flex flex-col flex-1 min-h-0 w-full">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 flex flex-col items-start gap-6 overflow-y-auto pr-2 -mr-2"
        >
          {/* Title + intro */}
          <div className="flex flex-col items-start gap-2">
            <span className="text-h2 font-h2 text-color-accent2-800">
              Belong Wi-Fi 6 Modem
            </span>
            <span className="text-body-bold font-body-bold text-color-accent2-800">
              A fast, reliable and simple modem designed to get the most out of
              your plan.
            </span>
          </div>

          {/* Feature cards */}
          <div className="flex w-full flex-col items-start gap-2">
            <FeatureItem
              icon={<FeatherZap />}
              title="Speed and reliability"
              description="Capable of speeds up to 950Mbps over Wifi 6 — fast enough for all our plans."
              variant="card"
            />
            <FeatureItem
              icon={<FeatherWifi />}
              title="Connect the whole house"
              description="Supports 12+ simultaneous device connections, so everyone in the household can stream, game, and scroll seamlessly."
              variant="card"
            />
            <FeatureItem
              icon={<FeatherSmile />}
              title="Super easy setup"
              description="Works with all Belong plans right out of the box. Plug it in and you're ready to go."
              variant="card"
            />
            <FeatureItem
              icon={<FeatherShield />}
              title="Safety and security"
              description="Customisable parental controls help keep your kids safe online, while encryption and security updates keep your network secure."
              variant="card"
            />
            <FeatureItem
              icon={<FeatherHeart />}
              title="Great support"
              description="Get enhanced troubleshooting and support via chat or phone. You're also covered by our 24-month warranty."
              variant="card"
            />
          </div>

          {/* Footer — scrolls with content, natural end of the page */}
          <div className="flex w-full flex-col items-start gap-8">
            <LinkButton
              variant="brand"
              icon={null}
              onClick={() => window.open(BELONG_SUPPORT_URL, "_blank", "noopener")}
            >
              View full details on our Modem FAQs page
            </LinkButton>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Top scrim — fades in when content scrolls beneath the header */}
        <div
          aria-hidden="true"
          className={[
            "pointer-events-none absolute top-0 left-0 right-0 h-16",
            "transition-opacity duration-200",
            isScrolled ? "opacity-100" : "opacity-0",
          ].join(" ")}
          style={{
            background:
              "linear-gradient(to bottom, rgba(227, 211, 255, 0.92), transparent)",
          }}
        />
      </div>
    </div>
  );
}
