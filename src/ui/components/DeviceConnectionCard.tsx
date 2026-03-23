// @subframe/sync-disable
"use client";
/*
 * Documentation:
 * deviceConnectionCard — https://app.subframe.com/c141bce6134a/library?component=deviceConnectionCard_9e7db8d4-a7c7-43f9-8439-4f4cfacb1325
 * PortTypeBadge — https://app.subframe.com/c141bce6134a/library?component=PortTypeBadge_189422de-a461-4798-976d-d166bdec6a94
 */

import React from "react";
import { FeatherInfo } from "@subframe/core";
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
        "group/9e7db8d4 flex w-full min-w-[240px] flex-col items-start gap-4 rounded-md border border-solid border-neutral-300 bg-neutral-50 px-4 py-4",
        {},
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full items-center gap-4">
        <div className="flex grow shrink-0 basis-0 flex-col items-start justify-center gap-2">
          <div className="flex flex-col items-start justify-center gap-1">
            {deviceName ? (
              <span className="whitespace-pre-wrap text-h4-button-700 font-h4-button-700 text-default-font">
                {deviceName}
              </span>
            ) : null}
            {connectionLabel ? (
              <span className="text-body font-body text-default-font">
                {connectionLabel}
              </span>
            ) : null}
          </div>
        </div>
        {image ? (
          <img
            className="h-20 w-20 flex-none object-contain"
            src={image}
          />
        ) : null}
      </div>
      {note && variant === "nbn-hardware" ? (
        <div className="flex items-center gap-1.5 text-brand-700">
          <FeatherInfo className="h-3.5 w-3.5 flex-none" />
          <span className="text-caption font-caption">
            {note}
          </span>
        </div>
      ) : null}
    </div>
  );
});

export const DeviceConnectionCard = DeviceConnectionCardRoot;
