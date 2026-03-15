// @subframe/sync-disable
"use client";
/*
 * Documentation:
 * orderCard — https://app.subframe.com/c141bce6134a/library?component=orderCard_11e35c6c-863a-48ea-956e-bd21f7eda5e3
 */

import React from "react";
import { FeatherHome } from "@subframe/core";
import { FeatherZap } from "@subframe/core";
import * as SubframeUtils from "../utils";

interface OrderCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  planLabel?: React.ReactNode;
  planPrice?: React.ReactNode;
  modemLabel?: React.ReactNode;
  modemPrice?: React.ReactNode;
  totalPrice?: React.ReactNode;
  serviceAddress?: React.ReactNode;
  nbnTechType?: React.ReactNode;
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
      className,
      ...otherProps
    }: OrderCardRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-300 bg-default-background px-4 py-4",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <span className="w-full text-h2 font-h2 text-brand-800">
          Order summary
        </span>
        <div className="flex w-full flex-col items-start gap-2">
          <div className="flex w-full items-center gap-2">
            <span className="text-body-bold font-body-bold text-brand-800">
              Service address
            </span>
          </div>
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <FeatherHome className="text-h4-button-500 font-h4-button-500 text-brand-800" />
              {serviceAddress ? (
                <span className="text-body font-body text-default-font">
                  {serviceAddress}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <FeatherZap className="text-h4-button-500 font-h4-button-500 text-brand-800" />
              {nbnTechType ? (
                <span className="text-body font-body text-default-font">
                  {nbnTechType}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex w-full flex-col items-start gap-4">
            <div className="flex w-full flex-col items-start gap-2">
              <div className="flex w-full items-center justify-between">
                {planLabel ? (
                  <span className="text-body-bold font-body-bold text-brand-800">
                    {planLabel}
                  </span>
                ) : null}
                {planPrice ? (
                  <span className="text-body font-body text-default-font">
                    {planPrice}
                  </span>
                ) : null}
              </div>
              <div className="flex w-full flex-col items-start gap-2 rounded-sm bg-color-accent2-101 px-3 py-2">
                <span className="text-body font-body text-default-font">
                  Offer: $20/month off for the first 6 months, then $99/month
                  after that. See T&amp;Cs.
                </span>
              </div>
            </div>
            <div className="flex w-full items-center justify-between">
              {modemLabel ? (
                <span className="text-body-bold font-body-bold text-brand-800">
                  {modemLabel}
                </span>
              ) : null}
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
              <span className="text-h4-button-500 font-h4-button-500 text-brand-800">
                Total monthly
              </span>
              {totalPrice ? (
                <span className="text-h4-button-500 font-h4-button-500 text-neutral-700">
                  {totalPrice}
                </span>
              ) : null}
            </div>
            <div className="flex w-full items-center justify-between">
              <span className="text-h4-button-500 font-h4-button-500 text-brand-800">
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
