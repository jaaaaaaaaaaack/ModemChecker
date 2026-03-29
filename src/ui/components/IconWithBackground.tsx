"use client";
/*
 * Documentation:
 * Icon with background — https://app.subframe.com/c141bce6134a/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 */

import React from "react";
import { FeatherCheck } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface IconWithBackgroundRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "brand"
    | "neutral"
    | "error"
    | "success"
    | "warning"
    | "dark-brand"
    | "neutral-dark"
    | "success-dark"
    | "error-dark"
    | "warning-2"
    | "brand-outline"
    | "accent"
    | "success-on-dark"
    | "error-on-dark"
    | "neutral-on-dark"
    | "accent-1"
    | "accent-2"
    | "success-outline"
    | "success-strong";
  size?: "x-large" | "large" | "medium" | "small" | "x-small";
  icon?: React.ReactNode;
  square?: boolean;
  className?: string;
}

const IconWithBackgroundRoot = React.forwardRef<
  HTMLDivElement,
  IconWithBackgroundRootProps
>(function IconWithBackgroundRoot(
  {
    variant = "brand",
    size = "x-small",
    icon = <FeatherCheck />,
    square = false,
    className,
    ...otherProps
  }: IconWithBackgroundRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/c5d68c0e flex h-5 w-5 items-center justify-center gap-2 rounded-full bg-brand-200",
        {
          "rounded-md": square,
          "h-6 w-6": size === "small",
          "h-8 w-8": size === "medium",
          "h-12 w-12": size === "large",
          "h-16 w-16": size === "x-large",
          "bg-success-700": variant === "success-strong",
          "border border-solid border-success-500 bg-transparent":
            variant === "success-outline",
          "bg-color-accent2-100": variant === "accent-2",
          "bg-color-accent2-50": variant === "accent-1",
          "bg-error-200": variant === "error-on-dark",
          "bg-success-200": variant === "success-on-dark",
          "bg-color-accent2-600": variant === "accent",
          "border border-solid border-brand-primary bg-transparent":
            variant === "brand-outline",
          "bg-warning-400": variant === "warning-2",
          "bg-error-800": variant === "error-dark",
          "bg-success-600": variant === "success-dark",
          "bg-neutral-600": variant === "neutral-dark",
          "bg-brand-800": variant === "dark-brand",
          "bg-warning-100": variant === "warning",
          "bg-success-100": variant === "success",
          "bg-error-100": variant === "error",
          "bg-neutral-200": variant === "neutral",
        },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {icon ? (
        <SubframeCore.IconWrapper
          className={SubframeUtils.twClassNames(
            "font-['Inter'] text-[14px] font-[400] leading-[12px] text-brand-900",
            {
              "text-caption font-caption": size === "small",
              "text-h4-button-500 font-h4-button-500": size === "medium",
              "text-h2 font-h2": size === "large",
              "text-h1 font-h1": size === "x-large",
              "text-white": variant === "success-strong",
              "text-success-500": variant === "success-outline",
              "text-color-accent2-700":
                variant === "accent-2" || variant === "accent-1",
              "text-error-800":
                variant === "error-on-dark" || variant === "error",
              "text-success-800":
                variant === "success-on-dark" || variant === "success",
              "text-color-accent2-50": variant === "accent",
              "text-brand-700": variant === "brand-outline",
              "font-['Inter'] text-[16px] font-[400] leading-[12px] tracking-normal text-neutral-900":
                variant === "warning-2",
              "text-error-50": variant === "error-dark",
              "font-['Inter'] text-[14px] font-[400] leading-[12px] tracking-normal text-neutral-0":
                variant === "success-dark",
              "font-['Inter'] text-[14px] font-[400] leading-[12px] tracking-normal text-neutral-50":
                variant === "neutral-dark",
              "font-['Inter'] text-[14px] font-[400] leading-[12px] tracking-normal text-brand-100":
                variant === "dark-brand",
              "text-warning-800": variant === "warning",
              "text-neutral-700": variant === "neutral",
            }
          )}
        >
          {icon}
        </SubframeCore.IconWrapper>
      ) : null}
    </div>
  );
});

export const IconWithBackground = IconWithBackgroundRoot;
