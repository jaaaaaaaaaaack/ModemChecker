import { FeatherChevronRight } from "@subframe/core";
import { Button } from "@/ui/components/Button";

interface SetupLandingProps {
  onGetStarted: () => void;
}

export function SetupLanding({ onGetStarted }: SetupLandingProps) {
  return (
    <div className="flex w-full flex-col items-start gap-6">
      <div className="flex w-full flex-col items-start gap-2">
        <h1 className="text-h1 font-h1 text-brand-800 mobile:text-h2 mobile:font-h2">
          Set up your modem
        </h1>
        <span className="text-body font-body text-default-font">
          We'll help you identify your modem and walk you through connecting it.
        </span>
      </div>
      <Button
        className="rounded-full"
        variant="brand-primary"
        iconRight={<FeatherChevronRight />}
        onClick={onGetStarted}
      >
        Get started
      </Button>
    </div>
  );
}
