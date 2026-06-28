import type { Dashboard, Item, Withdrawal, WithdrawalInput } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    let message = "No se pudo completar la accion.";
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) {
        message = body.detail;
      }
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  dashboard: () => request<Dashboard>("/api/dashboard"),
  items: () => request<Item[]>("/api/items"),
  withdrawals: () => request<Withdrawal[]>("/api/withdrawals"),
  createWithdrawal: (payload: WithdrawalInput) =>
    request<Withdrawal>("/api/withdrawals", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteWithdrawal: (id: number) =>
    request<void>(`/api/withdrawals/${id}`, { method: "DELETE" }),
  updateThreshold: (lowStockThreshold: number) =>
    request<{ lowStockThreshold: number }>("/api/settings", {
      method: "PATCH",
      body: JSON.stringify({ lowStockThreshold }),
    }),
  exportWithdrawalsUrl: `${API_BASE_URL}/api/export/withdrawals.csv`,
};
