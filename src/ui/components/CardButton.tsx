"use client";
/*
 * Documentation:
 * cardButton — https://app.subframe.com/c141bce6134a/library?component=cardButton_230e0e60-dbb1-4b67-b074-7a79d14e08e6
 */

import React from "react";
import { FeatherChevronRight } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface CardButtonRootProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string;
  modelName?: React.ReactNode;
  brand?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const CardButtonRoot = React.forwardRef<HTMLDivElement, CardButtonRootProps>(
  function CardButtonRoot(
    {
      image,
      modelName,
      brand,
      icon = <FeatherChevronRight />,
      className,
      ...otherProps
    }: CardButtonRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/230e0e60 flex h-24 w-full cursor-pointer items-center justify-between rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 transition-all duration-200 ease-out hover:border hover:border-solid hover:border-color-primary-500 hover:bg-white",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex items-center gap-4">
          {image ? (
            <img className="h-16 w-16 flex-none object-contain" src={image} />
          ) : null}
          <div className="flex flex-col items-start justify-center gap-1">
            {modelName ? (
              <span className="text-h4-button-500 font-h4-button-500 text-default-font">
                {modelName}
              </span>
            ) : null}
            {brand ? (
              <span className="text-body font-body text-neutral-500">
                {brand}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center justify-between rounded-md bg-white px-1 py-1 transition-all duration-200 ease-out group-hover/230e0e60:bg-color-primary-100 group-active/230e0e60:bg-color-primary-700">
          {icon ? (
            <SubframeCore.IconWrapper className="text-h3-500 font-h3-500 text-brand-700 transition-colors duration-200 ease-out group-hover/230e0e60:text-brand-800 group-active/230e0e60:text-white">
              {icon}
            </SubframeCore.IconWrapper>
          ) : null}
        </div>
      </div>
    );
  }
);

export const CardButton = CardButtonRoot;
