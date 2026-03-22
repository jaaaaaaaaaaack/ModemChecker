"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/c141bce6134a/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * serviceCard — https://app.subframe.com/c141bce6134a/library?component=serviceCard_7ec31dda-4b26-4964-ba46-ad19a2da00c9
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";

interface ServiceCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string;
  planName?: React.ReactNode;
  address?: React.ReactNode;
  avcId?: React.ReactNode;
  buttonText?: React.ReactNode;
  statusText?: React.ReactNode;
  className?: string;
}

const ServiceCardRoot = React.forwardRef<HTMLDivElement, ServiceCardRootProps>(
  function ServiceCardRoot(
    {
      image,
      planName,
      address,
      avcId,
      buttonText,
      statusText,
      className,
      ...otherProps
    }: ServiceCardRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex w-full items-start justify-between">
            {image ? (
              <img
                className="h-24 w-32 flex-none object-contain"
                src={image}
              />
            ) : null}
            <div className="flex h-9 items-center gap-2 rounded-full border border-solid border-success-100 bg-color-secondary-100 px-3">
              <div className="flex h-3 w-3 flex-none flex-col items-start gap-2 rounded-full bg-success-700 px-1 py-1" />
              {statusText ? (
                <span className="whitespace-nowrap text-caption-bold font-caption-bold text-success-800">
                  {statusText}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            {planName ? (
              <span className="text-h2 font-h2 text-default-font">
                {planName}
              </span>
            ) : null}
            <div className="flex flex-col items-start gap-2">
              {address ? (
                <span className="whitespace-pre-wrap text-h4-button-500 font-h4-button-500 text-neutral-700">
                  {address}
                </span>
              ) : null}
              <div className="flex items-center gap-1">
                <span className="text-h4-button-500 font-h4-button-500 text-neutral-500">
                  AVC ID:
                </span>
                {avcId ? (
                  <span className="text-h4-button-500 font-h4-button-500 text-neutral-500">
                    {avcId}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <Button
          className="h-14 w-full flex-none"
          variant="cyan-tertiary"
          size="large"
        >
          {buttonText}
        </Button>
      </div>
    );
  }
);

export const ServiceCard = ServiceCardRoot;
