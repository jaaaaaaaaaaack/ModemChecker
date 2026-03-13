// @subframe/sync-disable
"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/c141bce6134a/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * CompatibilityCard — https://app.subframe.com/c141bce6134a/library?component=CompatibilityCard_15c47a51-5291-4264-8249-1fd9e97a7afd
 * Link Button — https://app.subframe.com/c141bce6134a/library?component=Link+Button_a4ee726a-774c-4091-8c49-55b659356024
 * StatusIte — https://app.subframe.com/c141bce6134a/library?component=StatusIte_a6a68d53-7d15-411a-82fa-683addf6bc1c
 */

import React from "react";
import { FeatherRotateCcw } from "@subframe/core";
import { FeatherRouter } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { LinkButton } from "./LinkButton";
import { StatusIte } from "./StatusIte";
import { ModemImage } from "../../components/ModemImage";
import { ConditionList } from "../../components/ConditionList";
import { SPEED_WARNING_COPY, INDIVIDUAL_CONDITION_CODES } from "../../constants";
import type { ConditionCode, SpeedWarning } from "../../types";

interface CompatibilityCalloutProps
  extends React.HTMLAttributes<HTMLDivElement> {
  status?: "compatible" | "not-compatible" | "speed-warning" | "callout";
  modemName?: React.ReactNode;
  brand?: React.ReactNode;
  image?: string;
  conditions?: ConditionCode[];
  speedWarningType?: SpeedWarning["type"] | null;
  className?: string;
}

const CompatibilityCallout = React.forwardRef<
  HTMLDivElement,
  CompatibilityCalloutProps
>(function CompatibilityCallout(
  {
    status = "compatible",
    modemName,
    brand,
    image,
    conditions = [],
    speedWarningType = null,
    className,
    ...otherProps
  }: CompatibilityCalloutProps,
  ref
) {
  // Only ISP_LOCK (and other INDIVIDUAL_CONDITION_CODES) get their own line item.
  // All other conditions are absorbed into the generic "Some setup may be required" callout.
  const individualConditions = conditions.filter((c) => INDIVIDUAL_CONDITION_CODES.has(c));

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
          "flex w-full items-start justify-between rounded-md border border-solid border-neutral-300 bg-default-background pl-5 pr-4 py-4",
          {
            "flex-row flex-nowrap justify-between pl-4 pr-3 py-3":
              status === "speed-warning",
            "flex-row flex-nowrap items-start justify-between border border-solid border-error-700 bg-white px-4 py-4":
              status === "not-compatible",
          }
        )}
      >
        <div
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
        >
          <div
            className={SubframeUtils.twClassNames(
              "flex grow shrink-0 basis-0 items-center gap-3",
              {
                "flex-row flex-nowrap items-center justify-center gap-3":
                  status === "not-compatible",
              }
            )}
          >
            {image ? (
              <ModemImage
                src={image}
                alt={String(modemName ?? "Modem")}
                className={SubframeUtils.twClassNames(
                  "h-16 w-16 flex-none object-cover",
                  {
                    "h-16 w-auto flex-none":
                      status === "callout" ||
                      status === "speed-warning" ||
                      status === "not-compatible",
                  }
                )}
              />
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
          </div>
          <div
            className={SubframeUtils.twClassNames(
              "flex flex-col items-start gap-2",
              { "flex-col flex-nowrap gap-0": status === "not-compatible" }
            )}
          >
            <StatusIte
              title={
                status === "not-compatible"
                  ? "Modem is not compatible"
                  : "Compatible with Belong nbn\u00AE"
              }
              description={
                status === "not-compatible"
                  ? "Add a Belong modem to your order, or purchase a different compatible modem before your connection date."
                  : undefined
              }
              status={status === "not-compatible" ? "incompatible" : undefined}
              hasDescription={status === "not-compatible" ? true : undefined}
            />
            <div
              className={SubframeUtils.twClassNames(
                "hidden flex-col items-start pl-7",
                { flex: status === "not-compatible" }
              )}
            >
              <LinkButton
                className={SubframeUtils.twClassNames("hidden", {
                  flex: status === "not-compatible",
                })}
                variant={status === "not-compatible" ? "neutral" : undefined}
              >
                {status === "not-compatible"
                  ? "Learn more in our FAQs."
                  : "Label"}
              </LinkButton>
            </div>
            <StatusIte
              className={SubframeUtils.twClassNames({
                hidden: status === "not-compatible",
              })}
              title={
                speedWarningType
                  ? SPEED_WARNING_COPY[speedWarningType].title
                  : "Fast enough for your selected plan"
              }
              status={speedWarningType ? "warning" : undefined}
              hasDescription={speedWarningType ? false : undefined}
            />
            <StatusIte
              className={SubframeUtils.twClassNames("hidden", {
                flex: status === "callout",
              })}
              title={
                status === "callout"
                  ? "Some setup may be required"
                  : "Fast enough for your selected plan"
              }
              description={
                status === "callout"
                  ? "You might need to update a few modem settings. We\u2019ll send you a simple guide after your order is submitted."
                  : undefined
              }
              status={status === "callout" ? "callout" : undefined}
              hasDescription={status === "callout" ? true : undefined}
            />
            {individualConditions.length > 0 && (
              <ConditionList conditions={individualConditions} variant="callout" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

interface CompatibilityCardRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  state?: "results" | "default";
  modemName?: React.ReactNode;
  brand?: React.ReactNode;
  status?: "compatible" | "not-compatible" | "speed-warning" | "callout";
  image?: string;
  conditions?: ConditionCode[];
  speedWarningType?: SpeedWarning["type"] | null;
  onButtonClick?: () => void;
  className?: string;
}

const CompatibilityCardRoot = React.forwardRef<
  HTMLDivElement,
  CompatibilityCardRootProps
>(function CompatibilityCardRoot(
  {
    state = "results",
    modemName,
    brand,
    status = "compatible",
    image,
    conditions = [],
    speedWarningType = null,
    onButtonClick,
    className,
    ...otherProps
  }: CompatibilityCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/15c47a51 flex w-full flex-col items-start gap-6 rounded-md bg-gradient-brand px-4 py-4",
        { "flex-col flex-nowrap gap-6": status === "speed-warning" },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full flex-col items-start gap-3">
        <span className="text-h3-700 font-h3-700 text-color-primary-700">
          Compatibility checker
        </span>
        <CompatibilityCallout
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
          conditions={conditions}
          speedWarningType={speedWarningType}
        />
        <span className="text-caption font-caption text-default-font">
          {state === "default"
            ? "Check if your modem is compatible with Belong."
            : "This tool provides general advice only, we cannot guarantee its accuracy. You should verify your modem\u2019s details with the manufacturer or retailer."}
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
        variant="brand-secondary"
        icon={state === "default" ? <FeatherRouter /> : <FeatherRotateCcw />}
        hasLeftIcon={true}
        onClick={onButtonClick}
      >
        {state === "default" ? "Check your modem" : "Check another modem"}
      </Button>
    </div>
  );
});

export const CompatibilityCard = Object.assign(CompatibilityCardRoot, {
  CompatibilityCallout,
});
