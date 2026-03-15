import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/components/Button";
import { NBN_PLANS, NBN_TECH_TYPES } from "../constants";
import type { NbnTechType } from "../types";

interface DevMenuProps {
  open: boolean;
  onClose: () => void;
  planId: string;
  nbnTechType: NbnTechType;
  onPlanChange: (id: string) => void;
  onTechTypeChange: (id: NbnTechType) => void;
}

const sheetSpring = { type: "spring" as const, damping: 30, stiffness: 300 };

export function DevMenu({
  open,
  onClose,
  planId,
  nbnTechType,
  onPlanChange,
  onTechTypeChange,
}: DevMenuProps) {
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
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white px-5 pt-4 pb-8 shadow-xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={sheetSpring}
          >
            {/* Plan selection */}
            <div className="flex flex-col gap-2 mb-4">
              <span className="text-caption-bold font-caption-bold text-neutral-500 uppercase tracking-wider">
                Plan
              </span>
              <div className="flex gap-2">
                {NBN_PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => onPlanChange(plan.id)}
                    className={`flex-1 rounded-lg border px-3 py-2 transition-all text-center text-body-bold font-body-bold ${
                      planId === plan.id
                        ? "border-brand-500 bg-color-primary-50 text-brand-700"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                    }`}
                  >
                    {plan.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tech type selection */}
            <div className="flex flex-col gap-2 mb-5">
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

            {/* Close */}
            <Button
              className="w-full"
              onClick={onClose}
            >
              Close
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
