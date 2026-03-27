import type { TransitionDirection } from "../types";

export const contentVariants = {
  enter: (direction: TransitionDirection) => ({
    opacity: 0,
    x: direction === "forward" ? 6 : -6,
    scale: 1,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.15, ease: "easeOut" as const },
  },
  exit: (direction: TransitionDirection) => ({
    opacity: 0,
    x: direction === "forward" ? -6 : 6,
    scale: 0.98,
    transition: { duration: 0.25, ease: "easeIn" as const },
  }),
};