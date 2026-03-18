const STEPS = [
  "Customer indicates they want to use their own modem.",
  "A search interface asks for their modem\u2019s brand and model.",
  "The checker searches a curated database using full-text search with fuzzy matching.",
  "If multiple models match, they pick theirs from a short list with product images.",
  "They see a clear result: Compatible, Compatible with requirements, Speed warning, or Not compatible.",
];

export function SolutionSteps() {
  return (
    <div className="relative flex flex-col gap-0">
      {STEPS.map((step, i) => {
        const isLast = i === STEPS.length - 1;
        return (
          <div key={i} className="relative flex gap-4">
            {/* Vertical connecting line */}
            <div className="relative flex flex-col items-center">
              {/* The number circle */}
              <span
                className={`relative z-10 flex h-8 w-8 flex-none items-center justify-center rounded-full font-serif text-sm font-bold ${
                  isLast
                    ? "bg-brand-600 text-white shadow-md shadow-brand-200"
                    : "bg-brand-100 text-brand-700"
                }`}
              >
                {i + 1}
              </span>
              {/* Connecting line segment */}
              {!isLast && (
                <div className="w-px flex-1 bg-brand-200" />
              )}
            </div>
            {/* Step content */}
            <div
              className={`flex-1 pb-5 ${isLast ? "pb-0" : ""}`}
            >
              <div
                className={`rounded-lg px-4 py-3 ${
                  isLast
                    ? "border border-brand-200 bg-brand-50"
                    : ""
                }`}
              >
                <p
                  className={`text-[0.9rem] leading-relaxed ${
                    isLast
                      ? "font-medium text-brand-800"
                      : "text-neutral-600"
                  }`}
                >
                  {step}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
