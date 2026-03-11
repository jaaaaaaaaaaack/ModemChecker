import { describe, it, expect } from "vitest";
import { CONDITION_LABELS, STATUS_CONFIG } from "../src/constants";
import type { ConditionCode, CompatibilityStatus } from "../src/types";

describe("CONDITION_LABELS", () => {
  it("has a label for every condition code", () => {
    const codes: ConditionCode[] = [
      "SWITCH_TO_IPOE", "DISABLE_VLAN", "ISP_LOCK", "MISSING_SOS_ROC",
      "WAN_PORT_LIMIT", "NEEDS_2_5G_WAN", "FIRMWARE_UPDATE", "BRIDGE_MODE",
      "NO_VOIP", "EOL",
    ];
    for (const code of codes) {
      expect(CONDITION_LABELS[code]).toBeDefined();
      expect(CONDITION_LABELS[code].label).toBeTruthy();
      expect(CONDITION_LABELS[code].description).toBeTruthy();
    }
  });
});

describe("STATUS_CONFIG", () => {
  it("has config for every status", () => {
    const statuses: CompatibilityStatus[] = ["yes", "yes_but", "no"];
    for (const status of statuses) {
      expect(STATUS_CONFIG[status]).toBeDefined();
      expect(STATUS_CONFIG[status].heading).toBeTruthy();
      expect(STATUS_CONFIG[status].color).toBeTruthy();
    }
  });
});
