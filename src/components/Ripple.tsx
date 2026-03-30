import { memo, type CSSProperties } from "react";

interface RippleProps {
  /** Diameter of the innermost circle in px */
  mainCircleSize?: number;
  /** Peak opacity each ring reaches during its fade-in phase */
  mainCircleOpacity?: number;
  /** Total number of concurrent rings animating outward */
  numCircles?: number;
  /** How much each ring grows (scale multiplier) by the end of its life */
  expandScale?: number;
  /** Full cycle duration per ring in seconds */
  duration?: number;
  /** Time offset between each ring's spawn in seconds */
  staggerDelay?: number;
  /** Border width in px */
  borderWidth?: number;
  className?: string;
}

export const Ripple = memo(function Ripple({
  mainCircleSize = 140,
  mainCircleOpacity = 0.7,
  numCircles = 6,
  expandScale = 4,
  duration = 3,
  staggerDelay = 0.5,
  borderWidth = 1,
  className,
}: RippleProps) {
  return (
    <div
      className={[
        "pointer-events-none absolute inset-0 select-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {Array.from({ length: numCircles }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={
            {
              width: mainCircleSize,
              height: mainCircleSize,
              top: "50%",
              left: "50%",
              borderWidth: `${borderWidth}px`,
              borderStyle: "solid",
              borderColor: "rgba(103, 232, 249, 0.7)",
              backgroundColor: "rgba(165, 243, 252, 0.15)",
              "--ripple-expand": expandScale,
              "--ripple-opacity": mainCircleOpacity,
              animation: `ripple-pulse ${duration}s ease-out ${i * staggerDelay}s infinite backwards`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
});
