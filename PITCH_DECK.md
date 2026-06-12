# Mandate Protocol — Pitch Deck Structure

> Use this as the script for your 10-slide deck + 3-minute demo video.

---

## Slide 1 — Title

**Mandate Protocol**
*Autonomous treasury intelligence, with authority you can trust.*

Built on Canton Network | Build on Canton Hackathon 2026

---

## Slide 2 — The Problem (30 seconds)

**Institutions want to automate treasury operations. They can't.**

Three blockers:

1. **Risk** — AI agents with unconstrained access are unacceptable in regulated finance
2. **Privacy** — public chains expose strategy, positions, and counterparties
3. **Auditability** — "the AI did it" is not an acceptable answer to a regulator

> Every attempt at autonomous treasury management hits one of these walls.

---

## Slide 3 — The Insight

**The problem isn't AI. It's where authority lives.**

Current approach: authority in code → trusting the software to behave
Mandate Protocol: authority in the ledger → ledger enforces behavior

> If the ledger rejects the transaction, the agent cannot act.
> Not because we coded a check. Because the protocol doesn't allow it.

---

## Slide 4 — How It Works (the 3 layers)

**Authority flows down. It can only tighten, never loosen.**

```
CEO + CFO           → Institution Mandate  (absolute ceilings)
Compliance + Treasury → Operational Mandate (risk parameters)
Treasury Manager    → Agent Session         (today's permissions)
AI Agent            → operates here only
```

Visual: three-layer diagram with arrows only pointing down.

Key point: **The ledger asserts every limit before every action executes.**

---

## Slide 5 — What the Agent Manages

Three domains. All private. All auditable.

| Domain | Agent Action | Privacy |
|--------|-------------|---------|
| Collateral Pools | Rebalance when drift >5% | Pool balance private to institution |
| Margin Calls | Respond automatically within session limit | Counterparty sees only their leg |
| DVP Settlements | Confirm atomic cross-institution delivery | Each side sees only their assets |

If action exceeds limits → agent escalates to human (on-chain request)

---

## Slide 6 — The Key Innovation

**Every AI decision is stored permanently on-chain, with its reasoning.**

```
AgentAction {
  actionType:   MarginCallResponse
  amount:       $150,000 Treasury
  aiRationale: "Margin call from BankB. Deadline 2h.
                $15k penalty if default. Pool has $480k
                Treasury available. Responding now."
  limitChecks:  [margin_call_limit ✓, daily_cap ✓, asset ✓]
  timestamp:    2026-06-09T12:47:33Z
}
```

Regulator sees this. Compliance sees this. The institution sees this.
**Nobody needs to trust the AI. The ledger is the proof.**

---

## Slide 7 — Canton: Why This Only Works Here

Three Canton properties that make this possible:

| Property | What it enables |
|----------|----------------|
| **Sub-transaction privacy** | BankB never sees BankA's full position |
| **Multi-party atomic settlement** | DVP: both legs settle or neither does |
| **Daml authorization model** | Agent literally cannot exceed its mandate — ledger rejects it |

> On Ethereum, you'd need to trust the contract code.
> On Canton, you can trust the protocol.

---

## Slide 8 — Demo (live in video)

**Scenario: A margin call arrives during trading hours.**

1. BankB posts a MarginCall contract for $150k Treasury
2. Agent detects it (ledger polling)
3. Agent checks: within margin call limit ($200k) ✓, daily volume ✓, asset ✓
4. Claude reasons: "Responding avoids $15k penalty. Act now."
5. Agent calls `RespondToMarginCall` on the AgentSession contract
6. Ledger asserts all limits — transaction approved
7. AgentAction created with full AI rationale
8. Dashboard updates in real time

**Then show:** agent tries to exceed daily limit → ledger rejects → dashboard shows block

---

## Slide 9 — Tracks Covered

| Track | Coverage |
|-------|---------|
| **Private DeFi** | Collateral pools, margin calls, institutional OTC-style settlement |
| **RWA** | Manages tokenized bonds, treasuries, cash holdings |
| **Payments** | Atomic DVP cross-institution settlement |
| **Agentic Commerce** | AI agent as the core — commerce with cryptographic authority bounds |

---

## Slide 10 — Vision & Ask

**Near term:** pilot with two institutions on Canton DevNet
**Medium term:** multi-agent treasury networks with cross-institution composability
**Long term:** the authority layer for all institutional AI agents on Canton

> "Every institution that deploys an AI agent needs a Mandate.
> We built the protocol."

Tech Stack: Daml · Canton Network · Claude API · Next.js

GitHub: [link] | Live Demo: [link]

---

## Video Script (3 minutes)

### 0:00–0:30 — Hook
"Institutions want to automate treasury. The problem isn't the AI — it's that nobody wants to give an AI agent unlimited access to their assets. Mandate Protocol solves that by encoding the AI's authority directly into Canton Network contracts."

### 0:30–1:00 — The Problem
Show the three blockers. Keep it fast. One sentence each.

### 1:00–1:45 — How It Works
Show the 3-layer diagram. Walk through: CEO signs Institution Mandate → compliance sets parameters → treasury issues agent session → agent operates within it.

### 1:45–2:30 — Live Demo
Screen recording:
1. Dashboard showing active session and pool
2. Margin call arrives (simulate by creating contract)
3. Agent detects, reasons, executes — show the reasoning streaming
4. AgentAction contract appears with AI rationale
5. Regulator view: audit log visible, pool balance not visible

### 2:30–3:00 — Close
"The AI agent is not trusted. The ledger is. That's the difference between a demo and a product institutions can actually deploy."

---

## Submission Checklist

- [ ] Public GitHub repository
- [ ] This README as the project description
- [ ] Presentation deck (10 slides, use structure above)
- [ ] 3-minute video pitch with live demo
- [ ] Link to live product:
  - [ ] Frontend deployed on Vercel (free)
  - [ ] Daml sandbox recorded or Canton DevNet deployed

### Deploy Frontend to Vercel (5 minutes)
```bash
cd frontend
npx vercel --prod
# → gives you a live URL
```

### Record the Demo
Tools: QuickTime (Mac) or Loom
Record: `./scripts/start-local.sh` running, then open http://localhost:3000
Show all 3 tabs. Simulate a margin call via `daml navigator`.
