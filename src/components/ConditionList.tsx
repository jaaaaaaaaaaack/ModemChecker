import { CONDITION_LABELS } from "../constants";
import type { ConditionCode } from "../types";

interface ConditionListProps {
  conditions: ConditionCode[];
}

export function ConditionList({ conditions }: ConditionListProps) {
  if (conditions.length === 0) return null;

  return (
    <ul className="flex flex-col gap-3">
      {conditions.map((code) => {
        const info = CONDITION_LABELS[code];
        return (
          <li key={code} className="rounded-xl bg-gray-50 p-3">
            <p className="text-sm font-semibold text-gray-800">{info.label}</p>
            <p className="text-sm text-gray-500">{info.description}</p>
          </li>
        );
      })}
    </ul>
  );
}
