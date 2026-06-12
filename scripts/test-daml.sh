#!/usr/bin/env bash
# Run Daml unit tests + the full setup scenario
set -e
export PATH="/opt/homebrew/opt/openjdk@17/bin:$HOME/.daml/bin:$PATH"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT/daml"

echo "▶ Building..."
daml build

echo ""
echo "▶ Running Daml tests..."
daml test

echo ""
echo "▶ Running Setup scenario in sandbox..."
daml sandbox --port 6866 --wall-clock-time &
SANDBOX_PID=$!
sleep 4

daml script \
  --dar .daml/dist/mandate-protocol-0.1.0.dar \
  --script-name Setup:setup \
  --ledger-host localhost \
  --ledger-port 6866 \
  --wall-clock-time

kill $SANDBOX_PID
echo ""
echo "✓ All Daml tests passed"
