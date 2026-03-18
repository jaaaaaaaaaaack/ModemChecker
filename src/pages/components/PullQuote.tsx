interface PullQuoteProps {
  children: React.ReactNode;
}

export function PullQuote({ children }: PullQuoteProps) {
  return (
    <div className="my-12 sm:my-16">
      <div className="mx-auto max-w-[780px] px-6">
        <blockquote className="relative border-l-[3px] border-brand-400 py-2 pl-6 sm:pl-8">
          <p className="font-serif text-[1.3rem] font-medium leading-snug tracking-[-0.01em] text-doc-text sm:text-[1.5rem]">
            {children}
          </p>
        </blockquote>
      </div>
    </div>
  );
}
