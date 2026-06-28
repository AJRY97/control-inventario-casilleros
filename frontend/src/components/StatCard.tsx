import type { LucideIcon } from "lucide-react";
import { formatNumber } from "../lib/format";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "ink" | "green" | "blue" | "orange" | "rose";
}

const toneClasses = {
  ink: "bg-ink text-white",
  green: "bg-emerald-600 text-white",
  blue: "bg-blue-600 text-white",
  orange: "bg-orange-500 text-white",
  rose: "bg-rose-600 text-white",
};

export function StatCard({ label, value, icon: Icon, tone }: StatCardProps) {
  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{formatNumber(value)}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
}
