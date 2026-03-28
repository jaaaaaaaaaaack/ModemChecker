import { ModemIdentityCard } from "@/ui/components/ModemIdentityCard";
import { Alert } from "@/ui/components/Alert";
import { Button } from "@/ui/components/Button";
import { LinkButton } from "@/ui/components/LinkButton";
import { getModemImageUrl } from "../lib/supabase";
import { FeatherMessageCircle } from "@subframe/core";

interface SetupGuideNotAvailableProps {
  modemId: string;
  brand?: string;
  model?: string;
  omitHeading?: boolean;
  onSearchAgain: () => void;
}

export function SetupGuideNotAvailable({
  modemId,
  brand,
  model,
  omitHeading,
  onSearchAgain,
}: SetupGuideNotAvailableProps) {
  const modemName = brand && model ? `${brand} ${model}` : "this modem";

  return (
    <div className="flex w-full flex-col items-start gap-6">
      {!omitHeading && (
        <h1 className="text-h1 font-h1 text-brand-800 mobile:text-h2 mobile:font-h2">
          BYO modem setup
        </h1>
      )}
      {brand && model && (
        <ModemIdentityCard
          image={getModemImageUrl(modemId)}
          label="Your modem"
          title={modemName}
          action={<LinkButton onClick={onSearchAgain}>Change</LinkButton>}
        />
      )}
      <Alert
        variant="warning"
        title="Setup guide not available"
        description={`We don't have a setup guide for ${modemName} yet. Please contact Belong support for help getting connected.`}
      />
      <div className="flex w-full items-center gap-3">
        <Button
          variant="brand-primary"
          size="medium"
          icon={<FeatherMessageCircle />}
          hasLeftIcon={true}
          onClick={() => {}}
        >
          Talk to support
        </Button>
        <LinkButton variant="brand" onClick={onSearchAgain}>
          Search for a different modem
        </LinkButton>
      </div>
    </div>
  );
}
