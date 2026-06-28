import { AlertTriangle, CheckCircle2, Plus } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { formatNumber, stockPercent, todayInputValue } from "../lib/format";
import type { Item, WithdrawalInput } from "../types";

interface WithdrawalFormProps {
  items: Item[];
  onSubmit: (payload: WithdrawalInput) => Promise<void>;
}

const emptyForm = (itemCode = ""): WithdrawalInput => ({
  itemCode,
  date: todayInputValue(),
  quantity: 1,
  withdrawnBy: "",
  destination: "",
  observations: "",
});

export function WithdrawalForm({ items, onSubmit }: WithdrawalFormProps) {
  const [form, setForm] = useState<WithdrawalInput>(() => emptyForm(items[0]?.code ?? ""));
  const [submitting, setSubmitting] = useState(false);

  const selectedItem = useMemo(
    () => items.find((item) => item.code === form.itemCode) ?? items[0],
    [form.itemCode, items],
  );

  const quantityTooHigh = Boolean(selectedItem && form.quantity > selectedItem.currentStock);
  const canSubmit = Boolean(selectedItem && form.quantity > 0 && !quantityTooHigh && !submitting);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ ...form, itemCode: selectedItem.code });
      setForm(emptyForm(selectedItem.code));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="min-w-0 rounded-lg border border-line bg-white p-4 shadow-panel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">Registrar salida</h2>
        <span className="rounded-full bg-field px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-line">
          {items.length} códigos
        </span>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-600">Código</span>
          <select
            value={selectedItem?.code ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, itemCode: event.target.value }))
            }
            className="h-11 w-full rounded-lg border border-line bg-field px-3 text-sm outline-none transition focus:border-safety focus:bg-white focus:ring-2 focus:ring-emerald-100"
          >
            {items.map((item) => (
              <option key={item.code} value={item.code}>
                {item.code} · C{item.locker} · {item.name} · {item.sizeDetail}
              </option>
            ))}
          </select>
        </label>

        {selectedItem && (
          <div className="rounded-lg border border-line bg-field p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{selectedItem.name}</p>
                <p className="text-sm text-slate-500">
                  Casillero {selectedItem.locker} · {selectedItem.sizeDetail}
                </p>
              </div>
              <p className="text-right text-sm">
                <span className="block font-semibold text-ink">
                  {formatNumber(selectedItem.currentStock)} {selectedItem.unit}
                </span>
                <span className="text-slate-500">disponible</span>
              </p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white">
              <div
                className="h-2 rounded-full bg-safety"
                style={{
                  width: `${stockPercent(selectedItem.currentStock, selectedItem.initialStock)}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">Fecha</span>
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              className="h-11 w-full rounded-lg border border-line bg-field px-3 text-sm outline-none transition focus:border-safety focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">Cantidad</span>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  quantity: Number(event.target.value),
                }))
              }
              className="h-11 w-full rounded-lg border border-line bg-field px-3 text-sm outline-none transition focus:border-safety focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">Retirado por</span>
            <input
              value={form.withdrawnBy}
              onChange={(event) =>
                setForm((current) => ({ ...current, withdrawnBy: event.target.value }))
              }
              className="h-11 w-full rounded-lg border border-line bg-field px-3 text-sm outline-none transition focus:border-safety focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">Destino / área</span>
            <input
              value={form.destination}
              onChange={(event) =>
                setForm((current) => ({ ...current, destination: event.target.value }))
              }
              className="h-11 w-full rounded-lg border border-line bg-field px-3 text-sm outline-none transition focus:border-safety focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-600">Observaciones</span>
          <textarea
            value={form.observations}
            onChange={(event) =>
              setForm((current) => ({ ...current, observations: event.target.value }))
            }
            rows={3}
            className="w-full resize-none rounded-lg border border-line bg-field px-3 py-2 text-sm outline-none transition focus:border-safety focus:bg-white focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        {quantityTooHigh && selectedItem && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Disponible: {formatNumber(selectedItem.currentStock)} {selectedItem.unit}
          </div>
        )}

        {!quantityTooHigh && selectedItem && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Stock posterior: {formatNumber(selectedItem.currentStock - form.quantity)}{" "}
            {selectedItem.unit}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          title="Guardar salida"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Guardar salida
        </button>
      </form>
    </section>
  );
}
