import { useState, useCallback } from "react";

interface ModemImageProps {
  src: string;
  alt: string;
  /** Tailwind classes for width/height/rounding of the container */
  className?: string;
}

/**
 * Modem product image with skeleton placeholder and fade-in.
 * Reserves space to prevent layout shift, fades in on load, hides on error.
 */
export function ModemImage({ src, alt, className = "w-16 h-16 rounded-lg" }: ModemImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  const handleLoad = useCallback(() => setStatus("loaded"), []);
  const handleError = useCallback(() => setStatus("error"), []);

  if (status === "error") return null;

  return (
    <div className={`relative flex-none ${className}`}>
      {/* Skeleton placeholder — visible until image loads */}
      {status === "loading" && (
        <div className={`absolute inset-0 bg-neutral-100 ${className}`} />
      )}
      <img
        className={`h-full w-full object-contain drop-shadow-sm mix-blend-multiply transition-opacity duration-300 ease-in-out ${
          status === "loaded" ? "opacity-100" : "opacity-0"
        }`}
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
