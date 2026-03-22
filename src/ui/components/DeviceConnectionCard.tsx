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
  variant?: "option-1" | "horizontal-stack";
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
        },
        className
      )}
      ref={ref}
      {...otherProps}
    >
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
          <span className="whitespace-pre-wrap text-h4-button-700 font-h4-button-700 text-default-font text-center">
            {deviceName}
          </span>
        ) : null}
        {connectionLabel ? (
          <span
            className={SubframeUtils.twClassNames(
              "text-body font-body text-default-font text-center flex flex-wrap items-center justify-center gap-x-1",
              {
                "text-left justify-start": variant === "horizontal-stack",
              }
            )}
          >
            {connectionLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
});

export const DeviceConnectionCard = DeviceConnectionCardRoot;
