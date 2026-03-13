"use client";
/*
 * Documentation:
 * Icon with background — https://app.subframe.com/c141bce6134a/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 * StatusIte — https://app.subframe.com/c141bce6134a/library?component=StatusIte_a6a68d53-7d15-411a-82fa-683addf6bc1c
 */

import React from "react";
import { FeatherAlertTriangle } from "@subframe/core";
import { FeatherAsterisk } from "@subframe/core";
import { FeatherWifi } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { IconWithBackground } from "./IconWithBackground";

interface StatusIteRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  status?: "compatible" | "incompatible" | "warning" | "option-1";
  hasDescription?: boolean;
  className?: string;
}

const StatusIteRoot = React.forwardRef<HTMLDivElement, StatusIteRootProps>(
  function StatusIteRoot(
    {
      icon = <FeatherAlertTriangle />,
      title,
      description,
      status = "compatible",
      hasDescription = false,
      className,
      ...otherProps
    }: StatusIteRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/a6a68d53 flex w-full items-start gap-2 pb-2",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex items-start gap-2 pt-0.5">
          <IconWithBackground
            variant={
              status === "option-1"
                ? "brand"
                : status === "warning"
                ? "warning"
                : status === "incompatible"
                ? "error-dark"
                : "success-dark"
            }
            icon={
              status === "option-1" ? (
                <FeatherAsterisk />
              ) : status === "warning" ? (
                <FeatherWifi />
              ) : status === "incompatible" ? (
                <FeatherX />
              ) : undefined
            }
          />
        </div>
        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-0.5 pt-px">
          {title ? (
            <span className="text-body font-body text-default-font">
              {title}
            </span>
          ) : null}
          {description ? (
            <span
              className={SubframeUtils.twClassNames(
                "hidden font-['Plus_Jakarta_Sans'] text-[15px] font-[400] leading-[22px] text-subtext-color",
                { inline: hasDescription }
              )}
            >
              {description}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);

export const StatusIte = StatusIteRoot;
