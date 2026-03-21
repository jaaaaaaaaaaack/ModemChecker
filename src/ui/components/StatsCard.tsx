"use client";
/*
 * Documentation:
 * Stats Card — https://app.subframe.com/c141bce6134a/library?component=Stats+Card_ce8a575f-7dd0-409b-8e4d-98c260a65cb1
 */

import React from "react";
import { FeatherDollarSign } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface StatsCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  value?: React.ReactNode;
  variant?: "option-1" | "reversed";
  variant2?: "option-1" | "option-2";
  className?: string;
}

const StatsCardRoot = React.forwardRef<HTMLDivElement, StatsCardRootProps>(
  function StatsCardRoot(
    {
      icon = <FeatherDollarSign />,
      label,
      value,
      variant = "option-1",
      variant2 = "option-1",
      className,
      ...otherProps
    }: StatsCardRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/ce8a575f flex w-full items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-5 py-4 shadow-sm",
          {
            "h-full w-auto items-center justify-center border-none bg-brand-100":
              variant2 === "option-2",
          },
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div
          className={SubframeUtils.twClassNames(
            "flex grow shrink-0 basis-0 flex-col items-start gap-1",
            {
              "h-auto w-24 flex-none items-center justify-start":
                variant2 === "option-2",
              "flex-col flex-nowrap gap-2": variant === "reversed",
            }
          )}
        >
          <div
            className={SubframeUtils.twClassNames(
              "flex w-full items-center gap-1",
              {
                hidden: variant2 === "option-2",
                "flex-row flex-nowrap gap-2": variant === "reversed",
              }
            )}
          >
            {icon ? (
              <SubframeCore.IconWrapper
                className={SubframeUtils.twClassNames(
                  "text-body-bold font-body-bold text-neutral-400",
                  {
                    hidden: variant2 === "option-2",
                    "text-h2-500 font-h2-500 text-brand-600":
                      variant === "reversed",
                  }
                )}
              >
                {icon}
              </SubframeCore.IconWrapper>
            ) : null}
            {label ? (
              <span
                className={SubframeUtils.twClassNames(
                  "line-clamp-1 grow shrink-0 basis-0 text-body font-body text-subtext-color",
                  {
                    hidden: variant2 === "option-2",
                    "h-auto grow shrink-0 basis-0 self-stretch text-h3-500 font-h3-500 text-brand-600":
                      variant === "reversed",
                  }
                )}
              >
                {label}
              </span>
            ) : null}
          </div>
          {value ? (
            <span
              className={SubframeUtils.twClassNames(
                "w-full text-h2 font-h2 text-brand-700",
                {
                  "h-auto w-auto flex-none text-h3-700 font-h3-700":
                    variant2 === "option-2",
                  "text-body font-body text-neutral-500":
                    variant === "reversed",
                }
              )}
            >
              {value}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);

export const StatsCard = StatsCardRoot;
