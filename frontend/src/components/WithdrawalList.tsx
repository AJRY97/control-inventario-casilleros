import { Download, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { formatNumber } from "../lib/format";
import type { Withdrawal } from "../types";

interface WithdrawalListProps {
  withdrawals: Withdrawal[];
  onDelete: (id: number) => Promise<void>;
}

export function WithdrawalList({ withdrawals, onDelete }: WithdrawalListProps) {
  return (
    <section className="min-w-0 rounded-lg border border-line bg-white shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Salidas</h2>
          <p className="text-sm text-slate-500">{formatNumber(withdrawals.length)} registros</p>
        </div>
        <a
          href={api.exportWithdrawalsUrl}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-field px-3 text-sm font-semibold text-ink transition hover:bg-white"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Exportar CSV
        </a>
      </div>

      <div className="divide-y divide-line md:hidden">
        {withdrawals.map((withdrawal) => (
          <article key={withdrawal.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  {withdrawal.date} · {withdrawal.itemCode}
                </p>
                <h3 className="mt-1 text-base font-semibold text-ink">
                  {withdrawal.item.name}
                </h3>
                <p className="text-sm text-slate-500">
                  Casillero {withdrawal.item.locker} · {withdrawal.item.sizeDetail}
                </p>
              </div>
              <button
                type="button"
                title="Eliminar registro"
                onClick={() => onDelete(withdrawal.id)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Cantidad</p>
                <p className="mt-0.5 font-semibold text-ink">
                  {formatNumber(withdrawal.quantity)} {withdrawal.item.unit}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Destino</p>
                <p className="mt-0.5 font-semibold text-ink">
                  {withdrawal.destination || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Retirado por</p>
                <p className="mt-0.5 font-semibold text-ink">
                  {withdrawal.withdrawnBy || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Observación</p>
                <p className="mt-0.5 font-semibold text-ink">
                  {withdrawal.observations || "-"}
                </p>
              </div>
            </div>
          </article>
        ))}
        {withdrawals.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            Sin salidas registradas
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-field text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Fecha</th>
              <th className="px-4 py-3 text-left font-semibold">Artículo</th>
              <th className="px-4 py-3 text-right font-semibold">Cantidad</th>
              <th className="px-4 py-3 text-left font-semibold">Retirado por</th>
              <th className="px-4 py-3 text-left font-semibold">Destino</th>
              <th className="px-4 py-3 text-right font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-white">
            {withdrawals.map((withdrawal) => (
              <tr key={withdrawal.id} className="transition hover:bg-field">
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{withdrawal.date}</td>
                <td className="min-w-64 px-4 py-3">
                  <p className="font-medium text-ink">
                    {withdrawal.item.name} · {withdrawal.item.sizeDetail}
                  </p>
                  <p className="text-xs text-slate-500">
                    {withdrawal.itemCode} · Casillero {withdrawal.item.locker}
                  </p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink">
                  {formatNumber(withdrawal.quantity)} {withdrawal.item.unit}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                  {withdrawal.withdrawnBy || "-"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                  {withdrawal.destination || "-"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    type="button"
                    title="Eliminar registro"
                    onClick={() => onDelete(withdrawal.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
            {withdrawals.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                  Sin salidas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
