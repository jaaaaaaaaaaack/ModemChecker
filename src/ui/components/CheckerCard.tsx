// @subframe/sync-disable
"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/c141bce6134a/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * CheckerCard — https://app.subframe.com/c141bce6134a/library?component=CheckerCard_15c47a51-5291-4264-8249-1fd9e97a7afd
 * Link Button — https://app.subframe.com/c141bce6134a/library?component=Link+Button_a4ee726a-774c-4091-8c49-55b659356024
 * StatusItem — https://app.subframe.com/c141bce6134a/library?component=StatusItem_a6a68d53-7d15-411a-82fa-683addf6bc1c
 */

import React from "react";
import { motion } from "framer-motion";
import { FeatherRotateCcw } from "@subframe/core";
import { FeatherRouter } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { LinkButton } from "./LinkButton";
import { StatusItem } from "./StatusItem";
import { ModemImage } from "../../components/ModemImage";
import { ConditionList } from "../../components/ConditionList";
import { SPEED_WARNING_COPY, INDIVIDUAL_CONDITION_CODES } from "../../constants";
import type { ConditionCode, SpeedWarning, TechType } from "../../types";

// --- Stagger entry animation variants ---
const EASE_SETTLE = [0.25, 0.1, 0.25, 1] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const modemRowVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.18, ease: EASE_SETTLE },
  },
};

const statusSectionVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const statusItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: EASE_SETTLE },
  },
};

interface ResultsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: "compatible" | "not-compatible" | "speed-warning" | "callout";
  modemName?: React.ReactNode;
  brand?: React.ReactNode;
  image?: string;
  techType?: TechType;
  conditions?: ConditionCode[];
  speedWarningType?: SpeedWarning["type"] | null;
  onAddBelongModem?: () => void;
  className?: string;
}

const ResultsCard = React.forwardRef<
  HTMLDivElement,
  ResultsCardProps
>(function ResultsCard(
  {
    status = "compatible",
    modemName,
    brand,
    image,
    techType,
    conditions = [],
    speedWarningType = null,
    onAddBelongModem,
    className,
    ...otherProps
  }: ResultsCardProps,
  ref
) {
  // Only ISP_LOCK (and other INDIVIDUAL_CONDITION_CODES) get their own line item.
  // All other conditions are absorbed into the generic "Some setup required" callout.
  const individualConditions = conditions.filter((c) => INDIVIDUAL_CONDITION_CODES.has(c));

  const isFttnIncompatible = status === "not-compatible" && techType === "fttn";

  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/1d2e060b flex w-full flex-col items-start gap-2 rounded-md",
        { "items-start justify-center": status === "not-compatible" },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full items-start justify-between rounded-md border border-solid border-brand-300 bg-default-background px-4 py-4",
          {
            "flex-row flex-nowrap justify-between":
              status === "speed-warning",
            "flex-row flex-nowrap justify-between bg-white px-4 py-4":
              status === "not-compatible",
          }
        )}
      >
        <motion.div
          className={SubframeUtils.twClassNames(
            "flex grow shrink-0 basis-0 flex-col items-start gap-2 pr-4",
            {
              "flex-col flex-nowrap gap-3": status === "callout",
              "flex-col flex-nowrap items-start justify-center gap-3 pl-0 pr-4 py-0":
                status === "speed-warning",
              "flex-col flex-nowrap gap-3 pl-0 pr-4 py-0":
                status === "not-compatible",
            }
          )}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className={SubframeUtils.twClassNames(
              "flex grow shrink-0 basis-0 items-center gap-3",
              {
                "flex-row flex-nowrap items-center justify-center gap-3":
                  status === "not-compatible",
              }
            )}
            variants={modemRowVariants}
          >
            {image ? (
              <div className="flex min-w-[30px] w-fit items-start">
                <ModemImage
                  src={image}
                  alt={String(modemName ?? "Modem")}
                  className="h-16 w-auto object-contain"
                />
              </div>
            ) : null}
            <div
              className={SubframeUtils.twClassNames(
                "flex flex-col items-start gap-1",
                { "flex-col flex-nowrap gap-1": status === "not-compatible" }
              )}
            >
              {modemName ? (
                <span
                  className={SubframeUtils.twClassNames(
                    "text-h4-button-500 font-h4-button-500 text-default-font",
                    { "text-color-neutral-900": status === "speed-warning" }
                  )}
                >
                  {modemName}
                </span>
              ) : null}
              {brand ? (
                <span className="text-body font-body text-subtext-color">
                  {brand}
                </span>
              ) : null}
            </div>
          </motion.div>
          <motion.div
            className={SubframeUtils.twClassNames(
              "flex w-full flex-col items-start gap-2",
              { "flex-col flex-nowrap gap-1": status === "not-compatible" }
            )}
            variants={statusSectionVariants}
          >
            <motion.div variants={statusItemVariants}>
              <StatusItem
                title={
                  status === "not-compatible"
                    ? "Modem is not compatible"
                    : "Compatible with Belong"
                }
                description={
                  status === "not-compatible"
                    ? isFttnIncompatible
                      ? onAddBelongModem
                        ? (
                            <>
                              This modem won{"\u2019"}t work with your home
                              {"\u2019"}s nbn connection type. You can{" "}
                              <button
                                type="button"
                                className="inline cursor-pointer border-none bg-transparent p-0 text-brand-800 underline hover:no-underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddBelongModem();
                                }}
                              >
                                add a Belong modem
                              </button>
                              , or use a different compatible modem.
                            </>
                          )
                        : "This modem won\u2019t work with your home\u2019s nbn connection type. You can add a Belong modem, or use a different compatible modem."
                      : onAddBelongModem
                      ? (
                          <>
                            <button
                              type="button"
                              className="inline cursor-pointer border-none bg-transparent p-0 text-brand-800 underline hover:no-underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddBelongModem();
                              }}
                            >
                              Add a Belong modem to your order
                            </button>
                            , or purchase a different compatible modem before your connection date.
                          </>
                        )
                      : "Add a Belong modem to your order, or purchase a different compatible modem before your connection date."
                    : undefined
                }
                status={status === "not-compatible" ? "incompatible" : undefined}
                hasDescription={status === "not-compatible" ? true : undefined}
              />
            </motion.div>
            {status === "not-compatible" && (
              <motion.div
                className="flex flex-col items-start pl-8"
                variants={statusItemVariants}
              >
                <LinkButton variant="neutral">
                  {isFttnIncompatible
                    ? "See our FAQs for more info."
                    : "Learn more in our FAQs."}
                </LinkButton>
              </motion.div>
            )}
            {status !== "not-compatible" && (
              <motion.div variants={statusItemVariants}>
                <StatusItem
                  title={
                    speedWarningType
                      ? SPEED_WARNING_COPY[speedWarningType].title
                      : "Fast enough for your nbn\u00AE plan"
                  }
                  status={speedWarningType ? "warning" : undefined}
                  hasDescription={speedWarningType ? false : undefined}
                />
              </motion.div>
            )}
            {status === "callout" && (
              <motion.div variants={statusItemVariants}>
                <StatusItem
                  title="Some setup required"
                  description={"You might need to update a few modem settings. We\u2019ll send you a simple guide after your order is submitted."}
                  status="callout"
                  hasDescription={true}
                />
              </motion.div>
            )}
            {individualConditions.length > 0 && (
              <motion.div variants={statusItemVariants}>
                <ConditionList conditions={individualConditions} variant="callout" />
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
});

interface CheckerCardRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  state?: "results" | "default";
  modemName?: React.ReactNode;
  brand?: React.ReactNode;
  status?: "compatible" | "not-compatible" | "speed-warning" | "callout";
  image?: string;
  techType?: TechType;
  conditions?: ConditionCode[];
  speedWarningType?: SpeedWarning["type"] | null;
  onButtonClick?: () => void;
  onAddBelongModem?: () => void;
  className?: string;
}

const CheckerCardRoot = React.forwardRef<
  HTMLDivElement,
  CheckerCardRootProps
>(function CheckerCardRoot(
  {
    state = "results",
    modemName,
    brand,
    status = "compatible",
    image,
    techType,
    conditions = [],
    speedWarningType = null,
    onButtonClick,
    onAddBelongModem,
    className,
    ...otherProps
  }: CheckerCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/15c47a51 flex w-full flex-col items-start gap-4 rounded-md bg-color-primary-50 px-4 py-4",
        { "flex-col flex-nowrap gap-6": status === "speed-warning" },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full flex-col items-start gap-3">
        <span className="text-h3-700 font-h3-700 text-color-primary-700">
          {state === "default"
            ? "Compatibility checker"
            : "Compatibility results"}
        </span>
        <ResultsCard
          className={SubframeUtils.twClassNames({
            hidden: state === "default",
          })}
          status={
            status === "speed-warning"
              ? "speed-warning"
              : status === "not-compatible"
              ? "not-compatible"
              : status === "callout"
              ? "callout"
              : undefined
          }
          modemName={modemName}
          brand={brand}
          image={image}
          techType={techType}
          conditions={conditions}
          speedWarningType={speedWarningType}
          onAddBelongModem={onAddBelongModem}
        />
        <span
          className={SubframeUtils.twClassNames(
            "text-caption font-caption text-brand-900",
            { "text-body font-body text-brand-800": state === "default" }
          )}
        >
          {state === "default"
            ? "Check if your modem is compatible with Belong, and if it\u2019s fast enough for your selected plan."
            : "Important: This tool provides general advice only, based on information sourced online. You should verify your modem\u2019s details with the manufacturer or retailer."}
        </span>
      </div>
      <LinkButton
        className="hidden"
        variant="brand"
        icon={null}
        iconRight={null}
      >
        Check another modem
      </LinkButton>
      <Button
        variant="brand-tertiary"
        icon={state === "default" ? <FeatherRouter /> : <FeatherRotateCcw />}
        hasLeftIcon={true}
        onClick={onButtonClick}
      >
        {state === "default" ? "Check your modem" : "Check another modem"}
      </Button>
    </div>
  );
});

export const CheckerCard = Object.assign(CheckerCardRoot, {
  ResultsCard,
});
