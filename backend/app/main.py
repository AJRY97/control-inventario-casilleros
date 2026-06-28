from __future__ import annotations

import csv
import io
from contextlib import asynccontextmanager
from datetime import date
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel, Field

from .database import (
    get_connection,
    get_item,
    init_db,
    list_items,
    low_stock_threshold,
    set_low_stock_threshold,
    withdrawal_payload,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="Inventario Casilleros API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class WithdrawalCreate(BaseModel):
    itemCode: str = Field(min_length=1)
    date: date
    quantity: int = Field(gt=0)
    withdrawnBy: str = ""
    destination: str = ""
    observations: str = ""


class SettingsUpdate(BaseModel):
    lowStockThreshold: float = Field(ge=0.01, le=1)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/items")
def items() -> list[dict[str, Any]]:
    with get_connection() as conn:
        return list_items(conn)


@app.get("/api/dashboard")
def dashboard() -> dict[str, Any]:
    with get_connection() as conn:
        inventory = list_items(conn)
        threshold = low_stock_threshold(conn)
        withdrawals = fetch_withdrawals(conn, limit=8)

    totals = {
        "lines": len(inventory),
        "initialStock": sum(item["initialStock"] for item in inventory),
        "withdrawn": sum(item["withdrawn"] for item in inventory),
        "currentStock": sum(item["currentStock"] for item in inventory),
        "alerts": sum(1 for item in inventory if item["status"] != "ok"),
    }

    by_locker = []
    for locker in range(1, 6):
        locker_items = [item for item in inventory if item["locker"] == locker]
        by_locker.append(
            {
                "locker": locker,
                "lines": len(locker_items),
                "initialStock": sum(item["initialStock"] for item in locker_items),
                "withdrawn": sum(item["withdrawn"] for item in locker_items),
                "currentStock": sum(item["currentStock"] for item in locker_items),
                "alerts": sum(1 for item in locker_items if item["status"] != "ok"),
            }
        )

    units = sorted({item["unit"] for item in inventory})
    by_unit = [
        {
            "unit": unit,
            "initialStock": sum(item["initialStock"] for item in inventory if item["unit"] == unit),
            "withdrawn": sum(item["withdrawn"] for item in inventory if item["unit"] == unit),
            "currentStock": sum(item["currentStock"] for item in inventory if item["unit"] == unit),
        }
        for unit in units
    ]

    return {
        "settings": {"lowStockThreshold": threshold},
        "totals": totals,
        "byLocker": by_locker,
        "byUnit": by_unit,
        "recentWithdrawals": withdrawals,
    }


@app.get("/api/withdrawals")
def withdrawals(limit: int = Query(200, ge=1, le=1000)) -> list[dict[str, Any]]:
    with get_connection() as conn:
        return fetch_withdrawals(conn, limit=limit)


@app.post("/api/withdrawals", status_code=201)
def create_withdrawal(payload: WithdrawalCreate) -> dict[str, Any]:
    with get_connection() as conn:
        item = get_item(conn, payload.itemCode)
        if item is None:
            raise HTTPException(status_code=404, detail="Articulo no encontrado")
        if payload.quantity > item["currentStock"]:
            raise HTTPException(
                status_code=409,
                detail=f"Stock insuficiente. Disponible: {item['currentStock']} {item['unit']}.",
            )

        cursor = conn.execute(
            """
            INSERT INTO withdrawals
                (item_code, date, quantity, withdrawn_by, destination, observations)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                payload.itemCode,
                payload.date.isoformat(),
                payload.quantity,
                payload.withdrawnBy.strip(),
                payload.destination.strip(),
                payload.observations.strip(),
            ),
        )
        conn.commit()
        withdrawal_id = int(cursor.lastrowid)

    with get_connection() as conn:
        row = withdrawal_row(conn, withdrawal_id)
        if row is None:
            raise HTTPException(status_code=500, detail="No se pudo leer la salida creada")
        return withdrawal_payload(row)


@app.delete("/api/withdrawals/{withdrawal_id}", status_code=204, response_class=Response)
def delete_withdrawal(withdrawal_id: int) -> Response:
    with get_connection() as conn:
        result = conn.execute("DELETE FROM withdrawals WHERE id = ?", (withdrawal_id,))
        conn.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Registro no encontrado")
    return Response(status_code=204)


@app.patch("/api/settings")
def update_settings(payload: SettingsUpdate) -> dict[str, Any]:
    set_low_stock_threshold(payload.lowStockThreshold)
    return {"lowStockThreshold": payload.lowStockThreshold}


@app.get("/api/export/withdrawals.csv")
def export_withdrawals_csv() -> StreamingResponse:
    with get_connection() as conn:
        rows = fetch_withdrawals(conn, limit=10000)

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "Fecha",
            "Codigo",
            "Casillero",
            "Articulo",
            "Talla / detalle",
            "Unidad",
            "Cantidad",
            "Retirado por",
            "Destino / area",
            "Observaciones",
            "Creado",
        ]
    )
    for row in rows:
        writer.writerow(
            [
                row["date"],
                row["itemCode"],
                f"Casillero {row['item']['locker']}",
                row["item"]["name"],
                row["item"]["sizeDetail"],
                row["item"]["unit"],
                row["quantity"],
                row["withdrawnBy"],
                row["destination"],
                row["observations"],
                row["createdAt"],
            ]
        )

    response = StreamingResponse(iter([buffer.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=salidas_inventario.csv"
    return response


def fetch_withdrawals(conn, limit: int) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT
            w.id,
            w.item_code,
            w.date,
            w.quantity,
            w.withdrawn_by,
            w.destination,
            w.observations,
            w.created_at,
            i.locker,
            i.name,
            i.size_detail,
            i.unit
        FROM withdrawals w
        JOIN items i ON i.code = w.item_code
        ORDER BY w.date DESC, w.id DESC
        LIMIT ?
        """,
        (limit,),
    ).fetchall()
    return [withdrawal_payload(row) for row in rows]


def withdrawal_row(conn, withdrawal_id: int):
    return conn.execute(
        """
        SELECT
            w.id,
            w.item_code,
            w.date,
            w.quantity,
            w.withdrawn_by,
            w.destination,
            w.observations,
            w.created_at,
            i.locker,
            i.name,
            i.size_detail,
            i.unit
        FROM withdrawals w
        JOIN items i ON i.code = w.item_code
        WHERE w.id = ?
        """,
        (withdrawal_id,),
    ).fetchone()
