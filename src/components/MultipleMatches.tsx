import { useState } from "react";
import { FeatherChevronLeft, FeatherChevronRight } from "@subframe/core";
import { Button } from "../ui/components/Button";
import { IconButton } from "../ui/components/IconButton";
import { LinkButton } from "../ui/components/LinkButton";
import { RadioCardGroup } from "../ui/components/RadioCardGroup";
import { getModemImageUrl } from "../lib/supabase";
import type { Modem } from "../types";

interface MultipleMatchesProps {
  modems: Modem[];
  onSelect: (modem: Modem) => void;
  onBack: () => void;
}

export function MultipleMatches({ modems, onSelect, onBack }: MultipleMatchesProps) {
  const [selectedId, setSelectedId] = useState<string>("");

  function handleContinue() {
    const modem = modems.find((m) => m.id === selectedId);
    if (modem) {
      onSelect(modem);
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col items-start gap-6">
      <div className="flex w-full flex-col items-start gap-3">
        <span className="text-h2 font-h2 text-brand-900">Multiple matches found</span>
        <span className="text-body font-body text-brand-800">
          Check your modem's model info and select the correct one below.
        </span>
      </div>
      <RadioCardGroup
        label="Select your modem"
        value={selectedId}
        onValueChange={setSelectedId}
      >
        {modems.map((modem) => (
          <RadioCardGroup.RadioCard
            key={modem.id}
            label={modem.model}
            description={modem.brand}
            image={getModemImageUrl(modem.id)}
            value={modem.id}
          />
        ))}
      </RadioCardGroup>
      <LinkButton variant="brand" onClick={() => {}}>
        Help me identify my modem
      </LinkButton>
      <div className="flex w-full items-center justify-between mt-auto pt-2">
        <IconButton
          className="rounded-full"
          variant="neutral-primary"
          size="large"
          icon={<FeatherChevronLeft />}
          onClick={onBack}
          aria-label="Back"
        />
        <Button
          className="rounded-full"
          variant="brand-primary"
          iconRight={<FeatherChevronRight />}
          hasRightIcon={true}
          disabled={!selectedId}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
