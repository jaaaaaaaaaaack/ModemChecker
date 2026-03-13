export type TechType = "fttp" | "fttc" | "fttn" | "hfc";

export type CompatibilityStatus = "yes" | "yes_but" | "no";

export type ConditionCode =
  | "SWITCH_TO_IPOE"
  | "DISABLE_VLAN"
  | "ISP_LOCK"
  | "MISSING_SOS_ROC"
  | "WAN_PORT_LIMIT"
  | "NEEDS_2_5G_WAN"
  | "FIRMWARE_UPDATE"
  | "BRIDGE_MODE"
  | "NO_VOIP"
  | "EOL";

export type DeviceType = "router" | "modem_router" | "modem" | "mesh_system";

export interface TechCompatibility {
  status: CompatibilityStatus;
  conditions: ConditionCode[];
}

export interface Compatibility {
  fttp: TechCompatibility;
  fttc: TechCompatibility;
  fttn: TechCompatibility;
  hfc: TechCompatibility;
}

export interface Modem {
  id: string;
  brand: string;
  model: string;
  alternative_names: string[] | null;
  device_type: DeviceType;
  isp_provided_by: string | null;
  is_isp_locked: boolean;
  compatibility: Compatibility;
  wan: {
    has_vdsl2_modem: boolean;
    wan_port_speed_mbps: number;
    vdsl2?: {
      profiles: string[];
      supports_vectoring: boolean;
      supports_sra: boolean;
      supports_sos: boolean;
      supports_roc: boolean;
    };
  };
  wifi: {
    wifi_standard: string;
    wifi_generation: number;
    bands: string[];
    max_speed_mbps: {
      theoretical_combined: number;
      per_band: Record<string, number>;
    };
  };
  general: {
    release_year: number | null;
    still_sold: boolean;
    end_of_life: boolean;
    manufacturer_url: string | null;
  };
}

export type SearchState =
  | { step: "idle" }
  | { step: "searching"; query: string }
  | { step: "single_match"; modem: Modem }
  | { step: "multiple_matches"; modems: Modem[] }
  | { step: "no_match"; query: string };

export interface SpeedWarning {
  type: "wan-bottleneck" | "wifi-bottleneck";
}

export interface CompatibilityAssessment {
  cardStatus: "compatible" | "not-compatible" | "speed-warning" | "callout";
  speedWarning: SpeedWarning | null;
  setupConditions: ConditionCode[];
}
