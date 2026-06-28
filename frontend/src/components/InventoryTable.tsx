import { Search, SlidersHorizontal } from "lucide-react";
import { classNames, formatNumber, statusMeta, stockPercent } from "../lib/format";
import type { Item, Status } from "../types";

interface InventoryTableProps {
  items: Item[];
  search: string;
  activeStatus: Status | "all";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: Status | "all") => void;
}

export function InventoryTable({
  items,
  search,
  activeStatus,
  onSearchChange,
  onStatusChange,
}: InventoryTableProps) {
  return (
    <section className="min-w-0 rounded-lg border border-line bg-white shadow-panel">
      <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Inventario</h2>
          <p className="text-sm text-slate-500">{formatNumber(items.length)} registros visibles</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar artículo, código o talla"
              className="h-10 w-full rounded-lg border border-line bg-field pl-9 pr-3 text-sm outline-none transition focus:border-safety focus:bg-white focus:ring-2 focus:ring-emerald-100 sm:w-72"
            />
          </label>

          <label className="relative block">
            <SlidersHorizontal
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <select
              value={activeStatus}
              onChange={(event) => onStatusChange(event.target.value as Status | "all")}
              className="h-10 w-full rounded-lg border border-line bg-field pl-9 pr-8 text-sm outline-none transition focus:border-safety focus:bg-white focus:ring-2 focus:ring-emerald-100 sm:w-44"
            >
              <option value="all">Todos</option>
              <option value="ok">OK</option>
              <option value="reponer">Reponer</option>
              <option value="sin_stock">Sin stock</option>
            </select>
          </label>
        </div>
      </div>

      <div className="divide-y divide-line md:hidden">
        {items.map((item) => {
          const percent = stockPercent(item.currentStock, item.initialStock);
          const meta = statusMeta[item.status];
          return (
            <article
              key={item.code}
              className={classNames("border-l-4 p-4", meta.row)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    {item.code} · Casillero {item.locker}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-ink">{item.name}</h3>
                  <p className="text-sm text-slate-500">{item.sizeDetail}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.badge}`}
                >
                  {meta.label}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Inicial</p>
                  <p className="mt-0.5 font-semibold text-ink">
                    {formatNumber(item.initialStock)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Salidas</p>
                  <p className="mt-0.5 font-semibold text-ink">
                    {formatNumber(item.withdrawn)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Disponible</p>
                  <p className="mt-0.5 font-semibold text-ink">
                    {formatNumber(item.currentStock)} {item.unit}
                  </p>
                </div>
              </div>

              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-safety" style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-3 text-xs text-slate-500">{item.notes}</p>
            </article>
          );
        })}
        {items.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            Sin resultados
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-ink text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Código</th>
              <th className="px-4 py-3 text-left font-semibold">Casillero</th>
              <th className="px-4 py-3 text-left font-semibold">Artículo</th>
              <th className="px-4 py-3 text-left font-semibold">Talla</th>
              <th className="px-4 py-3 text-right font-semibold">Inicial</th>
              <th className="px-4 py-3 text-right font-semibold">Salidas</th>
              <th className="px-4 py-3 text-right font-semibold">Disponible</th>
              <th className="px-4 py-3 text-left font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-white">
            {items.map((item) => {
              const percent = stockPercent(item.currentStock, item.initialStock);
              const meta = statusMeta[item.status];
              return (
                <tr
                  key={item.code}
                  className={classNames(
                    "border-l-4 transition hover:bg-field",
                    meta.row,
                  )}
                >
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink">
                    {item.code}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    Casillero {item.locker}
                  </td>
                  <td className="min-w-64 px-4 py-3">
                    <p className="font-medium text-ink">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.notes}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {item.sizeDetail}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">
                    {formatNumber(item.initialStock)} {item.unit}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">
                    {formatNumber(item.withdrawn)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="ml-auto w-32">
                      <p className="font-semibold text-ink">
                        {formatNumber(item.currentStock)} {item.unit}
                      </p>
                      <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                        <div
                          className="h-1.5 rounded-full bg-safety"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.badge}`}>
                      {meta.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
