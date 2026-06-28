# Inventario Casilleros

Aplicacion local para controlar inventario por casillero, registrar salidas y mantener alertas de bajo stock.

## Tecnologias

- Backend: Python, FastAPI, SQLite
- Frontend: React, TypeScript, Vite, Tailwind CSS

## Instalacion

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Frontend:

```powershell
cd frontend
npm install
```

## Uso local

Terminal 1:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Terminal 2:

```powershell
cd frontend
npm run dev
```

La app queda en `http://127.0.0.1:5173`.

## Datos locales

La base SQLite se crea en `backend/app/data/inventory.db`. Ese archivo esta ignorado por Git para no subir tus movimientos ni stock real.

GitHub Pages no ejecuta backend Python. Puedes subir este proyecto a un repositorio cuando quieras, pero para una URL propia con backend necesitas correrlo localmente o desplegarlo en un hosting que soporte Python.
