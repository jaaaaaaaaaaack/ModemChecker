import { useCallback, useRef, useState } from "react";
import { FeatureItem } from "@/ui/components/FeatureItem";
import { LinkButton } from "@/ui/components/LinkButton";
import { Button } from "@/ui/components/Button";
import { HeaderWithNavigation } from "@/ui/components/HeaderWithNavigation";
import { IconButton } from "@/ui/components/IconButton";
import {
  FeatherZap,
  FeatherWifi,
  FeatherSmile,
  FeatherShield,
  FeatherHeart,
  FeatherX,
} from "@subframe/core";

const BELONG_SUPPORT_URL =
  "https://www.belong.com.au/support/internet/getting-started/what-do-i-get-with-the-belong-modem";

/** The mask fade zone grows from 0 to this value over the first MAX_FADE px of scroll. */
const MAX_FADE = 40;

interface ModemInfoSheetProps {
  onClose: () => void;
}

export function ModemInfoSheet({ onClose }: ModemInfoSheetProps) {
  const [fadeHeight, setFadeHeight] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el) setFadeHeight(Math.min(el.scrollTop, MAX_FADE));
  }, []);

  const maskValue =
    fadeHeight > 0
      ? `linear-gradient(to bottom, transparent, black ${fadeHeight}px, black)`
      : undefined;

  return (
    <div className="relative flex w-full flex-1 min-h-0">
      {/* Pinned close button — always accessible, above scroll + mask */}
      <IconButton
        className="absolute top-0 right-0 z-10 rounded-full"
        variant="neutral-primary"
        size="large"
        icon={<FeatherX />}
        onClick={onClose}
        aria-label="Close"
      />

      {/* Scrollable content — extends into BottomSheet bottom padding */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full flex-1 flex-col items-start gap-6 min-h-0 overflow-y-auto pr-2 -mr-2 -mb-8 pb-8 md:-mb-6 md:pb-6"
        style={{
          scrollbarColor: "rgba(160, 130, 210, 0.35) transparent",
          scrollbarWidth: "thin" as const,
          ...(maskValue
            ? { maskImage: maskValue, WebkitMaskImage: maskValue }
            : undefined),
        }}
      >
        {/* Modem image only — close button is pinned separately above */}
        <HeaderWithNavigation variant="image" />

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
    </div>
  );
}
