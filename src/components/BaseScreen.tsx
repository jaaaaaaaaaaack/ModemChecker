"use client";

import { useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FeatherCheck, FeatherChevronRight, FeatherRouter } from "@subframe/core";
import { Button } from "../ui/components/Button";
import { CheckerCard } from "../ui/components/CheckerCard";
import { LinkButton } from "../ui/components/LinkButton";
import { OrderCard } from "../ui/components/OrderCard";
import { RadioCardGroup } from "../ui/components/RadioCardGroup";
import { getModemImageUrl } from "../lib/supabase";
import { assessCompatibility } from "../lib/compatibility";
import { NBN_PLANS, NBN_TECH_LABELS } from "../constants";
import type { Modem, TechType, NbnTechType } from "../types";

interface BaseScreenProps {
  onCheckModem: () => void;
  onLearnMore?: () => void;
  verifiedModem?: Modem;
  techType: TechType;
  planSpeedMbps: number;
  nbnTechType: NbnTechType;
  planId: string;
  onOpenDevMenu: () => void;
  modemSummaryRef?: RefObject<HTMLDivElement | null>;
}

export function BaseScreen({
  onCheckModem,
  onLearnMore,
  verifiedModem,
  techType,
  planSpeedMbps,
  nbnTechType,
  planId,
  onOpenDevMenu,
  modemSummaryRef,
}: BaseScreenProps) {
  const [selection, setSelection] = useState<string>("");

  const currentPlan = NBN_PLANS.find((p) => p.id === planId) ?? NBN_PLANS[1];

  return (
    <div className="flex w-full flex-col items-center bg-neutral-50 px-4 py-6">
      <div className="flex w-full max-w-[384px] flex-col items-start justify-between pb-2">
        <div className="flex w-full flex-col items-start gap-8">
          <div className="flex w-full flex-col items-start gap-4">
            {/* Heading + modem summary + radio group */}
            <div className="flex w-full flex-col items-start gap-8">
              <div className="flex w-full flex-col items-start gap-4">
                <div className="flex flex-col items-start gap-2">
                  <span className="text-h2 font-h2 text-brand-800">
                    Modem selection
                  </span>
                  <span className="text-body-bold font-body-bold text-default-font">
                    You can choose to add a Belong modem, or bring-your-own
                    compatible modem.
                  </span>
                  <span className="text-body font-body text-default-font">
                    If you choose to BYO modem, we&apos;ll help you check
                    that it&apos;s compatible with your plan.
                  </span>
                </div>
                <div ref={modemSummaryRef} className="flex w-full flex-col items-start gap-3 rounded-md bg-color-accent2-100 px-4 py-4">
                  <div className="flex w-full items-start gap-4">
                    <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
                      <span className="text-h4-button-700 font-h4-button-700 text-color-accent2-800">
                        Belong Modem
                      </span>
                      <span className="text-body font-body text-default-font">
                        $132 upfront, or $11/month over 12 months
                      </span>
                    </div>
                    <img
                      className="h-20 w-28 flex-none rounded-md object-cover"
                      src="https://res.cloudinary.com/subframe/image/upload/v1773555007/uploads/11901/q3kxnpvkqcjl8176het5.png"
                      alt="Belong Modem"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <FeatherCheck className="text-h4-button-500 font-h4-button-500 text-color-accent2-800" />
                      <span className="text-body font-body text-default-font">
                        Supports all Belong nbn plans
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FeatherCheck className="text-h4-button-500 font-h4-button-500 text-color-accent2-800" />
                      <span className="text-body font-body text-default-font">
                        Connect to 12+ devices at once
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FeatherCheck className="text-h4-button-500 font-h4-button-500 text-color-accent2-800" />
                      <span className="text-body font-body text-default-font">
                        24-month warranty
                      </span>
                    </div>
                  </div>
                  <LinkButton icon={null} iconRight={null} onClick={onLearnMore}>
                    Learn more
                  </LinkButton>
                </div>
              </div>
              <RadioCardGroup
                className="flex-col"
                label="Do you want to add a Belong Modem?"
                helpText=""
                value={selection}
                onValueChange={(value: string) => setSelection(value)}
              >
                <RadioCardGroup.RadioCard
                  hideRadio={false}
                  label="Yes, I want a Belong modem"
                  value="belong"
                />
                <RadioCardGroup.RadioCard
                  hideRadio={false}
                  label="No, I'll use my own modem"
                  value="byo"
                />
              </RadioCardGroup>
            </div>

            {/* BYO section */}
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
                  <div className="flex flex-col items-start gap-3">
                    <span className="text-h3-700 font-h3-700 text-brand-800">
                      Modem compatibility
                    </span>
                    <span className="text-body font-body text-default-font">
                      Not all modems are compatible with every nbn provider. If
                      yours isn&apos;t compatible, or isn&apos;t fast enough, it
                      could affect your connection or limit your plan&apos;s
                      speeds.
                    </span>
                  </div>

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

          {/* Order summary */}
          <OrderCard
            planLabel={`${currentPlan.label} plan`}
            planPrice={currentPlan.price}
            modemLabel={selection === "byo" ? "Bring-your-own modem" : selection === "belong" ? "Belong Modem" : "No modem selected"}
            modemPrice={selection === "byo" ? "Free" : selection === "belong" ? "$0 upfront" : ""}
            totalPrice={currentPlan.price}
            serviceAddress="123 Somewhere St, Anytown, VIC"
            nbnTechType={NBN_TECH_LABELS[nbnTechType]}
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
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
