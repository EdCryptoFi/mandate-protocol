# Mandate Protocol

> **Autonomous treasury intelligence, with authority you can trust.**

An AI agent that manages institutional collateral and treasury operations — with authority limits enforced by the Canton Network ledger, not by trust.

Built for the **Build on Canton Hackathon** by Encode Club × Canton Network.

---

## The Problem

Institutions want to automate treasury operations with AI, but face three blockers:

1. **Risk** — giving an AI agent unrestricted access is unacceptable
2. **Privacy leakage** — executing on public chains exposes strategy and positions
3. **Auditability** — regulators need to see *why* the agent acted, not just *what* it did

## The Solution

Mandate Protocol solves all three by encoding the AI agent's authority directly into Canton Network smart contracts.

- The **ledger enforces limits** cryptographically — the agent cannot exceed them even if compromised
- **Canton's sub-transaction privacy** ensures counterparties never see your full positions
- **Every AI decision is stored on-chain** alongside the reasoning — a permanent, tamper-proof audit trail

---

## How It Works — 3-Layer Authority

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1 — Institution Mandate                         │
│  Signed by: CEO + CFO                                  │
│  Sets: absolute ceilings (assets, counterparties,      │
│        max daily volume, max single action)            │
│  Cannot be exceeded by anyone                          │
├─────────────────────────────────────────────────────────┤
│  LAYER 2 — Operational Mandate                         │
│  Signed by: Compliance Officer + Treasury Manager      │
│  Sets: target allocations, rebalance thresholds,       │
│        margin call response limits                     │
│  Can only tighten Layer 1, never loosen it             │
├─────────────────────────────────────────────────────────┤
│  LAYER 3 — Agent Session (time-limited token)          │
│  Issued by: Treasury Manager                           │
│  Sets: permitted choices, expires in N hours           │
│  The AI agent operates exclusively within this layer   │
└─────────────────────────────────────────────────────────┘
```

The ledger **asserts all limits before any choice executes**. If the agent tries to exceed a limit — due to a bug, a compromised API key, or a bad AI decision — the transaction is rejected at the protocol level.

---

## What the Agent Manages

| Domain | Operations |
|--------|-----------|
| **Collateral Pools** | Monitor holdings, rebalance when allocation drifts >5% |
| **Margin Calls** | Respond automatically when amount ≤ session limit |
| **DVP Settlements** | Confirm atomic cross-institution delivery-vs-payment |
| **Escalations** | Request human approval when action would exceed limits |

**Supported assets:** Bond, Treasury, Cash (configurable per mandate)

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  CANTON LEDGER (Daml)                                   │
│  InstitutionMandate → OperationalMandate → AgentSession  │
│  CollateralPool | MarginCall | AgentAction | Settlement  │
├──────────────────────────────────────────────────────────┤
│  AGENT CORE (Python + Claude API)                       │
│  Poll events → Reason with Claude → Validate → Execute  │
│  AI rationale stored on-chain in every AgentAction      │
├──────────────────────────────────────────────────────────┤
│  FRONTEND (Next.js)                                     │
│  Treasury Dashboard | Compliance View | Regulator Audit │
└──────────────────────────────────────────────────────────┘
```

---

## Hackathon Tracks Covered

| Track | How Mandate Protocol covers it |
|-------|-------------------------------|
| **Private DeFi** | Collateral pools and margin calls between institutions, fully private (Canton sub-tx privacy) |
| **RWA** | Manages tokenized real-world assets: bonds, treasuries, cash |
| **Payments** | Atomic DVP settlement flows between institutions |
| **Agentic Commerce** | AI agent executes financial operations autonomously within cryptographic authority bounds |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Daml 2.10 on Canton Network |
| AI Reasoning | Claude claude-sonnet-4-6 (Anthropic) |
| Ledger Integration | Canton JSON API v2 |
| Agent Runtime | Python 3.12 + asyncio |
| Frontend | Next.js 16 + Tailwind CSS + Recharts |
| Local Dev | Canton Sandbox |

---

## Local Setup

### Prerequisites

```bash
# 1. Install Java 17
brew install openjdk@17
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

# 2. Install Daml SDK
curl -sSL https://get.daml.com/ | sh
export PATH="$HOME/.daml/bin:$PATH"

# 3. Python 3.9+ and Node 18+ (already required)
```

### Run everything

```bash
# Clone and enter project
cd mandate-protocol

# Start full local stack (sandbox + JSON API + frontend)
./scripts/start-local.sh
```

The script will:
1. Build Daml contracts
2. Start Canton Sandbox on `:6865`
3. Run the full test scenario (12 steps, all passing)
4. Start JSON API on `:7575`
5. Start Next.js dashboard on `:3000`

### Configure and run the AI agent

```bash
cd agent
cp .env.example .env
# Edit .env: add ANTHROPIC_API_KEY and CANTON_PARTY_ID from sandbox output
python3 -m pip install -r requirements.txt
python3 agent.py
```

---

## Daml Contract Tests

The `Setup.daml` script tests 12 scenarios end-to-end:

| Step | Test |
|------|------|
| 1 | Institution Mandate created with multi-sig |
| 2 | Operational Mandate issued (compliance + treasury) |
| 3 | Agent Session issued with permitted choices |
| 4 | Agent executes rebalance within limits |
| 5 | AgentAction audit log verified on-chain |
| 6 | Counterparty sends margin call |
| 7 | Agent responds to margin call automatically |
| 8 | Margin call closed successfully |
| 9 | Session volume usage tracked correctly |
| 10 | **Over-limit action rejected by ledger** ✓ |
| 11 | **Disallowed asset rejected by ledger** ✓ |
| 12 | Cross-institution DVP settled atomically |

```bash
./scripts/test-daml.sh
# → All 12 tests pass
```

---

## Project Structure

```
mandate-protocol/
├── daml/
│   ├── daml.yaml
│   └── daml/
│       ├── Types.daml              # Asset classes, choice types, limit checks
│       ├── InstitutionMandate.daml # 3-layer authority + AgentAction audit log
│       ├── CollateralPool.daml     # Pool, MarginCall, DVP Settlement
│       └── Setup.daml              # End-to-end test scenario
├── agent/
│   ├── canton_client.py            # Async Canton JSON API client
│   ├── ai_reasoner.py              # Claude integration, structured decisions
│   ├── agent.py                    # Main loop: poll → reason → execute
│   └── requirements.txt
├── frontend/
│   └── app/
│       └── page.tsx                # Treasury, Compliance, Regulator dashboards
└── scripts/
    ├── start-local.sh              # Full stack bootstrap
    └── test-daml.sh                # Daml test runner
```

---

## The Key Innovation

**AI rationale stored permanently on-chain.**

Every `AgentAction` contract contains the full reasoning the AI used to make its decision:

```
AgentAction {
  actionType:   MarginCallResponse
  amount:       $150,000
  asset:        Treasury
  aiRationale: "Margin call MC-2026-0042 from BankB requires $150k Treasury
                by deadline in 2h. Pool has $480k Treasury available (32%
                utilization). Penalty of $15k if defaulted. Responding
                immediately to avoid penalty. Amount within margin call
                limit ($200k) and daily volume remaining."
  limitChecks:  [margin_call_limit ✓, single_action_cap ✓, daily_vol ✓]
  humanApproved: false
}
```

Regulators and compliance can query every decision the agent ever made — what it did, why, and which limits were checked — without ever seeing the institution's full position.

---

## Team

Built at the **Build on Canton Hackathon** by Encode Club × Canton Network, June 2026.

---

## License

MIT
