"use client";
/*
 * Documentation:
 * FeatureItem — https://app.subframe.com/c141bce6134a/library?component=FeatureItem_f5aec824-1b69-47bc-878c-07f5722d8351
 * Icon with background — https://app.subframe.com/c141bce6134a/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 */

import React from "react";
import { FeatherZap } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { IconWithBackground } from "./IconWithBackground";

interface FeatureItemRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "card" | "brand";
  className?: string;
}

const FeatureItemRoot = React.forwardRef<HTMLDivElement, FeatureItemRootProps>(
  function FeatureItemRoot(
    {
      icon = <FeatherZap />,
      title,
      description,
      variant = "default",
      className,
      ...otherProps
    }: FeatureItemRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/f5aec824 flex flex-col items-start gap-1",
          {
            "rounded-md border border-solid border-brand-200 bg-brand-50 px-3 py-3":
              variant === "brand",
            "rounded-md border border-solid border-color-accent2-200 bg-color-accent2-50 px-3 py-3":
              variant === "card",
          },
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex items-center gap-2">
          <IconWithBackground
            variant={
              variant === "brand"
                ? "neutral-on-dark"
                : variant === "card"
                ? "accent-2"
                : "accent-1"
            }
            size="medium"
            icon={icon}
            square={true}
          />
          {title ? (
            <span
              className={SubframeUtils.twClassNames(
                "text-h4-button-500 font-h4-button-500 text-color-accent2-800",
                { "text-brand-800": variant === "brand" }
              )}
            >
              {title}
            </span>
          ) : null}
        </div>
        {description ? (
          <span
            className={SubframeUtils.twClassNames(
              "text-body font-body text-color-accent2-800",
              { "text-brand-800": variant === "brand" }
            )}
          >
            {description}
          </span>
        ) : null}
      </div>
    );
  }
);

export const FeatureItem = FeatureItemRoot;
