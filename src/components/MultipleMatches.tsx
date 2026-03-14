import { FeatherChevronLeft, FeatherChevronRight, FeatherX } from "@subframe/core";
import { IconButton } from "../ui/components/IconButton";
import { LinkButton } from "../ui/components/LinkButton";
import { ModemImage } from "./ModemImage";
import { getModemImageUrl } from "../lib/supabase";
import type { Modem } from "../types";

interface MultipleMatchesProps {
  modems: Modem[];
  onSelect: (modem: Modem) => void;
  onBack: () => void;
  onClose?: () => void;
}

export function MultipleMatches({ modems, onSelect, onBack, onClose }: MultipleMatchesProps) {
  return (
    <div className="flex w-full flex-1 flex-col items-start gap-6 min-h-0">
      <div className="flex w-full flex-col items-start gap-3 flex-shrink-0">
        <div className="flex w-full items-center gap-2">
          <button
            type="button"
            className="flex items-center justify-center text-brand-600 hover:text-brand-800 transition-colors duration-150 -ml-1 flex-none"
            onClick={onBack}
            aria-label="Back"
          >
            <FeatherChevronLeft className="w-5 h-5" />
          </button>
          <span className="flex-1 text-h2 font-h2 text-brand-900">Select your modem</span>
          {onClose && (
            <IconButton
              variant="brand-secondary"
              icon={<FeatherX />}
              onClick={onClose}
              aria-label="Close"
            />
          )}
        </div>
        <span className="text-body font-body text-brand-800">
          Check your modem&apos;s model info and select the correct one below.
        </span>
      </div>
      <div className="flex w-full flex-1 flex-col items-start gap-2 min-h-0 overflow-y-auto px-1 -mx-1">
        {modems.map((modem) => (
          <button
            key={modem.id}
            type="button"
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-solid border-neutral-200 bg-default-background pl-4 pr-4 py-4 text-left transition-all duration-200 hover:border-brand-primary hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 active:scale-[0.98] active:bg-brand-100"
            onClick={() => onSelect(modem)}
            aria-label={`${modem.brand} ${modem.model}`}
          >
            <div className="flex grow shrink-0 basis-0 items-center gap-4">
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-0.5">
                <span className="text-body-bold font-body-bold text-default-font">
                  {modem.model}
                </span>
                <span className="text-body font-body text-neutral-500">
                  {modem.brand}
                </span>
              </div>
              <ModemImage
                src={getModemImageUrl(modem.id)}
                alt={modem.model}
                className="w-16 h-16 rounded-lg"
              />
            </div>
            <FeatherChevronRight className="w-5 h-5 text-neutral-400 flex-none" />
          </button>
        ))}
        <div className="flex-shrink-0 pt-2 pb-1">
          <LinkButton variant="brand" onClick={() => {}}>
            Help me identify my modem
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
