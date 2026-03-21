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
  variant?: "blue" | "yellow" | "neutral" | "neutral-2";
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
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div
        className={SubframeUtils.twClassNames(
          "flex items-center gap-2 rounded-md bg-color-primary-100 px-2 py-1",
          {
            "flex-row flex-nowrap gap-1 pl-2 pr-2.5 py-1": hasIcon,
            "bg-color-secondary-101": variant === "neutral-2",
            "bg-color-neutral-300": variant === "neutral",
            "bg-warning-200": variant === "yellow",
          }
        )}
      >
        {portIcon ? (
          <SubframeCore.IconWrapper
            className={SubframeUtils.twClassNames(
              "hidden text-h3-500 font-h3-500 text-default-font",
              { "inline-flex": hasIcon }
            )}
          >
            {portIcon}
          </SubframeCore.IconWrapper>
        ) : null}
        {portName ? (
          <span className="text-body-bold font-body-bold text-default-font">
            {portName}
          </span>
        ) : null}
      </div>
    </div>
  );
});

export const PortTypeBadge = PortTypeBadgeRoot;
