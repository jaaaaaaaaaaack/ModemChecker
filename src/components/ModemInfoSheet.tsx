import { useCallback, useEffect, useRef, useState } from "react";
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
  const [isAtBottom, setIsAtBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setIsScrolled(el.scrollTop > 4);
    setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 8);
  }, []);

  // Check initial scroll state once the content is laid out
  useEffect(checkScroll, [checkScroll]);

  return (
    <div className="flex w-full flex-1 flex-col items-start gap-6 min-h-0">
      {/* Pinned header + title */}
      <div className="flex w-full flex-col items-start gap-6 flex-shrink-0">
        <HeaderWithNavigation variant="image" onClose={onClose} />
        <div className="flex flex-col items-start gap-2">
          <span className="text-h2 font-h2 text-color-accent2-800">
            Belong Wi-Fi 6 Modem
          </span>
          <span className="text-body-bold font-body-bold text-color-accent2-800">
            A fast, reliable and simple modem designed to get the most out of
            your plan.
          </span>
        </div>
      </div>

      {/* Scrollable feature cards with scrims */}
      <div className="relative flex flex-col flex-1 min-h-0 w-full">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex-1 min-h-0 flex flex-col items-start gap-2 overflow-y-auto pl-1 -ml-1 pr-2 pb-2"
        >
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
        {/* Top scrim — fades in when content scrolls beneath the heading */}
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
        {/* Bottom scrim — fades out when scrolled to the end */}
        <div
          aria-hidden="true"
          className={[
            "pointer-events-none absolute bottom-0 left-0 right-0 h-16",
            "transition-opacity duration-200",
            isAtBottom ? "opacity-0" : "opacity-100",
          ].join(" ")}
          style={{
            background:
              "linear-gradient(to top, rgba(227, 211, 255, 0.92), transparent)",
          }}
        />
      </div>

      {/* Pinned footer */}
      <div className="flex w-full flex-col items-start gap-8 flex-shrink-0">
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
  );
}
