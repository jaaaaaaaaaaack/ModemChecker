import { InfoCallout } from "./InfoCallout";

const DISCLAIMER_TEXT =
  "This tool is based on information from the modem manufacturer and other online sources. While we try to ensure its accuracy, you should verify your modem\u2019s compatibility and specs with the manufacturer.";

export function DisclaimerCallout() {
  return (
    <InfoCallout>
      {DISCLAIMER_TEXT}
    </InfoCallout>
  );
}
