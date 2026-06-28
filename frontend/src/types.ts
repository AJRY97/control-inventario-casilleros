export type Status = "ok" | "reponer" | "sin_stock";

export interface Item {
  code: string;
  locker: number;
  category: string;
  name: string;
  sizeDetail: string;
  unit: string;
  initialStock: number;
  withdrawn: number;
  currentStock: number;
  minStock: number;
  status: Status;
  notes: string;
}

export interface Withdrawal {
  id: number;
  itemCode: string;
  date: string;
  quantity: number;
  withdrawnBy: string;
  destination: string;
  observations: string;
  createdAt: string;
  item: {
    locker: number;
    name: string;
    sizeDetail: string;
    unit: string;
  };
}

export interface LockerSummary {
  locker: number;
  lines: number;
  initialStock: number;
  withdrawn: number;
  currentStock: number;
  alerts: number;
}

export interface UnitSummary {
  unit: string;
  initialStock: number;
  withdrawn: number;
  currentStock: number;
}

export interface Dashboard {
  settings: {
    lowStockThreshold: number;
  };
  totals: {
    lines: number;
    initialStock: number;
    withdrawn: number;
    currentStock: number;
    alerts: number;
  };
  byLocker: LockerSummary[];
  byUnit: UnitSummary[];
  recentWithdrawals: Withdrawal[];
}

export interface WithdrawalInput {
  itemCode: string;
  date: string;
  quantity: number;
  withdrawnBy: string;
  destination: string;
  observations: string;
}
