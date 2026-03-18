import { useEffect, useRef, useState } from "react";

interface SectionProps {
  id: string;
  label?: string;
  title?: string;
  children: React.ReactNode;
  /** Hide the top border divider (e.g. for the hero section) */
  noDivider?: boolean;
  className?: string;
}

export function Section({
  id,
  label,
  title,
  children,
  noDivider = false,
  className = "",
}: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      } ${!noDivider ? "border-t border-doc-border pt-12 mt-16" : ""} ${className}`}
    >
      <div className="mx-auto max-w-[780px] px-6">
        {label && (
          <p className="mb-2 text-[0.8rem] font-bold uppercase tracking-[0.06em] text-doc-muted">
            {label}
          </p>
        )}
        {title && (
          <h2 className="mb-6 font-serif text-[1.65rem] font-semibold leading-tight tracking-[-0.01em] text-doc-text">
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}
