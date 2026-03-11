import type { ConditionCode, CompatibilityStatus } from "./types";

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
