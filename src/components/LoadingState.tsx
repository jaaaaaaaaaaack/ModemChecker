import { TailSpin } from "react-loader-spinner";

export function LoadingState() {
  return (
    <div
      className="flex w-full flex-1 flex-col items-center justify-center gap-3 min-h-0"
      role="status"
    >
      <TailSpin height={36} width={36} color="#0891b2" strokeWidth={3} />
      <span className="text-h3-700 font-h3-700 text-brand-800 text-center">
        Finding your modem...
      </span>
    </div>
  );
}
