#!/usr/bin/env bash
# One-command local launcher for the Unified Business Suite.
#
#   ./business_suite/run.sh            # install, seed (first run), serve on :8000
#   PORT=8001 ./business_suite/run.sh  # use a different port
#
# Re-runnable: dependencies and seed data are only set up when missing.
set -euo pipefail

# Resolve repo root from this script's location so it works from anywhere.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

PORT="${PORT:-8000}"
PY="${PYTHON:-python3}"

echo "==> Using $($PY --version 2>&1) at $(command -v "$PY")"

# Create/activate a local virtualenv so we don't touch system packages.
if [ ! -d ".venv" ]; then
  echo "==> Creating virtualenv (.venv)"
  "$PY" -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate

echo "==> Installing dependencies"
pip install -q --upgrade pip
pip install -q -r business_suite/requirements.txt

# Seed only if the database doesn't exist yet.
if [ ! -f "business_suite/business_suite.db" ]; then
  echo "==> Seeding database (demo users/COA/employees)"
  python -m business_suite.seed
fi

echo ""
echo "==> Starting server at http://localhost:${PORT}/"
echo "    Dashboard: http://localhost:${PORT}/   (login: admin / admin123)"
echo "    API docs:  http://localhost:${PORT}/docs"
echo ""
exec uvicorn business_suite.main:app --reload --host 0.0.0.0 --port "$PORT"
