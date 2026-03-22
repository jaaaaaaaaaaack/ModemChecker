import { FeatherArrowRight, FeatherX } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { ServiceCard } from "@/ui/components/ServiceCard";

interface SetupLandingProps {
  onGetStarted: () => void;
}

export function SetupLanding({ onGetStarted }: SetupLandingProps) {
  return (
    <div className="flex w-full flex-col items-start">
      {/* Welcome banner */}
      <div className="flex w-full flex-col items-center justify-center gap-2 bg-neutral-900 -mx-0 px-4 pt-4 pb-6 -mt-4 mobile:-mt-4">
        <span className="text-h1 font-h1 text-white">Welcome, Jack</span>
      </div>

      {/* Cards */}
      <div className="flex w-full flex-col items-start gap-4 px-4 py-4">
        <ServiceCard
          image="https://res.cloudinary.com/subframe/image/upload/v1774220418/uploads/11901/d5boxn9jzxijpwfu8wmg.png"
          planName="nbn® Fast plan"
          address={"15 Flinders Street, Thornbury"}
          avcId="AVC000191309572"
          buttonText="Manage internet"
          statusText="Active"
        />

        {/* Modem setup promo card */}
        <div className="flex w-full min-w-[240px] flex-col items-start gap-4 rounded-md border border-solid border-brand-primary bg-brand-100 px-4 py-4">
          <div className="flex w-full flex-col items-start gap-2">
            <div className="flex w-full items-center gap-2">
              <span className="grow shrink-0 basis-0 text-h3-700 font-h3-700 text-brand-700">
                Modem setup
              </span>
              <IconButton
                variant="option-1"
                size="small"
                icon={<FeatherX />}
                onClick={() => {}}
              />
            </div>
            <span className="w-full text-body font-body text-brand-700">
              Need a hand getting connected? We have setup guides for most
              popular modems that will help you get online fast.
            </span>
          </div>
          <Button
            variant="cyan-secondary"
            iconRight={<FeatherArrowRight />}
            hasRightIcon={true}
            onClick={onGetStarted}
          >
            Set up your modem
          </Button>
        </div>
      </div>
    </div>
  );
}
