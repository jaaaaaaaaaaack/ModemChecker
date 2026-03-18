interface Stat {
  value: string;
  label: string;
}

const STATS: Stat[] = [
  { value: "70", label: "Modems researched" },
  { value: "135", label: "Tests passing" },
  { value: "285", label: "Sourced references" },
  { value: "10", label: "Condition codes" },
];

interface StatsGridProps {
  dark?: boolean;
}

export function StatsGrid({ dark = false }: StatsGridProps) {
  return (
    <div className="grid grid-cols-4 gap-0">
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className={`py-1 text-center ${
            i > 0 ? (dark ? "border-l border-neutral-700" : "border-l border-neutral-200") : ""
          }`}
        >
          <div
            className={`font-serif text-[2rem] font-bold tracking-tight sm:text-[2.5rem] ${
              dark ? "text-white" : "text-doc-text"
            }`}
          >
            {stat.value}
          </div>
          <div
            className={`text-[11px] font-medium uppercase tracking-wider ${
              dark ? "text-neutral-400" : "text-doc-muted"
            }`}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
