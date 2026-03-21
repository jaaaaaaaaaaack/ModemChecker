"use client";
/*
 * Documentation:
 * SubstepCardContainer — https://app.subframe.com/c141bce6134a/library?component=SubstepCardContainer_5680c29b-9263-444a-ae9d-a7e18c3c5a7a
 */

import React from "react";
import { FeatherGlobe } from "@subframe/core";
import { FeatherLock } from "@subframe/core";
import { FeatherSmartphone } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import * as SubframeUtils from "../utils";

interface SubstepCardContainerRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "login-base"
    | "login-no-credentials"
    | "login-no-pass"
    | "app-only";
  password?: React.ReactNode;
  username?: React.ReactNode;
  adminUrlPrimary?: React.ReactNode;
  adminUrlSecondary?: React.ReactNode;
  image?: React.ReactNode;
  appName?: React.ReactNode;
  message?: React.ReactNode;
  className?: string;
}

const SubstepCardContainerRoot = React.forwardRef<
  HTMLDivElement,
  SubstepCardContainerRootProps
>(function SubstepCardContainerRoot(
  {
    variant = "login-base",
    password,
    username,
    adminUrlPrimary,
    adminUrlSecondary,
    image,
    appName,
    message,
    className,
    ...otherProps
  }: SubstepCardContainerRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/5680c29b flex w-full flex-col items-start gap-2",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col items-start gap-4 rounded-md bg-white px-4 py-4 shadow-sm",
          { hidden: variant === "app-only" }
        )}
      >
        <div className="flex w-full flex-col items-start justify-center gap-1">
          <div className="flex items-center gap-1">
            <FeatherGlobe className="text-h4-button-700 font-h4-button-700 text-neutral-500" />
            <span className="text-body font-body text-subtext-color">
              Address
            </span>
          </div>
          {adminUrlPrimary ? (
            <span className="text-h4-button-500 font-h4-button-500 text-default-font">
              {adminUrlPrimary}
            </span>
          ) : null}
          {adminUrlSecondary ? (
            <span className="text-body font-body text-subtext-color">
              {adminUrlSecondary}
            </span>
          ) : null}
        </div>
        <div className="flex h-px w-full flex-none items-start bg-neutral-border" />
        <div
          className={SubframeUtils.twClassNames("flex items-start gap-8", {
            hidden:
              variant === "login-no-pass" || variant === "login-no-credentials",
          })}
        >
          <div className="flex flex-col items-start justify-center gap-1">
            <div className="flex items-center gap-1">
              <FeatherUser className="text-h4-button-700 font-h4-button-700 text-neutral-500" />
              <span className="text-body font-body text-subtext-color">
                Username
              </span>
            </div>
            {username ? (
              <span className="text-h4-button-500 font-h4-button-500 text-default-font">
                {username}
              </span>
            ) : null}
          </div>
          <div className="flex flex-col items-start justify-center gap-1">
            <div className="flex items-center gap-1">
              <FeatherLock className="text-h4-button-700 font-h4-button-700 text-neutral-500" />
              <span className="text-body font-body text-subtext-color">
                Password
              </span>
            </div>
            {password ? (
              <span className="text-h4-button-500 font-h4-button-500 text-default-font">
                {password}
              </span>
            ) : null}
          </div>
        </div>
        <span
          className={SubframeUtils.twClassNames(
            "hidden text-body font-body text-default-font",
            { inline: variant === "login-no-credentials" }
          )}
        >
          Log in using the username and password you created during initial
          setup.
        </span>
        <div
          className={SubframeUtils.twClassNames(
            "hidden w-full flex-col items-start gap-4",
            { flex: variant === "login-no-pass" }
          )}
        >
          <div className="flex flex-col items-start justify-center gap-1">
            <div className="flex items-center gap-1">
              <FeatherUser className="text-h4-button-700 font-h4-button-700 text-neutral-500" />
              <span className="text-body font-body text-subtext-color">
                Username
              </span>
            </div>
            {username ? (
              <span className="text-h4-button-500 font-h4-button-500 text-default-font">
                {username}
              </span>
            ) : null}
          </div>
          <span className="text-body font-body text-default-font">
            Use the password on the sticker on the bottom of your modem.
          </span>
        </div>
      </div>
      <div
        className={SubframeUtils.twClassNames(
          "hidden w-full items-start gap-3 rounded-md bg-white px-4 py-4 shadow-sm",
          { flex: variant === "app-only" }
        )}
      >
        <FeatherSmartphone className="text-h3-500 font-h3-500 text-neutral-500" />
        <div className="flex flex-col items-start gap-1">
          {appName ? <div className="flex items-start">{appName}</div> : null}
          {message ? <div className="flex items-start">{message}</div> : null}
        </div>
      </div>
    </div>
  );
});

export const SubstepCardContainer = SubstepCardContainerRoot;
