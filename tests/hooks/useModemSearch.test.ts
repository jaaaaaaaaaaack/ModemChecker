import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("../../src/lib/search", () => ({
  searchModems: vi.fn(),
}));

import { useModemSearch } from "../../src/hooks/useModemSearch";
import { searchModems } from "../../src/lib/search";
import { makeModem } from "../fixtures/modem";

const mockSearch = vi.mocked(searchModems);

const modemA = makeModem({ id: "a" });
const modemB = makeModem({ id: "b", model: "Archer C7" });

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

  it("transitions to error state on search failure", async () => {
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
    expect(result.current.state).toEqual({ step: "error", query: "test" });
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

  it("direction starts as forward", () => {
    const { result } = renderHook(() => useModemSearch());
    expect(result.current.direction).toBe("forward");
  });

  it("direction is forward when advancing: idle → searching", async () => {
    mockSearch.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      result.current.search("test");
    });

    expect(result.current.direction).toBe("forward");
  });

  it("direction is forward when advancing: searching → single_match", async () => {
    mockSearch.mockResolvedValue([modemA]);
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("tp-link");
    });

    expect(result.current.state.step).toBe("single_match");
    expect(result.current.direction).toBe("forward");
  });

  it("direction is forward when advancing: multiple_matches → single_match", async () => {
    mockSearch.mockResolvedValue([modemA, modemB]);
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("archer");
    });

    act(() => {
      result.current.selectModem(modemA);
    });

    expect(result.current.state.step).toBe("single_match");
    expect(result.current.direction).toBe("forward");
  });

  it("direction is backward on reset from single_match", async () => {
    mockSearch.mockResolvedValue([modemA]);
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("tp-link");
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.step).toBe("idle");
    expect(result.current.direction).toBe("backward");
  });

  it("direction is backward on reset from no_match", async () => {
    mockSearch.mockResolvedValue([]);
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("nonexistent");
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.step).toBe("idle");
    expect(result.current.direction).toBe("backward");
  });

  it("ignores stale response when a newer search has completed", async () => {
    let resolveFirst!: (value: Modem[]) => void;
    const firstPromise = new Promise<Modem[]>((resolve) => {
      resolveFirst = resolve;
    });

    mockSearch
      .mockImplementationOnce(() => firstPromise)
      .mockResolvedValueOnce([modemA]);

    const { result } = renderHook(() => useModemSearch());

    // Start first search (will hang on firstPromise)
    await act(async () => {
      result.current.search("old query");
    });
    expect(result.current.state.step).toBe("searching");

    // Start second search — this aborts the first controller, then resolves
    await act(async () => {
      await result.current.search("new query");
    });
    expect(result.current.state.step).toBe("single_match");

    // Now resolve the first (stale) search — should be ignored
    await act(async () => {
      resolveFirst([modemB]);
    });

    // State should still be single_match from the second search, not overwritten
    expect(result.current.state.step).toBe("single_match");
    if (result.current.state.step === "single_match") {
      expect(result.current.state.modem.id).toBe("a"); // modemA from second search
    }
  });

  it("retry re-runs search with the same query", async () => {
    mockSearch
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce([modemA]);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("tp-link");
    });

    expect(result.current.state.step).toBe("error");

    await act(async () => {
      await result.current.retry();
    });

    expect(result.current.state.step).toBe("single_match");
    consoleSpy.mockRestore();
  });

  it("retry is a no-op when not in error state", async () => {
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      result.current.retry();
    });

    expect(result.current.state.step).toBe("idle");
  });

  it("reset aborts in-flight request and ignores late resolution", async () => {
    let resolveSearch!: (value: Modem[]) => void;
    const searchPromise = new Promise<Modem[]>((resolve) => {
      resolveSearch = resolve;
    });
    mockSearch.mockImplementation(() => searchPromise);

    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      result.current.search("test");
    });

    expect(result.current.state.step).toBe("searching");

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.step).toBe("idle");

    // Late resolution after reset — should be ignored (controller was aborted)
    await act(async () => {
      resolveSearch([modemA]);
    });

    expect(result.current.state.step).toBe("idle");
  });

  it("direction is forward when transitioning to error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockSearch.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useModemSearch());

    await act(async () => {
      await result.current.search("test");
    });

    expect(result.current.state.step).toBe("error");
    expect(result.current.direction).toBe("forward");
    consoleSpy.mockRestore();
  });
});
