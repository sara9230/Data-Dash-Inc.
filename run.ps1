param(
  [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendPath = Join-Path $root "frontend"
$backendPath = Join-Path $root "backend"
$venvPython = Join-Path $root ".venv\Scripts\python.exe"

# check if frontend and backend folders exist
if (-not (Test-Path $frontendPath)) {
  throw "Frontend folder not found at $frontendPath"
}

if (-not (Test-Path $backendPath)) {
  throw "Backend folder not found at $backendPath"
}

$pythonCmd = if (Test-Path $venvPython) { $venvPython } else { "python" }
$backendRequirements = Join-Path $backendPath "requirements.txt"
 # check if user wants to skip installation
if (-not $SkipInstall) {
  Push-Location $frontendPath
  # install frontend dependencies
  try {
    npm install
  }
  finally {
    Pop-Location
  }
  # install backend dependencies
  if (Test-Path $backendRequirements) {
    & $pythonCmd -m pip install -r $backendRequirements
  }
}

$backendApp = Join-Path $backendPath "app.py"
# opens a new terminal to run the backend
Write-Host "Starting backend"
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  # run backend
  "cd '$backendPath'; & '$pythonCmd' '$backendApp'"
)

Start-Sleep -Seconds 2

Write-Host "Open the local URL http://localhost:5173"
# run frontend
Push-Location $frontendPath
try {
  npm run dev
}
finally {
  Pop-Location
}
