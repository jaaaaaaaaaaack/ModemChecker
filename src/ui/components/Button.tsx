// @subframe/sync-disable
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
    | "inverse"
    | "cyan-primary"
    | "cyan-secondary"
    | "cyan-tertiary"
    | "green-primary"
    | "green-secondary"
    | "green-tertiary"
    | "purple-primary"
    | "purple-secondary"
    | "purple-tertiary"
    | "pink-primary"
    | "pink-secondary"
    | "pink-tertiary"
    | "secondary-inverse"
    | "option-1";
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
          "group/3b777358 flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-solid border-brand-800 bg-brand-800 px-8 text-left transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] disabled:active:scale-100 hover:border hover:border-solid hover:border-brand-950 hover:bg-brand-950 disabled:cursor-default disabled:border disabled:border-solid disabled:border-neutral-200 disabled:bg-neutral-200 hover:disabled:cursor-default hover:disabled:border hover:disabled:border-solid hover:disabled:border-neutral-300 hover:disabled:bg-neutral-100 active:disabled:cursor-default active:disabled:bg-neutral-200",
          {
            "pl-7 pr-6 py-0": hasRightIcon,
            "pl-5 pr-7 py-0": hasLeftIcon,
            "px-12 py-0": loading,
            "h-9 w-auto flex-row flex-nowrap gap-1 px-4 py-0": size === "small",
            "h-14 w-auto px-8 py-0": size === "large",
            "border-none bg-transparent hover:border-none hover:bg-brand-100 active:bg-brand-200":
              variant === "option-1",
            "border border-solid border-brand-300 bg-transparent hover:border hover:border-solid hover:border-brand-300 hover:bg-brand-300 active:bg-brand-100":
              variant === "secondary-inverse",
            "border border-solid border-color-accent3-201 bg-color-accent3-201 hover:border hover:border-solid hover:border-color-accent3-401 hover:bg-color-accent3-101 active:bg-color-accent3-301 active:transition-[background-color,border-color] active:duration-150 active:border-color-accent3-301":
              variant === "pink-tertiary",
            "border border-solid border-color-accent3-601 bg-transparent hover:border hover:border-solid hover:border-color-accent3-701 hover:bg-color-accent3-101 active:bg-color-accent3-201":
              variant === "pink-secondary",
            "border border-solid border-color-accent3-601 bg-color-accent3-601 hover:border hover:border-solid hover:border-color-accent3-701 hover:bg-color-accent3-701 active:bg-color-accent3-801 active:transition-[background-color,border-color] active:duration-150 active:border-color-accent3-801":
              variant === "pink-primary",
            "border border-solid border-color-accent2-201 bg-color-accent2-201 hover:border hover:border-solid hover:border-color-accent2-401 hover:bg-color-accent2-101 active:bg-color-accent2-301 active:transition-[background-color,border-color] active:duration-150 active:border-color-accent2-301 mobile:border mobile:border-solid mobile:border-color-accent2-301 mobile:bg-color-accent2-301 mobile:hover:border mobile:hover:border-solid mobile:hover:border-color-accent2-201 mobile:hover:bg-color-accent2-201 mobile:active:border mobile:active:border-solid mobile:active:border-color-accent2-51 mobile:active:bg-color-accent2-51":
              variant === "purple-tertiary",
            "border border-solid border-color-accent2-601 bg-transparent hover:border hover:border-solid hover:border-color-accent2-701 hover:bg-color-accent2-101 active:bg-color-accent2-201":
              variant === "purple-secondary",
            "border border-solid border-color-accent2-601 bg-color-accent2-601 hover:border hover:border-solid hover:border-color-accent2-701 hover:bg-color-accent2-701 active:bg-color-accent2-801 active:transition-[background-color,border-color] active:duration-150 active:border-color-accent2-801 mobile:border mobile:border-solid mobile:border-color-accent2-701 mobile:bg-color-accent2-701 mobile:hover:border mobile:hover:border-solid mobile:hover:border-color-accent2-901 mobile:hover:bg-color-accent2-901":
              variant === "purple-primary",
            "border border-solid border-color-secondary-201 bg-color-secondary-201 hover:border hover:border-solid hover:border-color-secondary-401 hover:bg-color-secondary-101 active:bg-color-secondary-301 active:transition-[background-color,border-color] active:duration-150 active:border-color-secondary-301":
              variant === "green-tertiary",
            "border border-solid border-color-secondary-601 bg-transparent hover:border hover:border-solid hover:border-color-secondary-701 hover:bg-color-secondary-101 active:bg-color-secondary-201":
              variant === "green-secondary",
            "border border-solid border-color-secondary-601 bg-color-secondary-601 hover:border hover:border-solid hover:border-color-secondary-701 hover:bg-color-secondary-701 active:bg-color-secondary-801 active:transition-[background-color,border-color] active:duration-150 active:border-color-secondary-801":
              variant === "green-primary",
            "border border-solid border-color-primary-201 bg-color-primary-201 hover:border hover:border-solid hover:border-color-primary-401 hover:bg-color-primary-101 active:bg-color-primary-301 active:transition-[background-color,border-color] active:duration-150 active:border-color-primary-301":
              variant === "cyan-tertiary",
            "border border-solid border-color-primary-601 bg-transparent hover:border hover:border-solid hover:border-color-primary-701 hover:bg-color-primary-101 active:bg-color-primary-201":
              variant === "cyan-secondary",
            "border border-solid border-color-primary-601 bg-color-primary-601 hover:border hover:border-solid hover:border-color-primary-701 hover:bg-color-primary-701 active:bg-color-primary-801 active:transition-[background-color,border-color] active:duration-150 active:border-color-primary-801":
              variant === "cyan-primary",
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
            "border border-solid border-brand-200 bg-brand-200 hover:border hover:border-solid hover:border-brand-800 hover:bg-brand-200 active:bg-brand-50":
              variant === "brand-tertiary",
            "bg-transparent hover:border hover:border-solid hover:border-brand-200 hover:bg-brand-200 active:border active:border-solid active:border-brand-800":
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
                "text-brand-300 group-hover/3b777358:text-brand-800":
                  variant === "secondary-inverse",
                "text-color-accent3-701":
                  variant === "pink-tertiary" || variant === "pink-secondary",
                "text-color-accent2-701":
                  variant === "purple-tertiary" ||
                  variant === "purple-secondary",
                "text-color-secondary-701":
                  variant === "green-tertiary" || variant === "green-secondary",
                "text-color-primary-701":
                  variant === "cyan-tertiary" || variant === "cyan-secondary",
                "text-error-700":
                  variant === "destructive-tertiary" ||
                  variant === "destructive-secondary",
                "text-neutral-700":
                  variant === "neutral-tertiary" ||
                  variant === "neutral-secondary" ||
                  variant === "neutral-primary",
                "text-brand-700 group-active/3b777358:text-brand-800":
                  variant === "brand-tertiary",
                "text-brand-700": variant === "brand-secondary",
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
                "text-brand-300": variant === "secondary-inverse",
                "text-caption font-caption text-color-accent3-701":
                  variant === "pink-tertiary" || variant === "pink-secondary",
                "text-caption font-caption text-color-accent2-701":
                  variant === "purple-tertiary" ||
                  variant === "purple-secondary",
                "text-caption font-caption text-color-secondary-701":
                  variant === "green-tertiary" || variant === "green-secondary",
                "text-caption font-caption text-color-primary-701":
                  variant === "cyan-tertiary" || variant === "cyan-secondary",
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
              "whitespace-nowrap text-body-bold font-body-bold text-brand-50 group-active/3b777358:text-brand-300 group-disabled/3b777358:text-neutral-600 group-hover/3b777358:group-disabled/3b777358:text-neutral-600 group-active/3b777358:group-disabled/3b777358:text-neutral-800",
              {
                hidden: loading,
                "text-caption-bold font-caption-bold": size === "small",
                "text-h3-500 font-h3-500": size === "large",
                "text-brand-800 underline group-active/3b777358:text-brand-900":
                  variant === "option-1",
                "text-brand-300 group-hover/3b777358:text-brand-800 group-active/3b777358:text-brand-800":
                  variant === "secondary-inverse",
                "text-color-accent3-801 group-active/3b777358:text-color-accent3-801":
                  variant === "pink-tertiary",
                "text-color-accent3-701 group-active/3b777358:text-color-accent3-901":
                  variant === "pink-secondary",
                "text-white group-active/3b777358:text-color-accent3-101":
                  variant === "pink-primary",
                "text-color-accent2-801 group-active/3b777358:text-color-accent2-801 mobile:text-color-accent2-901":
                  variant === "purple-tertiary",
                "text-color-accent2-701 group-active/3b777358:text-color-accent2-901":
                  variant === "purple-secondary",
                "text-white group-active/3b777358:text-color-accent2-101 mobile:group-active/3b777358:text-color-accent2-301":
                  variant === "purple-primary",
                "text-color-secondary-801 group-active/3b777358:text-color-secondary-801":
                  variant === "green-tertiary",
                "text-color-secondary-701 group-active/3b777358:text-color-secondary-901":
                  variant === "green-secondary",
                "text-white group-active/3b777358:text-color-secondary-101":
                  variant === "green-primary",
                "text-color-primary-801 group-active/3b777358:text-color-primary-801":
                  variant === "cyan-tertiary",
                "text-color-primary-701 group-active/3b777358:text-color-primary-901":
                  variant === "cyan-secondary",
                "text-white group-active/3b777358:text-color-primary-101":
                  variant === "cyan-primary",
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
                "text-brand-800 group-hover/3b777358:text-brand-900 group-active/3b777358:text-brand-950":
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
              "text-h3-500 font-h3-500 text-white group-active/3b777358:text-color-primary-200 group-disabled/3b777358:text-neutral-600 group-hover/3b777358:group-disabled/3b777358:text-neutral-600 group-active/3b777358:group-disabled/3b777358:text-color-primary-800",
              {
                "text-h3-700 font-h3-700": size === "large",
                "text-brand-300 group-hover/3b777358:text-brand-800 group-active/3b777358:text-brand-800":
                  variant === "secondary-inverse",
                "text-color-accent3-701":
                  variant === "pink-tertiary" || variant === "pink-secondary",
                "text-color-accent2-701":
                  variant === "purple-tertiary" ||
                  variant === "purple-secondary",
                "text-color-secondary-701":
                  variant === "green-tertiary" || variant === "green-secondary",
                "text-color-primary-701":
                  variant === "cyan-tertiary" || variant === "cyan-secondary",
                "text-error-700":
                  variant === "destructive-tertiary" ||
                  variant === "destructive-secondary",
                "text-neutral-700":
                  variant === "neutral-tertiary" ||
                  variant === "neutral-secondary" ||
                  variant === "neutral-primary",
                "text-brand-700 group-hover/3b777358:text-brand-50 group-active/3b777358:text-color-primary-300":
                  variant === "brand-tertiary",
                "text-brand-700 group-active/3b777358:text-color-primary-700":
                  variant === "brand-secondary",
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
