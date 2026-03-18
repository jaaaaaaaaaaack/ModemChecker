import { useState, useMemo } from "react";
import { assessCompatibility } from "../../lib/compatibility";
import { CONDITION_LABELS } from "../../constants";
import { MODEM_DATA } from "../../data/modem-subset";
import type { TechType, ConditionCode } from "../../types";
import { Badge } from "@/ui/components/Badge";
import { Select } from "@/ui/components/Select";

interface TraceStep {
  text: string;
  type: "step" | "highlight" | "warn" | "fail";
}

const TECH_TYPES: { value: TechType; label: string }[] = [
  { value: "fttp", label: "FTTP" },
  { value: "fttc", label: "FTTC" },
  { value: "fttn", label: "FTTN" },
  { value: "hfc", label: "HFC" },
];

const PLAN_OPTIONS = [
  { label: "Premium", speedMbps: 100 },
  { label: "Fast", speedMbps: 500 },
  { label: "Ultra Fast", speedMbps: 880 },
];

const STATUS_DISPLAY = {
  compatible: { label: "Compatible", variant: "success" as const },
  "not-compatible": { label: "Not Compatible", variant: "error" as const },
  "speed-warning": { label: "Speed Warning", variant: "warning" as const },
  callout: { label: "Compatible with Requirements", variant: "warning" as const },
};

export function CompatibilitySimulator() {
  const [modemId, setModemId] = useState("");
  const [techType, setTechType] = useState<TechType>("fttp");
  const [planSpeedMbps, setPlanSpeedMbps] = useState(500);

  const modem = useMemo(() => MODEM_DATA.find((m) => m.id === modemId), [modemId]);

  const result = useMemo(() => {
    if (!modem) return null;

    const compat = modem.compatibility[techType];
    const trace: TraceStep[] = [];

    // Build trace
    trace.push({
      text: `compat.${techType} = { status: "${compat.status}", conditions: [${compat.conditions.map((c) => `"${c}"`).join(", ")}] }`,
      type: "step",
    });

    if (compat.status === "no") {
      trace.push({ text: `Status is "no" — return not-compatible`, type: "fail" });
      return { ...assessCompatibility(modem, techType, planSpeedMbps), trace };
    }

    trace.push({ text: `Status is "${compat.status}" — continue to speed assessment`, type: "highlight" });

    const wanSpeed = modem.wan.wan_port_speed_mbps;
    const perBandValues = Object.values(modem.wifi.max_speed_mbps.per_band);
    const bestBand = perBandValues.length > 0 ? Math.max(...perBandValues) : 0;

    if (wanSpeed > 0 && wanSpeed < planSpeedMbps) {
      trace.push({ text: `WAN: ${wanSpeed} Mbps < ${planSpeedMbps} Mbps plan \u2192 WAN bottleneck`, type: "warn" });
    } else {
      trace.push({ text: `WAN: ${wanSpeed} Mbps \u2265 ${planSpeedMbps} Mbps plan \u2192 OK`, type: "highlight" });
      if (bestBand > 0 && bestBand < planSpeedMbps * 2) {
        trace.push({
          text: `WiFi: best band ${bestBand} Mbps < ${planSpeedMbps * 2} Mbps (2\u00D7 plan) \u2192 WiFi bottleneck`,
          type: "warn",
        });
      } else if (bestBand > 0) {
        trace.push({ text: `WiFi: best band ${bestBand} Mbps \u2265 ${planSpeedMbps * 2} Mbps \u2192 OK`, type: "highlight" });
      }
    }

    const assessment = assessCompatibility(modem, techType, planSpeedMbps);

    if (assessment.speedWarning) {
      trace.push({ text: `Result: speed-warning (${assessment.speedWarning.type})`, type: "warn" });
    } else if (assessment.setupConditions.length > 0) {
      trace.push({ text: `Result: callout \u2014 conditions: [${assessment.setupConditions.join(", ")}]`, type: "warn" });
    } else {
      trace.push({ text: `Result: compatible \u2014 no issues found`, type: "highlight" });
    }

    return { ...assessment, trace };
  }, [modem, techType, planSpeedMbps]);

  return (
    <div className="rounded-lg border border-doc-border bg-doc-card p-6 shadow-sm">
      {/* Inputs */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Select
            label="Modem"
            placeholder="Choose a modem..."
            value={modemId || undefined}
            onValueChange={(val) => setModemId(val)}
          >
            {MODEM_DATA.map((m) => (
              <Select.Item key={m.id} value={m.id}>
                {m.brand} {m.model}
              </Select.Item>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-32">
          <Select
            label="nbn Type"
            value={techType}
            onValueChange={(val) => setTechType(val as TechType)}
          >
            {TECH_TYPES.map((t) => (
              <Select.Item key={t.value} value={t.value}>
                {t.label}
              </Select.Item>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-36">
          <Select
            label="Plan Speed"
            value={String(planSpeedMbps)}
            onValueChange={(val) => setPlanSpeedMbps(Number(val))}
          >
            {PLAN_OPTIONS.map((p) => (
              <Select.Item key={p.speedMbps} value={String(p.speedMbps)}>
                {p.label}
              </Select.Item>
            ))}
          </Select>
        </div>
      </div>

      {/* Result */}
      {!result ? (
        <p className="text-sm text-doc-light">Select a modem to see the compatibility assessment.</p>
      ) : (
        <div>
          {/* Status badge + context */}
          <div className="mb-4 flex items-start gap-3">
            <Badge variant={STATUS_DISPLAY[result.cardStatus].variant}>
              {STATUS_DISPLAY[result.cardStatus].label}
            </Badge>
            <p className="text-sm text-neutral-600">
              <strong>{modem!.brand} {modem!.model}</strong> on <strong>{techType.toUpperCase()}</strong> at{" "}
              <strong>{planSpeedMbps} Mbps</strong>
            </p>
          </div>

          {/* Setup conditions */}
          {result.setupConditions.length > 0 && (
            <div className="mb-4 space-y-2">
              {result.setupConditions.map((code: ConditionCode) => {
                const info = CONDITION_LABELS[code];
                return (
                  <div key={code} className="border-b border-neutral-100 pb-2 text-sm">
                    <strong className="text-neutral-800">{info.label}</strong>
                    <p className="text-neutral-500">{info.description}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Speed warning */}
          {result.speedWarning && (
            <div className="mb-4 text-sm font-medium text-warning-700">
              {result.speedWarning.type === "wan-bottleneck"
                ? "This modem's WAN port is not fast enough to support the plan's maximum speeds."
                : "This modem may not deliver the plan's maximum speeds over WiFi."}
            </div>
          )}

          {/* Execution trace */}
          {"trace" in result && result.trace && (
            <div className="mt-4 rounded-md bg-neutral-900 px-4 py-3 font-mono text-xs leading-relaxed">
              <div className="mb-1 text-neutral-500">{"// assessCompatibility() trace"}</div>
              {(result.trace as TraceStep[]).map((step, i) => (
                <div
                  key={i}
                  className={
                    step.type === "highlight"
                      ? "text-success-400"
                      : step.type === "warn"
                        ? "text-warning-400"
                        : step.type === "fail"
                          ? "text-error-400"
                          : "text-neutral-300"
                  }
                >
                  {step.text}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
