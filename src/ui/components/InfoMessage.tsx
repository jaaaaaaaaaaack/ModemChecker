"use client";
/*
 * Documentation:
 * InfoMessage — https://app.subframe.com/c141bce6134a/library?component=InfoMessage_79165a53-7ef8-44eb-a896-d2dd60e2e2c7
 */

import React from "react";
import { FeatherInfo } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface InfoMessageRootProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  message?: React.ReactNode;
  className?: string;
}

const InfoMessageRoot = React.forwardRef<HTMLDivElement, InfoMessageRootProps>(
  function InfoMessageRoot(
    {
      icon = <FeatherInfo />,
      message,
      className,
      ...otherProps
    }: InfoMessageRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex items-start gap-2",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {icon ? (
          <SubframeCore.IconWrapper className="text-h3-700 font-h3-700 text-brand-700">
            {icon}
          </SubframeCore.IconWrapper>
        ) : null}
        {message ? <div className="flex items-start">{message}</div> : null}
      </div>
    );
  }
);

export const InfoMessage = InfoMessageRoot;
