"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FeatherChevronRight, FeatherRouter } from "@subframe/core";
import { Button } from "../ui/components/Button";
import { CheckerCard } from "../ui/components/CheckerCard";
import { LinkButton } from "../ui/components/LinkButton";
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

  return (
    <div className="flex w-full flex-col items-center bg-neutral-50 px-4 py-6">
      <div className="flex w-full max-w-[384px] flex-col items-start justify-between pb-2">
        <div className="flex w-full flex-col items-start gap-12">
          <div className="flex w-full flex-col items-start gap-4">
            <div className="flex w-full flex-col items-start gap-4">
              <span className="text-h2 font-h2 text-color-primary-600">
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
                    Not all modems are compatible with every nbn provider. If
                    yours isn&apos;t compatible, or isn&apos;t fast enough, it
                    could affect your connection or limit your plan&apos;s
                    speeds.
                  </span>

                  {/* Default: check button / Results: CheckerCard */}
                  {verifiedModem ? (
                    (() => {
                      const assessment = assessCompatibility(
                        verifiedModem,
                        techType,
                        planSpeedMbps
                      );
                      return (
                        <CheckerCard
                          state="results"
                          status={assessment.cardStatus}
                          speedWarningType={
                            assessment.speedWarning?.type ?? null
                          }
                          conditions={assessment.setupConditions}
                          modemName={verifiedModem.model}
                          brand={verifiedModem.brand}
                          image={getModemImageUrl(verifiedModem.id)}
                          onButtonClick={onCheckModem}
                        />
                      );
                    })()
                  ) : (
                    <Button
                      className="h-12 w-auto flex-none"
                      variant="brand-tertiary"
                      icon={<FeatherRouter />}
                      hasLeftIcon={true}
                      onClick={onCheckModem}
                    >
                      Check your modem
                    </Button>
                  )}

                  {/* FAQ link */}
                  <div className="flex flex-col items-start">
                    <span className="text-body font-body text-default-font">
                      Need more information or help? Check out our
                    </span>
                    <LinkButton variant="brand" onClick={() => {}}>
                      Modem compatibility FAQs
                    </LinkButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary — no heading, just the card */}
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

        {/* Footer buttons */}
        <div className="flex w-full items-center justify-between pt-6">
          <Button
            className="h-12 w-auto flex-none"
            variant="brand-secondary"
            onClick={() => {}}
          >
            Back
          </Button>
          <Button
            className="h-12 w-auto flex-none"
            iconRight={<FeatherChevronRight />}
            hasRightIcon={true}
            onClick={() => {}}
          >
            Start checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
