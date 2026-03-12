"use client";
/*
 * Documentation:
 * Compatibility callout card — https://app.subframe.com/c141bce6134a/library?component=Compatibility+callout+card_06e79aa0-03fa-4e1b-b8fc-f1ce9bd29b87
 */

import React from "react";
import { FeatherCalendar } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface CompatibilityCalloutCardRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  image?: string;
  className?: string;
}

const CompatibilityCalloutCardRoot = React.forwardRef<
  HTMLDivElement,
  CompatibilityCalloutCardRootProps
>(function CompatibilityCalloutCardRoot(
  {
    title,
    icon = <FeatherCalendar />,
    description,
    image,
    className,
    ...otherProps
  }: CompatibilityCalloutCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "hidden w-full items-center justify-between rounded-md border border-solid border-neutral-border bg-default-background px-4 py-2 shadow-sm",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex flex-col items-start gap-1">
        {title ? (
          <span className="text-body-bold font-body-bold text-default-font">
            {title}
          </span>
        ) : null}
        <div className="hidden items-center gap-2">
          <div className="hidden items-center justify-center gap-2 rounded-full bg-success-600 px-1 py-1">
            {icon ? (
              <SubframeCore.IconWrapper className="text-body-bold font-body-bold text-white">
                {icon}
              </SubframeCore.IconWrapper>
            ) : null}
          </div>
          {description ? (
            <span className="text-body font-body text-subtext-color">
              {description}
            </span>
          ) : null}
        </div>
      </div>
      {image ? <img className="w-16 flex-none" src={image} /> : null}
    </div>
  );
});

export const CompatibilityCalloutCard = CompatibilityCalloutCardRoot;
