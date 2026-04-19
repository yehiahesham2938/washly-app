# Install all Node/npm dependencies for washly-app (client + server).
# Run from repo root in PowerShell:
#   .\install-dependencies.ps1
# If execution policy blocks scripts, use CMD instead (no signing):
#   install-dependencies.cmd
# Or one-shot bypass:
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\install-dependencies.ps1
# Or allow scripts for your user:
#   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

$ErrorActionPreference = 'Stop'

function Require-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Write-Error "Error: '$Name' not found. Install Node.js (includes npm): https://nodejs.org/"
        exit 1
    }
}

Require-Command node
Require-Command npm

$nodeMajor = [int](node -p "parseInt(process.versions.node.split('.')[0],10)")
if ($nodeMajor -lt 18) {
    Write-Error "Error: Node.js 18 or newer is required (found $(node -v))."
    exit 1
}

$Root = $PSScriptRoot
$ClientDir = Join-Path $Root 'client'
$ServerDir = Join-Path $Root 'server'

foreach ($dir in @($ClientDir, $ServerDir)) {
    if (-not (Test-Path (Join-Path $dir 'package.json'))) {
        Write-Error "Error: missing $(Join-Path $dir 'package.json')"
        exit 1
    }
}

function Install-Pkg {
    param([string]$Label, [string]$Directory)
    Write-Host ""
    Write-Host "==> ${Label}: npm ci"
    Push-Location $Directory
    try {
        npm ci
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
    finally {
        Pop-Location
    }
}

Install-Pkg 'Client (Vite + React)' $ClientDir
Install-Pkg 'Server (Express)' $ServerDir

Write-Host ""
Write-Host "All npm dependencies installed."
Write-Host "Runtime: start MongoDB and configure server/.env (see client/.env.example for API URL patterns)."
Write-Host "  Client dev: cd client; npm run dev"
Write-Host "  Server dev: cd server; npm run dev"
