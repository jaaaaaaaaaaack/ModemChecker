"use client";
/*
 * Documentation:
 * Step header — https://app.subframe.com/c141bce6134a/library?component=Step+header_a77d29b3-3143-4c39-8b4b-9a4a860f1b93
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface StepHeaderRootProps extends React.HTMLAttributes<HTMLDivElement> {
  stepNumber?: React.ReactNode;
  stepTitle?: React.ReactNode;
  variant?: "active" | "inactive";
  className?: string;
}

const StepHeaderRoot = React.forwardRef<HTMLDivElement, StepHeaderRootProps>(
  function StepHeaderRoot(
    {
      stepNumber,
      stepTitle,
      variant = "active",
      className,
      ...otherProps
    }: StepHeaderRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/a77d29b3 flex w-full flex-col items-start gap-4 rounded-xl border border-solid border-brand-400 bg-default-background px-6 py-6 shadow-sm",
          { "border border-solid border-neutral-300": variant === "inactive" },
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex w-full items-center gap-4">
          <div
            className={SubframeUtils.twClassNames(
              "flex h-12 w-12 flex-none items-center justify-center rounded-full bg-brand-300",
              { "bg-neutral-300": variant === "inactive" }
            )}
          >
            {stepNumber ? (
              <span className="text-h3-500 font-h3-500 text-brand-950">
                {stepNumber}
              </span>
            ) : null}
          </div>
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
            {stepTitle ? (
              <span
                className={SubframeUtils.twClassNames(
                  "text-h3-500 font-h3-500 text-brand-800",
                  { "text-neutral-600": variant === "inactive" }
                )}
              >
                {stepTitle}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

export const StepHeader = StepHeaderRoot;
