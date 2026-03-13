import { StatusItem } from "@/ui/components/StatusItem";
import { CONDITION_LABELS } from "../constants";
import type { ConditionCode } from "../types";

interface ConditionListProps {
  conditions: ConditionCode[];
  variant?: "warning" | "callout";
}

export function ConditionList({ conditions, variant = "warning" }: ConditionListProps) {
  if (conditions.length === 0) return null;

  const statusItemStatus = variant === "callout" ? ("callout" as const) : ("warning" as const);

  return (
    <div className="flex w-full flex-col items-start gap-2">
      {conditions.map((code) => {
        const info = CONDITION_LABELS[code];
        return (
          <StatusItem
            key={code}
            title={info.label}
            description={info.description}
            status={statusItemStatus}
            hasDescription={true}
          />
        );
      })}
    </div>
  );
}
