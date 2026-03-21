"use client";
/*
 * Documentation:
 * Modern navbar — https://app.subframe.com/c141bce6134a/library?component=Modern+navbar_cba8555a-1e5a-4a57-8c3d-6ad67c2ef976
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
        "group/4f025ecf flex h-12 cursor-pointer flex-col items-center justify-center gap-4 px-4",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {children ? (
        <span className="text-body-bold font-body-bold text-subtext-color group-hover/4f025ecf:text-default-font">
          {children}
        </span>
      ) : null}
    </div>
  );
});

interface ModernNavbarRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  rightSlot?: React.ReactNode;
  logo?: string;
  className?: string;
}

const ModernNavbarRoot = React.forwardRef<
  HTMLDivElement,
  ModernNavbarRootProps
>(function ModernNavbarRoot(
  {
    children,
    rightSlot,
    logo,
    className,
    ...otherProps
  }: ModernNavbarRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full max-w-[1024px] flex-wrap items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background shadow-md",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex h-12 flex-col items-start justify-center gap-2 px-4">
        {logo ? (
          <img className="h-4 flex-none object-cover" src={logo} />
        ) : null}
      </div>
      {children ? (
        <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-wrap items-center gap-6">
          {children}
        </div>
      ) : null}
      {rightSlot ? (
        <div className="flex items-center gap-2 px-2">{rightSlot}</div>
      ) : null}
    </div>
  );
});

export const ModernNavbar = Object.assign(ModernNavbarRoot, {
  NavItem,
});
