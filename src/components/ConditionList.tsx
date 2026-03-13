import { StatusIte } from "@/ui/components/StatusIte";
import { CONDITION_LABELS } from "../constants";
import type { ConditionCode } from "../types";

interface ConditionListProps {
  conditions: ConditionCode[];
}

export function ConditionList({ conditions }: ConditionListProps) {
  if (conditions.length === 0) return null;

  return (
    <div className="flex w-full flex-col items-start gap-2">
      {conditions.map((code) => {
        const info = CONDITION_LABELS[code];
        return (
          <StatusIte
            key={code}
            title={info.label}
            description={info.description}
            status="warning"
            hasDescription={true}
          />
        );
      })}
    </div>
  );
}
