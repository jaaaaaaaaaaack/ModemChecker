import { FeatherInfo } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { LinkButton } from "@/ui/components/LinkButton";
import { CheckerCard } from "@/ui/components/CheckerCard";
import { DEFAULT_PLAN_SPEED_MBPS } from "../constants";
import { assessCompatibility } from "../lib/compatibility";
import { getModemImageUrl } from "../lib/supabase";
import type { Modem, TechType } from "../types";

interface ResultCardProps {
  modem: Modem;
  techType: TechType;
  planSpeedMbps?: number;
  onDone?: () => void;
  onReset?: () => void;
  onAddBelongModem?: () => void;
}

export function ResultCard({
  modem,
  techType,
  planSpeedMbps = DEFAULT_PLAN_SPEED_MBPS,
  onDone,
  onReset,
  onAddBelongModem,
}: ResultCardProps) {
  const assessment = assessCompatibility(modem, techType, planSpeedMbps);

  return (
    <div className="flex w-full flex-1 flex-col items-start gap-5 min-h-0">
      <span className="text-h2 font-h2 text-color-primary-700">
        Compatibility results
      </span>
      <CheckerCard.ResultsCard
        status={assessment.cardStatus}
        modemName={modem.model}
        brand={modem.brand}
        image={getModemImageUrl(modem.id)}
        techType={techType}
        conditions={assessment.setupConditions}
        speedWarningType={assessment.speedWarning?.type ?? null}
        onAddBelongModem={onAddBelongModem}
      />
      <div className="flex w-full flex-col items-start gap-3 rounded-md border border-solid border-brand-200 bg-brand-50 px-4 py-4">
        <div className="flex items-center gap-2">
          <FeatherInfo className="text-brand-700 flex-none w-4 h-4" />
          <span className="text-body-bold font-body-bold text-brand-700">Important info</span>
        </div>
        <span className="text-body font-body text-brand-700">
          This tool provides general advice only, sourced from the modem manufacturer and other online sources. We do our best to ensure it{"\u2019"}s accurate, but you should verify your modem{"\u2019"}s compatibility and specs on the manufacturer{"\u2019"}s website.
        </span>
      </div>
      <div className="flex w-full items-center justify-between mt-auto md:mt-10 pt-2">
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
