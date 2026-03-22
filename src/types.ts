export type TechType = "fttp" | "fttc" | "fttn" | "hfc";

/** Display tech type includes FTTB (maps to FTTN for compatibility lookups) */
export type NbnTechType = "fttp" | "fttb" | "fttn" | "fttc" | "hfc";

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
  | { step: "no_match"; query: string }
  | { step: "error"; query: string };

export interface SpeedWarning {
  type: "wan-bottleneck" | "wifi-bottleneck";
}

export interface CompatibilityAssessment {
  cardStatus: "compatible" | "not-compatible" | "speed-warning" | "callout";
  speedWarning: SpeedWarning | null;
  setupConditions: ConditionCode[];
}

export type TransitionDirection = "forward" | "backward";

// ---- Setup Guide Types (from data contract §11) ----

export type CredentialType =
  | "standard"
  | "user_created"
  | "isp_sticker"
  | "app_only";

export type PortColor =
  | "blue"
  | "yellow"
  | "red"
  | "white"
  | "grey"
  | "green"
  | "black";

export type PortIcon = "globe" | "ethernet";

export type SourceType =
  | "manufacturer"
  | "isp"
  | "community"
  | "review"
  | "manual";

export interface AdminPanel {
  default_ip: string;
  default_username: string | null;
  default_password: string | null;
  alt_access: string | null;
  credential_type: CredentialType;
  app_only: boolean;
  app_name: string | null;
  app_store_links: { ios: string; android: string } | null;
  auto_detects_ipoe: boolean;
  supports_https: boolean;
  notes: string | null;
}

export interface WanConfigPath {
  nav_path: string;
  connection_type_field: string;
  ipoe_label: string;
  save_button_label: string;
  pppoe_clear_note: string;
  steps_ipoe: string[];
}

export interface WanConfig {
  ethernet: WanConfigPath;
  dsl?: WanConfigPath;
  vlan_field: string | null;
  vlan_nav_path: string | null;
  vlan_notes: string | null;
}

export interface PhysicalLayout {
  wan_port_label: string;
  wan_port_color: PortColor;
  wan_port_position: string;
  wan_port_icon: PortIcon | null;
  wan_port_notes: string | null;
  dsl_port_label: string | null;
  dsl_port_color: PortColor | null;
  dsl_port_position: string | null;
  dsl_port_icon: PortIcon | null;
  dsl_port_notes: string | null;
  lan_ports: string;
  other_ports: string;
  reset_button: string;
  reset_hold_seconds: number;
}

export interface FactoryReset {
  method: string;
  restores_default_credentials: boolean;
  notes: string | null;
}

export interface Firmware {
  check_path: string;
  auto_update_available: boolean;
  download_url: string | null;
  notes: string | null;
}

export interface Troubleshooting {
  internet_led_label: string | null;
  internet_led_success: string | null;
  internet_led_failure: string | null;
  common_issues: string[] | null;
}

export interface SetupSource {
  url: string;
  type: SourceType;
  description: string;
  accessed: string;
}

export interface SetupConfidence {
  score: number;
  notes: string;
}

export interface SetupGuideData {
  admin_panel: AdminPanel;
  wan_config: WanConfig;
  physical: PhysicalLayout;
  factory_reset: FactoryReset;
  firmware: Firmware;
  troubleshooting?: Troubleshooting;
  setup_notes: string;
  manual_url: string | null;
  setup_sources: SetupSource[];
  setup_confidence: SetupConfidence;
}

export type StepTemplateId =
  | "power_on"
  | "physical_connection"
  | "connect_wifi"
  | "login_web"
  | "login_app"
  | "navigate_and_configure"
  | "verify";

// ---- NBN Hardware Types ----

export type CableType = "ethernet" | "phone";

export interface NbnHardwareInfo {
  /** Device name shown on the connection card */
  deviceName: string;
  /** Short description (e.g., "nbn connection box") */
  shortName: string;
  /** Supabase storage image ID (without extension) */
  imageId: string;
  /** Cable type connecting NBN hardware to the modem */
  cableType: CableType;
  /** Generic port description — always accurate across hardware variants */
  portDescription: string;
  /** Port badge label for the PortTypeBadge component */
  portBadgeLabel: string;
  /** Port badge color variant */
  portBadgeColor: "blue" | "yellow" | "neutral" | "green" | "red" | "white";
  /** Disclaimer note about hardware variants */
  variantNote: string;
}
