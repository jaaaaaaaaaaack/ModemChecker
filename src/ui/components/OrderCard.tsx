"use client";
/*
 * Documentation:
 * orderCard — https://app.subframe.com/c141bce6134a/library?component=orderCard_11e35c6c-863a-48ea-956e-bd21f7eda5e3
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface OrderCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  planLabel?: React.ReactNode;
  planPrice?: React.ReactNode;
  modemLabel?: React.ReactNode;
  modemPrice?: React.ReactNode;
  totalPrice?: React.ReactNode;
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
      className,
      ...otherProps
    }: OrderCardRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex w-full flex-col items-start gap-3">
            <div className="flex w-full items-center justify-between">
              {planLabel ? (
                <span className="text-body-bold font-body-bold text-default-font">
                  {planLabel}
                </span>
              ) : null}
              {planPrice ? (
                <span className="text-body-bold font-body-bold text-default-font">
                  {planPrice}
                </span>
              ) : null}
            </div>
            <div className="flex w-full items-center justify-between">
              {modemLabel ? (
                <span className="text-body-bold font-body-bold text-default-font">
                  {modemLabel}
                </span>
              ) : null}
              {modemPrice ? (
                <span className="text-body font-body text-neutral-500">
                  {modemPrice}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex w-full items-center justify-between">
            <span className="text-h3-700 font-h3-700 text-default-font">
              Total
            </span>
            {totalPrice ? (
              <span className="text-h3-700 font-h3-700 text-default-font">
                {totalPrice}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

export const OrderCard = OrderCardRoot;
