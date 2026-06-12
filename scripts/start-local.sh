#!/usr/bin/env bash
# Start the full Mandate Protocol stack locally.
# Requires: Daml SDK installed, Python 3.9+, Node 18+

set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DAML_DIR="$REPO_ROOT/daml"
AGENT_DIR="$REPO_ROOT/agent"
FRONTEND_DIR="$REPO_ROOT/frontend"

export PATH="/opt/homebrew/opt/openjdk@17/bin:$HOME/.daml/bin:$PATH"

echo "╔══════════════════════════════════════════╗"
echo "║      Mandate Protocol — Local Stack      ║"
echo "╚══════════════════════════════════════════╝"

# ---- 1. Build Daml ----
echo ""
echo "▶ Building Daml contracts..."
cd "$DAML_DIR"
daml build

# ---- 2. Start Canton Sandbox ----
echo ""
echo "▶ Starting Canton Sandbox on :6865 ..."
daml sandbox --port 6865 &
SANDBOX_PID=$!
echo "  sandbox PID: $SANDBOX_PID"
sleep 5

# ---- 3. Run Daml Script (setup scenario) ----
echo ""
echo "▶ Running setup script (creates all parties + contracts)..."
daml script \
  --dar .daml/dist/mandate-protocol-0.1.0.dar \
  --script-name Setup:setup \
  --ledger-host localhost \
  --ledger-port 6865 \
  --wall-clock-time

# ---- 4. Start JSON API ----
echo ""
echo "▶ Starting Daml JSON API on :7575 ..."
daml json-api \
  --ledger-host localhost \
  --ledger-port 6865 \
  --http-port 7575 &
JSON_API_PID=$!
echo "  json-api PID: $JSON_API_PID"
sleep 3

# ---- 5. Install Python deps ----
echo ""
echo "▶ Installing Python agent dependencies..."
cd "$AGENT_DIR"
python3 -m pip install -q -r requirements.txt

# ---- 6. Start frontend ----
echo ""
echo "▶ Starting Next.js frontend on :3000 ..."
cd "$FRONTEND_DIR"
npm install -q
npm run dev &
FRONTEND_PID=$!
echo "  frontend PID: $FRONTEND_PID"

echo ""
echo "═══════════════════════════════════════════"
echo "  All services running!"
echo ""
echo "  Dashboard  → http://localhost:3000"
echo "  JSON API   → http://localhost:7575"
echo "  Sandbox    → localhost:6865"
echo ""
echo "  To start the AI agent:"
echo "  cd agent && cp .env.example .env"
echo "  # Add your ANTHROPIC_API_KEY and CANTON_PARTY_ID"
echo "  python3 agent.py"
echo "═══════════════════════════════════════════"

# Trap to clean up on exit
cleanup() {
  echo ""
  echo "Shutting down..."
  kill $SANDBOX_PID $JSON_API_PID $FRONTEND_PID 2>/dev/null
  exit 0
}
trap cleanup INT TERM

wait
