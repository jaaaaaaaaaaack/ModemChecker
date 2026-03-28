#!/bin/bash
# Conductor startup script for ModemChecker workspaces
# 1. Ensures .env has Supabase credentials
# 2. Checks if workspace is behind remote main

PROJECT_ROOT="${PWD}"
ENV_FILE="$PROJECT_ROOT/.env"

# --- 1. Ensure .env has Supabase credentials ---
NEEDS_URL=true
NEEDS_KEY=true

if [ -f "$ENV_FILE" ]; then
  grep -q "^VITE_SUPABASE_URL=" "$ENV_FILE" && NEEDS_URL=false
  grep -q "^VITE_SUPABASE_ANON_KEY=" "$ENV_FILE" && NEEDS_KEY=false
fi

if $NEEDS_URL || $NEEDS_KEY; then
  if [ ! -f "$ENV_FILE" ]; then
    touch "$ENV_FILE"
  fi
  if $NEEDS_URL; then
    echo "VITE_SUPABASE_URL=https://mgkdulkdngifkzpgzofk.supabase.co" >> "$ENV_FILE"
  fi
  if $NEEDS_KEY; then
    echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1na2R1bGtkbmdpZmt6cGd6b2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDY1NzQsImV4cCI6MjA4ODQ4MjU3NH0.rxDeoTHkUVELo4U9tXkMImW9ymTVV2GSKMXXoBgE_nU" >> "$ENV_FILE"
  fi
  echo "[workspace-init] Created/updated .env with Supabase credentials."
else
  echo "[workspace-init] .env already has Supabase credentials."
fi

# --- 2. Check if workspace is behind remote main ---
git fetch origin main --quiet 2>/dev/null

LOCAL_HEAD=$(git rev-parse HEAD 2>/dev/null)
REMOTE_HEAD=$(git rev-parse origin/main 2>/dev/null)

if [ -z "$LOCAL_HEAD" ] || [ -z "$REMOTE_HEAD" ]; then
  echo "[workspace-init] Could not compare with remote (offline or no remote configured)."
elif [ "$LOCAL_HEAD" = "$REMOTE_HEAD" ]; then
  echo "[workspace-init] Workspace is up to date with remote main."
else
  BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null)
  AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null)
  if [ "$BEHIND" -gt 0 ] 2>/dev/null; then
    echo "[workspace-init] WARNING: This workspace is $BEHIND commit(s) behind remote main. Ask the user if they want to sync (git pull --rebase origin main)."
  fi
  if [ "$AHEAD" -gt 0 ] 2>/dev/null; then
    echo "[workspace-init] This workspace is $AHEAD commit(s) ahead of remote main."
  fi
fi
