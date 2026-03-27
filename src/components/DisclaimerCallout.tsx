import { InfoCallout } from "./InfoCallout";

const DISCLAIMER_TEXT =
  "This tool uses information from the modem manufacturer and other online sources. You should verify your modem\u2019s compatibility and specs independently.";

export function DisclaimerCallout({ className }: { className?: string }) {
  return (
    <InfoCallout className={className}>
      {DISCLAIMER_TEXT}
    </InfoCallout>
  );
}
