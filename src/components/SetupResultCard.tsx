import { FeatherChevronLeft, FeatherChevronRight, FeatherInfo } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Alert } from "@/ui/components/Alert";
import { CheckerCard } from "@/ui/components/CheckerCard";
import { DEFAULT_PLAN_SPEED_MBPS } from "../constants";
import { assessCompatibility } from "../lib/compatibility";
import { hasSetupGuide } from "../lib/setupGuides";
import { getModemImageUrl } from "../lib/supabase";
import type { Modem, TechType } from "../types";

interface SetupResultCardProps {
  modem: Modem;
  techType: TechType;
  planSpeedMbps?: number;
  onSetupModem: () => void;
  onCheckAnother: () => void;
  onClose: () => void;
}

export function SetupResultCard({
  modem,
  techType,
  planSpeedMbps = DEFAULT_PLAN_SPEED_MBPS,
  onSetupModem,
  onCheckAnother,
  onClose,
}: SetupResultCardProps) {
  const assessment = assessCompatibility(modem, techType, planSpeedMbps);
  const isCompatible = assessment.cardStatus !== "not-compatible";
  const hasGuide = hasSetupGuide(modem.id);

  return (
    <div className="flex flex-1 w-full flex-col items-start gap-5">
      <span className="text-h2 font-h2 text-color-primary-700">
        Your modem
      </span>
      <CheckerCard.ResultsCard
        status={assessment.cardStatus}
        modemName={modem.model}
        brand={modem.brand}
        image={getModemImageUrl(modem.id)}
        techType={techType}
        conditions={[]}
        speedWarningType={assessment.speedWarning?.type ?? null}
      />
      {isCompatible && !hasGuide && (
        <Alert
          variant="inline-brand"
          title=""
          description="We don't have a setup guide for this modem yet. Contact Belong support for help getting connected."
        />
      )}
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
        <IconButton
          variant="white"
          size="large"
          icon={<FeatherChevronLeft className="-ml-0.5" />}
          onClick={onCheckAnother}
        />
        {isCompatible && hasGuide ? (
          <Button
            className="rounded-full"
            variant="brand-primary"
            iconRight={<FeatherChevronRight />}
            hasRightIcon={true}
            onClick={onSetupModem}
          >
            Set up my modem
          </Button>
        ) : (
          <Button
            className="rounded-full"
            variant="brand-primary"
            icon={null}
            iconRight={null}
            onClick={onClose}
          >
            Close
          </Button>
        )}
      </div>
    </div>
  );
}
