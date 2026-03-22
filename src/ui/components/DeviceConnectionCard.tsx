// @subframe/sync-disable
"use client";
/*
 * Documentation:
 * deviceConnectionCard — https://app.subframe.com/c141bce6134a/library?component=deviceConnectionCard_9e7db8d4-a7c7-43f9-8439-4f4cfacb1325
 * PortTypeBadge — https://app.subframe.com/c141bce6134a/library?component=PortTypeBadge_189422de-a461-4798-976d-d166bdec6a94
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface DeviceConnectionCardRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  image?: string;
  deviceName?: React.ReactNode;
  connectionLabel?: React.ReactNode;
  note?: React.ReactNode;
  variant?: "option-1" | "horizontal-stack" | "nbn-hardware";
  className?: string;
}

const DeviceConnectionCardRoot = React.forwardRef<
  HTMLDivElement,
  DeviceConnectionCardRootProps
>(function DeviceConnectionCardRoot(
  {
    image,
    deviceName,
    connectionLabel,
    note,
    variant = "option-1",
    className,
    ...otherProps
  }: DeviceConnectionCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/9e7db8d4 flex h-full w-full min-w-[144px] flex-col items-center justify-between rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm",
        {
          "flex-row flex-nowrap items-center justify-start gap-6 border border-solid border-neutral-100 px-4 py-4":
            variant === "horizontal-stack",
          "flex-col flex-nowrap items-start justify-start gap-4 border border-solid border-neutral-100 px-4 py-4":
            variant === "nbn-hardware",
        },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {/* Inner layout: nbn-hardware wraps image+text in a row; horizontal-stack uses the outer flex-row directly */}
      {variant === "nbn-hardware" ? (
        <div className="flex w-full flex-row flex-nowrap gap-4">
          {image ? (
            <img
              className="h-20 w-20 flex-none object-contain"
              src={image}
            />
          ) : null}
          <div className="flex flex-1 min-w-0 flex-col items-start justify-center gap-2">
            {deviceName ? (
              <span className="whitespace-pre-wrap text-h4-button-700 font-h4-button-700 text-default-font text-left">
                {deviceName}
              </span>
            ) : null}
            {connectionLabel ? (
              <span className="text-body font-body text-default-font text-left">
                {connectionLabel}
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          {image ? (
            <img
              className={SubframeUtils.twClassNames(
                "h-32 w-36 flex-none object-contain",
                { "h-20 w-20 flex-none": variant === "horizontal-stack" }
              )}
              src={image}
            />
          ) : null}
          <div
            className={SubframeUtils.twClassNames(
              "flex flex-col items-center justify-center gap-3 pt-4",
              {
                "flex-col flex-nowrap items-start justify-center gap-1 px-0 py-0":
                  variant === "horizontal-stack",
              }
            )}
          >
            {deviceName ? (
              <span
                className={SubframeUtils.twClassNames(
                  "whitespace-pre-wrap text-h4-button-700 font-h4-button-700 text-default-font text-center",
                  { "text-left": variant === "horizontal-stack" }
                )}
              >
                {deviceName}
              </span>
            ) : null}
            {connectionLabel ? (
              <span
                className={SubframeUtils.twClassNames(
                  "text-body font-body text-default-font text-center flex flex-wrap items-center justify-center gap-x-1",
                  { "text-left justify-start": variant === "horizontal-stack" }
                )}
              >
                {connectionLabel}
              </span>
            ) : null}
          </div>
        </>
      )}
      {note && variant === "nbn-hardware" ? (
        <span className="text-caption font-caption text-neutral-500">
          {note}
        </span>
      ) : null}
    </div>
  );
});

export const DeviceConnectionCard = DeviceConnectionCardRoot;
