# Mandate Protocol — Hackathon Submission
### Build on Canton · Encode Club × Canton Network · 2026

---

## Links

| | |
|---|---|
| **Live product** | https://mandate-protocol.vercel.app |
| **GitHub** | https://github.com/EdCryptoFi/mandate-protocol |
| **Demo video** | *(link após gravar)* |
| **Pitch deck** | *(link após exportar)* |

---

## One-liner

> An AI agent that manages institutional treasury operations — with authority limits enforced by the Canton Network ledger, not by trust.

---

## The Problem

Institutions want to automate treasury operations with AI. Three things stop them:

1. **Risk** — giving an AI agent unrestricted access to assets is unacceptable in regulated finance
2. **Privacy** — public chains expose strategy, positions, and counterparties to competitors
3. **Auditability** — *"the AI decided"* is not an acceptable answer to a regulator

Every attempt at autonomous treasury management hits one of these walls.

---

## The Insight

**The problem isn't the AI. It's where authority lives.**

| Old approach | Mandate Protocol |
|---|---|
| Authority encoded in Python → trust the software | Authority encoded in Canton contracts → ledger enforces it |
| Agent can exceed limits if code has a bug | Agent **cannot** exceed limits — ledger rejects the transaction |
| Audit trail is a log file you can edit | Audit trail is an immutable on-chain contract |

---

## How It Works — 3-Layer Authority Model

```
CEO + CFO              ──→  INSTITUTION MANDATE   (absolute ceilings)
                               max single action:  $500,000
                               max daily volume:   $2,000,000
                               expiry:             2026-12-31
                                      ↓ can only tighten

Compliance + Treasury  ──→  OPERATIONAL MANDATE   (risk parameters)
                               margin call limit:  $300,000
                               rebalance threshold: 5% drift
                               target allocations: Bond 38%, Treasury 30%
                                      ↓ can only tighten

Treasury Manager       ──→  AGENT SESSION         (today's token)
                               duration:           8 hours
                               permitted:          CanRebalance ✓
                                                   CanRespondToMarginCall ✓
                                                   CanPostCollateral ✓
                                      ↓ operates here only

Claude AI Agent        ──→  polls ledger · reasons · submits choices
                               all assertMsg checks run before settlement
                               rejected by Canton if any limit exceeded
```

The Canton ledger **physically cannot execute an action that violates a mandate**. This is not a software check — it is a cryptographic enforcement.

---

## What the Agent Manages

| Domain | Autonomous action | Privacy |
|---|---|---|
| **Collateral Pools** | Rebalance when allocation drifts >5% from target | Pool balance private to institution |
| **Margin Calls** | Respond automatically when amount ≤ session limit | Counterparty sees only their leg |
| **DVP Settlements** | Confirm atomic cross-institution delivery-vs-payment | Each side sees only their assets |
| **Escalations** | Create on-chain approval request when action would exceed any limit | Human reviews before canton settles |

---

## The Key Innovation — AI Rationale On-Chain

Every AI decision is stored permanently as an `AgentAction` contract:

```
AgentAction {
  actionType:   MarginCallResponse
  amount:       $180,000 Cash
  counterparty: BankB
  callId:       MC-2026-0042

  aiRationale:  "Margin call MC-2026-0042 from Bank B requires
                 $180K Cash by 16:00 UTC. Penalty $22K if defaulted.
                 Pool holds $988K Cash (18.9% utilization).
                 Margin call limit: $300K — within bounds.
                 Daily volume after: $430K / $2,000K — within bounds.
                 Responding immediately."

  limitChecks:  [margin_call_limit: $180K / $300K ✓]
                [daily_volume_cap: $430K / $2,000K ✓]
                [asset_allowed: Cash ✓]

  damlTx:       TX-0xB7D1…2A9F
  timestamp:    2026-06-12T10:44:00Z
}
```

Regulator sees this. Compliance sees this. The institution sees this.  
**Nobody needs to trust the AI. The ledger is the proof.**

---

## Why This Only Works on Canton

| Canton property | What it enables in Mandate Protocol |
|---|---|
| **Sub-transaction privacy** | BankB never sees BankA's full collateral position |
| **Multi-party atomic settlement** | DVP: both legs settle or neither does — no counterparty risk |
| **Daml authorization model** | `assertMsg` runs inside every choice — agent literally cannot exceed its mandate |
| **Signatory model** | AgentAction requires institution + agent as signatories — non-repudiable |

On Ethereum: trust the contract code.  
On Canton: trust the protocol.

---

## Tracks Covered

| Track | How |
|---|---|
| **Private DeFi** | Institutional collateral pools and margin calls with Canton sub-tx privacy |
| **RWA** | Manages tokenized real-world assets — bonds, treasuries, cash — via Daml contracts |
| **Payments** | Atomic DVP settlement between institutions |
| **Agentic Commerce** | AI agent as the core executor — commerce with cryptographic authority bounds |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart contracts | Daml 2.10 on Canton Network |
| AI reasoning | Claude Sonnet 4.6 (Anthropic) |
| Ledger integration | Canton JSON API v2 |
| Agent runtime | Python 3.12 + asyncio |
| Frontend | Next.js 16 · Tailwind CSS · Three.js · Recharts |
| Security | Zero-Trust AppSec audit · 24/24 tests passing |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  CANTON LEDGER (Daml 2.10)                                  │
│  InstitutionMandate · OperationalMandate · AgentSession      │
│  CollateralPool · MarginCall · AgentAction · DVPSettlement   │
├──────────────────────────────────────────────────────────────┤
│  AI AGENT (Python 3.12 + Claude Sonnet 4.6)                 │
│  Poll ledger every 3s → Reason with Claude → Validate →     │
│  Execute choice → Store AI rationale on-chain               │
├──────────────────────────────────────────────────────────────┤
│  FRONTEND (Next.js 16 + static HTML)                        │
│  Treasury Dashboard · Compliance View · Regulator Audit     │
│  3-role login · Agent session simulator                     │
└──────────────────────────────────────────────────────────────┘
```

---

## Demo Walkthrough (3 minutes)

**Scenario: Margin call arrives during trading hours.**

1. Sign in as **Treasury Manager** at `/login`
2. Dashboard shows active session AGT-2026-001, pool $5.2M, 2 prior actions
3. Click **⚡ Simulate Margin Call** — animation shows:
   - Incoming call from Bank B: $95K Cash, deadline 1h
   - Agent reasoning spinner (checking all session limits)
   - Responded ✓ — AgentAction created on Canton ledger
4. Expand the new action card — see full AI rationale + limit checks
5. Switch to **Regulator** tab — see full audit log with AI reasoning (pool balance hidden by Canton privacy)
6. Go to **Mandate Config** — see the 3-layer authority model with live session data
7. Go to **Agent Sessions** — see blocked margin call MC-2026-0043 ($420K > $300K limit) awaiting human approval

---

## Security Highlights

- **Zero-Trust AppSec audit completed** — 9 vulnerabilities identified and fixed
- **24 security tests passing** (`agent/tests/test_security.py`)
- **SSRF protection** — Canton client validates all URLs, blocks private IPs and cloud metadata
- **Prompt injection protection** — counterparty-controlled ledger fields are sanitized before Claude
- **XSS prevention** — all innerHTML injections escape HTML entities via `sanitize.js`
- **Input schema validation** — all Claude API responses validated before use
- **12 Daml e2e tests** — forced limit violations tested and verified

---

## Team

Built for the **Build on Canton Hackathon** by Encode Club × Canton Network — June 2026.

- Repository: https://github.com/EdCryptoFi/mandate-protocol
- Live: https://mandate-protocol.vercel.app
- Contact: cryptolairbr@gmail.com
