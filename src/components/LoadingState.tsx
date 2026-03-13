import { FeatherLoader } from "@subframe/core";

export function LoadingState() {
  return (
    <div
      className="flex w-full flex-1 flex-col items-center justify-center gap-3 min-h-0"
      role="status"
    >
      <FeatherLoader className="font-['Plus_Jakarta_Sans'] text-[24px] font-[400] leading-[36px] text-brand-600 animate-spin" />
      <span className="text-h3-700 font-h3-700 text-brand-800 text-center">
        Finding your modem...
      </span>
    </div>
  );
}
