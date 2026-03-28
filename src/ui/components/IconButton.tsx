// @subframe/sync-disable
"use client";
/*
 * Documentation:
 * Icon Button — https://app.subframe.com/c141bce6134a/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 */

import React from "react";
import { FeatherPlus } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface IconButtonRootProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  variant?:
    | "brand-primary"
    | "brand-secondary"
    | "brand-tertiary"
    | "neutral-primary"
    | "neutral-secondary"
    | "neutral-tertiary"
    | "destructive-primary"
    | "destructive-secondary"
    | "destructive-tertiary"
    | "inverse"
    | "option-1"
    | "neutral-secondary-2"
    | "white"
    | "brand-outline";
  size?: "large" | "medium" | "small";
  icon?: React.ReactNode;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const IconButtonRoot = React.forwardRef<HTMLButtonElement, IconButtonRootProps>(
  function IconButtonRoot(
    {
      disabled = false,
      variant = "neutral-tertiary",
      size = "medium",
      icon = <FeatherPlus />,
      loading = false,
      className,
      type = "button",
      ...otherProps
    }: IconButtonRootProps,
    ref
  ) {
    return (
      <button
        className={SubframeUtils.twClassNames(
          "group/af9405b1 flex h-10 w-10 cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-transparent text-left hover:bg-neutral-100 active:bg-neutral-50 disabled:cursor-default disabled:bg-neutral-100 hover:disabled:cursor-default hover:disabled:bg-neutral-100 active:disabled:cursor-default active:disabled:bg-neutral-100",
          {
            "h-6 w-6": size === "small",
            "h-12 w-12 rounded-full hover:rounded-full": size === "large",
            "border border-solid border-white bg-white hover:border hover:border-solid hover:border-brand-800 hover:bg-white active:border active:border-solid active:border-brand-primary active:bg-brand-100":
              variant === "white",
            "border border-solid border-brand-200 bg-white hover:border hover:border-solid hover:border-brand-800 hover:bg-white active:border active:border-solid active:border-brand-primary active:bg-brand-100":
              variant === "brand-outline",
            "border-2 border-solid border-brand-800 bg-brand-100 hover:border-2 hover:border-solid hover:border-brand-200 hover:bg-brand-200 active:border-2 active:border-solid active:border-brand-800 active:bg-brand-800":
              variant === "neutral-secondary-2",
            "bg-brand-200": variant === "option-1",
            "hover:bg-[#ffffff29] active:bg-[#ffffff3d]": variant === "inverse",
            "hover:bg-error-50 active:bg-error-100":
              variant === "destructive-tertiary",
            "bg-error-50 hover:bg-error-100 active:bg-error-50":
              variant === "destructive-secondary",
            "bg-error-600 hover:bg-error-500 active:bg-error-600":
              variant === "destructive-primary",
            "border-2 border-solid border-brand-800 hover:border-2 hover:border-solid hover:border-brand-200 hover:bg-brand-200 active:border-2 active:border-solid active:border-brand-800 active:bg-brand-800":
              variant === "neutral-secondary",
            "bg-neutral-100 hover:border hover:border-solid hover:border-neutral-700 hover:bg-default-background active:border active:border-solid active:border-neutral-400 active:bg-neutral-200":
              variant === "neutral-primary",
            "hover:bg-brand-50 active:bg-brand-100":
              variant === "brand-tertiary",
            "bg-brand-50 hover:bg-brand-100 active:bg-brand-50":
              variant === "brand-secondary",
            "bg-brand-600 hover:bg-brand-500 active:bg-brand-600":
              variant === "brand-primary",
          },
          className
        )}
        ref={ref}
        type={type}
        disabled={disabled}
        {...otherProps}
      >
        {icon ? (
          <SubframeCore.IconWrapper
            className={SubframeUtils.twClassNames(
              "text-h2-500 font-h2-500 text-neutral-700 group-disabled/af9405b1:text-neutral-400",
              {
                hidden: loading,
                "text-body-bold font-body-bold": size === "small",
                "text-h2-500 font-h2-500": size === "large",
                "text-brand-600 group-hover/af9405b1:text-brand-800":
                  variant === "white" || variant === "brand-outline",
                "text-brand-800 group-hover/af9405b1:text-h2-500 group-hover/af9405b1:font-h2-500 group-active/af9405b1:text-brand-100":
                  variant === "neutral-secondary-2",
                "text-brand-700": variant === "option-1",
                "text-white group-hover/af9405b1:text-white":
                  variant === "inverse",
                "text-error-700 group-hover/af9405b1:text-error-700 group-active/af9405b1:text-error-700":
                  variant === "destructive-tertiary" ||
                  variant === "destructive-secondary",
                "text-white group-hover/af9405b1:text-white group-active/af9405b1:text-white":
                  variant === "destructive-primary" ||
                  variant === "brand-primary",
                "text-brand-800 group-active/af9405b1:text-brand-100":
                  variant === "neutral-secondary",
                "text-neutral-700 group-hover/af9405b1:text-neutral-700 group-active/af9405b1:text-neutral-700":
                  variant === "neutral-primary",
                "text-brand-800 group-active/af9405b1:text-brand-700":
                  variant === "brand-tertiary",
                "text-brand-700 group-hover/af9405b1:text-brand-700 group-active/af9405b1:text-brand-700":
                  variant === "brand-secondary",
              }
            )}
          >
            {icon}
          </SubframeCore.IconWrapper>
        ) : null}
        <SubframeCore.Loader
          className={SubframeUtils.twClassNames(
            "hidden text-caption font-caption text-neutral-700 group-disabled/af9405b1:text-neutral-400",
            {
              "inline-block": loading,
              "text-caption font-caption": size === "small",
              "text-white":
                variant === "inverse" ||
                variant === "destructive-primary" ||
                variant === "brand-primary",
              "text-error-700":
                variant === "destructive-tertiary" ||
                variant === "destructive-secondary",
              "text-neutral-700": variant === "neutral-primary",
              "text-brand-700":
                variant === "brand-tertiary" || variant === "brand-secondary",
            }
          )}
        />
      </button>
    );
  }
);

export const IconButton = IconButtonRoot;
