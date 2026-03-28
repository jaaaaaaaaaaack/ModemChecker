interface SheetFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Bottom-pinned footer bar for sheet screens.
 * Sticks to the bottom on mobile (mt-auto) and adds breathing room on desktop (md:mt-10).
 */
export function SheetFooter({ children, className }: SheetFooterProps) {
  return (
    <div
      className={[
        "flex w-full items-center mt-auto md:mt-10 pt-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
