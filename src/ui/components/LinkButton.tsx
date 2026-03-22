"use client";
/*
 * Documentation:
 * Link Button — https://app.subframe.com/c141bce6134a/library?component=Link+Button_a4ee726a-774c-4091-8c49-55b659356024
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface LinkButtonRootProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  variant?: "brand" | "neutral" | "inverse" | "monospace";
  size?: "large" | "medium" | "small" | "large-monospace";
  icon?: React.ReactNode;
  children?: React.ReactNode;
  iconRight?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const LinkButtonRoot = React.forwardRef<HTMLButtonElement, LinkButtonRootProps>(
  function LinkButtonRoot(
    {
      disabled = false,
      variant = "neutral",
      size = "medium",
      icon = null,
      children,
      iconRight = null,
      className,
      type = "button",
      ...otherProps
    }: LinkButtonRootProps,
    ref
  ) {
    return (
      <button
        className={SubframeUtils.twClassNames(
          "group/a4ee726a flex cursor-pointer items-center gap-1 border-none bg-transparent text-left hover:rounded-sm",
          {
            "flex-row flex-nowrap gap-1":
              size === "large-monospace" || size === "large",
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
              "text-body font-body text-neutral-700 group-hover/a4ee726a:text-brand-700 group-disabled/a4ee726a:text-neutral-400 group-hover/a4ee726a:group-disabled/a4ee726a:text-neutral-400",
              {
                "text-h3-700 font-h3-700":
                  size === "large-monospace" || size === "large",
                "text-caption font-caption": size === "small",
                "text-brand-700 group-hover/a4ee726a:text-brand-700":
                  variant === "monospace" || variant === "brand",
                "text-white group-hover/a4ee726a:text-white":
                  variant === "inverse",
              }
            )}
          >
            {icon}
          </SubframeCore.IconWrapper>
        ) : null}
        {children ? (
          <span
            className={SubframeUtils.twClassNames(
              "text-body-bold font-body-bold text-brand-800 underline group-hover/a4ee726a:no-underline group-disabled/a4ee726a:text-neutral-400 group-hover/a4ee726a:group-disabled/a4ee726a:text-neutral-400 group-hover/a4ee726a:group-disabled/a4ee726a:no-underline",
              {
                "font-['monospace'] text-[20px] font-[400] leading-[20px] tracking-normal group-hover/a4ee726a:font-['monospace'] group-hover/a4ee726a:text-[20px] group-hover/a4ee726a:font-[700] group-hover/a4ee726a:leading-[20px] group-hover/a4ee726a:tracking-normal":
                  size === "large-monospace",
                "text-caption-bold font-caption-bold text-brand-700 underline group-hover/a4ee726a:text-caption-bold group-hover/a4ee726a:font-caption-bold group-hover/a4ee726a:text-brand-900":
                  size === "small",
                "text-h4-button-500 font-h4-button-500 group-hover/a4ee726a:text-h3-700 group-hover/a4ee726a:font-h3-700":
                  size === "large",
                "font-['monospace'] text-[16px] font-[500] leading-[20px] tracking-normal group-hover/a4ee726a:font-['monospace'] group-hover/a4ee726a:text-[16px] group-hover/a4ee726a:font-[600] group-hover/a4ee726a:leading-[20px] group-hover/a4ee726a:tracking-normal":
                  variant === "monospace",
                "text-brand-200 group-hover/a4ee726a:text-brand-50":
                  variant === "inverse",
                "text-brand-800 group-hover/a4ee726a:text-brand-900 group-hover/a4ee726a:no-underline":
                  variant === "brand",
              }
            )}
          >
            {children}
          </span>
        ) : null}
        {iconRight ? (
          <SubframeCore.IconWrapper
            className={SubframeUtils.twClassNames(
              "text-body font-body text-brand-800 group-hover/a4ee726a:text-brand-700 group-disabled/a4ee726a:text-neutral-400 group-hover/a4ee726a:group-disabled/a4ee726a:text-neutral-400",
              {
                "text-h3-700 font-h3-700":
                  size === "large-monospace" || size === "large",
                "text-caption font-caption": size === "small",
                "text-brand-700 group-hover/a4ee726a:text-brand-700":
                  variant === "monospace" || variant === "brand",
                "text-white group-hover/a4ee726a:text-white":
                  variant === "inverse",
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

export const LinkButton = LinkButtonRoot;
