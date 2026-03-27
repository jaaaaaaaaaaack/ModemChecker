import { FeatherChevronRight } from "@subframe/core";
import { Button } from "@/ui/components/Button";

interface SupportArticlePageProps {
  onGetStarted: () => void;
}

export function SupportArticlePage({ onGetStarted }: SupportArticlePageProps) {
  return (
    <div className="w-full max-w-[720px] mx-auto px-6 py-12 mobile:px-4 mobile:py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2 mb-2">
          <span className="text-caption font-caption text-neutral-500">
            Support &rsaquo; Internet
          </span>
          <h1 className="text-h1 font-h1 text-default-font">
            How to set up your BYO modem with Belong nbn
          </h1>
        </div>

        <div className="flex flex-col gap-4 text-body font-body text-neutral-700">
          <p>
            Bringing your own modem? Great choice. Most modern modems work with
            Belong nbn — you just need to adjust a few settings to get
            connected.
          </p>
          <p>
            Our interactive setup guide will walk you through the process step by
            step, tailored to your specific modem model.
          </p>
          <p>
            You&apos;ll need your modem&apos;s brand and model name to get
            started. This is usually printed on the back or underside of the
            device.
          </p>
        </div>

        <div className="flex flex-col gap-6 rounded-lg border border-brand-200 bg-brand-50 p-6">
          <div className="flex flex-col gap-2">
            <span className="text-h3-700 font-h3-700 text-brand-700">
              Ready to get connected?
            </span>
            <span className="text-body font-body text-brand-700">
              Search for your modem and we&apos;ll provide a step-by-step setup
              guide.
            </span>
          </div>
          <Button
            className="rounded-full self-start"
            variant="brand-primary"
            iconRight={<FeatherChevronRight />}
            hasRightIcon
            onClick={onGetStarted}
          >
            Set up my modem
          </Button>
        </div>
      </div>
    </div>
  );
}
