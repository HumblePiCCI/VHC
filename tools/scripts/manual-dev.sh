#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PORT="${PORT:-2048}"
HOST="${HOST:-0.0.0.0}"
LOG_FILE="${LOG_FILE:-/tmp/vh-pwa-dev.log}"

info() { echo "[manual-dev] $*"; }
warn() { echo "[manual-dev][warn] $*" >&2; }

kill_port() {
  local pids
  if pids=$(lsof -ti tcp:"${PORT}" 2>/dev/null); then
    info "Stopping existing process on port ${PORT}"
    xargs kill <<<"${pids}" || true
  fi
  if pkill -f "pnpm --filter @vh/web-pwa dev" >/dev/null 2>&1; then
    info "Stopped prior @vh/web-pwa dev server"
  fi
}

start_stack() {
  info "Ensuring home stack is up (Traefik, MinIO, relay, Anvil, etc.)"
  (cd "${ROOT}" && pnpm vh bootstrap up)
}

start_pwa() {
  info "Starting PWA dev server on ${HOST}:${PORT} (log: ${LOG_FILE})"
  (cd "${ROOT}" && nohup pnpm --filter @vh/web-pwa dev -- --host "${HOST}" --port "${PORT}" --strictPort >"${LOG_FILE}" 2>&1 & echo $!) >/tmp/vh-pwa-dev.pid
}

print_endpoints() {
  local tailscale_ip lan_ip
  tailscale_ip="$(command -v tailscale >/dev/null 2>&1 && tailscale ip -4 2>/dev/null | head -n1 || true)"
  lan_ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
  info "Local:        http://localhost:${PORT}/"
  if [[ -n "${lan_ip}" ]]; then
    info "LAN:          http://${lan_ip}:${PORT}/"
  fi
  if [[ -n "${tailscale_ip}" ]]; then
    info "Tailscale:    http://${tailscale_ip}:${PORT}/"
  fi
  cat <<'EOF'
Tips for remote manual testing:
  - Use a secure origin to avoid WebCrypto errors. Easiest: SSH tunnel and hit localhost:
      ssh -L 2048:localhost:2048 <user>@<server-ip>
      then open http://localhost:2048
  - If using raw IP, prefer HTTPS (self-signed) or localhost via tunnel.
  - Logs: /tmp/vh-pwa-dev.log
EOF
}

teardown() {
  kill_port
}

case "${1:-up}" in
  up)
    kill_port
    start_stack
    start_pwa
    print_endpoints
    ;;
  down)
    teardown
    info "Dev server stopped. Stack left running."
    ;;
  *)
    warn "Usage: $0 [up|down]"
    exit 1
    ;;
esac
