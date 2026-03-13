import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "../../src/hooks/useMediaQuery";

describe("useMediaQuery", () => {
  let listeners: Array<() => void>;
  let currentMatches: boolean;

  beforeEach(() => {
    listeners = [];
    currentMatches = false;

    vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
      matches: currentMatches,
      media: query,
      addEventListener: (_: string, cb: () => void) => {
        listeners.push(cb);
      },
      removeEventListener: (_: string, cb: () => void) => {
        listeners = listeners.filter((l) => l !== cb);
      },
    })));
  });

  it("returns initial match state synchronously", () => {
    currentMatches = true;
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("returns false when query does not match", () => {
    currentMatches = false;
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
  });

  it("updates when media query changes", () => {
    currentMatches = false;
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);

    // Simulate the matchMedia change event — update the mock's matches value
    // and fire the subscribed callback so useSyncExternalStore re-reads.
    currentMatches = true;
    act(() => {
      listeners.forEach((cb) => cb());
    });
    expect(result.current).toBe(true);
  });

  it("cleans up listener on unmount", () => {
    const { unmount } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(listeners.length).toBeGreaterThanOrEqual(1);
    unmount();
    expect(listeners).toHaveLength(0);
  });
});
