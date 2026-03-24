import { InfoCallout } from "./InfoCallout";

const DISCLAIMER_TEXT =
  "This tool uses information from the modem manufacturer and other online sources. You should verify your modem\u2019s compatibility and specs independently.";

export function DisclaimerCallout() {
  return (
    <InfoCallout>
      {DISCLAIMER_TEXT}
    </InfoCallout>
  );
}
