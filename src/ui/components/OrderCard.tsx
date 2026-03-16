// @subframe/sync-disable
"use client";
/*
 * Documentation:
 * orderCard — https://app.subframe.com/c141bce6134a/library?component=orderCard_11e35c6c-863a-48ea-956e-bd21f7eda5e3
 */

import React from "react";
import { FeatherHome } from "@subframe/core";
import { FeatherRouter } from "@subframe/core";
import { FeatherThumbsUp } from "@subframe/core";
import * as SubframeUtils from "../utils";

interface OrderCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  planLabel?: React.ReactNode;
  planPrice?: React.ReactNode;
  modemLabel?: React.ReactNode;
  modemPrice?: React.ReactNode;
  totalPrice?: React.ReactNode;
  serviceAddress?: React.ReactNode;
  nbnTechType?: React.ReactNode;
  variant?: "option-1" | "option-2" | "option-3";
  className?: string;
}

const OrderCardRoot = React.forwardRef<HTMLDivElement, OrderCardRootProps>(
  function OrderCardRoot(
    {
      planLabel,
      planPrice,
      modemLabel,
      modemPrice,
      totalPrice,
      serviceAddress,
      nbnTechType,
      variant = "option-1",
      className,
      ...otherProps
    }: OrderCardRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/11e35c6c flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-300 bg-default-background px-4 py-4",
          {
            "border border-solid border-neutral-border mobile:border-none mobile:bg-color-neutral-100":
              variant === "option-2",
          },
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <span
          className={SubframeUtils.twClassNames(
            "w-full text-h2 font-h2 text-brand-900",
            { hidden: variant === "option-2" }
          )}
        >
          Order summary
        </span>
        <div
          className={SubframeUtils.twClassNames(
            "flex w-full flex-col items-start gap-2",
            { hidden: variant === "option-2" }
          )}
        >
          <div className="flex w-full items-center gap-2">
            <FeatherHome className="text-h4-button-500 font-h4-button-500 text-brand-800" />
            <div className="flex grow shrink-0 basis-0 items-center gap-2">
              <span className="text-body-bold font-body-bold text-brand-800">
                Service address
              </span>
            </div>
          </div>
          {serviceAddress ? (
            <span className="text-body font-body text-default-font">
              {serviceAddress}
            </span>
          ) : null}
        </div>
        <div
          className={SubframeUtils.twClassNames(
            "flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border",
            { hidden: variant === "option-2" }
          )}
        />
        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex w-full flex-col items-start gap-4">
            <div className="flex w-full flex-col items-start gap-2">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <FeatherThumbsUp className="text-h4-button-500 font-h4-button-500 text-brand-800" />
                  {planLabel ? (
                    <span className="text-body-bold font-body-bold text-brand-800">
                      {planLabel}
                    </span>
                  ) : null}
                </div>
                {planPrice ? (
                  <span className="text-body font-body text-default-font">
                    {planPrice}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <FeatherRouter className="text-h4-button-500 font-h4-button-500 text-brand-800" />
                {modemLabel ? (
                  <span className="text-body-bold font-body-bold text-brand-800">
                    {modemLabel}
                  </span>
                ) : null}
              </div>
              {modemPrice ? (
                <span className="text-body font-body text-neutral-600">
                  {modemPrice}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
          <div className="flex w-full flex-col items-start gap-3">
            <div className="flex w-full items-center justify-between">
              <span className="text-body-bold font-body-bold text-brand-800">
                Total monthly
              </span>
              {totalPrice ? (
                <span className="text-h4-button-500 font-h4-button-500 text-neutral-700">
                  {totalPrice}
                </span>
              ) : null}
            </div>
            <div className="flex w-full items-center justify-between">
              <span className="text-body-bold font-body-bold text-brand-800">
                Due today
              </span>
              <span className="text-h4-button-500 font-h4-button-500 text-neutral-700">
                $0
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export const OrderCard = OrderCardRoot;
