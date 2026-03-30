"use client";
/*
 * Documentation:
 * ModemIdentityCard — https://app.subframe.com/c141bce6134a/library?component=ModemIdentityCard_279003e6-45a9-4599-8c7d-3913749ef88e
 */

import React, { useState, useCallback } from "react";
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
  const [imgReady, setImgReady] = useState(false);
  const handleLoad = useCallback(() => setImgReady(true), []);

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full items-center justify-between gap-6 rounded-sm bg-default-background pl-3 pr-4 py-4 shadow-sm",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex items-center gap-3">
        {image ? (
          <div className="flex h-16 min-w-[50px] max-w-[80px] shrink-0 items-center justify-center">
            <img
              className={`max-w-[80px] max-h-[64px] object-contain transition-opacity duration-200 ease-in-out ${imgReady ? "opacity-100" : "opacity-0"}`}
              src={image}
              onLoad={handleLoad}
            />
          </div>
        ) : null}
        <div className="flex flex-col items-start gap-1">
          {title ? (
            <span className="text-h4-button-500 font-h4-button-500 text-default-font text-balance">
              {title}
            </span>
          ) : null}
          {label ? (
            <span className="text-body font-body text-neutral-500">
              {label}
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
