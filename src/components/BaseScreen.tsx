"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/components/Button";
import { CheckerCard } from "../ui/components/CheckerCard";
import { RadioCardGroup } from "../ui/components/RadioCardGroup";
import { getModemImageUrl } from "../lib/supabase";
import { assessCompatibility } from "../lib/compatibility";
import { DEFAULT_PLAN_SPEED_MBPS } from "../constants";
import type { Modem, TechType } from "../types";

interface BaseScreenProps {
  onCheckModem: () => void;
  verifiedModem?: Modem;
  techType?: TechType;
  planSpeedMbps?: number;
}

export function BaseScreen({
  onCheckModem,
  verifiedModem,
  techType = "fttp",
  planSpeedMbps = DEFAULT_PLAN_SPEED_MBPS,
}: BaseScreenProps) {
  const [selection, setSelection] = useState<string>("");

  const renderModemCard = () => {
    if (!verifiedModem) {
      return (
        <div className="flex w-full flex-col items-start gap-3 rounded-md bg-gradient-brand px-4 py-4">
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
      );
    }

    const assessment = assessCompatibility(verifiedModem, techType, planSpeedMbps);

    return (
      <CheckerCard
        status={assessment.cardStatus}
        speedWarningType={assessment.speedWarning?.type ?? null}
        conditions={assessment.setupConditions}
        modemName={verifiedModem.model}
        brand={verifiedModem.brand}
        image={getModemImageUrl(verifiedModem.id)}
        onButtonClick={onCheckModem}
      />
    );
  };

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

        <AnimatePresence>
          {selection === "byo" && (
            <motion.div
              key="byo-section"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex w-full flex-col items-start gap-4"
            >
              <span className="text-h3-700 font-h3-700 text-color-primary-700">
                BYO Modem compatibility
              </span>
              <span className="text-body font-body text-default-font">
                Your choice of modem, and how you set it up, could cause
                connectivity issues or limit the speed of your internet.
              </span>
              {renderModemCard()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
