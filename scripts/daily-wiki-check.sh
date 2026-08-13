#!/usr/bin/env bash
# Scheduled via crontab (see `crontab -l`). Runs Claude Code headlessly against
# this vault to: (1) ingest any files in Clippings/ not yet in Ingestion Log.md,
# (2) lint the wiki per CLAUDE.md's Lint workflow. Logs go to scripts/logs/.
set -euo pipefail

VAULT_DIR="/home/keith/Documents/project-jarvis"
LOG_DIR="$VAULT_DIR/scripts/logs"
mkdir -p "$LOG_DIR"

STAMP="$(date +%F_%H-%M-%S)"
LOG_FILE="$LOG_DIR/$STAMP.log"

cd "$VAULT_DIR"

/home/keith/.local/bin/claude -p "Check Clippings/ for any source files not yet recorded in 'Project Jarvis/Ingestion Log.md'. Ingest each one found, following CLAUDE.md's Ingestion workflow. Then run the Lint workflow from CLAUDE.md and report findings. Do not ask for confirmation on citation/date fixes, but do not mass-rewrite pages or resolve real contradictions without flagging them first — leave those noted, not fixed." \
  --permission-mode acceptEdits \
  > "$LOG_FILE" 2>&1

echo "$STAMP: done, see $LOG_FILE"
