import { Button } from "@/ui/components/Button";
import { LinkButton } from "@/ui/components/LinkButton";
import { StatusIte } from "@/ui/components/StatusIte";
import { FeatherWifi } from "@subframe/core";
import { STATUS_CONFIG, DEFAULT_PLAN_SPEED_MBPS, SPEED_WARNING_COPY } from "../constants";
import { assessCompatibility } from "../lib/compatibility";
import { getModemImageUrl } from "../lib/supabase";
import { ModemImage } from "./ModemImage";
import { ConditionList } from "./ConditionList";
import type { Modem, TechType } from "../types";

interface ResultCardProps {
  modem: Modem;
  techType: TechType;
  planSpeedMbps?: number;
  onDone?: () => void;
  onReset?: () => void;
}

export function ResultCard({
  modem,
  techType,
  planSpeedMbps = DEFAULT_PLAN_SPEED_MBPS,
  onDone,
  onReset,
}: ResultCardProps) {
  const assessment = assessCompatibility(modem, techType, planSpeedMbps);

  // Map assessment to headline StatusIte props
  let headlineTitle: string;
  let headlineStatus: "compatible" | "incompatible" | "warning" | "option-1";

  switch (assessment.cardStatus) {
    case "compatible":
      headlineTitle = STATUS_CONFIG.yes.heading;
      headlineStatus = "compatible";
      break;
    case "speed-warning":
      headlineTitle = SPEED_WARNING_COPY[assessment.speedWarning!.type].title;
      headlineStatus = "warning";
      break;
    case "callout":
      headlineTitle = STATUS_CONFIG.yes_but.heading;
      headlineStatus = "compatible";
      break;
    case "not-compatible":
      headlineTitle = STATUS_CONFIG.no.heading;
      headlineStatus = "incompatible";
      break;
  }

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
            title={headlineTitle}
            description=""
            status={headlineStatus}
          />
          {assessment.setupConditions.length > 0 && (
            <ConditionList conditions={assessment.setupConditions} />
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
