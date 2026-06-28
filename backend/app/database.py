from __future__ import annotations

import math
import os
import sqlite3
from pathlib import Path
from typing import Any

DB_PATH = Path(
    os.getenv(
        "INVENTORY_DB_PATH",
        Path(__file__).resolve().parent / "data" / "inventory.db",
    )
)

INITIAL_ITEMS: list[tuple[str, int, str, str, str, str, int, str]] = [
    ("C1-GEO-S", 1, "Vestuario", "Geologos", "S", "Unidad", 6, "Geologos talla S"),
    ("C1-GEO-M", 1, "Vestuario", "Geologos", "M", "Unidad", 7, "Geologos talla M"),
    ("C1-GEO-L", 1, "Vestuario", "Geologos", "L", "Unidad", 22, "Geologos talla L"),
    ("C1-GEO-XL", 1, "Vestuario", "Geologos", "XL", "Unidad", 3, "Geologos talla XL"),
    ("C1-GEO-2XL", 1, "Vestuario", "Geologos", "2XL", "Unidad", 6, "Geologos talla 2XL"),
    ("C1-GEO-3XL", 1, "Vestuario", "Geologos", "3XL", "Unidad", 2, "Geologos talla 3XL"),
    ("C2-GEO-3XL", 2, "Vestuario", "Geologos", "3XL", "Unidad", 2, "Geologos talla 3XL"),
    ("C2-GEO-2XL", 2, "Vestuario", "Geologos", "2XL", "Unidad", 1, "Geologos talla 2XL"),
    ("C2-GEO-L", 2, "Vestuario", "Geologos", "L", "Unidad", 1, "Geologos talla L"),
    ("C2-GCB", 2, "EPP", "Guantes de cuero blancos", "Sin talla", "Par", 30, "3 bolsas de 10 pares cada una"),
    ("C2-GAZ", 2, "EPP", "Guantes azules", "Sin talla", "Par", 20, "1 bolsa de 8 pares y 1 bolsa de 12 pares"),
    ("C2-GAI", 2, "EPP", "Guantes anti impacto", "Sin talla", "Par", 10, "10 pares"),
    ("C2-TAP", 2, "EPP", "Tapones auditivos de espuma", "Caja", "Caja", 1, "1 caja"),
    ("C2-FMR", 2, "EPP", "Filtros de mascara respiradora", "Sin talla", "Par", 40, "40 pares"),
    ("C2-GAM", 2, "EPP", "Guantes amarillos", "Sin talla", "Par", 11, "1 bolsa de 5 pares y 1 bolsa de 6 pares"),
    ("C2-PAC", 2, "EPP", "Protector auditivo para casco", "Caja", "Caja", 5, "5 cajas"),
    ("C2-ESL", 2, "Izaje", "Eslingas", "Sin talla", "Unidad", 3, "3 eslingas"),
    ("C2-LSOL", 2, "EPP", "Lentes de sol", "Sin talla", "Unidad", 13, "13 unidades"),
    ("C3-BUZO-AZ", 3, "Vestuario", "Buzo azul", "Sin talla", "Unidad", 25, "25 unidades"),
    ("C3-TRAJE-AG-AM", 3, "Vestuario lluvia", "Traje de agua amarillo", "Sin talla", "Unidad", 10, "10 unidades"),
    ("C4-CAPA-IMP", 4, "Vestuario lluvia", "Capa impermeable", "Sin talla", "Unidad", 40, "40 unidades"),
    ("C4-TRAJE-AG-AM", 4, "Vestuario lluvia", "Traje de agua amarillo", "Sin talla", "Unidad", 10, "10 unidades"),
    ("C5-TRAJE-AG-AM", 5, "Vestuario lluvia", "Traje de agua amarillo", "Sin talla", "Unidad", 29, "29 unidades"),
]


def get_connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS items (
                code TEXT PRIMARY KEY,
                locker INTEGER NOT NULL,
                category TEXT NOT NULL,
                name TEXT NOT NULL,
                size_detail TEXT NOT NULL,
                unit TEXT NOT NULL,
                initial_stock INTEGER NOT NULL CHECK (initial_stock >= 0),
                notes TEXT NOT NULL DEFAULT ''
            );

            CREATE TABLE IF NOT EXISTS withdrawals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_code TEXT NOT NULL REFERENCES items(code) ON DELETE RESTRICT,
                date TEXT NOT NULL,
                quantity INTEGER NOT NULL CHECK (quantity > 0),
                withdrawn_by TEXT NOT NULL DEFAULT '',
                destination TEXT NOT NULL DEFAULT '',
                observations TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
            """
        )
        conn.execute(
            "INSERT OR IGNORE INTO settings (key, value) VALUES ('low_stock_threshold', '0.2')"
        )
        item_count = conn.execute("SELECT COUNT(*) FROM items").fetchone()[0]
        if item_count == 0:
            conn.executemany(
                """
                INSERT INTO items
                    (code, locker, category, name, size_detail, unit, initial_stock, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                INITIAL_ITEMS,
            )


def low_stock_threshold(conn: sqlite3.Connection) -> float:
    value = conn.execute(
        "SELECT value FROM settings WHERE key = 'low_stock_threshold'"
    ).fetchone()
    if value is None:
        return 0.2
    try:
        return float(value["value"])
    except (TypeError, ValueError):
        return 0.2


def set_low_stock_threshold(value: float) -> None:
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO settings (key, value)
            VALUES ('low_stock_threshold', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
            """,
            (str(value),),
        )


def status_for(current_stock: int, min_stock: int) -> str:
    if current_stock <= 0:
        return "sin_stock"
    if current_stock <= min_stock:
        return "reponer"
    return "ok"


def item_payload(row: sqlite3.Row, threshold: float) -> dict[str, Any]:
    withdrawn = int(row["withdrawn"] or 0)
    initial = int(row["initial_stock"])
    current = initial - withdrawn
    min_stock = max(1, math.ceil(initial * threshold)) if initial > 0 else 0

    return {
        "code": row["code"],
        "locker": int(row["locker"]),
        "category": row["category"],
        "name": row["name"],
        "sizeDetail": row["size_detail"],
        "unit": row["unit"],
        "initialStock": initial,
        "withdrawn": withdrawn,
        "currentStock": current,
        "minStock": min_stock,
        "status": status_for(current, min_stock),
        "notes": row["notes"],
    }


def list_items(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    threshold = low_stock_threshold(conn)
    rows = conn.execute(
        """
        SELECT
            i.code,
            i.locker,
            i.category,
            i.name,
            i.size_detail,
            i.unit,
            i.initial_stock,
            i.notes,
            COALESCE(SUM(w.quantity), 0) AS withdrawn
        FROM items i
        LEFT JOIN withdrawals w ON w.item_code = i.code
        GROUP BY
            i.code, i.locker, i.category, i.name, i.size_detail,
            i.unit, i.initial_stock, i.notes
        ORDER BY i.rowid
        """
    ).fetchall()
    return [item_payload(row, threshold) for row in rows]


def get_item(conn: sqlite3.Connection, code: str) -> dict[str, Any] | None:
    return next((item for item in list_items(conn) if item["code"] == code), None)


def withdrawal_payload(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": int(row["id"]),
        "itemCode": row["item_code"],
        "date": row["date"],
        "quantity": int(row["quantity"]),
        "withdrawnBy": row["withdrawn_by"],
        "destination": row["destination"],
        "observations": row["observations"],
        "createdAt": row["created_at"],
        "item": {
            "locker": int(row["locker"]),
            "name": row["name"],
            "sizeDetail": row["size_detail"],
            "unit": row["unit"],
        },
    }
