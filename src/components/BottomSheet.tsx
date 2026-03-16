import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "../hooks/useMediaQuery";

const GRADIENT_CLASSES = {
  brand: { full: "bg-gradient-brand", compact: "md:bg-gradient-brand-compact" },
  accent2: { full: "bg-gradient-accent2", compact: "md:bg-gradient-accent2-compact" },
} as const;

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  gradient?: "brand" | "accent2";
  title?: string;
  /** Mobile min-height. Defaults to "75vh". Desktop side-sheet ignores this. */
  minHeight?: string;
}

const overlayTransition = {
  enter: { duration: 0.25 },
  exit: { duration: 0.2 },
};

const sheetSpring = { type: "spring" as const, damping: 30, stiffness: 300 };

export function BottomSheet({ open, onClose, children, gradient = "brand", title = "Modem search", minHeight = "75vh" }: BottomSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const axis = isDesktop ? "x" : "y";
  const gradientConfig = GRADIENT_CLASSES[gradient];

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
            <Dialog.Content
              forceMount
              asChild
              onOpenAutoFocus={(e) => {
                // Prevent Radix from focusing the first button (e.g. close).
                // Instead, focus the sheet container — a11y focus trap still
                // works, but no button gets a jarring highlight on open.
                e.preventDefault();
                (e.target as HTMLElement).focus();
              }}
            >
              <motion.div
                tabIndex={-1}
                aria-modal="true"
                aria-describedby={undefined}
                initial={{ [axis]: "100%" }}
                animate={{ [axis]: 0 }}
                exit={{ [axis]: "100%" }}
                transition={sheetSpring}
                style={isDesktop ? undefined : { minHeight }}
                className={[
                  // Base
                  `fixed z-50 ${gradientConfig.full} shadow-xl overflow-hidden outline-none`,
                  "flex flex-col",
                  // Mobile: bottom sheet — extra bottom padding (-bottom-10 + pb-18)
                  // absorbs spring overshoot so no black bar flashes beneath
                  "inset-x-0 -bottom-10 max-h-[87vh] rounded-t-3xl p-5 pb-18",
                  // Desktop: side sheet
                  "md:inset-y-0 md:bottom-0 md:right-0 md:left-auto",
                  `${gradientConfig.compact} md:w-[480px] md:max-h-none md:rounded-none md:p-6`,
                ].join(" ")}
              >
                <Dialog.Title className="sr-only">{title}</Dialog.Title>
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
