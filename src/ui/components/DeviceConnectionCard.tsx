"use client";
/*
 * Documentation:
 * deviceConnectionCard — https://app.subframe.com/c141bce6134a/library?component=deviceConnectionCard_9e7db8d4-a7c7-43f9-8439-4f4cfacb1325
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface DeviceConnectionCardRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  image?: string;
  deviceName?: React.ReactNode;
  connectionLabel?: React.ReactNode;
  portType?: React.ReactNode;
  portLabel?: React.ReactNode;
  variant?: "option-1" | "horizontal-stack";
  portType2?: React.ReactNode;
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
    portType,
    portLabel,
    variant = "option-1",
    portType2,
    className,
    ...otherProps
  }: DeviceConnectionCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/9e7db8d4 flex h-full w-full min-w-[144px] flex-col items-center justify-between rounded-sm bg-color-neutral-100 px-6 py-6",
        {
          "flex-row flex-nowrap items-start justify-start gap-6 px-4 py-4":
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
            {
              "h-auto max-h-[80px] w-20 flex-none self-stretch":
                variant === "horizontal-stack",
            }
          )}
          src={image}
        />
      ) : null}
      <div
        className={SubframeUtils.twClassNames(
          "flex flex-col items-center justify-center gap-3 pt-4",
          {
            "flex-col flex-nowrap items-start justify-center gap-2 px-0 py-0":
              variant === "horizontal-stack",
          }
        )}
      >
        {deviceName ? (
          <span className="whitespace-pre-wrap text-h4-button-500 font-h4-button-500 text-default-font text-center">
            {deviceName}
          </span>
        ) : null}
        <div
          className={SubframeUtils.twClassNames(
            "flex flex-col items-center gap-1",
            { "items-start justify-start": variant === "horizontal-stack" }
          )}
        >
          {connectionLabel ? (
            <span
              className={SubframeUtils.twClassNames(
                "whitespace-pre-wrap text-body font-body text-default-font text-center",
                { "text-left": variant === "horizontal-stack" }
              )}
            >
              {connectionLabel}
            </span>
          ) : null}
          {portType2 ? (
            <div className="flex items-center gap-1">{portType2}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
});

export const DeviceConnectionCard = DeviceConnectionCardRoot;
