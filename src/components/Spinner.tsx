interface SpinnerProps {
  size?: "small" | "medium";
  className?: string;
}

/**
 * CSS border-spinner with two size presets.
 * - small: 16px, thin border, fast spin (connection test)
 * - medium: 36px, thicker border, slower spin (search loading)
 */
export function Spinner({ size = "medium", className }: SpinnerProps) {
  return (
    <div
      className={[
        "flex-none rounded-full",
        size === "small"
          ? "h-4 w-4 border-2 border-brand-100 border-t-brand-800 animate-spin-fast"
          : "h-9 w-9 border-[3px] border-brand-200 border-t-brand-700 animate-spin-slow",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
