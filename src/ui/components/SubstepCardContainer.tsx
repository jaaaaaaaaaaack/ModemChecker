// @subframe/sync-disable
"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/c141bce6134a/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * SubstepCardContainer — https://app.subframe.com/c141bce6134a/library?component=SubstepCardContainer_5680c29b-9263-444a-ae9d-a7e18c3c5a7a
 */

import React from "react";
import { FeatherArrowUpRight } from "@subframe/core";
import { FeatherGlobe } from "@subframe/core";
import { FeatherLock } from "@subframe/core";
import { FeatherLockKeyhole } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";

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
  appStoreUrl?: string;
  playStoreUrl?: string;
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
    appStoreUrl,
    playStoreUrl,
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
        <div className="flex w-full flex-col items-start justify-center gap-2">
          <div className="flex items-center gap-1">
            <FeatherGlobe className="text-h4-button-700 font-h4-button-700 text-neutral-500" />
            <span className="text-body font-body text-subtext-color">
              Address
            </span>
          </div>
          {adminUrlPrimary ? (
            <span className="text-h4-button-500 font-h4-button-500">
              {adminUrlPrimary}
            </span>
          ) : null}
          {adminUrlSecondary ? (
            <span className="text-body font-body text-subtext-color">
              If that doesn&apos;t work, try{" "}
              <span className="text-body font-body text-default-font">
                {adminUrlSecondary}
              </span>
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
          <div className="flex flex-col items-start justify-center gap-2">
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
          <div className="flex flex-col items-start justify-center gap-2">
            <div className="flex items-center gap-1">
              <FeatherLockKeyhole className="text-h4-button-700 font-h4-button-700 text-neutral-500" />
              <span className="text-body font-body text-subtext-color">
                Default password
              </span>
            </div>
            {password ? (
              <span className="text-h4-button-500 font-h4-button-500 text-default-font">
                {password}
              </span>
            ) : null}
          </div>
        </div>
        <div
          className={SubframeUtils.twClassNames(
            "hidden flex-col items-start gap-2",
            { flex: variant === "login-no-credentials" }
          )}
        >
          <div
            className={SubframeUtils.twClassNames("hidden items-center gap-1", {
              flex: variant === "login-no-credentials",
            })}
          >
            {variant === "login-no-credentials" ? (
              <FeatherLockKeyhole className="text-h4-button-700 font-h4-button-700 text-neutral-500" />
            ) : (
              <FeatherLock className="text-h4-button-700 font-h4-button-700 text-neutral-500" />
            )}
            <span className="text-body font-body text-subtext-color">
              {variant === "login-no-credentials"
                ? "Login details"
                : "Password"}
            </span>
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
        </div>
        <div
          className={SubframeUtils.twClassNames(
            "hidden w-full flex-col items-start gap-4",
            { flex: variant === "login-no-pass" }
          )}
        >
          <div className="flex flex-col items-start justify-center gap-2">
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
          <div
            className={SubframeUtils.twClassNames(
              "hidden flex-col items-start gap-2",
              { flex: variant === "login-no-pass" }
            )}
          >
            <div className="flex items-center gap-1">
              {variant === "login-no-pass" ? (
                <FeatherLockKeyhole className="text-h4-button-700 font-h4-button-700 text-neutral-500" />
              ) : (
                <FeatherLock className="text-h4-button-700 font-h4-button-700 text-neutral-500" />
              )}
              <span className="text-body font-body text-subtext-color">
                Password
              </span>
            </div>
            <span className="text-body font-body text-default-font">
              {variant === "login-no-pass"
                ? "The default password is printed on a sticker on the bottom of your modem."
                : "Use the password on the sticker on the bottom of your modem."}
            </span>
          </div>
        </div>
      </div>
      <div
        className={SubframeUtils.twClassNames(
          "hidden w-full items-start gap-3 rounded-md bg-white px-4 py-4 shadow-sm",
          { flex: variant === "app-only" }
        )}
      >
        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4">
          <div
            className={SubframeUtils.twClassNames(
              "hidden w-full flex-col items-start gap-4",
              { flex: variant === "app-only" }
            )}
          >
            {appStoreUrl ? (
              <div className="flex flex-col items-start gap-2">
                <span className="text-body-bold font-body-bold text-default-font">
                  Download for iPhone or iPad
                </span>
                <a
                  href={appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="brand-secondary"
                    iconRight={<FeatherArrowUpRight />}
                    hasRightIcon={true}
                  >
                    Apple App Store
                  </Button>
                </a>
              </div>
            ) : null}
            {playStoreUrl ? (
              <div className="flex flex-col items-start gap-2">
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-body-bold font-body-bold text-default-font">
                    Download for Android devices
                  </span>
                  <span className="text-body font-body text-neutral-600">
                    Samsung, Xiaomi, Pixel, and others
                  </span>
                </div>
                <a
                  href={playStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="brand-secondary"
                    iconRight={<FeatherArrowUpRight />}
                    hasRightIcon={true}
                  >
                    Google Play Store
                  </Button>
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
});

export const SubstepCardContainer = SubstepCardContainerRoot;
