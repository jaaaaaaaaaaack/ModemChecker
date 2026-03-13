import { Button } from "@/ui/components/Button";
import { LinkButton } from "@/ui/components/LinkButton";
import { StatusIte } from "@/ui/components/StatusIte";
import { FeatherWifi } from "@subframe/core";
import { STATUS_CONFIG } from "../constants";
import { getModemImageUrl } from "../lib/supabase";
import { ModemImage } from "./ModemImage";
import { ConditionList } from "./ConditionList";
import type { Modem, TechType, CompatibilityStatus } from "../types";

interface ResultCardProps {
  modem: Modem;
  techType: TechType;
  onDone?: () => void;
  onReset?: () => void;
}

const STATUS_TO_STATUSITE: Record<CompatibilityStatus, "success" | "warning" | "info"> = {
  yes: "success",
  yes_but: "warning",
  no: "warning",
};

export function ResultCard({ modem, techType, onDone, onReset }: ResultCardProps) {
  const compat = modem.compatibility[techType];
  const config = STATUS_CONFIG[compat.status];
  const statusIteStatus = STATUS_TO_STATUSITE[compat.status];

  return (
    <div className="flex w-full flex-col items-start gap-5">
      <div className="flex h-40 w-40 flex-none items-center justify-center rounded-md bg-color-primary-100">
        <FeatherWifi className="font-['Plus_Jakarta_Sans'] text-[64px] font-[400] leading-[96px] text-color-primary-400" />
      </div>
      <div className="flex w-full flex-col items-start gap-4">
        <span className="text-h2 font-h2 text-color-primary-700">
          Compatibility results
        </span>
        <div className="flex w-full items-center gap-3 rounded-md bg-white px-4 py-3 shadow-sm">
          <ModemImage
            src={getModemImageUrl(modem.id)}
            alt={`${modem.brand} ${modem.model}`}
            className="w-12 h-12 rounded-md"
          />
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-caption font-caption text-subtext-color">
              {modem.brand}
            </span>
            <span className="text-body-bold font-body-bold text-default-font">
              {modem.model}
            </span>
          </div>
        </div>
        <div className="flex w-full flex-col items-start gap-2">
          <StatusIte
            icon={null}
            title={config.heading}
            description=""
            status={statusIteStatus}
          />
          {compat.status === "yes_but" && (
            <ConditionList conditions={compat.conditions} />
          )}
        </div>
      </div>
      <div className="flex w-full items-center justify-between pt-2">
        <LinkButton
          variant="brand"
          icon={null}
          iconRight={null}
          onClick={onReset}
        >
          Check another modem
        </LinkButton>
        <Button
          className="rounded-full"
          variant="brand-primary"
          icon={null}
          iconRight={null}
          onClick={onDone}
        >
          Close
        </Button>
      </div>
    </div>
  );
}
