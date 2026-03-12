"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/c141bce6134a/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface ButtonRootProps
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
    | "inverse";
  size?: "large" | "medium" | "small";
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  hasLeftIcon?: boolean;
  hasRightIcon?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const ButtonRoot = React.forwardRef<HTMLButtonElement, ButtonRootProps>(
  function ButtonRoot(
    {
      disabled = false,
      variant = "brand-primary",
      size = "medium",
      children,
      icon = null,
      iconRight = null,
      loading = false,
      hasLeftIcon = false,
      hasRightIcon = false,
      className,
      type = "button",
      ...otherProps
    }: ButtonRootProps,
    ref
  ) {
    return (
      <button
        className={SubframeUtils.twClassNames(
          "group/3b777358 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-solid border-brand-800 bg-brand-800 px-6 text-left transition-[background-color,border-color] duration-150 hover:border hover:border-solid hover:border-brand-950 hover:bg-brand-950 disabled:cursor-default disabled:bg-neutral-200 hover:disabled:cursor-default hover:disabled:bg-neutral-200",
          {
            "pl-7 pr-6 py-0": hasRightIcon,
            "pl-5 pr-7 py-0": hasLeftIcon,
            "px-12 py-0": loading,
            "h-9 w-auto flex-row flex-nowrap gap-1 px-4 py-0": size === "small",
            "h-14 w-auto px-8 py-0": size === "large",
            "bg-transparent hover:bg-[#ffffff29] active:bg-[#ffffff3d]":
              variant === "inverse",
            "border-none bg-error-200 hover:border-none hover:bg-error-700 active:bg-error-900":
              variant === "destructive-tertiary",
            "border border-solid border-error-700 bg-error-50 hover:border hover:border-solid hover:border-error-700 hover:bg-error-100 active:bg-error-700":
              variant === "destructive-secondary",
            "border border-solid border-error-600 bg-error-600 hover:border hover:border-solid hover:border-error-900 hover:bg-error-900 active:border active:border-solid active:border-error-200 active:bg-error-200":
              variant === "destructive-primary",
            "bg-transparent hover:bg-neutral-100 active:bg-neutral-200":
              variant === "neutral-tertiary",
            "border border-solid border-neutral-border bg-default-background hover:bg-neutral-50 active:border active:border-solid active:border-neutral-800 active:bg-color-neutral-800":
              variant === "neutral-secondary",
            "border border-solid border-neutral-500 bg-neutral-100 hover:border hover:border-solid hover:border-neutral-500 hover:bg-neutral-200 active:border active:border-solid active:border-neutral-700 active:bg-neutral-700":
              variant === "neutral-primary",
            "border border-solid border-brand-200 bg-brand-200 hover:border hover:border-solid hover:border-brand-600 hover:bg-brand-100 active:border active:border-solid active:border-brand-400 active:bg-brand-400":
              variant === "brand-tertiary",
            "bg-transparent hover:border hover:border-solid hover:border-brand-700 hover:bg-default-background active:bg-brand-700":
              variant === "brand-secondary",
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
              "text-h3-500 font-h3-500 text-white group-disabled/3b777358:text-neutral-400",
              {
                hidden: loading,
                "text-h3-700 font-h3-700": size === "large",
                "text-error-700":
                  variant === "destructive-tertiary" ||
                  variant === "destructive-secondary",
                "text-neutral-700":
                  variant === "neutral-tertiary" ||
                  variant === "neutral-secondary" ||
                  variant === "neutral-primary",
                "text-brand-700":
                  variant === "brand-tertiary" || variant === "brand-secondary",
              }
            )}
          >
            {icon}
          </SubframeCore.IconWrapper>
        ) : null}
        <div
          className={SubframeUtils.twClassNames(
            "hidden h-6 w-6 flex-none items-center justify-center gap-2",
            { flex: loading, "h-3 w-3 flex-none": size === "small" }
          )}
        >
          <SubframeCore.Loader
            className={SubframeUtils.twClassNames(
              "font-['Inter'] text-[20px] font-[400] leading-[20px] text-brand-100 group-disabled/3b777358:text-caption group-disabled/3b777358:font-caption group-disabled/3b777358:text-neutral-400",
              {
                "text-caption font-caption": size === "small",
                "text-caption font-caption text-error-700":
                  variant === "destructive-tertiary" ||
                  variant === "destructive-secondary",
                "text-caption font-caption text-neutral-700":
                  variant === "neutral-tertiary" ||
                  variant === "neutral-secondary" ||
                  variant === "neutral-primary",
                "text-caption font-caption text-brand-700":
                  variant === "brand-tertiary" || variant === "brand-secondary",
              }
            )}
          />
        </div>
        {children ? (
          <span
            className={SubframeUtils.twClassNames(
              "whitespace-nowrap text-body-bold font-body-bold text-brand-50 group-active/3b777358:text-brand-300 group-disabled/3b777358:text-neutral-400 group-active/3b777358:group-disabled/3b777358:text-neutral-400",
              {
                hidden: loading,
                "text-caption-bold font-caption-bold": size === "small",
                "text-h3-500 font-h3-500": size === "large",
                "text-white": variant === "inverse",
                "text-error-800 group-hover/3b777358:text-error-50 group-active/3b777358:text-white":
                  variant === "destructive-tertiary",
                "text-error-700 group-active/3b777358:text-error-100":
                  variant === "destructive-secondary",
                "group-hover/3b777358:text-error-50 group-active/3b777358:text-error-900":
                  variant === "destructive-primary",
                "text-neutral-700 group-active/3b777358:text-neutral-700":
                  variant === "neutral-tertiary",
                "text-neutral-600 group-active/3b777358:text-neutral-200":
                  variant === "neutral-secondary",
                "text-neutral-700 group-active/3b777358:text-neutral-200":
                  variant === "neutral-primary",
                "text-brand-800 group-active/3b777358:text-brand-800":
                  variant === "brand-tertiary",
                "text-brand-800 group-active/3b777358:text-brand-200":
                  variant === "brand-secondary",
              }
            )}
          >
            {children}
          </span>
        ) : null}
        {iconRight ? (
          <SubframeCore.IconWrapper
            className={SubframeUtils.twClassNames(
              "text-h3-500 font-h3-500 text-white group-disabled/3b777358:text-neutral-400",
              {
                "text-h3-700 font-h3-700": size === "large",
                "text-error-700":
                  variant === "destructive-tertiary" ||
                  variant === "destructive-secondary",
                "text-neutral-700":
                  variant === "neutral-tertiary" ||
                  variant === "neutral-secondary" ||
                  variant === "neutral-primary",
                "text-brand-700":
                  variant === "brand-tertiary" || variant === "brand-secondary",
              }
            )}
          >
            {iconRight}
          </SubframeCore.IconWrapper>
        ) : null}
      </button>
    );
  }
);

export const Button = ButtonRoot;
