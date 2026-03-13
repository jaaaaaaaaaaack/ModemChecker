import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

const overlayTransition = {
  enter: { duration: 0.25 },
  exit: { duration: 0.2 },
};

const sheetSpring = { type: "spring" as const, damping: 30, stiffness: 300 };

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const axis = isDesktop ? "x" : "y";

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay forceMount asChild>
              <motion.div
                data-testid="sheet-overlay"
                className="fixed inset-0 z-50 bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={overlayTransition.enter}
              />
            </Dialog.Overlay>
            <Dialog.Content forceMount asChild>
              <motion.div
                aria-modal="true"
                aria-describedby={undefined}
                initial={{ [axis]: "100%" }}
                animate={{ [axis]: 0 }}
                exit={{ [axis]: "100%" }}
                transition={sheetSpring}
                className={[
                  // Base
                  "fixed z-50 bg-gradient-brand shadow-xl overflow-hidden outline-none",
                  "flex flex-col min-h-[60vh]",
                  // Mobile: bottom sheet
                  "inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl p-5 pb-8",
                  // Desktop: side sheet
                  "md:inset-y-0 md:right-0 md:left-auto",
                  "md:bg-gradient-brand-compact md:w-[480px] md:max-h-none md:rounded-none md:p-6",
                ].join(" ")}
              >
                <Dialog.Title className="sr-only">Modem search</Dialog.Title>
                <Dialog.Close
                  aria-label="Close"
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  ✕
                </Dialog.Close>
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
