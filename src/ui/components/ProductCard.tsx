"use client";
/*
 * Documentation:
 * Button — https://app.subframe.com/c141bce6134a/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * Link Button — https://app.subframe.com/c141bce6134a/library?component=Link+Button_a4ee726a-774c-4091-8c49-55b659356024
 * ProductCard — https://app.subframe.com/c141bce6134a/library?component=ProductCard_29d681ec-71df-455e-96bd-58a05857d77c
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { LinkButton } from "./LinkButton";

interface ProductCardRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  pricing?: React.ReactNode;
  productImage?: string;
  features?: React.ReactNode;
  variant?:
    | "option-1"
    | "option-2"
    | "brand"
    | "green"
    | "brand-reversed"
    | "brand-flat"
    | "brand-outline"
    | "brand-outline-2";
  className?: string;
}

const ProductCardRoot = React.forwardRef<HTMLDivElement, ProductCardRootProps>(
  function ProductCardRoot(
    {
      title,
      pricing,
      productImage,
      features,
      variant = "option-1",
      className,
      ...otherProps
    }: ProductCardRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/29d681ec flex w-full cursor-pointer flex-col items-start gap-4 rounded-md border border-solid border-color-accent2-200 px-4 py-4 bg-gradient-to-b from-color-accent2-200 to-color-accent2-50",
          {
            "border-none bg-default-background bg-none from-transparent to-transparent":
              variant === "brand-outline-2",
            "border border-solid border-brand-primary bg-none from-transparent to-transparent":
              variant === "brand-outline",
            "border border-solid border-brand-200 bg-brand-100 bg-none from-transparent to-transparent":
              variant === "brand-flat",
            "border border-solid border-brand-200 bg-gradient-to-t from-brand-200 to-brand-50":
              variant === "brand-reversed",
            "border border-solid border-color-secondary-101 bg-gradient-to-b from-color-secondary-101 to-color-secondary-51":
              variant === "green",
            "border border-solid border-brand-300 bg-gradient-to-b from-brand-200 to-brand-50":
              variant === "brand",
          },
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex w-full items-start gap-4">
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
            <div
              className={SubframeUtils.twClassNames(
                "flex flex-col items-start gap-3",
                { "flex-col flex-nowrap gap-4": variant === "green" }
              )}
            >
              {title ? (
                <span
                  className={SubframeUtils.twClassNames(
                    "text-h3-500 font-h3-500 text-color-accent2-800",
                    {
                      "text-brand-800":
                        variant === "brand-outline-2" ||
                        variant === "brand-outline" ||
                        variant === "brand-reversed" ||
                        variant === "brand",
                      "text-h4-button-700 font-h4-button-700 text-brand-800":
                        variant === "brand-flat",
                      "text-color-secondary-701": variant === "green",
                    }
                  )}
                >
                  {title}
                </span>
              ) : null}
              {pricing ? (
                <span className="whitespace-pre-wrap text-body font-body text-default-font">
                  {pricing}
                </span>
              ) : null}
            </div>
          </div>
          {productImage ? (
            <img
              className="h-20 w-24 flex-none object-cover overflow-visible"
              src={productImage}
            />
          ) : null}
        </div>
        {features ? (
          <div className="flex flex-col items-start gap-2">{features}</div>
        ) : null}
        <div className="flex items-center gap-2">
          <Button
            className={SubframeUtils.twClassNames({
              hidden: variant === "brand-flat",
            })}
            variant={
              variant === "brand-outline-2"
                ? "brand-tertiary"
                : variant === "brand-outline"
                ? "brand-tertiary"
                : variant === "brand-flat"
                ? "brand-tertiary"
                : variant === "brand-reversed"
                ? "cyan-tertiary"
                : variant === "green"
                ? "green-tertiary"
                : variant === "brand"
                ? "brand-tertiary"
                : "purple-tertiary"
            }
            size="small"
          >
            Modem details
          </Button>
          <div
            className={SubframeUtils.twClassNames(
              "hidden items-center gap-2 pb-1",
              { flex: variant === "brand-flat" }
            )}
          >
            <LinkButton
              className={SubframeUtils.twClassNames("hidden", {
                flex: variant === "brand-flat",
              })}
            >
              {variant === "brand-flat" ? "More modem info" : "Label"}
            </LinkButton>
          </div>
        </div>
      </div>
    );
  }
);

export const ProductCard = ProductCardRoot;
