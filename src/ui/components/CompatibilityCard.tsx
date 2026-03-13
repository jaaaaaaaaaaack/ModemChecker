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
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { LinkButton } from "./LinkButton";
import { StatusIte } from "./StatusIte";
import { ModemImage } from "../../components/ModemImage";
import { ConditionList } from "../../components/ConditionList";
import { SPEED_WARNING_COPY } from "../../constants";
import type { ConditionCode, SpeedWarning } from "../../types";

interface CompatibilityCalloutProps
  extends React.HTMLAttributes<HTMLDivElement> {
  status?: "compatible" | "not-compatible" | "speed-warning";
  modemName?: React.ReactNode;
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
    image,
    conditions = [],
    speedWarningType = null,
    className,
    ...otherProps
  }: CompatibilityCalloutProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/1d2e060b flex w-full flex-col items-start gap-2",
        { "items-start justify-center": status === "not-compatible" },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full items-center justify-between rounded-md border border-solid border-white bg-default-background pl-4 pr-3 py-2 shadow-sm",
          {
            "flex-row flex-nowrap items-start justify-between":
              status === "speed-warning",
            "flex-row flex-nowrap items-start justify-between border border-solid border-error-300 bg-error-50 px-4 py-4":
              status === "not-compatible",
          }
        )}
      >
        <div
          className={SubframeUtils.twClassNames(
            "flex flex-col items-start gap-1.5",
            {
              "items-start justify-center pl-0 pr-4 py-0":
                status === "speed-warning",
              "flex-col flex-nowrap gap-2 pl-0 pr-4 py-0":
                status === "not-compatible",
            }
          )}
        >
          {modemName ? (
            <span
              className={SubframeUtils.twClassNames(
                "text-body-bold font-body-bold text-default-font",
                { "text-color-neutral-900": status === "speed-warning" }
              )}
            >
              {modemName}
            </span>
          ) : null}
          <div
            className={SubframeUtils.twClassNames("flex flex-col items-start", {
              "flex-col flex-nowrap gap-0": status === "not-compatible",
            })}
          >
            <StatusIte
              title={
                status === "not-compatible"
                  ? "Not compatible with Belong nbn\u00AE"
                  : "Compatible with Belong nbn\u00AE"
              }
              description={
                status === "not-compatible"
                  ? "You'll need to add a Belong modem or purchase a compatible modem before your connection date."
                  : "Supports download speeds up to 380Mbps, which isn't fast enough to support your selected plan's 500Mbps max download speed."
              }
              status={status === "not-compatible" ? "incompatible" : undefined}
              hasDescription={status === "not-compatible" ? true : undefined}
            />
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
            />
            {conditions.length > 0 && (
              <ConditionList conditions={conditions} variant="callout" />
            )}
          </div>
        </div>
        {image ? (
          <ModemImage
            src={image}
            alt={String(modemName ?? "Modem")}
            className={SubframeUtils.twClassNames(
              "max-h-[80px] flex-none self-stretch object-cover",
              {
                "h-20 w-auto flex-none":
                  status === "speed-warning" || status === "not-compatible",
              }
            )}
          />
        ) : null}
      </div>
    </div>
  );
});

interface CompatibilityCardRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  state?: "default" | "option-1";
  modemName?: React.ReactNode;
  status?: "compatible" | "not-compatible" | "speed-warning";
  image?: string;
  conditions?: ConditionCode[];
  speedWarningType?: SpeedWarning["type"] | null;
  onCheckAnother?: () => void;
  className?: string;
}

const CompatibilityCardRoot = React.forwardRef<
  HTMLDivElement,
  CompatibilityCardRootProps
>(function CompatibilityCardRoot(
  {
    state = "default",
    modemName,
    status = "compatible",
    image,
    conditions = [],
    speedWarningType = null,
    onCheckAnother,
    className,
    ...otherProps
  }: CompatibilityCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/15c47a51 flex w-full flex-col items-start gap-3 rounded-md bg-color-primary-50 px-4 py-4",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <span className="text-h3-700 font-h3-700 text-color-primary-700">
        Modem compatibility checker
      </span>
      <CompatibilityCallout
        className={SubframeUtils.twClassNames({ hidden: state === "option-1" })}
        status={
          status === "speed-warning"
            ? "speed-warning"
            : status === "not-compatible"
            ? "not-compatible"
            : undefined
        }
        modemName={modemName}
        image={image}
        conditions={conditions}
        speedWarningType={speedWarningType}
      />
      <LinkButton
        className={SubframeUtils.twClassNames("hidden", {
          flex: !!onCheckAnother,
        })}
        variant="brand"
        icon={null}
        iconRight={null}
        onClick={onCheckAnother}
      >
        Check another modem
      </LinkButton>
      <div className="hidden w-full flex-wrap items-start gap-1">
        <span className="text-body font-body text-neutral-600">
          This tool provides general information only. You should verify your
          modem&#39;s details with the manufacturer or the ISP who provided it.
        </span>
      </div>
      <span
        className={SubframeUtils.twClassNames(
          "text-body font-body text-default-font",
          { hidden: !!onCheckAnother }
        )}
      >
        Check if your modem is compatible with your internet plan.
      </span>
      <Button
        className={SubframeUtils.twClassNames({ hidden: !!onCheckAnother })}
        variant="brand-secondary"
      >
        Check your modem
      </Button>
    </div>
  );
});

export const CompatibilityCard = Object.assign(CompatibilityCardRoot, {
  CompatibilityCallout,
});
