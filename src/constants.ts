import type { ConditionCode, CompatibilityStatus, SpeedWarning, TechType, NbnTechType } from "./types";

export const CONDITION_LABELS: Record<ConditionCode, { label: string; description: string }> = {
  SWITCH_TO_IPOE: {
    label: "Reconfigure to IPoE",
    description: "This modem may be set up for PPPoE. You'll need to switch it to IPoE/DHCP for Belong.",
  },
  DISABLE_VLAN: {
    label: "Disable VLAN tagging",
    description: "VLAN tagging from a previous ISP may need to be turned off.",
  },
  ISP_LOCK: {
    label: "May be ISP-locked",
    description: "This device may be locked to its original ISP. Check before using with Belong.",
  },
  MISSING_SOS_ROC: {
    label: "Missing SOS/ROC support",
    description: "This modem lacks SOS/ROC support, which can cause dropouts on FTTN/FTTB connections.",
  },
  WAN_PORT_LIMIT: {
    label: "WAN port speed bottleneck",
    description: "The 100 Mbps WAN port will cap your speeds on nbn 100+ plans.",
  },
  NEEDS_2_5G_WAN: {
    label: "2.5G WAN recommended",
    description: "A 1 Gbps WAN port will bottleneck nbn 500/1000 plans. Consider a 2.5G WAN device.",
  },
  FIRMWARE_UPDATE: {
    label: "Firmware update required",
    description: "Update your modem's firmware before using it with Belong.",
  },
  BRIDGE_MODE: {
    label: "Requires bridge mode",
    description: "This device needs to be configured in bridge mode for use with Belong.",
  },
  NO_VOIP: {
    label: "No VoIP support",
    description: "This device doesn't support VoIP if you need a home phone service.",
  },
  EOL: {
    label: "End of life",
    description: "This device is no longer supported by the manufacturer. Security and compatibility may be affected.",
  },
};

export const STATUS_CONFIG: Record<CompatibilityStatus, { heading: string; color: string; bgColor: string }> = {
  yes: {
    heading: "Compatible with Belong nbn",
    color: "text-success-500",
    bgColor: "bg-success-50",
  },
  yes_but: {
    heading: "Compatible with some requirements",
    color: "text-warning-500",
    bgColor: "bg-warning-50",
  },
  no: {
    heading: "Not compatible with Belong nbn",
    color: "text-error-500",
    bgColor: "bg-error-50",
  },
};

export const DEFAULT_PLAN_SPEED_MBPS = 500;

/** Condition codes that are superseded by the runtime speed assessment */
export const SPEED_CONDITION_CODES: ReadonlySet<ConditionCode> = new Set([
  "WAN_PORT_LIMIT",
  "NEEDS_2_5G_WAN",
]);

/**
 * Condition codes that warrant their own individual display on the card.
 * All other conditions are absorbed into the generic "Some setup may be required" callout.
 */
export const INDIVIDUAL_CONDITION_CODES: ReadonlySet<ConditionCode> = new Set([
  "ISP_LOCK",
]);

export const SPEED_WARNING_COPY: Record<SpeedWarning["type"], { title: string }> = {
  "wan-bottleneck": {
    title: "This modem is not fast enough to support your plan's maximum speeds.",
  },
  "wifi-bottleneck": {
    title: "This modem may not be capable of supporting your plan's maximum speeds over Wi-Fi.",
  },
};

// --- Dev menu plan & tech type config ---

export interface NbnPlan {
  id: string;
  label: string;
  speedMbps: number;
  price: string;
}

export const NBN_PLANS: NbnPlan[] = [
  { id: "nbn100", label: "nbn\u00AE100", speedMbps: 100, price: "$65/month" },
  { id: "nbn500", label: "nbn\u00AE500", speedMbps: 500, price: "$79/month" },
  { id: "nbn1000", label: "nbn\u00AE1000", speedMbps: 880, price: "$99/month" },
];

export interface NbnTechOption {
  id: NbnTechType;
  label: string;
  /** The DB-level TechType used for compatibility lookups */
  dbTechType: TechType;
}

export const NBN_TECH_TYPES: NbnTechOption[] = [
  { id: "fttp", label: "FTTP", dbTechType: "fttp" },
  { id: "fttb", label: "FTTB", dbTechType: "fttn" },
  { id: "fttn", label: "FTTN", dbTechType: "fttn" },
  { id: "fttc", label: "FTTC", dbTechType: "fttc" },
  { id: "hfc", label: "HFC", dbTechType: "hfc" },
];
