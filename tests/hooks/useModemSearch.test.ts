import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("../../src/lib/search", () => ({
  searchModems: vi.fn(),
}));

import { useModemSearch } from "../../src/hooks/useModemSearch";
import { searchModems } from "../../src/lib/search";
import type { Modem } from "../../src/types";

const mockSearch = vi.mocked(searchModems);

const modemA: Modem = {
  id: "a", brand: "TP-Link", model: "Archer VR1600v",
  alternative_names: null, device_type: "modem_router",
  isp_provided_by: null, is_isp_locked: false,
  compatibility: {
    fttp: { status: "yes", conditions: [] },
    fttc: { status: "yes", conditions: [] },
    fttn: { status: "yes", conditions: [] },
    hfc: { status: "yes", conditions: [] },
  },
  wan: { has_vdsl2_modem: true, wan_port_speed_mbps: 1000 },
  wifi: { wifi_standard: "Wi-Fi 5", wifi_generation: 5, bands: [], max_speed_mbps: { theoretical_combined: 0, per_band: {} } },
  general: { release_year: null, still_sold: false, end_of_life: false, manufacturer_url: null },
};

const modemB: Modem = { ...modemA, id: "b", model: "Archer C7" };

describe("useModemSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts in idle state", () => {
    const { result } = renderHook(() => useModemSearch());
    expect(result.current.state.step).toBe("idle");
  });

  it("transitions to single_match on one result", async () => {
    mockSearch.mockResolvedValue([modemA]);
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("tp-link");
    });

    expect(result.current.state.step).toBe("single_match");
    if (result.current.state.step === "single_match") {
      expect(result.current.state.modem.id).toBe("a");
    }
  });

  it("transitions to multiple_matches on 2+ results", async () => {
    mockSearch.mockResolvedValue([modemA, modemB]);
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("archer");
    });

    expect(result.current.state.step).toBe("multiple_matches");
    if (result.current.state.step === "multiple_matches") {
      expect(result.current.state.modems).toHaveLength(2);
    }
  });

  it("transitions to no_match on 0 results", async () => {
    mockSearch.mockResolvedValue([]);
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("nonexistent");
    });

    expect(result.current.state.step).toBe("no_match");
  });

  it("selectModem transitions from multiple_matches to single_match", async () => {
    mockSearch.mockResolvedValue([modemA, modemB]);
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("archer");
    });

    act(() => {
      result.current.selectModem(modemB);
    });

    expect(result.current.state.step).toBe("single_match");
    if (result.current.state.step === "single_match") {
      expect(result.current.state.modem.id).toBe("b");
    }
  });

  it("logs error to console.error on search failure", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const searchError = new Error("Network error");
    mockSearch.mockRejectedValue(searchError);

    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("test");
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "[ModemChecker] Search failed:",
      searchError
    );
    expect(result.current.state).toEqual({ step: "no_match", query: "test" });
    consoleSpy.mockRestore();
  });

  it("reset returns to idle", async () => {
    mockSearch.mockResolvedValue([modemA]);
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("tp-link");
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.step).toBe("idle");
  });
});
