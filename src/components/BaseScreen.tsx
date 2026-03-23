"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FeatherCheck, FeatherChevronLeft, FeatherChevronRight, FeatherRouter } from "@subframe/core";
import { Button } from "../ui/components/Button";
import { IconButton } from "../ui/components/IconButton";
import { CheckerCard } from "../ui/components/CheckerCard";
import { LinkButton } from "../ui/components/LinkButton";
import { OrderCard } from "../ui/components/OrderCard";
import { ProductCard } from "../ui/components/ProductCard";
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
  const [selection, setSelection] = useState<"" | "belong" | "byo">("");
  const byoSectionRef = useRef<HTMLDivElement>(null);
  const orderCardRef = useRef<HTMLDivElement>(null);

  // Scroll newly-revealed content into view after radio selection
  useEffect(() => {
    if (!selection) return;
    // Small delay so the enter animation has started and layout is stable
    const timeout = setTimeout(() => {
      const target = selection === "byo" ? byoSectionRef.current : orderCardRef.current;
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    return () => clearTimeout(timeout);
  }, [selection]);

  const handleAddBelongModem = () => {
    modemSummaryRef?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const currentPlan = NBN_PLANS.find((p) => p.id === planId) ?? NBN_PLANS[1];

  return (
    <div className="flex w-full flex-col items-center rounded-md border border-solid border-neutral-border bg-neutral-50 px-4 py-6 shadow-sm mobile:rounded-none mobile:border-none">
      <div className="flex w-full max-w-[384px] flex-col items-start justify-between pb-2">
        {/* Outer gap-8: between [content block] and [order card] */}
        <div className="flex w-full flex-col items-start gap-8">
          {/* All top sections share gap-8 rhythm: heading+card, radio, BYO */}
          <div className="flex w-full flex-col items-start gap-8">
            {/* Heading + ProductCard — gap-4 */}
            <div className="flex w-full flex-col items-start gap-4">
              <div className="flex flex-col items-start gap-2">
                <span className="text-h2 font-h2 text-brand-900">
                  Modem selection
                </span>
                <span className="text-body font-body text-default-font">
                  You can choose to add a Belong modem, or bring your own
                  compatible modem.
                </span>
              </div>
              <ProductCard
                ref={modemSummaryRef}
                title="Belong Modem"
                pricing={"$132 upfront or\n$11/month over 12 months"}
                productImage="https://res.cloudinary.com/subframe/image/upload/v1773555007/uploads/11901/q3kxnpvkqcjl8176het5.png"
                features={
                  <>
                    <div className="flex items-center gap-2">
                      <FeatherCheck className="text-h4-button-500 font-h4-button-500 text-brand-800" />
                      <span className="text-body font-body text-default-font">
                        Fast and reliable
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FeatherCheck className="text-h4-button-500 font-h4-button-500 text-brand-800" />
                      <span className="text-body font-body text-default-font">
                        Simple setup
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FeatherCheck className="text-h4-button-500 font-h4-button-500 text-brand-800" />
                      <span className="text-body font-body text-default-font">
                        24-month warranty
                      </span>
                    </div>
                  </>
                }
                variant="brand-flat"
                onClick={onLearnMore}
              />
            </div>

            {/* Radio group */}
            <RadioCardGroup
              className="flex-col"
              label="Do you want to add a Belong Modem?"
              helpText=""
              value={selection}
              onValueChange={(value: string) => setSelection(value as "" | "belong" | "byo")}
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

            {/* BYO compatibility section (animated) */}
            <AnimatePresence>
              {selection === "byo" && (
                <motion.div
                  ref={byoSectionRef}
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
                          techType={techType}
                          onAddBelongModem={handleAddBelongModem}
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

          {/* Order summary (animated) */}
          <AnimatePresence>
            {selection && (
              <motion.div
                ref={orderCardRef}
                key="order-summary"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full"
              >
                <OrderCard
                  planLabel={`${currentPlan.label} plan`}
                  planPrice={currentPlan.price}
                  modemLabel={selection === "byo" ? "BYO Modem" : "Belong Modem"}
                  modemPrice={selection === "byo" ? "Free" : "$0 upfront"}
                  totalPrice={currentPlan.price}
                  serviceAddress="123 Somewhere St, Anytown, VIC"
                  nbnTechType={NBN_TECH_LABELS[nbnTechType]}
                  onClick={onOpenDevMenu}
                  className="cursor-pointer transition-colors hover:border-brand-400 active:scale-[0.99]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer buttons */}
        <div className="flex w-full items-center justify-between pt-6">
          <IconButton
            variant="white"
            icon={<FeatherChevronLeft className="-ml-0.5" />}
            onClick={() => {}}
          />
          <AnimatePresence>
            {selection && (
              <motion.div
                key="continue-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Button
                  className="h-12 w-auto flex-none"
                  iconRight={<FeatherChevronRight />}
                  hasRightIcon={true}
                  onClick={() => {}}
                >
                  Continue
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
