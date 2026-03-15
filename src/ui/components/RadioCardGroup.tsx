// @subframe/sync-disable
"use client";
/*
 * Documentation:
 * Radio Card Group — https://app.subframe.com/c141bce6134a/library?component=Radio+Card+Group_6d5193b8-6043-4dc1-aad5-7f902ef872df
 *
 * FIX: Removed explicit `checked` prop from RadioGroup.Item — it overrides
 * Radix's group-level value control. The group's `value` prop determines
 * which item is checked; passing checked={false} via itemProps clobbers it.
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { ModemImage } from "../../components/ModemImage";

interface RadioCardProps
  extends React.ComponentProps<typeof SubframeCore.RadioGroup.Item> {
  disabled?: boolean;
  checked?: boolean;
  hideRadio?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  image?: string;
  children?: React.ReactNode;
  className?: string;
}

const RadioCard = React.forwardRef<HTMLButtonElement, RadioCardProps>(
  function RadioCard(
    {
      disabled = false,
      checked = false,
      hideRadio = false,
      label,
      description,
      image,
      children,
      className,
      ...otherProps
    }: RadioCardProps,
    ref
  ) {
    return (
      <SubframeCore.RadioGroup.Item
        disabled={disabled}
        asChild={true}
        {...otherProps}
      >
        <button
          className={SubframeUtils.twClassNames(
            "group/502d4919 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-solid border-neutral-300 bg-default-background pl-4 pr-5 py-4 text-left transition-all duration-200 hover:border hover:border-solid hover:border-brand-primary focus-within:transition-all focus-within:duration-200 focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-600 focus-within:ring-offset-2 aria-[checked=true]:border aria-[checked=true]:border-solid aria-[checked=true]:border-brand-600 aria-[checked=true]:bg-brand-50 disabled:cursor-default disabled:border disabled:border-solid disabled:border-neutral-100 disabled:bg-neutral-50 hover:disabled:cursor-default hover:disabled:border hover:disabled:border-solid hover:disabled:border-neutral-200",
            className
          )}
          ref={ref}
        >
          <div
            className={SubframeUtils.twClassNames(
              "flex items-center gap-2 rounded-full",
              { hidden: hideRadio }
            )}
          >
            <div className="flex h-6 w-6 flex-none flex-col items-center justify-center gap-2 rounded-full border-2 border-solid border-neutral-300 transition-all duration-200 group-hover/502d4919:border-[5px] group-hover/502d4919:border-solid group-hover/502d4919:border-neutral-400 group-aria-[checked=true]/502d4919:border-8 group-aria-[checked=true]/502d4919:border-solid group-aria-[checked=true]/502d4919:border-brand-600 group-hover/502d4919:group-aria-[checked=true]/502d4919:border-8 group-hover/502d4919:group-aria-[checked=true]/502d4919:border-solid group-hover/502d4919:group-aria-[checked=true]/502d4919:border-brand-primary group-disabled/502d4919:bg-neutral-100">
              <div className="hidden h-2 w-2 flex-none flex-col items-start gap-2 rounded-full bg-white transition-all duration-200 group-aria-[checked=true]/502d4919:flex group-disabled/502d4919:bg-neutral-300" />
            </div>
          </div>
          <div className="flex grow shrink-0 basis-0 items-center gap-4">
            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-0.5">
              {label ? (
                <span className="text-body-bold font-body-bold text-default-font">
                  {label}
                </span>
              ) : null}
              {description ? (
                <span className="text-body font-body text-neutral-500">
                  {description}
                </span>
              ) : null}
              {children ? (
                <div className="flex w-full flex-col items-start">
                  {children}
                </div>
              ) : null}
            </div>
            {image ? (
              <ModemImage
                src={image}
                alt={String(label ?? "Modem")}
                className="w-16 flex-none self-stretch object-contain drop-shadow-sm mix-blend-multiply"
              />
            ) : null}
          </div>
        </button>
      </SubframeCore.RadioGroup.Item>
    );
  }
);

interface RadioCardGroupRootProps
  extends React.ComponentProps<typeof SubframeCore.RadioGroup.Root> {
  label?: React.ReactNode;
  helpText?: React.ReactNode;
  children?: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

const RadioCardGroupRoot = React.forwardRef<
  HTMLDivElement,
  RadioCardGroupRootProps
>(function RadioCardGroupRoot(
  {
    label,
    helpText,
    children,
    className,
    ...otherProps
  }: RadioCardGroupRootProps,
  ref
) {
  return (
    <SubframeCore.RadioGroup.Root asChild={true} {...otherProps}>
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col gap-3 items-stretch",
          className
        )}
        ref={ref}
      >
        <div className="flex flex-col items-start gap-1">
          {label ? (
            <span className="text-h4-button-700 font-h4-button-700 text-brand-800">
              {label}
            </span>
          ) : null}
          {helpText ? (
            <span className="text-body font-body text-subtext-color">
              {helpText}
            </span>
          ) : null}
        </div>
        {children ? (
          <div className="flex w-full flex-col gap-2 items-stretch">
            {children}
          </div>
        ) : null}
      </div>
    </SubframeCore.RadioGroup.Root>
  );
});

export const RadioCardGroup = Object.assign(RadioCardGroupRoot, {
  RadioCard,
});
