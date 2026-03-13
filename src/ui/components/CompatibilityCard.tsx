"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/c141bce6134a/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * CompatibilityCard — https://app.subframe.com/c141bce6134a/library?component=CompatibilityCard_15c47a51-5291-4264-8249-1fd9e97a7afd
 * Icon with background — https://app.subframe.com/c141bce6134a/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 * Link Button — https://app.subframe.com/c141bce6134a/library?component=Link+Button_a4ee726a-774c-4091-8c49-55b659356024
 */

import React from "react";
import { FeatherGaugeCircle } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { IconWithBackground } from "./IconWithBackground";
import { LinkButton } from "./LinkButton";
import { ModemImage } from "../../components/ModemImage";

interface CompatibilityCalloutProps
  extends React.HTMLAttributes<HTMLDivElement> {
  status?: "compatible" | "not-compatible" | "speed-warning";
  modemName?: React.ReactNode;
  image?: string;
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
    className,
    ...otherProps
  }: CompatibilityCalloutProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/1d2e060b flex w-full flex-col items-start gap-2",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full items-center justify-between rounded-md border border-solid border-white bg-default-background pl-4 pr-3 py-2 shadow-sm",
          {
            "flex-row flex-nowrap justify-between": status === "speed-warning",
            "flex-row flex-nowrap justify-between border border-solid border-error-300":
              status === "not-compatible",
          }
        )}
      >
        <div
          className={SubframeUtils.twClassNames(
            "flex flex-col items-start gap-1.5",
            { "items-start justify-center": status === "speed-warning" }
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
          <div className="flex items-center gap-1">
            <IconWithBackground
              variant={
                status === "speed-warning"
                  ? "warning"
                  : status === "not-compatible"
                  ? "error"
                  : "success"
              }
              size="small"
              icon={
                status === "speed-warning" ? (
                  <FeatherGaugeCircle />
                ) : status === "not-compatible" ? (
                  <FeatherX />
                ) : undefined
              }
              square={status === "not-compatible" ? false : undefined}
            />
            <span
              className={SubframeUtils.twClassNames(
                "text-caption font-caption text-brand-800",
                {
                  "text-neutral-600": status === "speed-warning",
                  "text-neutral-800": status === "not-compatible",
                }
              )}
            >
              {status === "speed-warning"
                ? "May not support the full download speeds of your plan."
                : status === "not-compatible"
                ? "Not compatible with Belong"
                : "Compatible with Belong nbn®"}
            </span>
          </div>
        </div>
        {image ? (
          <ModemImage
            src={image}
            alt={String(modemName ?? "Modem")}
            className="w-16 h-16 rounded-md"
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
      />
      <LinkButton
        className="hidden"
        variant="brand"
        icon={null}
        iconRight={null}
      >
        Check another modem
      </LinkButton>
      <div className="hidden w-full flex-wrap items-start gap-1">
        <span className="text-body font-body text-neutral-600">
          This tool provides general information only. You should verify your
          modem&#39;s details with the manufacturer or the ISP who provided it.
        </span>
      </div>
      <span className="text-body font-body text-default-font">
        Check if your modem is compatible with your internet plan.
      </span>
      <Button variant="brand-secondary">Check your modem</Button>
    </div>
  );
});

export const CompatibilityCard = Object.assign(CompatibilityCardRoot, {
  CompatibilityCallout,
});
