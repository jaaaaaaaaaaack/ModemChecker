import type { Modem, TechType, ConditionCode, CompatibilityAssessment, SpeedWarning } from "../types";
import { SPEED_CONDITION_CODES } from "../constants";

export function assessCompatibility(
  modem: Modem,
  techType: TechType,
  planSpeedMbps: number
): CompatibilityAssessment {
  const compat = modem.compatibility[techType];

  if (compat.status === "no") {
    return { cardStatus: "not-compatible", speedWarning: null, setupConditions: [] };
  }

  // Assess speed
  let speedWarning: SpeedWarning | null = null;
  const wanSpeed = modem.wan.wan_port_speed_mbps;
  const perBandValues = Object.values(modem.wifi.max_speed_mbps.per_band);
  const bestBand = perBandValues.length > 0 ? Math.max(...perBandValues) : 0;

  if (wanSpeed > 0 && wanSpeed < planSpeedMbps) {
    speedWarning = { type: "wan-bottleneck" };
  } else if (bestBand > 0 && bestBand < planSpeedMbps * 2) {
    speedWarning = { type: "wifi-bottleneck" };
  }

  // Filter out speed-related condition codes — the runtime assessment supersedes them
  const setupConditions: ConditionCode[] = compat.conditions.filter(
    (code) => !SPEED_CONDITION_CODES.has(code)
  );

  // Determine card status
  let cardStatus: CompatibilityAssessment["cardStatus"];
  if (speedWarning) {
    cardStatus = "speed-warning";
  } else if (setupConditions.length > 0) {
    cardStatus = "callout";
  } else {
    cardStatus = "compatible";
  }

  return { cardStatus, speedWarning, setupConditions };
}
