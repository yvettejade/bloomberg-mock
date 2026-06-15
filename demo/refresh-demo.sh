#!/usr/bin/env bash
#
# refresh-demo.sh — reset the BBG market-data demo to its baseline state.
#
# Use this between demo runs. It returns the app to "backend only, no dashboard"
# so you can live-build the dashboard again from a clean slate:
#
#   - removes the dashboard UI (components, hooks, front-end-only helpers)
#   - restores the baseline page.tsx / globals.css / layout.tsx
#   - clears runtime state (SQLite data + Next.js build cache)
#   - (re)installs dependencies
#
# The backend (src/app/api/**, src/lib/server/**, src/lib/mock-bbg/**) is the
# source of truth and is never touched by this script.
#
# Usage:
#   ./refresh-demo.sh            # full refresh (default)
#   ./refresh-demo.sh --no-install   # skip npm install (faster)

set -euo pipefail

# Resolve the demo directory (this script lives at its root).
DEMO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASELINE_DIR="$DEMO_DIR/.demo-baseline"
cd "$DEMO_DIR"

RUN_INSTALL=1
for arg in "$@"; do
  case "$arg" in
    --no-install) RUN_INSTALL=0 ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

bold() { printf "\033[1m%s\033[0m\n" "$1"; }
step() { printf "\033[36m▶\033[0m %s\n" "$1"; }

bold "Refreshing BBG market-data demo…"

# 1. Warn if the dev server is still running on :3000.
if lsof -nP -iTCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "  ⚠  Something is listening on :3000 — stop 'npm run dev' (Ctrl+C) before/after refreshing."
fi

# 2. Remove the dashboard UI that gets built during the demo.
step "Removing dashboard UI components…"
rm -rf src/components
rm -rf src/hooks
rm -f src/lib/client-types.ts
rm -f src/lib/format.ts

# 3. Restore baseline front-end files (placeholder page + theme + layout).
step "Restoring baseline front-end files…"
if [ ! -d "$BASELINE_DIR" ]; then
  echo "  ✖  Missing baseline snapshot at .demo-baseline/ — cannot restore." >&2
  exit 1
fi
cp "$BASELINE_DIR/page.tsx"    src/app/page.tsx
cp "$BASELINE_DIR/globals.css" src/app/globals.css
cp "$BASELINE_DIR/layout.tsx"  src/app/layout.tsx

# 4. Clear runtime state: SQLite database + Next.js build cache.
step "Clearing runtime state (SQLite data + .next cache)…"
rm -rf data
rm -rf .next

# 5. Install dependencies.
if [ "$RUN_INSTALL" -eq 1 ]; then
  step "Installing dependencies (npm install)…"
  npm install
else
  step "Skipping npm install (--no-install)."
fi

echo ""
bold "✅ Demo reset complete."
echo "Backend is intact (mock @glue42/bbg-market-data feed + SQLite + reporting job)."
echo ""
echo "Next steps:"
echo "  1) npm run dev        # starts the feed; dashboard is intentionally empty"
echo "  2) Ask Cursor to build out the dashboard against the existing API routes."
