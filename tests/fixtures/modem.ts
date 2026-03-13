import type { Modem } from "../../src/types";

export function makeModem(overrides: Partial<Modem> = {}): Modem {
  return {
    id: "test-modem",
    brand: "TP-Link",
    model: "Archer VR1600v",
    alternative_names: null,
    device_type: "modem_router",
    isp_provided_by: null,
    is_isp_locked: false,
    compatibility: {
      fttp: { status: "yes", conditions: [] },
      fttc: { status: "yes", conditions: [] },
      fttn: { status: "yes", conditions: [] },
      hfc: { status: "yes", conditions: [] },
    },
    wan: { has_vdsl2_modem: true, wan_port_speed_mbps: 1000 },
    wifi: {
      wifi_standard: "Wi-Fi 5",
      wifi_generation: 5,
      bands: [],
      max_speed_mbps: { theoretical_combined: 0, per_band: {} },
    },
    general: {
      release_year: null,
      still_sold: false,
      end_of_life: false,
      manufacturer_url: null,
    },
    ...overrides,
  };
}
