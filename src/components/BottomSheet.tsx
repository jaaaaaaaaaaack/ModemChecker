import { useEffect, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  // Stay mounted during exit animation
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  if (!mounted) return null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <Dialog.Portal forceMount>
        <Dialog.Overlay
          forceMount
          data-testid="sheet-overlay"
          className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-[overlay-fade-in_300ms_ease-out] data-[state=closed]:animate-[overlay-fade-out_200ms_ease-in]"
        />
        <Dialog.Content
          forceMount
          aria-modal="true"
          aria-describedby={undefined}
          onAnimationEnd={() => {
            if (!open) setMounted(false);
          }}
          className={[
            // Base
            "fixed z-50 bg-white shadow-xl overflow-y-auto outline-none",
            // Mobile: bottom sheet
            "inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl p-5 pb-8",
            "data-[state=open]:animate-[sheet-slide-up_300ms_ease-out]",
            "data-[state=closed]:animate-[sheet-slide-down_200ms_ease-in]",
            // Desktop: side sheet
            "md:inset-y-0 md:right-0 md:left-auto",
            "md:w-[480px] md:max-h-none md:rounded-none md:p-6",
            "md:data-[state=open]:animate-[sheet-slide-in-right_300ms_ease-out]",
            "md:data-[state=closed]:animate-[sheet-slide-out-right_200ms_ease-in]",
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
