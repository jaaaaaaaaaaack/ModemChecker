import { STATUS_CONFIG } from "../constants";
import { ConditionList } from "./ConditionList";
import type { Modem, TechType } from "../types";

interface ResultCardProps {
  modem: Modem;
  techType: TechType;
}

export function ResultCard({ modem, techType }: ResultCardProps) {
  const compat = modem.compatibility[techType];
  const config = STATUS_CONFIG[compat.status];

  return (
    <div className="flex flex-col gap-5">
      <div className={`rounded-2xl ${config.bgColor} p-4 text-center`}>
        <p className={`text-lg font-bold ${config.color}`}>{config.heading}</p>
      </div>

      <div className="rounded-2xl bg-gray-50 p-4">
        <p className="text-sm text-gray-500">{modem.brand}</p>
        <p className="text-base font-semibold text-gray-900">{modem.model}</p>
      </div>

      <ConditionList conditions={compat.conditions} />
    </div>
  );
}
