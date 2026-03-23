// @subframe/sync-disable
"use client";
/*
 * Documentation:
 * PortTypeBadge — https://app.subframe.com/c141bce6134a/library?component=PortTypeBadge_189422de-a461-4798-976d-d166bdec6a94
 */

import React from "react";
import { FeatherGlobe } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface PortTypeBadgeRootProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "blue" | "yellow" | "neutral" | "green" | "red" | "white";
  portName?: React.ReactNode;
  hasIcon?: boolean;
  portIcon?: React.ReactNode;
  className?: string;
}

const PortTypeBadgeRoot = React.forwardRef<
  HTMLDivElement,
  PortTypeBadgeRootProps
>(function PortTypeBadgeRoot(
  {
    variant = "blue",
    portName,
    hasIcon = false,
    portIcon = <FeatherGlobe />,
    className,
    ...otherProps
  }: PortTypeBadgeRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/189422de flex items-center gap-2",
        { "shadow-sm": variant === "white" },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div
        className={SubframeUtils.twClassNames(
          "flex items-center gap-2 rounded-[4px] border border-solid border-[#94d6ff] bg-[#d1f0ff] px-1",
          {
            "flex-row flex-nowrap gap-1 pl-0.5 pr-1 py-0": hasIcon,
            "border border-solid border-color-neutral-300 bg-default-background":
              variant === "white",
            "border border-solid border-[#ffd6de] bg-[#ffd6de]":
              variant === "red",
            "border border-solid border-success-300 bg-success-100":
              variant === "green",
            "border border-solid border-neutral-300 bg-color-neutral-100":
              variant === "neutral",
            "border border-solid border-warning-300 bg-warning-100":
              variant === "yellow",
          }
        )}
      >
        {portIcon ? (
          <SubframeCore.IconWrapper
            className={SubframeUtils.twClassNames(
              "hidden h-[1em] w-[1em] text-brand-900",
              {
                "inline-flex": hasIcon,
                "text-neutral-600":
                  variant === "white" || variant === "neutral",
                "text-neutral-900": variant === "red" || variant === "yellow",
                "text-success-800": variant === "green",
              }
            )}
          >
            {portIcon}
          </SubframeCore.IconWrapper>
        ) : null}
        {portName ? (
          <span
            className={SubframeUtils.twClassNames(
              "text-body-bold font-body-bold text-brand-900",
              {
                "text-neutral-600":
                  variant === "white" || variant === "neutral",
                "text-neutral-900": variant === "red" || variant === "yellow",
                "text-success-800": variant === "green",
              }
            )}
          >
            {portName}
          </span>
        ) : null}
      </div>
    </div>
  );
});

export const PortTypeBadge = PortTypeBadgeRoot;
