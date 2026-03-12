"use client";
/*
 * Documentation:
 * Compatibility Card Mini — https://app.subframe.com/c141bce6134a/library?component=Compatibility+Card+Mini_0acc457e-abdb-41d5-93ce-2739f1f9b1e4
 */

import React from "react";
import { FeatherAlertTriangle } from "@subframe/core";
import { FeatherCheck } from "@subframe/core";
import * as SubframeUtils from "../utils";

interface CompatibilityCardMiniRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  status?: React.ReactNode;
  className?: string;
}

const CompatibilityCardMiniRoot = React.forwardRef<
  HTMLDivElement,
  CompatibilityCardMiniRootProps
>(function CompatibilityCardMiniRoot(
  { status, className, ...otherProps }: CompatibilityCardMiniRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "hidden h-20 w-full items-center justify-between rounded-md border border-solid border-color-primary-700 bg-white px-4",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex flex-col items-start gap-1">
        <span className="text-body-bold font-body-bold text-default-font">
          Eero 6E
        </span>
        <div className="flex items-center gap-1">
          <div className="flex h-4 w-4 flex-none items-center justify-center rounded-full bg-color-secondary-500">
            <FeatherCheck className="font-['Plus_Jakarta_Sans'] text-[10px] font-[400] leading-[15px] text-white" />
            <FeatherAlertTriangle className="hidden font-['Plus_Jakarta_Sans'] text-[10px] font-[400] leading-[15px] text-white" />
          </div>
          {status ? (
            <span className="text-body font-body text-default-font">
              {status}
            </span>
          ) : null}
          {status ? (
            <span className="hidden text-body font-body text-default-font">
              {status}
            </span>
          ) : null}
        </div>
      </div>
      <img
        className="w-16 flex-none"
        src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
      />
      <img className="h-14 w-14 flex-none rounded-md object-contain" src="" />
    </div>
  );
});

export const CompatibilityCardMini = CompatibilityCardMiniRoot;
