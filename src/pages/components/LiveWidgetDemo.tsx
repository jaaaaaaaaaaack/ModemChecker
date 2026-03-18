import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ModemChecker } from "../../components/ModemChecker";

export function LiveWidgetDemo() {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-neutral-900 px-4 py-6 sm:px-8 sm:py-8">
      {/* Device frame — constrained height with internal scroll */}
      <div className="w-full max-w-[390px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-white/10">
        <div className="max-h-[520px] overflow-y-auto">
          <ErrorBoundary>
            <ModemChecker />
          </ErrorBoundary>
        </div>
      </div>
      <p className="mt-4 text-center text-[13px] text-neutral-400">
        This is the live tool &mdash; try searching for a modem.
      </p>
    </div>
  );
}
