"use client";
/*
 * Documentation:
 * Icon with background — https://app.subframe.com/c141bce6134a/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 * StatusItem — https://app.subframe.com/c141bce6134a/library?component=StatusItem_a6a68d53-7d15-411a-82fa-683addf6bc1c
 */

import React from "react";
import { FeatherAlertTriangle } from "@subframe/core";
import { FeatherAsterisk } from "@subframe/core";
import { FeatherBell } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { IconWithBackground } from "./IconWithBackground";

interface StatusItemRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  status?:
    | "compatible"
    | "incompatible"
    | "warning"
    | "callout"
    | "compatible-on-dark"
    | "warning-on-dark"
    | "info-on-dark";
  hasDescription?: boolean;
  isOnDark?: boolean;
  className?: string;
}

const StatusItemRoot = React.forwardRef<HTMLDivElement, StatusItemRootProps>(
  function StatusItemRoot(
    {
      icon = <FeatherAlertTriangle />,
      title,
      description,
      status = "compatible",
      hasDescription = false,
      isOnDark = false,
      className,
      ...otherProps
    }: StatusItemRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/a6a68d53 flex w-full items-start gap-2",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex items-start gap-2 pt-0.5">
          <IconWithBackground
            variant={
              status === "info-on-dark"
                ? "neutral"
                : status === "warning-on-dark"
                ? "warning"
                : status === "compatible-on-dark"
                ? "success"
                : status === "callout"
                ? "dark-brand"
                : status === "warning"
                ? "neutral"
                : status === "incompatible"
                ? "warning-2"
                : "success-dark"
            }
            size="small"
            icon={
              status === "callout" ? (
                <FeatherAsterisk />
              ) : status === "warning" ? (
                <FeatherBell />
              ) : status === "incompatible" ? (
                <FeatherX />
              ) : undefined
            }
          />
        </div>
        <div className="flex grow shrink-0 basis-0 flex-col items-start justify-center gap-0.5 self-stretch pt-px">
          {title ? (
            <span
              className={SubframeUtils.twClassNames(
                "text-body font-body text-default-font",
                {
                  "text-brand-50":
                    isOnDark ||
                    status === "info-on-dark" ||
                    status === "warning-on-dark" ||
                    status === "compatible-on-dark",
                  "text-body-bold font-body-bold text-neutral-800":
                    status === "incompatible",
                }
              )}
            >
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

export const StatusItem = StatusItemRoot;
