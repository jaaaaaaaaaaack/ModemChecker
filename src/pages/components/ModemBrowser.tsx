import { useState, useMemo } from "react";
import { MODEM_DATA, type DocModem } from "../../data/modem-subset";
import { CONDITION_LABELS } from "../../constants";
import { Badge } from "@/ui/components/Badge";
import type { TechType } from "../../types";

const TECH_KEYS: TechType[] = ["fttp", "fttc", "fttn", "hfc"];

function getDeviceTypeLabel(type: string): string {
  switch (type) {
    case "modem_router": return "Modem/Router";
    case "mesh_system": return "Mesh System";
    default: return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

function getStatusVariant(status: string): "success" | "error" | "warning" {
  if (status === "yes") return "success";
  if (status === "no") return "error";
  return "warning";
}

function ModemCard({ modem }: { modem: DocModem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-doc-border bg-doc-card transition-shadow hover:shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-doc-text">
            {modem.brand} {modem.model}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-doc-muted">
            <span>{getDeviceTypeLabel(modem.device_type)}</span>
            {modem.isp_provided_by && (
              <>
                <span className="text-neutral-300">·</span>
                <span>{modem.isp_provided_by}</span>
              </>
            )}
            <span className="text-neutral-300">·</span>
            <span>{modem.wifi.wifi_standard}</span>
          </div>
        </div>

        {/* Tech type badges */}
        <div className="ml-3 flex gap-1">
          {TECH_KEYS.map((tech) => (
            <Badge key={tech} variant={getStatusVariant(modem.compatibility[tech].status)}>
              {tech.toUpperCase()}
            </Badge>
          ))}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-neutral-100 px-4 pb-4 pt-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Compatibility detail */}
            <div>
              <h5 className="mb-2 text-xs font-bold uppercase tracking-wide text-doc-muted">Compatibility</h5>
              <div className="space-y-1.5">
                {TECH_KEYS.map((tech) => {
                  const c = modem.compatibility[tech];
                  return (
                    <div key={tech} className="flex items-center gap-2 text-xs">
                      <Badge variant={getStatusVariant(c.status)}>{tech.toUpperCase()}</Badge>
                      <span className="text-neutral-600">
                        {c.status === "yes"
                          ? "Compatible"
                          : c.status === "no"
                            ? "Not compatible"
                            : c.conditions.map((code) => CONDITION_LABELS[code]?.label ?? code).join(", ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Specs */}
            <div>
              <h5 className="mb-2 text-xs font-bold uppercase tracking-wide text-doc-muted">Specs</h5>
              <div className="space-y-1 text-xs text-neutral-600">
                <div>
                  <strong>WAN:</strong> {modem.wan.wan_port_speed_mbps} Mbps
                  {modem.wan.has_vdsl2_modem && " + VDSL2"}
                </div>
                <div>
                  <strong>WiFi:</strong>{" "}
                  {Object.entries(modem.wifi.max_speed_mbps.per_band)
                    .map(([band, speed]) => `${band} ${speed} Mbps`)
                    .join(", ")}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <strong>Confidence:</strong>
                  <div className="h-1.5 w-12 rounded-full bg-neutral-200">
                    <div
                      className={`h-full rounded-full ${
                        modem.confidence >= 90
                          ? "bg-success-500"
                          : modem.confidence >= 75
                            ? "bg-warning-500"
                            : "bg-error-500"
                      }`}
                      style={{ width: `${modem.confidence}%` }}
                    />
                  </div>
                  <span>{modem.confidence}/100</span>
                  <span className="text-neutral-400">({modem.sourceCount} sources)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ModemBrowser() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return MODEM_DATA;
    const q = search.toLowerCase();
    return MODEM_DATA.filter(
      (m) =>
        m.brand.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q) ||
        (m.isp_provided_by && m.isp_provided_by.toLowerCase().includes(q)) ||
        m.device_type.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search modems..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
        />
        <span className="text-xs text-doc-muted">{filtered.length} modems</span>
      </div>
      <div className="space-y-2">
        {filtered.map((modem) => (
          <ModemCard key={modem.id} modem={modem} />
        ))}
      </div>
    </div>
  );
}
