"use client";
/*
 * Documentation:
 * Modern navbar mobile — https://app.subframe.com/c141bce6134a/library?component=Modern+navbar+mobile_2aee7939-9e79-4bd2-806c-ccf3dcdc90ce
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const NavItem = React.forwardRef<HTMLDivElement, NavItemProps>(function NavItem(
  { children, className, ...otherProps }: NavItemProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/02bfa066 flex h-12 cursor-pointer flex-col items-center justify-center gap-4 px-4",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {children ? (
        <span className="text-body-bold font-body-bold text-subtext-color group-hover/02bfa066:text-default-font">
          {children}
        </span>
      ) : null}
    </div>
  );
});

interface ModernNavbarMobileRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  logo?: string;
  variant?: "option-1" | "option-2";
  className?: string;
}

const ModernNavbarMobileRoot = React.forwardRef<
  HTMLDivElement,
  ModernNavbarMobileRootProps
>(function ModernNavbarMobileRoot(
  {
    children,
    logo,
    variant = "option-1",
    className,
    ...otherProps
  }: ModernNavbarMobileRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/2aee7939 flex w-full max-w-[1024px] flex-wrap items-center gap-4 bg-neutral-900 px-1",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {children ? (
        <div className="flex grow shrink-0 basis-0 flex-wrap items-center justify-center gap-4">
          {children}
        </div>
      ) : null}
    </div>
  );
});

export const ModernNavbarMobile = Object.assign(ModernNavbarMobileRoot, {
  NavItem,
});
