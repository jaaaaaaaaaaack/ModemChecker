import { FeatherLoader, FeatherWifi } from "@subframe/core";

export function LoadingState() {
  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-6 rounded-lg bg-color-primary-50 px-5 py-5"
      role="status"
    >
      <div className="flex flex-col items-center justify-center relative">
        <div className="flex h-64 w-64 flex-none items-start rounded-full border border-solid border-brand-200 absolute opacity-30" />
        <div className="flex h-52 w-52 flex-none items-start rounded-full border border-solid border-brand-300 absolute opacity-40" />
        <div className="flex h-40 w-40 flex-none items-start rounded-full border border-solid border-brand-400 absolute opacity-50" />
        <div className="flex h-28 w-28 flex-none items-start rounded-full border border-solid border-brand-500 absolute opacity-60" />
        <div className="flex h-32 w-32 flex-none items-center justify-center rounded-full bg-white shadow-md z-10">
          <FeatherWifi className="font-['Plus_Jakarta_Sans'] text-[48px] font-[400] leading-[72px] text-brand-600" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 mt-8">
        <FeatherLoader className="font-['Plus_Jakarta_Sans'] text-[24px] font-[400] leading-[36px] text-brand-600 animate-spin" />
        <span className="text-h3-700 font-h3-700 text-brand-800 text-center">
          Finding your modem...
        </span>
      </div>
    </div>
  );
}
