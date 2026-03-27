import { FeatherChevronRight } from "@subframe/core";
import { Button } from "@/ui/components/Button";

interface SupportArticlePageProps {
  onGetStarted: () => void;
}

export function SupportArticlePage({ onGetStarted }: SupportArticlePageProps) {
  return (
    <div className="flex flex-col gap-8 pt-8 pb-12 mobile:pt-6 mobile:pb-8">
      {/* Category label + H1 */}
      <div className="flex flex-col gap-3">
        <span className="text-caption font-caption text-brand-700">
          Getting started
        </span>
        <h1 className="text-h1 font-h1 text-default-font">
          How to set up your BYO modem with Belong nbn
        </h1>
      </div>

      {/* Intro */}
      <div className="flex flex-col gap-4 text-body font-body text-neutral-700">
        <p>
          Bringing your own modem? Great choice. Most modern modems work with
          Belong nbn — you just need to adjust a few settings to get
          connected.
        </p>
      </div>

      {/* Quick tips */}
      <div className="flex flex-col gap-3">
        <h2 className="text-h3-700 font-h3-700 text-default-font">
          Quick tips
        </h2>
        <p className="text-body font-body text-neutral-700">
          Here are a few things you can do if your modem isn&apos;t working
          with your Belong internet service:
        </p>
        <ol className="list-decimal list-outside ml-5 flex flex-col gap-2.5 text-body font-body text-neutral-700">
          <li>
            Make sure your modem is using IPoE (IP over Ethernet) — this is
            the connection type Belong uses. Check with your modem&apos;s
            manufacturer for instructions.
          </li>
          <li>
            Check your cables and connections to make sure everything&apos;s
            plugged in correctly.
          </li>
          <li>
            Restart your equipment. Turn off your modem and nbn connection
            device, wait 10 minutes, then turn them back on.
          </li>
          <li>
            Check your modem lights — they&apos;ll help you identify
            what&apos;s working and what&apos;s not.
          </li>
        </ol>
      </div>

      {/* CTA card */}
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
  );
}
