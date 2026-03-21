"use client";
/*
 * Documentation:
 * codeWindow — https://app.subframe.com/c141bce6134a/library?component=codeWindow_4fa7604c-2bd3-4200-a88b-b81616e77547
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface CodeWindowRootProps extends React.HTMLAttributes<HTMLDivElement> {
  filename?: React.ReactNode;
  code?: React.ReactNode;
  className?: string;
}

const CodeWindowRoot = React.forwardRef<HTMLDivElement, CodeWindowRootProps>(
  function CodeWindowRoot(
    { filename, code, className, ...otherProps }: CodeWindowRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col items-start overflow-hidden rounded-lg border border-solid border-neutral-800 bg-neutral-800 shadow-lg",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex w-full items-center gap-2 bg-neutral-950 px-4 py-3">
          <div className="flex h-3 w-3 flex-none items-start rounded-full bg-error-500" />
          <div className="flex h-3 w-3 flex-none items-start rounded-full bg-warning-500" />
          <div className="flex h-3 w-3 flex-none items-start rounded-full bg-success-500" />
          {filename ? (
            <span className="text-monospace-body font-monospace-body text-neutral-400 ml-2">
              {filename}
            </span>
          ) : null}
        </div>
        <div className="flex w-full items-start px-6 py-6 overflow-x-auto">
          {code ? (
            <span className="grow shrink-0 basis-0 font-['monospace'] text-[15px] font-[400] leading-[24px] text-neutral-300 whitespace-pre">
              {code}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);

export const CodeWindow = CodeWindowRoot;
