import type { Status } from "../types";

export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("es-CL").format(value);
}

export function todayInputValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export const statusMeta: Record<
  Status,
  { label: string; badge: string; dot: string; row: string }
> = {
  ok: {
    label: "OK",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    row: "border-l-emerald-400",
  },
  reponer: {
    label: "Reponer",
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
    row: "border-l-amber-400",
  },
  sin_stock: {
    label: "Sin stock",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
    row: "border-l-rose-400",
  },
};

export function stockPercent(current: number, initial: number) {
  if (initial <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((current / initial) * 100)));
}
