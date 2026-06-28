import {
  AlertTriangle,
  Boxes,
  ClipboardList,
  Database,
  Download,
  LockKeyhole,
  PackageCheck,
  RefreshCcw,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { InventoryTable } from "./components/InventoryTable";
import { LockerOverview } from "./components/LockerOverview";
import { StatCard } from "./components/StatCard";
import { WithdrawalForm } from "./components/WithdrawalForm";
import { WithdrawalList } from "./components/WithdrawalList";
import { api } from "./lib/api";
import { classNames, formatNumber } from "./lib/format";
import type { Dashboard, Item, Status, Withdrawal, WithdrawalInput } from "./types";

type Notice = { type: "success" | "error"; message: string } | null;

function App() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLocker, setActiveLocker] = useState<number | "all">("all");
  const [activeStatus, setActiveStatus] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
  const [threshold, setThreshold] = useState(20);
  const [notice, setNotice] = useState<Notice>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardData, inventoryData, withdrawalData] = await Promise.all([
        api.dashboard(),
        api.items(),
        api.withdrawals(),
      ]);
      setDashboard(dashboardData);
      setItems(inventoryData);
      setWithdrawals(withdrawalData);
      setThreshold(Math.round(dashboardData.settings.lowStockThreshold * 100));
      setNotice(null);
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo cargar la app.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const lockerMatch = activeLocker === "all" || item.locker === activeLocker;
      const statusMatch = activeStatus === "all" || item.status === activeStatus;
      const searchMatch =
        query.length === 0 ||
        [item.code, item.name, item.sizeDetail, item.category, item.notes]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return lockerMatch && statusMatch && searchMatch;
    });
  }, [activeLocker, activeStatus, items, search]);

  async function handleCreateWithdrawal(payload: WithdrawalInput) {
    try {
      const created = await api.createWithdrawal(payload);
      setNotice({
        type: "success",
        message: `Salida guardada: ${formatNumber(created.quantity)} ${created.item.unit} de ${created.item.name}.`,
      });
      await loadData();
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo guardar la salida.",
      });
      throw error;
    }
  }

  async function handleDeleteWithdrawal(id: number) {
    const confirmed = window.confirm("Eliminar este registro de salida?");
    if (!confirmed) {
      return;
    }

    try {
      await api.deleteWithdrawal(id);
      setNotice({ type: "success", message: "Registro eliminado." });
      await loadData();
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo eliminar el registro.",
      });
    }
  }

  async function handleSaveThreshold() {
    try {
      await api.updateThreshold(threshold / 100);
      setNotice({ type: "success", message: "Umbral actualizado." });
      await loadData();
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "No se pudo actualizar el umbral.",
      });
    }
  }

  const totals = dashboard?.totals;
  const lockers = dashboard?.byLocker ?? [];
  const units = dashboard?.byUnit ?? [];

  return (
    <div className="min-h-screen bg-field">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-white shadow-panel">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-ink">Inventario Casilleros</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                  Local
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Control de EPP, vestuario y salidas por casillero.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={api.exportWithdrawalsUrl}
              title="Exportar salidas"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-field px-3 text-sm font-semibold text-ink transition hover:bg-white"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              CSV
            </a>
            <button
              type="button"
              onClick={() => void loadData()}
              title="Actualizar"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-field px-3 text-sm font-semibold text-ink transition hover:bg-white"
            >
              <RefreshCcw
                className={classNames("h-4 w-4", loading && "animate-spin")}
                aria-hidden="true"
              />
              Actualizar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 max-sm:w-[calc(100vw-24px)] max-sm:px-0 sm:px-6 lg:px-8">
        {notice && (
          <div
            className={classNames(
              "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium",
              notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700",
            )}
          >
            {notice.type === "success" ? (
              <PackageCheck className="h-4 w-4" aria-hidden="true" />
            ) : (
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            )}
            {notice.message}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Stock disponible"
            value={totals?.currentStock ?? 0}
            icon={Boxes}
            tone="green"
          />
          <StatCard
            label="Salidas registradas"
            value={totals?.withdrawn ?? 0}
            icon={ClipboardList}
            tone="blue"
          />
          <StatCard
            label="Alertas"
            value={totals?.alerts ?? 0}
            icon={AlertTriangle}
            tone={totals?.alerts ? "orange" : "ink"}
          />
          <StatCard
            label="Líneas de inventario"
            value={totals?.lines ?? 0}
            icon={Database}
            tone="rose"
          />
        </div>

        <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <LockerOverview
            lockers={lockers}
            units={units}
            activeLocker={activeLocker}
            onLockerChange={setActiveLocker}
          />

          <div className="min-w-0 rounded-lg border border-line bg-white p-4 shadow-panel">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink">Alerta de stock</h2>
                <p className="text-sm text-slate-500">{threshold}% del stock inicial</p>
              </div>
              <button
                type="button"
                onClick={() => void handleSaveThreshold()}
                title="Guardar umbral"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-white transition hover:bg-slate-800"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
              className="mt-5 w-full accent-emerald-700"
            />
            <div className="mt-2 flex justify-between text-xs font-semibold text-slate-500">
              <span>5%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </section>

        <section className="grid min-w-0 gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
          <WithdrawalForm items={items} onSubmit={handleCreateWithdrawal} />
          <InventoryTable
            items={filteredItems}
            search={search}
            activeStatus={activeStatus}
            onSearchChange={setSearch}
            onStatusChange={setActiveStatus}
          />
        </section>

        <WithdrawalList withdrawals={withdrawals} onDelete={handleDeleteWithdrawal} />
      </main>
    </div>
  );
}

export default App;
