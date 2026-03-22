import { FeatherChevronLeft, FeatherChevronRight } from "@subframe/core";
import { Button } from "@/ui/components/Button";
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
        conditions={assessment.setupConditions}
        speedWarningType={assessment.speedWarning?.type ?? null}
      />
      {isCompatible && !hasGuide && (
        <Alert
          variant="inline-brand"
          title=""
          description="We don't have a setup guide for this modem yet. Contact Belong support for help getting connected."
        />
      )}
      <div className="flex w-full items-center justify-between mt-auto md:mt-10 pt-2">
        <Button
          variant="brand-secondary"
          icon={<FeatherChevronLeft />}
          onClick={onCheckAnother}
        >
          Back
        </Button>
        {isCompatible && hasGuide ? (
          <Button
            className="rounded-full"
            variant="brand-primary"
            iconRight={<FeatherChevronRight />}
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
