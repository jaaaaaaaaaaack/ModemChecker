import { FeatherInfo } from "@subframe/core";

const DISCLAIMER_TEXT =
  "This tool provides general advice only, sourced from the modem manufacturer and other online sources. We do our best to ensure it\u2019s accurate, but you should verify your modem\u2019s compatibility and specs on the manufacturer\u2019s website.";

export function DisclaimerCallout() {
  return (
    <div className="flex w-full flex-col items-start gap-3 rounded-md border border-solid border-brand-200 bg-brand-50 px-4 py-4">
      <div className="flex items-center gap-2">
        <FeatherInfo className="text-brand-700 flex-none w-4 h-4" />
        <span className="text-body-bold font-body-bold text-brand-700">Important info</span>
      </div>
      <span className="text-body font-body text-brand-700">
        {DISCLAIMER_TEXT}
      </span>
    </div>
  );
}
