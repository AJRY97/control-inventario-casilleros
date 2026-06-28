$ErrorActionPreference = "Stop"

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$PSScriptRoot\backend'; if (Test-Path '.\.venv\Scripts\Activate.ps1') { . .\.venv\Scripts\Activate.ps1 }; python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
)

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$PSScriptRoot\frontend'; npm run dev"
)
