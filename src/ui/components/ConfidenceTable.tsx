"use client";
/*
 * Documentation:
 * ConfidenceTable — https://app.subframe.com/c141bce6134a/library?component=ConfidenceTable_433817a4-8c55-4c78-b1c1-9308c60df815
 */

import React from "react";
import { FeatherCheck } from "@subframe/core";
import { FeatherCheckCheck } from "@subframe/core";
import { FeatherRotateCcw } from "@subframe/core";
import { FeatherXCircle } from "@subframe/core";
import * as SubframeUtils from "../utils";

interface ConfidenceTableRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const ConfidenceTableRoot = React.forwardRef<
  HTMLDivElement,
  ConfidenceTableRootProps
>(function ConfidenceTableRoot(
  { className, ...otherProps }: ConfidenceTableRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex items-center justify-center gap-2",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex flex-col items-start gap-2">
        <div className="flex w-96 flex-col items-start justify-center gap-4 rounded-full bg-error-500 px-4 py-4">
          <span className="text-h4-button-700 font-h4-button-700 text-white">
            &lt;50
          </span>
        </div>
        <div className="flex h-40 w-96 flex-none flex-col items-start gap-2 rounded-md border border-solid border-error-500 bg-error-50 px-4 py-4">
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <FeatherXCircle className="text-h3-500 font-h3-500 text-error-600" />
              <span className="text-h4-button-500 font-h4-button-500 text-error-600">
                Rejected
              </span>
            </div>
            <span className="text-caption font-caption text-neutral-800">
              Incomplete or conflicting data. Excluded from database and flagged
              for manual review.
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start gap-2">
        <div className="flex w-56 flex-col items-start justify-center gap-2 rounded-full bg-warning-500 px-4 py-4">
          <span className="text-h4-button-700 font-h4-button-700 text-white">
            50-69
          </span>
        </div>
        <div className="flex h-40 w-56 flex-none flex-col items-start gap-2 rounded-md border border-solid border-warning-500 bg-warning-50 px-4 py-4">
          <div className="flex w-full flex-col items-start gap-2">
            <div className="flex items-center gap-1">
              <FeatherRotateCcw className="text-h3-500 font-h3-500 text-warning-600" />
              <span className="text-h4-button-500 font-h4-button-500 text-warning-600">
                Blocked
              </span>
            </div>
            <span className="w-full whitespace-pre-wrap text-caption font-caption text-neutral-800">
              {
                "Key data points unable to be verified. Sent back for additional round of research with specific focus on unverified claims."
              }
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex w-56 flex-col items-start justify-center gap-2 rounded-full bg-brand-500 px-4 py-4">
          <span className="text-h4-button-700 font-h4-button-700 text-white">
            70-89
          </span>
        </div>
        <div className="flex h-40 w-56 flex-none flex-col items-start gap-2 rounded-md border border-solid border-brand-500 bg-brand-50 px-4 py-4">
          <div className="flex w-full flex-col items-start gap-2">
            <div className="flex items-center gap-1">
              <FeatherCheck className="text-h3-500 font-h3-500 text-brand-600" />
              <span className="text-h4-button-500 font-h4-button-500 text-brand-600">
                Accepted
              </span>
            </div>
            <span className="w-full whitespace-pre-wrap text-caption font-caption text-neutral-800">
              {
                " Documented gaps ≤30 points. All claims survived adversarial challenge."
              }
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex w-36 flex-col items-start justify-center gap-2 rounded-full bg-success-500 px-4 py-4">
          <span className="text-h4-button-700 font-h4-button-700 text-white">
            90-100
          </span>
        </div>
        <div className="flex h-40 w-36 flex-none flex-col items-start gap-2 rounded-md border border-solid border-success-500 bg-success-50 px-4 py-4">
          <div className="flex w-full flex-col items-start gap-2">
            <div className="flex items-center gap-1">
              <FeatherCheckCheck className="text-h3-500 font-h3-500 text-success-600" />
              <span className="text-h4-button-500 font-h4-button-500 text-success-600">
                Verified
              </span>
            </div>
            <span className="w-full whitespace-pre-wrap text-caption font-caption text-neutral-800">
              {"All claims confirmed via manufacturer + independent source"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export const ConfidenceTable = ConfidenceTableRoot;
