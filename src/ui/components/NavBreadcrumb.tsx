"use client";
/*
 * Documentation:
 * navBreadcrumb — https://app.subframe.com/c141bce6134a/library?component=navBreadcrumb_f9462f83-2167-41ed-82b8-ace9674632f6
 */

import React from "react";
import { FeatherChevronRight } from "@subframe/core";
import { FeatherHome } from "@subframe/core";
import * as SubframeUtils from "../utils";

interface SegmentProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  variant?: "nav-label" | "setting-value";
  className?: string;
}

const Segment = React.forwardRef<HTMLDivElement, SegmentProps>(function Segment(
  { label, variant = "nav-label", className, ...otherProps }: SegmentProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/1ded16a7 flex items-center gap-2 rounded-[4px] border border-solid border-neutral-border bg-color-neutral-100 px-2.5 py-1.5",
        {
          "border border-solid border-color-accent2-200 bg-color-accent2-100":
            variant === "setting-value",
        },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {label ? (
        <div className="flex items-start text-monospace-body font-monospace-body text-neutral-700">
          {label}
        </div>
      ) : null}
    </div>
  );
});

interface DividerProps
  extends React.ComponentProps<typeof FeatherChevronRight> {
  className?: string;
}

const Divider = React.forwardRef<
  React.ElementRef<typeof FeatherChevronRight>,
  DividerProps
>(function Divider({ className, ...otherProps }: DividerProps, ref) {
  return (
    <FeatherChevronRight
      className={SubframeUtils.twClassNames(
        "text-h3-500 font-h3-500 text-neutral-400",
        className
      )}
      ref={ref}
      {...otherProps}
    />
  );
});

interface NavBreadcrumbRootProps extends React.HTMLAttributes<HTMLDivElement> {
  steps?: React.ReactNode;
  hasHome?: boolean;
  className?: string;
}

const NavBreadcrumbRoot = React.forwardRef<
  HTMLDivElement,
  NavBreadcrumbRootProps
>(function NavBreadcrumbRoot(
  { steps, hasHome = false, className, ...otherProps }: NavBreadcrumbRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/f9462f83 flex items-center gap-2",
        { "flex-row flex-nowrap gap-0": hasHome },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div
        className={SubframeUtils.twClassNames(
          "hidden items-center rounded-full",
          { flex: hasHome }
        )}
      >
        <FeatherHome className="text-h3-500 font-h3-500 text-neutral-700" />
      </div>
      <Divider
        className={SubframeUtils.twClassNames("hidden", { flex: hasHome })}
      />
      {steps ? (
        <div className="flex flex-wrap items-center">{steps}</div>
      ) : null}
    </div>
  );
});

export const NavBreadcrumb = Object.assign(NavBreadcrumbRoot, {
  Segment,
  Divider,
});
