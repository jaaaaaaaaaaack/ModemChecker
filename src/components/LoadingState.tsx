export function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-4 py-12" role="status">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      <p className="text-lg font-medium text-gray-600">Finding your modem...</p>
    </div>
  );
}
