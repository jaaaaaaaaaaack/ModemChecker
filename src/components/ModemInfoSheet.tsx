import { FeatureItem } from "@/ui/components/FeatureItem";
import { LinkButton } from "@/ui/components/LinkButton";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import {
  FeatherZap,
  FeatherWifi,
  FeatherHeart,
  FeatherShield,
  FeatherX,
} from "@subframe/core";

const BELONG_SUPPORT_URL =
  "https://www.belong.com.au/support/internet/getting-started/what-do-i-get-with-the-belong-modem";

interface ModemInfoSheetProps {
  onClose: () => void;
}

export function ModemInfoSheet({ onClose }: ModemInfoSheetProps) {
  return (
    <div className="flex w-full flex-1 flex-col items-start gap-6 min-h-0">
      <div className="flex w-full items-start justify-between">
        <img
          className="h-28 w-36 flex-none object-cover"
          src="https://res.cloudinary.com/subframe/image/upload/v1773555007/uploads/11901/q3kxnpvkqcjl8176het5.png"
          alt="Belong Wi-Fi 6 Modem"
        />
        <IconButton
          variant="neutral-primary"
          size="large"
          icon={<FeatherX />}
          onClick={onClose}
          aria-label="Dismiss"
        />
      </div>
      <div className="flex flex-col items-start gap-2">
        <span className="text-h2 font-h2 text-color-accent2-800">
          Belong Wi-Fi 6 Modem
        </span>
        <span className="text-body-bold font-body-bold text-color-accent2-800">
          A fast and reliable modem designed to get the most out of your Belong
          nbn plan.
        </span>
      </div>
      <div className="flex w-full flex-col items-start gap-2">
        <FeatureItem
          icon={<FeatherZap />}
          title="The speed your home needs"
          description="The Belong modem delivers speeds up to 950Mbps, fast enough for all Belong nbn plans — including ultra fast fibre."
          variant="card"
        />
        <FeatureItem
          icon={<FeatherWifi />}
          title="Connect the whole house"
          description="Supports 12+ simultaneous device connections, so everyone in the household can stream, game, and scroll seamlessly."
          variant="card"
        />
        <FeatureItem
          icon={<FeatherHeart />}
          title="Support and warranty"
          description="24-month warranty with troubleshooting support (live chat or phone)."
          variant="card"
        />
        <FeatureItem
          icon={<FeatherShield />}
          title="Safe and secure"
          description="Customisable parental controls built-in. Encryption keeps your network secure, and security updates are delivered automatically — you won't need to do a thing."
          variant="card"
        />
      </div>
      <div className="flex w-full flex-col items-start gap-8 mt-auto">
        <LinkButton
          variant="brand"
          icon={null}
          onClick={() => window.open(BELONG_SUPPORT_URL, "_blank", "noopener")}
        >
          View full details on belong.com.au
        </LinkButton>
        <Button className="h-12 w-full flex-none" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
