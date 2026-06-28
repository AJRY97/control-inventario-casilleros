import { AlertTriangle, Warehouse } from "lucide-react";
import { formatNumber, stockPercent } from "../lib/format";
import type { LockerSummary, UnitSummary } from "../types";

interface LockerOverviewProps {
  lockers: LockerSummary[];
  units: UnitSummary[];
  activeLocker: number | "all";
  onLockerChange: (locker: number | "all") => void;
}

export function LockerOverview({
  lockers,
  units,
  activeLocker,
  onLockerChange,
}: LockerOverviewProps) {
  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 rounded-lg border border-line bg-white p-4 shadow-panel">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-safety" aria-hidden="true" />
            <h2 className="text-base font-semibold text-ink">Casilleros</h2>
          </div>
          <button
            type="button"
            onClick={() => onLockerChange("all")}
            className={`w-full rounded-lg px-3 py-2 text-sm font-semibold ring-1 transition sm:w-auto ${
              activeLocker === "all"
                ? "bg-ink text-white ring-ink"
                : "bg-field text-slate-700 ring-line hover:bg-white"
            }`}
          >
            Todos
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {lockers.map((locker) => {
            const percent = stockPercent(locker.currentStock, locker.initialStock);
            const isActive = activeLocker === locker.locker;
            return (
              <button
                key={locker.locker}
                type="button"
                onClick={() => onLockerChange(locker.locker)}
                className={`rounded-lg border p-3 text-left transition ${
                  isActive
                    ? "border-safety bg-emerald-50 shadow-sm"
                    : "border-line bg-white hover:border-safety"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-ink">Casillero {locker.locker}</p>
                  {locker.alerts > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                      {locker.alerts}
                    </span>
                  )}
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-safety"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Disponible</p>
                    <p className="mt-0.5 font-semibold text-ink">
                      {formatNumber(locker.currentStock)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Salidas</p>
                    <p className="mt-0.5 font-semibold text-ink">
                      {formatNumber(locker.withdrawn)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="min-w-0 rounded-lg border border-line bg-white p-4 shadow-panel">
        <h2 className="text-base font-semibold text-ink">Unidades</h2>
        <div className="mt-4 space-y-3">
          {units.map((unit) => {
            const percent = stockPercent(unit.currentStock, unit.initialStock);
            return (
              <div key={unit.unit}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-ink">{unit.unit}</span>
                  <span className="text-slate-500">
                    {formatNumber(unit.currentStock)} / {formatNumber(unit.initialStock)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-cobalt"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
