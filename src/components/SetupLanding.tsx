import { FeatherPhone, FeatherX } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { LinkButton } from "@/ui/components/LinkButton";

interface SetupLandingProps {
  onGetStarted: () => void;
}

export function SetupLanding({ onGetStarted }: SetupLandingProps) {
  return (
    <div className="flex w-full flex-col items-start">
      {/* Cards */}
      <div className="flex w-full flex-col items-start gap-4 px-4 py-4">
        {/* NBN service card */}
        <div className="flex w-full flex-col items-start gap-4 rounded-md bg-default-background px-4 py-4 shadow-lg">
          <div className="flex w-full flex-col items-start gap-4">
            <div className="flex w-full items-start justify-between">
              <img
                className="h-24 w-32 flex-none object-contain"
                src="/nbnPlan.webp"
                alt="nbn modem"
              />
              <div className="flex h-9 items-center gap-2 rounded-lg bg-[#ecfdf5] px-3.5">
                <div className="flex h-3 w-3 flex-none rounded-full bg-color-secondary-400" />
                <span className="whitespace-nowrap text-caption-bold font-caption-bold text-color-secondary-400">
                  Active
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-4">
              <span className="text-h2 font-h2 text-default-font">
                nbn® Fast plan
              </span>
              <div className="flex flex-col items-start gap-2">
                <span className="text-h4-button-500 font-h4-button-500 text-neutral-700">
                  15 Flinders Street, Thornbury
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-body font-body text-neutral-600">
                    AVC ID:
                  </span>
                  <span className="text-body font-body text-neutral-600">
                    AVC000191309572
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modem setup CTA — inside the card */}
          <div className="flex w-full min-w-[240px] flex-col items-start gap-4 rounded-md border border-solid border-brand-200 bg-brand-50 px-4 pt-4 pb-5">
            <div className="flex w-full flex-col items-start gap-2">
              <div className="flex w-full items-center gap-2">
                <span className="grow shrink-0 basis-0 text-h3-700 font-h3-700 text-brand-700">
                  Set up your modem
                </span>
                <IconButton
                  className="h-7 w-7 flex-none"
                  variant="white"
                  size="small"
                  icon={<FeatherX />}
                  onClick={() => {}}
                />
              </div>
              <span className="w-full text-body font-body text-brand-700">
                Need a hand getting connected? We have setup guides for many
                popular modems to help you get online fast.
              </span>
            </div>
            <LinkButton variant="brand" onClick={onGetStarted}>
              View modem setup guide
            </LinkButton>
          </div>

          <Button
            variant="cyan-tertiary"
            onClick={() => {}}
          >
            Manage nbn® service
          </Button>
        </div>

        {/* Mobile service card */}
        <div className="flex w-full flex-col items-start gap-4 rounded-md bg-default-background px-4 py-4 shadow-lg">
          <div className="flex w-full flex-col items-start gap-4">
            <div className="flex w-full items-start justify-between">
              <img
                className="h-24 w-32 flex-none object-cover"
                src="/mobilePlan.webp"
                alt="Mobile plan"
              />
              <div className="flex h-9 items-center gap-2 rounded-lg bg-[#ecfdf5] px-3.5">
                <div className="flex h-3 w-3 flex-none rounded-full bg-color-secondary-400" />
                <span className="whitespace-nowrap text-caption-bold font-caption-bold text-[#00b862]">
                  Active
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-4">
              <div className="flex flex-col items-start gap-2">
                <span className="text-h2 font-h2 text-default-font">
                  40 GB mobile plan
                </span>
                <div className="flex items-center gap-1">
                  <FeatherPhone className="text-h4-button-500 font-h4-button-500 text-neutral-600" />
                  <span className="text-body font-body text-neutral-600">
                    0401 234 567
                  </span>
                </div>
              </div>

              {/* Data usage callout */}
              <div className="flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-neutral-50 px-4 py-4">
                <div className="flex flex-col items-start gap-2">
                  <span className="text-h3-700 font-h3-700 text-neutral-700">
                    24.7 GB left
                  </span>
                  <span className="text-body font-body text-neutral-600">
                    You&apos;ll get another 40 GB in 6 days (30 March)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="cyan-tertiary"
            onClick={() => {}}
          >
            Manage mobile
          </Button>
        </div>
      </div>
    </div>
  );
}
