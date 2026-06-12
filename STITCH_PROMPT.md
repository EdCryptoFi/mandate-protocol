# Google Stitch Prompt — Mandate Protocol Frontend

Cole este prompt inteiro no Stitch para gerar o frontend profissional.

---

## PROMPT

Design a professional institutional finance web application called **Mandate Protocol** — an AI-powered treasury automation platform built on Canton Network blockchain.

---

### Brand & Visual Identity

- **Personality:** Institutional, trustworthy, technically credible. Think Bloomberg Terminal meets Vercel Dashboard meets Linear.app.
- **Color palette:**
  - Background primary: `#0B0F1A` (deep navy, NOT pure black)
  - Background secondary: `#111827` (card surfaces)
  - Background tertiary: `#0d1220` (alternate sections)
  - Border default: `#1e293b`
  - Accent primary: `#4F6EF7` (indigo-blue — authority, trust)
  - Accent secondary: `#06b6d4` (cyan — data, activity)
  - Accent success: `#4ade80` (green — confirmed, passed)
  - Accent warning: `#f59e0b` (amber — pending, paused)
  - Accent danger: `#f87171` (red — rejected, alert)
  - Text primary: `#e2e8f0`
  - Text secondary: `#94a3b8`
  - Text muted: `#475569`
- **Typography:** Inter or Geist Sans. Bold (700) for headlines, Medium (500) for labels, Regular (400) for body. Monospace (JetBrains Mono or Geist Mono) for contract IDs, amounts, and code.
- **Border radius:** 12px cards, 8px chips/badges, 16px modals
- **Shadows:** Subtle glow effects using accent colors at 10% opacity (e.g. `box-shadow: 0 0 0 1px #4F6EF710`)

---

### Screen 1: Landing Page (`/`)

**Layout:** Full-width, dark navy, vertically stacked sections.

**Navigation bar (fixed, blur backdrop):**
- Left: Shield icon in indigo square + "Mandate Protocol" wordmark + small "Built on Canton" badge
- Right: "How it works" text link + "Sign In" indigo button

**Hero section:**
- Large headline (60px): *"Where treasury* **flows.**" — "flows" in italic indigo
- Subtitle line: *"Within limits you* **define.**" — "define" in italic cyan
- Body copy (16px, muted): "An AI agent that manages institutional collateral and responds to margin calls — with authority limits enforced by the Canton Network ledger, not by trust."
- Two CTA buttons: Primary "Access Dashboard →" (indigo) + Secondary "How it works" (ghost border)
- Decorative: subtle grid lines (1px, 5% opacity) with radial mask fading out; soft indigo glow blob centered behind headline
- Stats bar below hero (3 columns, bordered box, dark surface):
  - "On-chain" / "Protocol-level rejection" / "Limit enforcement"
  - "100%" / "Immutable audit trail" / "AI decisions logged"
  - "Sub-tx" / "Canton native" / "Privacy model"

**Core properties section (3-column grid):**
Three cards with icon + title + body:
1. 🔒 "Authority in the ledger." — The AI agent's limits are cryptographic contracts. The Canton protocol rejects any action that exceeds them — at the transaction level.
2. 👁 "Privacy fit for regulated institutions." — Counterparties never see your full positions. Regulators see decisions without seeing balances.
3. ⚡ "Decisions recorded, forever." — Every action stored immutably on-chain with AI reasoning.

**Authority Model section (dark navy bg, full width):**
Label: "Authority Model" in small caps indigo
Headline: *"Decentralization with* **control.**"
Four stacked rows (like steps), each with:
- Roman numeral (I, II, III, AI) in colored monospace
- Layer name (Institution Mandate / Operational Mandate / Agent Session / AI Agent)
- Description text
- Each row has a left-border accent in its color (indigo, cyan, violet, green)
- Arrow pointing down between rows

**Operations section (2-column: text left, cards right):**
Left: headline + body copy
Right: 4 cards with checkmark icons:
- Collateral Pools
- Margin Calls
- DVP Settlement
- Audit Trail

**Privacy callout (full-width card, gradient navy):**
Centered, with lock icon, headline: "The regulator sees every decision." + italic "Not your positions."
Three benefit chips below: "AI rationale stored on-chain" / "Positions private by protocol" / "Immutable audit log"

**CTA section:**
Headline: "Delegate with confidence." + body + two buttons + footer

---

### Screen 2: Login Page (`/login`)

**Layout:** Centered card on dark navy background. Max width 420px.

**Elements:**
- Lock icon in indigo rounded square (large, centered)
- Headline: "Access Dashboard"
- Subtitle: "Select your institution and role to continue"
- **Institution dropdown:** Label "Institution" + Building icon + select (Bank A, Bank B)
- **Role cards (3 options, radio-style):**
  - Treasury Manager (selected state: indigo border + glow ring + indigo bg tint)
  - Compliance Officer (selected: cyan)
  - Regulator (selected: violet)
  - Each card: role name (bold) + one-line description
- **"Enter Dashboard" button:** Full width, indigo, with chevron →
- **Loading state:** Button shows spinner + "Connecting to ledger..."
- Footer note: "Connected to Canton Sandbox · No real assets" in muted text

---

### Screen 3: Dashboard (`/dashboard`) — Treasury Manager View

**Layout:** Full-height app. Fixed header + tab bar + scrollable content.

**Header:**
- Left: Shield icon + "Mandate Protocol" + "Autonomous Treasury · Canton Network" subtitle
- Right: Green pulsing dot + "Agent Active" label + "⚡ Simulate Margin Call" amber ghost button + "Pause Agent" yellow ghost button

**Tab bar:** Three tabs: "Treasury Manager" | "Compliance" | "Regulator"
Active tab: white text + indigo bottom border. Inactive: gray.

**Treasury Manager tab content:**

*Top stat cards (4-column grid):*
- Pool Value: "$5.20M" / "32% utilized" / trend-up icon in indigo
- Daily Volume Used: "12%" / "$250k of $2.0M" / activity icon in cyan
- Actions Today: "2" / "All within limits" / checkmark icon in green
- Session Valid: "8h" / "3 permitted choices" / clock icon in indigo

*Two-column section:*
Left — "Collateral Allocation" card:
- Donut/ring chart with 3 segments: Bond (indigo 60%), Treasury (cyan 30%), Cash (green 10%)
- Legend below: each row shows color dot + asset name + percentage + USD amount

Right — "Daily Volume Usage" card (spans 2 columns):
- Area chart with indigo gradient fill
- X-axis: time labels (09:00 to Now)
- Y-axis: dollar amounts
- Dotted reference line at 80% threshold

*Session Limits card (full width):*
Three progress bars:
- Daily Volume: 12.5% filled (indigo)
- Margin Call Limit (per call): 0% (indigo)
- Single Action Cap: 0% (indigo)
Each bar: label left, "$used / $max" right, colored fill bar

*Agent Activity Feed (full width):*
Header: "Agent Activity Feed" + "Click to see AI rationale stored on-chain" muted hint

Two action rows (collapsed by default, expandable):

**Row 1 — Rebalance:**
- Cyan chip: "Rebalance"
- Text: "$100,000 Bond → Treasury"
- Time: "10:32 AM"
- Green checkmark icon
- Expanded state reveals:
  - 🔒 "AI Rationale (stored on-chain)" label
  - Gray rounded box: "Portfolio drifted: Bond at 67% (target 60%), Treasury at 23% (target 30%). Rebalancing $100k to restore target allocation. Market conditions stable."
  - Three green monospace chips: "single_action_cap ✓ $100,000 ≤ $500,000" etc.

**Row 2 — MarginCallResponse:**
- Amber chip: "MarginCallResponse"
- Text: "$150,000 Treasury"
- Time: "12:47 PM"
- Green checkmark
- Same expandable AI rationale pattern

**Live simulation banners (appear between stat cards and feed during simulation):**
- Incoming: orange/amber background, pulsing, "Margin Call Incoming — MC-2026-0055 · BankC · $80k Treasury · Deadline 1h"
- Reasoning: indigo background, spinner, "Agent Reasoning..." + subtitle
- Responded: green background, checkmark, "Margin Call Responded — $80k Treasury posted · AI rationale stored on-chain"

---

### Screen 4: Dashboard — Compliance Tab

Three stat cards: Risk Exposure 32% / Limit Violations 0 / Human Escalations 0

Full-width card: "Operational Mandate Parameters"
- 8-row table, alternating subtle borders
- Left: parameter name (muted) / Right: value (white, monospace)
- Parameters: Target Bond Allocation / Target Treasury Allocation / Target Cash / Rebalance Threshold / Margin Call Limit / Max Single Action / Max Daily Volume / Allowed Assets

---

### Screen 5: Dashboard — Regulator Tab

**Privacy banner (indigo bg, full width):**
Lock icon + "Privacy Preserved" bold + "Full agent audit log with AI rationale visible. Collateral pool balances are private to the institution (Canton sub-transaction privacy)."

**Audit Log card:**
"Full Agent Audit Log — AgentAction Contracts"

Two expandable audit entries, each showing:
- Top row: contract ID (indigo monospace) + action type + timestamp (right-aligned)
- 3-column metadata: Amount / Asset / Human Approved
- 🔒 "AI Rationale (on-chain)" label + gray box with full text
- Green monospace chips: each limit check passed

---

### Interaction Notes

- All cards: `hover:border-opacity-60` subtle lift
- Action rows: expand/collapse with smooth height animation
- Simulation button: triggers 3-phase animated sequence with state banners
- Pause Agent: toggles between yellow "Pause" and green "Resume" states
- Tab switching: instant, no animation needed
- Mobile: single column stacking, collapsed navigation

---

### What NOT to do

- No white backgrounds anywhere
- No rounded corners larger than 16px
- No drop shadows (only border + glow)
- No bright colors — everything desaturated to fit dark institutional palette
- No animations on page load (except hero fade-in)
- No illustrations or icons larger than 24px in content areas
- No comic sans, rounded sans, or display fonts

---

### Reference aesthetic

The design should feel like: **Canton Network website** (institutional navy) meets **Linear.app** (crisp dark dashboard) meets **Vercel dashboard** (clean data presentation).

Target user: a CFO or Head of Treasury at a major financial institution. They expect precision, not playfulness.
