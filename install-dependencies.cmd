@echo off
setlocal EnableExtensions

REM Install all Node/npm dependencies for washly-app (client + server).
REM Run from repo root (double-click or: install-dependencies.cmd)
REM Use this if PowerShell blocks .ps1 (execution policy / signing).

set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"

where node >nul 2>&1
if errorlevel 1 (
  echo Error: node not found. Install Node.js ^(includes npm^): https://nodejs.org/
  exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
  echo Error: npm not found. Install Node.js: https://nodejs.org/
  exit /b 1
)

node -e "if (parseInt(process.versions.node.split('.')[0],10)<18){console.error('Error: Node.js 18 or newer is required (found '+process.version+').');process.exit(1)}"
if errorlevel 1 exit /b 1

if not exist "%ROOT%\client\package.json" (
  echo Error: missing "%ROOT%\client\package.json"
  exit /b 1
)
if not exist "%ROOT%\server\package.json" (
  echo Error: missing "%ROOT%\server\package.json"
  exit /b 1
)

echo.
echo ==> Client (Vite + React^): npm ci
pushd "%ROOT%\client"
call npm ci
if errorlevel 1 (
  popd
  exit /b 1
)
popd

echo.
echo ==> Server (Express^): npm ci
pushd "%ROOT%\server"
call npm ci
if errorlevel 1 (
  popd
  exit /b 1
)
popd

echo.
echo All npm dependencies installed.
echo Runtime: start MongoDB and configure server/.env (see client/.env.example for API URL patterns).
echo   Client dev:  cd client
echo                 npm run dev
echo   Server dev:  cd server
echo                 npm run dev
exit /b 0
