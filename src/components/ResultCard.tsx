import { Link } from "react-router-dom";
import { FeatherChevronRight } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { LinkButton } from "@/ui/components/LinkButton";
import { CheckerCard } from "@/ui/components/CheckerCard";
import { DEFAULT_PLAN_SPEED_MBPS } from "../constants";
import { assessCompatibility } from "../lib/compatibility";
import { hasSetupGuide } from "../lib/setupGuides";
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
      <span className="text-caption font-caption text-default-font">
        This tool provides general advice only, we cannot guarantee its accuracy. You should verify your modem{"\u2019"}s details with the manufacturer or retailer.
      </span>
      {hasSetupGuide(modem.id) && (
        <Link
          to={`/setup?modem=${modem.id}&tech=${techType}`}
          className="flex items-center gap-1 text-body-bold font-body-bold text-brand-700 hover:text-brand-800 transition-colors"
        >
          Set up this modem
          <FeatherChevronRight className="w-4 h-4" />
        </Link>
      )}
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
