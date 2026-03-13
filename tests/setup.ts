import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { createElement, forwardRef, type ReactNode } from "react";

// Props that Framer Motion uses but are not valid HTML attributes.
// Strip these when rendering motion.div as a plain div in tests.
const MOTION_PROPS = new Set([
  "initial", "animate", "exit", "variants", "custom",
  "transition", "layout", "layoutId", "onAnimationComplete",
  "whileHover", "whileTap", "whileFocus", "whileDrag",
  "whileInView", "drag", "dragConstraints",
]);

// Stub window.matchMedia for components using useMediaQuery.
// Individual tests can override with vi.stubGlobal("matchMedia", ...).
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })),
  });
}

// Mock framer-motion to avoid animation timing issues in tests.
// AnimatePresence renders children immediately; motion.div renders
// as a plain div with motion props filtered out.
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
    motion: {
      div: forwardRef<HTMLDivElement, Record<string, unknown>>(
        (props, ref) => {
          const filtered: Record<string, unknown> = {};
          for (const [key, val] of Object.entries(props)) {
            if (!MOTION_PROPS.has(key)) filtered[key] = val;
          }
          return createElement("div", { ref, ...filtered });
        },
      ),
    },
  };
});

afterEach(() => {
  cleanup();
});
