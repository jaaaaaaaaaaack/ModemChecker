"use client";
/*
 * Documentation:
 * ModemIdentityCard — https://app.subframe.com/c141bce6134a/library?component=ModemIdentityCard_279003e6-45a9-4599-8c7d-3913749ef88e
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface ModemIdentityCardRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  image?: string;
  label?: React.ReactNode;
  title?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const ModemIdentityCardRoot = React.forwardRef<
  HTMLDivElement,
  ModemIdentityCardRootProps
>(function ModemIdentityCardRoot(
  {
    image,
    label,
    title,
    action,
    className,
    ...otherProps
  }: ModemIdentityCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full items-center justify-between rounded-sm bg-default-background pl-4 pr-6 py-4 shadow-sm",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex items-center gap-6">
        {image ? <img className="w-20 flex-none" src={image} /> : null}
        <div className="flex flex-col items-start gap-1">
          {label ? (
            <span className="text-body font-body text-neutral-500">
              {label}
            </span>
          ) : null}
          {title ? (
            <span className="text-h4-button-500 font-h4-button-500 text-default-font">
              {title}
            </span>
          ) : null}
        </div>
      </div>
      {action ? (
        <div className="flex items-center justify-between">{action}</div>
      ) : null}
    </div>
  );
});

export const ModemIdentityCard = ModemIdentityCardRoot;
