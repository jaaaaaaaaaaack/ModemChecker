import { memo, type CSSProperties } from "react";

interface RippleProps {
  /** Diameter of the innermost circle in px */
  mainCircleSize?: number;
  /** Opacity of the innermost circle (each successive ring decreases by 0.03) */
  mainCircleOpacity?: number;
  /** Total number of concentric rings */
  numCircles?: number;
  /** Size increment between each ring in px */
  circleIncrement?: number;
  /** Whether the rings pulse. When false the circles freeze at rest (scale 1). */
  animating?: boolean;
  className?: string;
}

export const Ripple = memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  circleIncrement = 70,
  animating = true,
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
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * circleIncrement;
        const opacity = mainCircleOpacity - i * 0.03;

        return (
          <div
            key={i}
            className={[
              "absolute rounded-full border",
              animating ? "animate-ripple" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={
              {
                "--i": i,
                width: `${size}px`,
                height: `${size}px`,
                opacity: Math.max(opacity, 0.02),
                animationDelay: animating ? `${i * 0.06}s` : undefined,
                borderWidth: "1px",
                borderColor: "rgba(103, 232, 249, 1)",
                backgroundColor: "rgba(165, 243, 252, 0.3)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1)",
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
});
