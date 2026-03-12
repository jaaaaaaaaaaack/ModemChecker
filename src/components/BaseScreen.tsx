"use client";

import { useState } from "react";
import { Button } from "../ui/components/Button";
import { LinkButton } from "../ui/components/LinkButton";
import { RadioCardGroup } from "../ui/components/RadioCardGroup";

interface VerifiedModem {
  brand: string;
  model: string;
}

interface BaseScreenProps {
  onCheckModem: () => void;
  verifiedModem?: VerifiedModem;
}

export function BaseScreen({ onCheckModem, verifiedModem }: BaseScreenProps) {
  const [selection, setSelection] = useState<string>("");

  return (
    <div className="flex w-full flex-col items-center bg-white px-4 py-6">
      <div className="flex w-full max-w-[384px] flex-col items-start gap-6">
        <span className="text-h2 font-h2 text-color-primary-700">
          Modem selection
        </span>
        <RadioCardGroup
          className="flex-col"
          label="Do you need a Belong Modem?"
          helpText=""
          value={selection}
          onValueChange={(value: string) => setSelection(value)}
        >
          <RadioCardGroup.RadioCard
            hideRadio={false}
            label="Yes, I need a Belong modem"
            value="belong"
          />
          <RadioCardGroup.RadioCard
            hideRadio={false}
            label="No, I'll use my own compatible modem"
            value="byo"
          />
        </RadioCardGroup>

        {selection === "byo" && (
          <div className="flex w-full flex-col items-start gap-4">
            <span className="text-h3-700 font-h3-700 text-color-primary-700">
              BYO Modem compatibility
            </span>
            <span className="text-body font-body text-default-font">
              Your choice of modem, and how you set it up, could cause
              connectivity issues or limit the speed of your internet.
            </span>

            {verifiedModem ? (
              <div className="flex w-full flex-col items-start gap-3 rounded-md bg-color-primary-50 px-4 py-4">
                <span className="text-h3-700 font-h3-700 text-color-primary-700">
                  Modem compatibility checker
                </span>
                <div className="flex w-full items-center justify-between rounded-md border border-solid border-white bg-default-background pl-4 pr-3 py-2 shadow-sm">
                  <span className="text-body-bold font-body-bold text-default-font">
                    {verifiedModem.model}
                  </span>
                </div>
                <LinkButton variant="brand" onClick={() => {}}>
                  Check another modem
                </LinkButton>
              </div>
            ) : (
              <div className="flex w-full flex-col items-start gap-3 rounded-md bg-color-primary-50 px-4 py-4">
                <span className="text-h3-700 font-h3-700 text-color-primary-700">
                  Modem compatibility checker
                </span>
                <span className="text-body font-body text-default-font">
                  Check that your modem can connect to Belong nbn® and that
                  it's fast enough for your selected plan.
                </span>
                <Button
                  className="rounded-full"
                  variant="brand-secondary"
                  onClick={onCheckModem}
                >
                  Check your modem
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
