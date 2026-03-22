// @ts-nocheck — Subframe-generated component, TS narrowing flags dead branches in variant ternary
"use client";
/*
 * Documentation:
 * itemCard — https://app.subframe.com/c141bce6134a/library?component=itemCard_0bb538d5-7a56-4663-9a14-05f4b7e651d3
 */

import React from "react";
import { FeatherCheck } from "@subframe/core";
import { FeatherCheckCheck } from "@subframe/core";
import { FeatherGitBranch } from "@subframe/core";
import { FeatherRotateCcw } from "@subframe/core";
import { FeatherXCircle } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface ItemCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  subheader?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "success" | "brand" | "warning" | "accent-pink" | "error";
  className?: string;
}

const ItemCardRoot = React.forwardRef<HTMLDivElement, ItemCardRootProps>(
  function ItemCardRoot(
    {
      header,
      subheader,
      icon = <FeatherGitBranch />,
      variant = "success",
      className,
      ...otherProps
    }: ItemCardRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/0bb538d5 flex w-full items-center justify-between overflow-hidden rounded-sm border border-solid border-neutral-border bg-default-background",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div
          className={SubframeUtils.twClassNames(
            "flex w-32 flex-none flex-col items-center justify-center gap-2 self-stretch bg-success-500 px-2 py-2",
            {
              "bg-error-500": variant === "error",
              "bg-color-accent3-501": variant === "accent-pink",
              "bg-warning-500": variant === "warning",
              "h-auto w-36 flex-none self-stretch bg-brand-500":
                variant === "brand",
            }
          )}
        >
          <div className="flex items-center gap-8">
            <span
              className={SubframeUtils.twClassNames(
                "text-h3-700 font-h3-700 text-success-50",
                {
                  "text-error-50": variant === "error",
                  "text-color-accent3-50": variant === "accent-pink",
                  "text-warning-50": variant === "warning",
                  "text-brand-50": variant === "brand",
                }
              )}
            >
              {variant === "error"
                ? "&lt;50"
                : variant === "accent-pink"
                ? "&lt;50"
                : variant === "warning"
                ? "50-69"
                : variant === "brand"
                ? "70-89"
                : "90-100"}
            </span>
          </div>
        </div>
        <div className="flex grow shrink-0 basis-0 items-center justify-between px-4 py-4">
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              {variant === "error" ? (
                <FeatherXCircle
                  className={SubframeUtils.twClassNames(
                    "text-h2 font-h2 text-success-500",
                    {
                      "text-error-500": variant === "error",
                      "text-color-accent3-500": variant === "accent-pink",
                      "text-warning-500": variant === "warning",
                      "text-brand-500": variant === "brand",
                    }
                  )}
                />
              ) : variant === "warning" ? (
                <FeatherRotateCcw
                  className={SubframeUtils.twClassNames(
                    "text-h2 font-h2 text-success-500",
                    {
                      "text-error-500": variant === "error",
                      "text-color-accent3-500": variant === "accent-pink",
                      "text-warning-500": variant === "warning",
                      "text-brand-500": variant === "brand",
                    }
                  )}
                />
              ) : variant === "brand" ? (
                <FeatherCheck
                  className={SubframeUtils.twClassNames(
                    "text-h2 font-h2 text-success-500",
                    {
                      "text-error-500": variant === "error",
                      "text-color-accent3-500": variant === "accent-pink",
                      "text-warning-500": variant === "warning",
                      "text-brand-500": variant === "brand",
                    }
                  )}
                />
              ) : (
                <FeatherCheckCheck
                  className={SubframeUtils.twClassNames(
                    "text-h2 font-h2 text-success-500",
                    {
                      "text-error-500": variant === "error",
                      "text-color-accent3-500": variant === "accent-pink",
                      "text-warning-500": variant === "warning",
                      "text-brand-500": variant === "brand",
                    }
                  )}
                />
              )}
              {header ? (
                <span className="text-h4-button-500 font-h4-button-500 text-default-font">
                  {header}
                </span>
              ) : null}
            </div>
            {subheader ? (
              <span className="text-caption font-caption text-subtext-color">
                {subheader}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

export const ItemCard = ItemCardRoot;
