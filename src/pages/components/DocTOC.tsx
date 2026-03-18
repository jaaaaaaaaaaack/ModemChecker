import { useEffect, useState } from "react";

interface TOCItem {
  id: string;
  label: string;
}

interface DocTOCProps {
  items: TOCItem[];
}

export function DocTOC({ items }: DocTOCProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first section that is intersecting (top-down)
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="sticky top-20 hidden xl:block">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-doc-muted">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-doc-border">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => {
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`block w-full border-l-2 py-1 pl-3 pr-2 text-left text-[12px] leading-snug transition-colors ${
                activeId === item.id
                  ? "-ml-px border-brand-500 font-semibold text-brand-700"
                  : "-ml-px border-transparent text-doc-muted hover:text-doc-text"
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
