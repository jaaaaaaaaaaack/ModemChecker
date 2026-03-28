export function LoadingState() {
  return (
    <div
      className="flex w-full flex-1 flex-col items-center gap-3 min-h-0 pt-32 sm:pt-40"
      role="status"
    >
      <div
        className="h-9 w-9 rounded-full border-[3px] border-brand-200 border-t-brand-700 animate-spin-slow"
      />
      <span className="text-h3-700 font-h3-700 text-brand-800 text-center">
        Finding your modem...
      </span>
    </div>
  );
}
