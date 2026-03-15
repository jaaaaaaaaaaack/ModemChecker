import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { preloadImages } from "../../src/lib/preloadImages";

/** Flush the microtask queue (multiple ticks for Promise.race / .then chains). */
async function flushMicrotasks() {
  for (let i = 0; i < 10; i++) await Promise.resolve();
}

// Capture Image instances so tests can fire onload / onerror
let imageInstances: Array<{ src: string; onload: (() => void) | null; onerror: (() => void) | null }>;

beforeEach(() => {
  imageInstances = [];
  vi.stubGlobal(
    "Image",
    class {
      src = "";
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const instance = this;
        imageInstances.push(instance);
      }
    },
  );
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("preloadImages", () => {
  it("resolves immediately for empty urls array", async () => {
    const p = preloadImages([]);
    await expect(p).resolves.toBeUndefined();
  });

  it("resolves when all images load before the timeout", async () => {
    const p = preloadImages(["a.webp", "b.webp"], 2000);

    // Images should have been created
    expect(imageInstances).toHaveLength(2);
    expect(imageInstances[0].src).toBe("a.webp");
    expect(imageInstances[1].src).toBe("b.webp");

    // Simulate load
    imageInstances[0].onload?.();
    imageInstances[1].onload?.();

    await expect(p).resolves.toBeUndefined();
  });

  it("resolves on timeout if images have not loaded", async () => {
    let resolved = false;
    preloadImages(["slow.webp"], 500).then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);

    // Advance past the timeout and flush the microtask queue
    vi.advanceTimersByTime(500);
    await flushMicrotasks();

    expect(resolved).toBe(true);
  });

  it("resolves even if images error (best-effort)", async () => {
    const p = preloadImages(["broken.webp"], 2000);
    imageInstances[0].onerror?.();
    await expect(p).resolves.toBeUndefined();
  });

  it("resolves immediately when AbortSignal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();

    const p = preloadImages(["a.webp"], 2000, controller.signal);
    await expect(p).resolves.toBeUndefined();
  });

  it("resolves when AbortSignal fires during preload", async () => {
    const controller = new AbortController();
    let resolved = false;

    preloadImages(["a.webp"], 5000, controller.signal).then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);

    controller.abort();
    await flushMicrotasks();

    expect(resolved).toBe(true);
  });
});
