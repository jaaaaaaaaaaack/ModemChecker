import { FeatherInfo } from "@subframe/core";

interface InfoCalloutProps {
  children: React.ReactNode;
  variant?: "bordered" | "in-line";
}

export function InfoCallout({ children, variant = "bordered" }: InfoCalloutProps) {
  return (
    <div
      className={
        variant === "bordered"
          ? "flex w-full flex-col items-start gap-1 rounded-md border border-solid border-brand-600 px-4 py-4"
          : "flex w-full flex-col items-start gap-1"
      }
    >
      <div className="flex items-start gap-1">
        <FeatherInfo className="text-brand-700 flex-none w-4 h-4 mt-0.5" />
        <span className="text-body font-body text-brand-700">
          {children}
        </span>
      </div>
    </div>
  );
}
