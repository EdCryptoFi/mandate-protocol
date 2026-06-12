# Mandate Protocol — User Guide

> How institutional treasury automation works, explained for the people who use it.

---

## Who Uses Mandate Protocol

There are 4 roles. Each sees a different view and has different powers:

```
CEO / CFO
  └─ Sets the rules nobody can break (Institution Mandate)

Compliance Officer
  └─ Sets risk parameters within those rules (Operational Mandate)

Treasury Manager
  └─ Configures the AI agent and monitors operations (Agent Session)

Regulator
  └─ Sees all AI decisions and their reasoning — but not your positions
```

---

## The Core Idea: Authority Encoded, Not Assumed

Traditional treasury automation trusts the software to behave.
Mandate Protocol trusts the **ledger** to enforce behavior.

The AI agent's authority is not a policy document.
It is a cryptographic contract — the ledger rejects anything outside it.

---

## Step-by-Step: Setting Up Your Institution

### Step 1 — CEO + CFO Create the Institution Mandate

This is your institution's "constitution." It takes two signatures.

**You define:**
- Which assets the agent can ever touch (e.g. Bond, Treasury, Cash)
- Which counterparties the agent can interact with (e.g. BankB, BankC)
- The absolute ceiling for any single operation (e.g. max $500,000 per action)
- The absolute ceiling for total daily volume (e.g. max $2,000,000/day)
- The mandate expiry date

**Once signed, nobody — not even the CEO — can exceed these limits without revoking and reissuing the mandate.**

---

### Step 2 — Compliance + Treasury Issue Operational Parameters

The Compliance Officer and Treasury Manager set the day-to-day operating parameters. These can only be tighter than the Institution Mandate — never looser.

**Compliance sets:**
- Maximum the agent can post in a single margin call response (e.g. $200,000)
- Risk thresholds that trigger alerts or pauses

**Treasury Manager sets:**
- Target allocation for each asset class:
  ```
  Bond     → 60% of portfolio
  Treasury → 30% of portfolio
  Cash     → 10% of portfolio (never posted as collateral)
  ```
- Rebalance threshold: how far an asset can drift before the agent acts (e.g. 5%)
- Which collateral pools the agent monitors

---

### Step 3 — Treasury Manager Issues an Agent Session

When the Treasury Manager is ready to activate the AI agent, they issue a Session — a time-limited token that specifies exactly what the agent can do today.

**The Treasury Manager chooses:**
- Session duration (e.g. 8 hours for a trading day)
- Which actions are permitted in this session:
  - Can Rebalance?
  - Can Respond to Margin Calls?
  - Can Post Collateral?

**The session expires automatically.** It must be renewed for each operating period. This is a deliberate safety design.

---

## What the Agent Does Automatically

Once a Session is active, the AI agent polls the ledger every few seconds and acts autonomously for these events:

### Portfolio Drift → Rebalance

```
If Bond position drifts from 60% to 67%:

Agent detects drift.
Agent reasons: "Bond over target by 7%. Treasury under by 7%.
               Rebalance $100k Bond → Treasury.
               Within single action cap. Within daily volume."
Agent executes rebalance.
Audit log created with full AI reasoning, stored on-chain.
```

### Incoming Margin Call → Automatic Response

```
BankB sends margin call: "Need $150k Treasury within 2 hours."

Agent detects margin call.
Agent checks: $150k < margin call limit ($200k) ✓
              $150k < daily volume remaining ($1.75M) ✓
              Treasury in allowed assets ✓
Agent reasons: "Responding now avoids $15k penalty."
Agent posts $150k Treasury.
Both ledgers update atomically — BankB confirms receipt.
Audit log created.
```

### Action Exceeds Limits → Escalation

```
Margin call arrives for $350,000 (above $200k limit).

Agent detects it cannot respond autonomously.
Agent creates an ApprovalRequest on-chain.
Treasury Manager receives alert.
Treasury Manager reviews and approves or rejects.
```

---

## What Requires Human Action

The agent **always escalates** in these situations:

| Situation | Who Acts |
|-----------|----------|
| Action would exceed daily volume | Treasury Manager |
| Margin call above response limit | Treasury Manager |
| Unfamiliar counterparty | Treasury Manager |
| Session expired | Treasury Manager (renew session) |
| Emergency pause triggered | Compliance Officer or Institution |
| Asset not in whitelist | Treasury Manager (adjust mandate) |

---

## What the Regulator Sees

The Regulator has read access to all `AgentAction` contracts across institutions.

**What they CAN see:**
- Every action the agent took (type, amount, asset, timestamp)
- The AI's reasoning for each decision — verbatim, stored on-chain permanently
- Which limit checks were performed and whether they passed
- Whether a human approved the action

**What they CANNOT see:**
- The institution's total collateral pool balance
- The institution's full position breakdown
- Actions by other institutions (each regulator sees their supervised institutions)

This is enforced by **Canton's sub-transaction privacy** at the protocol level — not by a permission flag in the app.

---

## Dashboard Views

### Treasury Manager Dashboard

```
┌─────────────────────────────────────────────────────┐
│  Pool Value: $5.2M          Utilization: 32%        │
│  Daily Volume: 12.5% used   Actions Today: 2        │
├─────────────────────────────────────────────────────┤
│  Allocation              Volume Usage               │
│  [Pie Chart]             [Area Chart]               │
│  Bond:     60% ●         ████░░░░░░  12.5%          │
│  Treasury: 30% ●                                    │
│  Cash:     10% ●                                    │
├─────────────────────────────────────────────────────┤
│  Session Limits                                     │
│  Daily Volume    ████░░░░░░  $250k / $2M            │
│  Margin Call     ░░░░░░░░░░  $0 / $200k             │
│  Single Action   ░░░░░░░░░░  $0 / $500k             │
├─────────────────────────────────────────────────────┤
│  Activity Feed                                      │
│  [Rebalance]  $100k Bond → Treasury   10:32am  ✓   │
│  [MarginCall] $150k Treasury posted   12:47pm  ✓   │
│  ↕ click to see AI rationale stored on-chain        │
└─────────────────────────────────────────────────────┘
```

**Controls:** Pause Agent | Expand Limit | Revoke Session

---

### Compliance View

- Current limit utilization across all pools
- Operational Mandate parameters (with ability to tighten)
- Alert conditions status
- Escalation requests awaiting approval

---

### Regulator View

- Full audit log of every AgentAction
- AI rationale for each decision
- Limit checks performed (which limits, what was checked, pass/fail)
- Exportable for compliance reporting

---

## Security Model

| Layer | What Protects It |
|-------|-----------------|
| Institution identity | Canton party cryptography |
| Agent authority | On-chain assertions in Daml contracts |
| Privacy of positions | Canton sub-transaction privacy (protocol-level) |
| Audit trail | Immutable on-chain contracts (signatory: institution + agent) |
| Session expiry | Time-limited AgentSession contracts |
| Emergency stop | EmergencyPause choice available to institution or compliance |

**No password, no admin panel, no security through obscurity.**
The contracts are the security.

---

## Glossary

| Term | Meaning |
|------|---------|
| **Party** | A cryptographic identity on the Canton ledger (your institution, your agent, the regulator) |
| **Contract** | An agreement on the ledger — exists until consumed or archived |
| **Choice** | An action a party can take on a contract |
| **Signatory** | A party whose signature created the contract and who cannot be removed |
| **Observer** | A party that can see the contract but cannot act on it |
| **Sub-transaction privacy** | Canton's guarantee that each party only sees the parts of a transaction relevant to them |
| **AgentAction** | An immutable audit log entry created every time the agent acts |
| **Session** | A time-limited authorization token for the AI agent |
| **Mandate** | The contractual definition of what the agent is allowed to do |
| **DVP** | Delivery-vs-Payment: atomic settlement where both legs execute or neither does |
