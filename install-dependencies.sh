#!/usr/bin/env bash
# Install all Node/npm dependencies for washly-app (client + server).
#
# Run from repo root:
#   bash install-dependencies.sh
#
# Make executable (Linux / macOS / Git Bash), then:
#   chmod +x install-dependencies.sh && ./install-dependencies.sh
#
# Windows:
#   If PowerShell blocks .ps1 (signing / execution policy), use CMD:
#     install-dependencies.cmd
#   Or from PowerShell:
#     .\install-dependencies.ps1
#   One-shot bypass:
#     powershell -NoProfile -ExecutionPolicy Bypass -File .\install-dependencies.ps1
#   Or allow scripts for your user:
#     Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
#   Or use Git Bash / a WSL distro so this file runs under real bash, not the
#   WSL stub when no Linux distribution is installed.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENT_DIR="${ROOT}/client"
SERVER_DIR="${ROOT}/server"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: '$1' not found. Install Node.js (includes npm): https://nodejs.org/" >&2
    exit 1
  fi
}

require_cmd node
require_cmd npm

NODE_MAJOR="$(node -p "parseInt(process.versions.node.split('.')[0],10)")"
if [ "${NODE_MAJOR}" -lt 18 ]; then
  echo "Error: Node.js 18 or newer is required (found $(node -v))." >&2
  exit 1
fi

for dir in "${CLIENT_DIR}" "${SERVER_DIR}"; do
  if [ ! -f "${dir}/package.json" ]; then
    echo "Error: missing ${dir}/package.json" >&2
    exit 1
  fi
done

install_pkg() {
  local name="$1"
  local dir="$2"
  echo ""
  echo "==> ${name}: npm ci"
  (cd "${dir}" && npm ci)
}

install_pkg "Client (Vite + React)" "${CLIENT_DIR}"
install_pkg "Server (Express)" "${SERVER_DIR}"

echo ""
echo "All npm dependencies installed."
echo "Runtime: start MongoDB and configure server/.env (see client/.env.example for API URL patterns)."
echo "  Client dev: cd client && npm run dev"
echo "  Server dev: cd server && npm run dev"
