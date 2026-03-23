param(
  [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'

Write-Host "== Data-Dash-Inc Run ==" -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendPath = Join-Path $root "frontend"
$backendPath = Join-Path $root "backend"
$venvPython = Join-Path $root ".venv\Scripts\python.exe"

if (-not (Test-Path $frontendPath)) {
  throw "Frontend folder not found at $frontendPath"
}

if (-not (Test-Path $backendPath)) {
  throw "Backend folder not found at $backendPath"
}

if (-not $SkipInstall) {
  Push-Location $frontendPath
  try {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
  }
  finally {
    Pop-Location
  }
}

$pythonCmd = if (Test-Path $venvPython) { $venvPython } else { "python" }
$backendApp = Join-Path $backendPath "app.py"

Write-Host "Starting backend in a new PowerShell window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$backendPath'; & '$pythonCmd' '$backendApp'"
)

Start-Sleep -Seconds 2

Write-Host "Starting frontend dev server in this terminal..." -ForegroundColor Yellow
Write-Host "Open the local URL printed by Vite (usually http://localhost:5173)." -ForegroundColor DarkGray

Push-Location $frontendPath
try {
  npm run dev
}
finally {
  Pop-Location
}
