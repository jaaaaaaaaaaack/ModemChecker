import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Modem } from "../../src/types";

// Mock supabase before importing search
vi.mock("../../src/lib/supabase", () => {
  const mockSelect = vi.fn();
  const mockTextSearch = vi.fn();
  const mockLimit = vi.fn();

  // Chain: from().select().textSearch().limit()
  const mockFrom = vi.fn(() => ({
    select: mockSelect.mockReturnValue({
      textSearch: mockTextSearch.mockReturnValue({
        limit: mockLimit,
      }),
    }),
  }));

  return {
    supabase: { from: mockFrom },
    __mocks: { mockFrom, mockSelect, mockTextSearch, mockLimit },
  };
});

import { searchModems } from "../../src/lib/search";
import { __mocks } from "../../src/lib/supabase";

const { mockLimit } = __mocks as {
  mockFrom: ReturnType<typeof vi.fn>;
  mockSelect: ReturnType<typeof vi.fn>;
  mockTextSearch: ReturnType<typeof vi.fn>;
  mockLimit: ReturnType<typeof vi.fn>;
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

  it("returns modems from Supabase full-text search", async () => {
    mockLimit.mockResolvedValue({ data: [fakeModem], error: null });

    const result = await searchModems("tp-link archer");
    expect(result).toEqual([fakeModem]);
  });

  it("returns empty array when no results", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    const result = await searchModems("nonexistent modem");
    expect(result).toEqual([]);
  });

  it("throws on Supabase error", async () => {
    mockLimit.mockResolvedValue({ data: null, error: { message: "DB error" } });

    await expect(searchModems("test")).rejects.toThrow("DB error");
  });

  it("trims and rejects empty queries", async () => {
    const result = await searchModems("   ");
    expect(result).toEqual([]);
  });
});
