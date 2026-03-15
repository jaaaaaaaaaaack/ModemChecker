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

const TOP_MASK =
  "linear-gradient(to bottom, transparent, black 40px, black)";

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
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex w-full flex-1 flex-col items-start gap-6 min-h-0 overflow-y-auto pr-2 -mr-2"
      style={
        isScrolled
          ? { maskImage: TOP_MASK, WebkitMaskImage: TOP_MASK }
          : undefined
      }
    >
      <HeaderWithNavigation variant="image" onClose={onClose} />

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

      {/* Footer */}
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
  );
}
