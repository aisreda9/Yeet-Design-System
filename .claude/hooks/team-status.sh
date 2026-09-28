#!/usr/bin/env bash
# SessionStart: show which branches other sessions are working on and where they overlap with this one.
# Output goes into the session context. Never blocks the session start.
cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0
timeout 30 node scripts/team/status.mjs --brief 2>/dev/null || true
exit 0
