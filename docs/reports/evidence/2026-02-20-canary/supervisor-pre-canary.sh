#!/usr/bin/env bash
APP_DIR="/srv/trinity/worktrees/live-main/apps/web-pwa"
LOG="/tmp/vhc-web-pwa-supervisor.log"
mkdir -p /tmp
cd "$APP_DIR" || exit 1

# Access + transport fixes
export VITE_INVITE_ONLY_ENABLED=false
export VITE_GUN_PEERS='["https://ccibootstrap.tail6cc9b5.ts.net/gun"]'

# Feed wiring
export VITE_NEWS_BRIDGE_ENABLED=true

# Parity feature flags
export VITE_VH_ANALYSIS_PIPELINE=true
export VITE_VH_BIAS_TABLE_V2=true
export VITE_ANALYSIS_MODEL=gpt-4o-mini
export VITE_VH_ANALYSIS_DAILY_LIMIT=0

# Analysis relay upstream (local adapter -> OpenAI)
export ANALYSIS_RELAY_UPSTREAM_URL='http://127.0.0.1:3099/v1/chat/completions'
export ANALYSIS_RELAY_API_KEY='local-relay-key'
export ANALYSIS_RELAY_PROVIDER_ID='openai-relay'

echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] supervisor boot (INVITE=$VITE_INVITE_ONLY_ENABLED GUN_PEERS=$VITE_GUN_PEERS NEWS_BRIDGE=$VITE_NEWS_BRIDGE_ENABLED ANALYSIS_PIPELINE=$VITE_VH_ANALYSIS_PIPELINE BIAS_TABLE_V2=$VITE_VH_BIAS_TABLE_V2 ANALYSIS_MODEL=$VITE_ANALYSIS_MODEL ANALYSIS_RELAY_UPSTREAM_URL=$ANALYSIS_RELAY_UPSTREAM_URL)" >> "$LOG"
while true; do
  echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] launching vite" >> "$LOG"
  pnpm dev -- --host 127.0.0.1 --port 2048 --strictPort >> "$LOG" 2>&1
  code=$?
  echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] vite exited code=$code; restarting in 2s" >> "$LOG"
  sleep 2
done
