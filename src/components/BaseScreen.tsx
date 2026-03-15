"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FeatherChevronRight } from "@subframe/core";
import { Button } from "../ui/components/Button";
import { CheckerCard } from "../ui/components/CheckerCard";
import { OrderCard } from "../ui/components/OrderCard";
import { RadioCardGroup } from "../ui/components/RadioCardGroup";
import { getModemImageUrl } from "../lib/supabase";
import { assessCompatibility } from "../lib/compatibility";
import { NBN_PLANS } from "../constants";
import type { Modem, TechType, NbnTechType } from "../types";

interface BaseScreenProps {
  onCheckModem: () => void;
  verifiedModem?: Modem;
  techType: TechType;
  planSpeedMbps: number;
  nbnTechType: NbnTechType;
  planId: string;
  onOpenDevMenu: () => void;
}

export function BaseScreen({
  onCheckModem,
  verifiedModem,
  techType,
  planSpeedMbps,
  nbnTechType,
  planId,
  onOpenDevMenu,
}: BaseScreenProps) {
  const [selection, setSelection] = useState<string>("");

  const currentPlan = NBN_PLANS.find((p) => p.id === planId) ?? NBN_PLANS[1];

  const renderModemCard = () => {
    if (!verifiedModem) {
      return (
        <CheckerCard
          state="default"
          onButtonClick={onCheckModem}
        />
      );
    }

    const assessment = assessCompatibility(verifiedModem, techType, planSpeedMbps);

    return (
      <CheckerCard
        state="results"
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
      <div className="flex w-full max-w-[384px] flex-col items-start justify-between pb-2">
        <div className="flex w-full flex-col items-start gap-10">
          <div className="flex w-full flex-col items-start gap-4">
            <div className="flex w-full flex-col items-start gap-4">
              <span className="text-h2 font-h2 text-color-primary-700">
                Modem selection
              </span>
              <RadioCardGroup
                className="flex-col"
                label="Do you want to add a Belong Modem?"
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
            </div>

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
                    Modem compatibility
                  </span>
                  <span className="text-body font-body text-default-font">
                    It&apos;s important to know that not all modems are compatible
                    with different nbn providers. Also, if your modem isn&apos;t
                    fast enough, it may limit the speed you can get from your
                    plan. We recommend you check its compatibility.
                  </span>
                  {renderModemCard()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div className="flex w-full flex-col items-start gap-2">
            <div className="flex w-full items-center gap-4">
              <span className="grow text-h2 font-h2 text-brand-800">
                Order summary
              </span>
            </div>
            <OrderCard
              planLabel={`${currentPlan.label} plan`}
              planPrice={currentPlan.price}
              modemLabel={selection === "byo" ? "BYO Modem" : "Belong Modem"}
              modemPrice={selection === "byo" ? "Free" : "$0 upfront"}
              totalPrice={currentPlan.price}
              onClick={onOpenDevMenu}
              className="cursor-pointer transition-colors hover:border-brand-400 active:scale-[0.99]"
            />
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex w-full items-center justify-between pt-6">
          <Button
            variant="brand-secondary"
            onClick={() => {}}
          >
            Back
          </Button>
          <Button
            iconRight={<FeatherChevronRight />}
            onClick={() => {}}
          >
            Start checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
