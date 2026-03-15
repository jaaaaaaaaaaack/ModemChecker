// @subframe/sync-disable
"use client";
/*
 * Documentation:
 * HeaderWithNavigation — https://app.subframe.com/c141bce6134a/library?component=HeaderWithNavigation_59be7886-4446-4a7f-aec5-f052204e534f
 * Icon Button — https://app.subframe.com/c141bce6134a/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 */

import React from "react";
import { FeatherChevronLeft } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { IconButton } from "./IconButton";

interface HeaderWithNavigationRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  variant?: "option-1" | "image" | "2-slot-blue" | "2-slot-purple";
  onClose?: () => void;
  className?: string;
}

const HeaderWithNavigationRoot = React.forwardRef<
  HTMLDivElement,
  HeaderWithNavigationRootProps
>(function HeaderWithNavigationRoot(
  {
    title,
    variant = "option-1",
    onClose,
    className,
    ...otherProps
  }: HeaderWithNavigationRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/59be7886 flex w-full items-center gap-2",
        {
          "flex-row flex-nowrap items-start justify-between":
            variant === "image",
        },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <img
        className={SubframeUtils.twClassNames(
          "hidden h-24 w-32 flex-none object-cover",
          { block: variant === "image" }
        )}
        src={
          variant === "image"
            ? "https://res.cloudinary.com/subframe/image/upload/v1773555007/uploads/11901/q3kxnpvkqcjl8176het5.png"
            : "https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
        }
      />
      <div
        className={SubframeUtils.twClassNames(
          "flex grow shrink-0 basis-0 items-center gap-2",
          { "h-auto w-auto flex-none": variant === "image" }
        )}
      >
        <IconButton
          className={SubframeUtils.twClassNames({
            hidden:
              variant === "2-slot-purple" ||
              variant === "2-slot-blue" ||
              variant === "image",
          })}
          variant="option-1"
          icon={<FeatherChevronLeft />}
        />
        {title ? (
          <span
            className={SubframeUtils.twClassNames(
              "grow shrink-0 basis-0 text-h2 font-h2 text-brand-900",
              {
                "text-color-accent2-800": variant === "2-slot-purple",
                "text-brand-800": variant === "2-slot-blue",
                hidden: variant === "image",
              }
            )}
          >
            {title}
          </span>
        ) : null}
        {onClose ? (
          <IconButton
            className="rounded-full"
            variant={
              variant === "2-slot-purple"
                ? "neutral-primary"
                : variant === "2-slot-blue"
                ? "brand-secondary"
                : variant === "image"
                ? "neutral-primary"
                : "neutral-secondary"
            }
            size={variant === "image" ? "large" : undefined}
            icon={<FeatherX />}
            onClick={onClose}
            aria-label="Close"
          />
        ) : null}
      </div>
    </div>
  );
});

export const HeaderWithNavigation = HeaderWithNavigationRoot;
