import { memo, type CSSProperties } from "react";

interface RippleProps {
  /** Diameter of the innermost circle in px */
  mainCircleSize?: number;
  /** Opacity of the innermost circle */
  mainCircleOpacity?: number;
  /** Total number of concentric rings */
  numCircles?: number;
  /** Size increment between each ring in px */
  circleIncrement?: number;
  /** Opacity decrease per ring (higher = faster fade to edges) */
  opacityStep?: number;
  /** Full pulse cycle duration in seconds */
  duration?: number;
  /** Time offset between each ring's animation in seconds (creates wave) */
  staggerDelay?: number;
  /** Scale at pulse peak — values > 1 expand, < 1 contract */
  pulseScale?: number;
  /** Border width in px */
  borderWidth?: number;
  /** Whether the rings pulse. When false the circles freeze at rest (scale 1). */
  animating?: boolean;
  className?: string;
}

export const Ripple = memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  circleIncrement = 70,
  opacityStep = 0.03,
  duration = 2,
  staggerDelay = 0.2,
  pulseScale = 0.9,
  borderWidth = 1,
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
        const opacity = mainCircleOpacity - i * opacityStep;

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
                "--duration": `${duration}s`,
                "--pulse-scale": pulseScale,
                "--stagger": `${staggerDelay}s`,
                width: `${size}px`,
                height: `${size}px`,
                opacity: Math.max(opacity, 0.02),
                animationDelay: animating ? `calc(${i} * ${staggerDelay}s)` : undefined,
                borderWidth: `${borderWidth}px`,
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
