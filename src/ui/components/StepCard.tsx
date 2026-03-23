// @subframe/sync-disable
"use client";
/*
 * Documentation:
 * Badge — https://app.subframe.com/c141bce6134a/library?component=Badge_97bdb082-1124-4dd7-a335-b14b822d0157
 * stepCard — https://app.subframe.com/c141bce6134a/library?component=stepCard_b8335e7c-64aa-47a0-8ec5-254b406a46aa
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FeatherAlertTriangle } from "@subframe/core";
import { FeatherCheck } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Badge } from "./Badge";

interface ConditionalBlockProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: "info" | "warning" | "optional" | "neutral";
  title?: React.ReactNode;
  body?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

const ConditionalBlock = React.forwardRef<
  HTMLDivElement,
  ConditionalBlockProps
>(function ConditionalBlock(
  {
    variant = "info",
    title,
    body,
    badge,
    className,
    ...otherProps
  }: ConditionalBlockProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/cb1b5257 flex w-full flex-col items-start gap-2 rounded-md border border-solid border-brand-300 bg-brand-50 px-5 py-4",
        {
          "border-none bg-white px-4 py-4 shadow-sm": variant === "neutral",
          "border-none bg-color-accent2-50 px-4 py-4": variant === "optional",
          "border border-solid border-warning-300 bg-default-background":
            variant === "warning",
        },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex flex-col items-start gap-1">
        {badge ? (
          <div
            className={SubframeUtils.twClassNames("flex items-start", {
              hidden: variant === "neutral",
            })}
          >
            {badge}
          </div>
        ) : null}
        {title ? (
          <div
            className={SubframeUtils.twClassNames("flex items-start", {
              hidden: variant === "optional",
            })}
          >
            {title}
          </div>
        ) : null}
      </div>
      {body ? (
        <div className="flex w-full flex-col items-start">{body}</div>
      ) : null}
    </div>
  );
});

interface StepCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  stepNumber?: React.ReactNode;
  stepTitle?: React.ReactNode;
  description?: React.ReactNode;
  infoMessage?: React.ReactNode;
  primaryAction?: React.ReactNode;
  variant?: "current" | "completed" | "upcoming" | "warning" | "optional";
  children?: React.ReactNode;
  className?: string;
}

const StepCardRoot = React.forwardRef<HTMLDivElement, StepCardRootProps>(
  function StepCardRoot(
    {
      stepNumber,
      stepTitle,
      description,
      infoMessage,
      primaryAction,
      variant = "current",
      children,
      className,
      ...otherProps
    }: StepCardRootProps,
    ref
  ) {
    const isExpanded =
      variant === "current" ||
      variant === "warning" ||
      variant === "optional";

    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/b8335e7c flex w-full flex-col items-start px-4 py-4 transition-colors duration-300",
          {
            "rounded-md border border-solid border-white bg-default-background shadow-lg": variant === "current",
            "rounded-xl border border-solid border-color-accent2-300 bg-color-accent2-50":
              variant === "optional",
            "rounded-xl border border-solid border-warning-200 bg-warning-50": variant === "warning",
            "rounded-xl border border-solid border-neutral-300 bg-transparent": variant === "upcoming",
            "rounded-xl border border-solid border-neutral-300 bg-neutral-50":
              variant === "completed",
          },
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex w-full flex-col items-start">
          <div className="flex w-full items-center gap-2">
            {/* Step indicator — crossfade between number and check */}
            <div
              className={SubframeUtils.twClassNames(
                "relative flex h-8 w-8 flex-none items-center justify-center rounded-full transition-colors duration-300",
                {
                  "bg-brand-700": variant === "current",
                  "hidden bg-color-accent2-200": variant === "optional",
                  "hidden bg-warning-200": variant === "warning",
                  "border border-solid border-neutral-border bg-neutral-border":
                    variant === "upcoming",
                  "bg-success-200": variant === "completed",
                }
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {variant === "completed" ? (
                  <motion.span
                    key="check"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <FeatherCheck className="text-h3-500 font-h3-500 text-success-700" />
                  </motion.span>
                ) : variant === "optional" ? (
                  <motion.span
                    key="plus"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <FeatherPlus className="text-h3-500 font-h3-500 text-color-accent2-700" />
                  </motion.span>
                ) : variant === "warning" ? (
                  <motion.span
                    key="warning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <FeatherAlertTriangle className="text-h3-500 font-h3-500 text-warning-700" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="number"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    className={SubframeUtils.twClassNames(
                      "text-h4-button-500 font-h4-button-500",
                      {
                        "text-brand-50": variant === "current",
                        "text-neutral-500": variant === "upcoming",
                      }
                    )}
                  >
                    {stepNumber}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div
              className={SubframeUtils.twClassNames(
                "flex grow shrink-0 basis-0 items-center gap-2",
                {
                  "flex-col flex-nowrap items-start justify-start gap-1":
                    variant === "optional" || variant === "warning",
                }
              )}
            >
              <Badge
                className={SubframeUtils.twClassNames("hidden", {
                  flex: variant === "optional" || variant === "warning",
                })}
                variant={
                  variant === "optional"
                    ? "success-2"
                    : variant === "warning"
                    ? "warning"
                    : undefined
                }
              >
                {variant === "optional"
                  ? "Optional step"
                  : variant === "warning"
                  ? "May be required"
                  : "Badge"}
              </Badge>
              <div
                className={SubframeUtils.twClassNames(
                  "flex grow shrink-0 basis-0 flex-col items-start gap-1",
                  {
                    "pl-1 pr-0 py-0":
                      variant === "optional" || variant === "warning",
                  }
                )}
              >
                {stepTitle ? (
                  <h3
                    style={{ textWrap: "balance" }}
                    className={SubframeUtils.twClassNames(
                      "text-h4-button-500 font-h4-button-500 transition-colors duration-300",
                      {
                        "text-brand-800": variant === "current",
                        "text-neutral-600":
                          variant === "optional" || variant === "warning",
                        "text-neutral-500":
                          variant === "upcoming" || variant === "completed",
                      }
                    )}
                  >
                    {stepTitle}
                  </h3>
                ) : null}
              </div>
            </div>
          </div>

          {/* Animated content area */}
          <motion.div
            initial={false}
            animate={{
              height: isExpanded ? "auto" : 0,
              opacity: isExpanded ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden", width: "100%" }}
          >
            <div className="flex w-full flex-col items-start gap-4 pt-4">
              {description ? (
                <span className="w-full text-body font-body text-brand-800">
                  {description}
                </span>
              ) : null}
              {children ? (
                <div className="flex w-full flex-col items-start gap-4">
                  {children}
                </div>
              ) : null}
              {infoMessage ? (
                <div className="flex w-full flex-col items-start">
                  <span className="text-body font-body text-brand-700">
                    {infoMessage}
                  </span>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>

        {/* Animated primary action */}
        {primaryAction ? (
          <motion.div
            initial={false}
            animate={{
              height: isExpanded ? "auto" : 0,
              opacity: isExpanded ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden", width: "100%" }}
          >
            <div className="flex flex-col items-start gap-8 pt-4">
              {primaryAction}
            </div>
          </motion.div>
        ) : null}
      </div>
    );
  }
);

export const StepCard = Object.assign(StepCardRoot, {
  ConditionalBlock,
});
