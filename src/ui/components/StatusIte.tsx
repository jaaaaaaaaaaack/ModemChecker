"use client";
/*
 * Documentation:
 * StatusIte — https://app.subframe.com/c141bce6134a/library?component=StatusIte_a6a68d53-7d15-411a-82fa-683addf6bc1c
 */

import React from "react";
import { FeatherAlertTriangle } from "@subframe/core";
import { FeatherCheck } from "@subframe/core";
import { FeatherInfo } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface StatusIteRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  status?: "warning" | "success" | "info";
  className?: string;
}

const StatusIteRoot = React.forwardRef<HTMLDivElement, StatusIteRootProps>(
  function StatusIteRoot(
    {
      icon = <FeatherAlertTriangle />,
      title,
      description,
      status = "warning",
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
        <div
          className={SubframeUtils.twClassNames(
            "flex h-6 w-6 flex-none items-center justify-center rounded-full bg-warning-700",
            {
              "border border-solid border-brand-200 bg-brand-200":
                status === "info",
              "bg-success-600": status === "success",
            }
          )}
        >
          {icon ? (
            <SubframeCore.IconWrapper
              className={SubframeUtils.twClassNames(
                "text-body font-body text-white h-3.5 w-3.5",
                {
                  "hidden text-brand-700": status === "info",
                  hidden: status === "success",
                }
              )}
            >
              {icon}
            </SubframeCore.IconWrapper>
          ) : null}
          <FeatherCheck
            className={SubframeUtils.twClassNames(
              "hidden text-body font-body text-white h-3.5 w-3.5",
              { "h-3.5 w-3.5 flex": status === "success" }
            )}
          />
          <FeatherInfo
            className={SubframeUtils.twClassNames(
              "hidden text-body font-body text-brand-50 h-3.5 w-3.5",
              { "text-brand-800 h-3.5 w-3.5 flex": status === "info" }
            )}
          />
        </div>
        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-0.5 pt-px">
          {title ? (
            <span className="text-body-bold font-body-bold text-default-font">
              {title}
            </span>
          ) : null}
          {description ? (
            <span
              className={SubframeUtils.twClassNames(
                "text-body font-body text-subtext-color",
                { hidden: status === "success" }
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
