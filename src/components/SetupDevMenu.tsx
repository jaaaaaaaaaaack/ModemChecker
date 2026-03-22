import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/components/Button";
import { SETUP_GUIDE_MAP } from "../lib/setupGuides";
import { getModemImageUrl } from "../lib/supabase";
import { NBN_TECH_TYPES } from "../constants";
import type { NbnTechType } from "../types";

interface SetupDevMenuProps {
  open: boolean;
  onClose: () => void;
  currentModemId: string | null;
  nbnTechType: NbnTechType;
  onModemChange: (modemId: string) => void;
  onTechTypeChange: (techType: NbnTechType) => void;
}

const sheetSpring = { type: "spring" as const, damping: 30, stiffness: 300 };

const GUIDE_LIST = Object.values(SETUP_GUIDE_MAP).sort((a, b) =>
  `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`),
);

export function SetupDevMenu({
  open,
  onClose,
  currentModemId,
  nbnTechType,
  onModemChange,
  onTechTypeChange,
}: SetupDevMenuProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/15"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white px-5 pt-4 pb-8 shadow-xl max-h-[80vh] flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={sheetSpring}
          >
            {/* Tech type selection */}
            <div className="flex flex-col gap-2 mb-4">
              <span className="text-caption-bold font-caption-bold text-neutral-500 uppercase tracking-wider">
                nbn Technology
              </span>
              <div className="flex flex-wrap gap-2">
                {NBN_TECH_TYPES.map((tech) => (
                  <button
                    key={tech.id}
                    onClick={() => onTechTypeChange(tech.id)}
                    className={`rounded-lg border px-4 py-2 transition-all text-body-bold font-body-bold ${
                      nbnTechType === tech.id
                        ? "border-brand-500 bg-color-primary-50 text-brand-700"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                    }`}
                  >
                    {tech.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modem selection */}
            <div className="flex flex-col gap-2 mb-4 flex-1 min-h-0">
              <span className="text-caption-bold font-caption-bold text-neutral-500 uppercase tracking-wider">
                Modem ({GUIDE_LIST.length} with guides)
              </span>
              <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0">
                {GUIDE_LIST.map((guide) => {
                  const isActive = currentModemId === guide.id;
                  return (
                    <button
                      key={guide.id}
                      onClick={() => {
                        onModemChange(guide.id);
                        onClose();
                      }}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-all text-left ${
                        isActive
                          ? "border-brand-500 bg-color-primary-50"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <img
                        src={getModemImageUrl(guide.id)}
                        alt=""
                        className="w-10 h-10 object-contain flex-none"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className={`text-body-bold font-body-bold truncate ${
                          isActive ? "text-brand-700" : "text-neutral-800"
                        }`}>
                          {guide.model}
                        </span>
                        <span className="text-caption font-caption text-neutral-500 truncate">
                          {guide.brand}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Close */}
            <Button className="w-full mt-2" onClick={onClose}>
              Close
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
