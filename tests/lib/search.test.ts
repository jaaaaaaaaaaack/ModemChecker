import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Modem } from "../../src/types";

// Mock supabase before importing search
vi.mock("../../src/lib/supabase", () => {
  const mockLimit = vi.fn();
  const mockTextSearch = vi.fn(() => ({ limit: mockLimit }));
  const mockSelect = vi.fn(() => ({ textSearch: mockTextSearch }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  const mockRpc = vi.fn();

  return {
    supabase: { from: mockFrom, rpc: mockRpc },
    __mocks: { mockFrom, mockSelect, mockTextSearch, mockLimit, mockRpc },
  };
});

import { searchModems } from "../../src/lib/search";
import { __mocks } from "../../src/lib/supabase";

const { mockLimit, mockRpc } = __mocks as {
  mockFrom: ReturnType<typeof vi.fn>;
  mockSelect: ReturnType<typeof vi.fn>;
  mockTextSearch: ReturnType<typeof vi.fn>;
  mockLimit: ReturnType<typeof vi.fn>;
  mockRpc: ReturnType<typeof vi.fn>;
};

const fakeModem: Modem = {
  id: "tp-link-archer-vr1600v",
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
    bands: ["2.4GHz", "5GHz"],
    max_speed_mbps: { theoretical_combined: 1600, per_band: {} },
  },
  general: { release_year: 2019, still_sold: false, end_of_life: false, manufacturer_url: null },
};

describe("searchModems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns modems from FTS when results found", async () => {
    mockLimit.mockResolvedValue({ data: [fakeModem], error: null });

    const result = await searchModems("tp-link archer");
    expect(result).toEqual([fakeModem]);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("falls back to trigram RPC when FTS returns empty", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });
    mockRpc.mockResolvedValue({ data: [fakeModem], error: null });

    const result = await searchModems("tplink archer");
    expect(mockRpc).toHaveBeenCalledWith("search_modems_fuzzy", {
      query_text: "tplink archer",
      max_results: 10,
    });
    expect(result).toEqual([fakeModem]);
  });

  it("returns empty array when both tiers find nothing", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });
    mockRpc.mockResolvedValue({ data: [], error: null });

    const result = await searchModems("zzzznotamodem");
    expect(mockRpc).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("throws on FTS error and does not fall back", async () => {
    mockLimit.mockResolvedValue({ data: null, error: { message: "DB error" } });

    await expect(searchModems("test")).rejects.toThrow("DB error");
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("throws on trigram RPC error", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });
    mockRpc.mockResolvedValue({ data: null, error: { message: "RPC error" } });

    await expect(searchModems("tplink")).rejects.toThrow("RPC error");
  });

  it("trims and rejects empty queries", async () => {
    const result = await searchModems("   ");
    expect(result).toEqual([]);
  });
});
