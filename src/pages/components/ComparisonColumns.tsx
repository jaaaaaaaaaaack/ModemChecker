interface Column {
  heading: string;
  accent: string;
  bg: string;
  border: string;
  marker: string;
  markerColor: string;
  itemColor: string;
  items: string[];
}

const LLM_COLUMN: Column = {
  heading: "LLM-based (v1)",
  accent: "text-error-700",
  bg: "bg-error-50",
  border: "border-error-200",
  marker: "\u2717",
  markerColor: "text-error-400",
  itemColor: "text-error-900/70",
  items: [
    "Probabilistic \u2014 different answers each time",
    "Can hallucinate modem specs",
    "~3\u20135s response time per query",
    "Per-query API cost",
    "Not auditable or reproducible",
  ],
};

const DB_COLUMN: Column = {
  heading: "Database-first (v2)",
  accent: "text-success-700",
  bg: "bg-success-50",
  border: "border-success-200",
  marker: "\u2713",
  markerColor: "text-success-500",
  itemColor: "text-success-900/70",
  items: [
    "Deterministic \u2014 same input, same output",
    "No hallucination risk",
    "Sub-second response time",
    "Zero marginal cost per query",
    "Every verdict traceable to sourced data",
  ],
};

export function ComparisonColumns() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {[LLM_COLUMN, DB_COLUMN].map((col) => (
        <div
          key={col.heading}
          className={`rounded-lg border p-5 ${col.bg} ${col.border}`}
        >
          <h4 className={`mb-3 text-sm font-bold ${col.accent}`}>{col.heading}</h4>
          <ul className="space-y-2.5">
            {col.items.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <span className={`mt-0.5 flex-none font-bold ${col.markerColor}`}>{col.marker}</span>
                <span className={col.itemColor}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
