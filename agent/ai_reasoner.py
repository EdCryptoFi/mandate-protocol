"""AI reasoning engine — uses Claude to decide agent actions."""

import anthropic
import json
from dataclasses import dataclass
from typing import Optional
from enum import Enum


class AgentDecision(Enum):
    REBALANCE = "rebalance"
    POST_COLLATERAL = "post_collateral"
    RESPOND_MARGIN_CALL = "respond_margin_call"
    CONFIRM_SETTLEMENT = "confirm_settlement"
    ESCALATE_HUMAN = "escalate_human"
    NO_ACTION = "no_action"


@dataclass
class ReasoningResult:
    decision: AgentDecision
    amount: float
    asset: str
    to_asset: Optional[str]
    rationale: str       # stored on-chain in AgentAction
    confidence: float    # 0.0–1.0
    risk_flags: list[str]


SYSTEM_PROMPT = """You are an institutional treasury AI agent operating under a Mandate Protocol.

Your role: Manage collateral pools and respond to margin calls on behalf of your institution.

STRICT RULES:
1. You can ONLY act within your AgentSession limits. If an action would exceed limits, escalate.
2. Always give a clear, auditable rationale — it will be stored permanently on the blockchain.
3. Prioritize: (1) margin calls before deadline, (2) portfolio drift correction, (3) optimization.
4. Never expose position sizes to counterparties — your reasoning stays internal.
5. If uncertain, escalate to human rather than guess.

OUTPUT FORMAT (JSON only):
{
  "decision": "rebalance|post_collateral|respond_margin_call|confirm_settlement|escalate_human|no_action",
  "amount": 0.0,
  "asset": "Bond|Treasury|Cash|Equity|Commodity",
  "to_asset": "Bond|Treasury|Cash|null",
  "rationale": "Clear explanation for the audit log",
  "confidence": 0.0,
  "risk_flags": ["flag1", "flag2"]
}"""


class AIReasoner:
    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)

    def reason(
        self,
        session_state: dict,
        pool_state: Optional[dict],
        events: list[dict],
        market_prices: dict[str, float],
    ) -> ReasoningResult:
        """
        Ask Claude to reason about the current state and decide an action.
        Returns a structured decision with an auditable rationale.
        """
        context = self._build_context(session_state, pool_state, events, market_prices)

        message = self.client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": context}],
        )

        raw = message.content[0].text.strip()

        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        data = json.loads(raw)

        return ReasoningResult(
            decision=AgentDecision(data["decision"]),
            amount=float(data.get("amount", 0.0)),
            asset=data.get("asset", "Cash"),
            to_asset=data.get("to_asset"),
            rationale=data["rationale"],
            confidence=float(data.get("confidence", 0.8)),
            risk_flags=data.get("risk_flags", []),
        )

    def _sanitize_event(self, ev: dict) -> dict:
        """Extract only typed, numeric fields from counterparty-controlled event data.
        Counterparties control the content of MarginCall contracts — passing raw text
        fields from the ledger into the Claude prompt would allow prompt injection."""
        allowed_assets = {"Bond", "Treasury", "Cash", "Equity", "Commodity"}
        asset = ev.get("requiredAsset", "Unknown")
        if asset not in allowed_assets:
            asset = "Unknown"
        return {
            "callId": str(ev.get("callId", ""))[:32].replace("\n", "").replace("\r", ""),
            "requiredAmountUSD": max(0.0, float(ev.get("requiredAmountUSD", 0))),
            "requiredAsset": asset,
            "penaltyUSD": max(0.0, float(ev.get("penaltyUSD", 0))),
            "contractId": str(ev.get("contractId", ""))[:64],
        }

    def _build_context(
        self,
        session: dict,
        pool: Optional[dict],
        events: list[dict],
        prices: dict[str, float],
    ) -> str:
        lines = ["=== CURRENT STATE ===\n"]

        lines.append("SESSION LIMITS:")
        lines.append(f"  Actions used today: {session.get('actionsUsedToday', 0)}")
        lines.append(f"  Volume used today: ${session.get('volumeUsedTodayUSD', 0):,.0f}")
        lines.append(f"  Max single action: ${session.get('maxSingleActionUSD', 0):,.0f}")
        lines.append(f"  Max daily volume: ${session.get('maxDailyVolumeUSD', 0):,.0f}")
        lines.append(f"  Margin call limit: ${session.get('marginCallResponseLimitUSD', 0):,.0f}")
        lines.append(f"  Permitted: {session.get('permittedChoices', [])}")
        lines.append(f"  Allowed assets: {session.get('allowedAssets', [])}")

        if pool:
            lines.append("\nCOLLATERAL POOL:")
            lines.append(f"  Total value: ${pool.get('totalValueUSD', 0):,.0f}")
            lines.append(f"  Utilization: {pool.get('utilizationRatio', 0)*100:.1f}%")
            lines.append(f"  Locked: ${pool.get('lockedUSD', 0):,.0f}")
            for h in pool.get("holdings", []):
                pct = (h["valueUSD"] / max(pool["totalValueUSD"], 1)) * 100
                lines.append(f"  {h['asset']}: {h['quantity']:.0f} units = ${h['valueUSD']:,.0f} ({pct:.1f}%)")

        if prices:
            lines.append("\nMARKET PRICES (USD per unit):")
            for asset, price in prices.items():
                lines.append(f"  {asset}: ${price:,.2f}")

        if events:
            lines.append("\nPENDING EVENTS:")
            for ev in events:
                # Sanitize counterparty-controlled fields before injecting into prompt.
                # A malicious counterparty could craft contract payloads to manipulate
                # the AI's decision (prompt injection). Only extract typed, numeric fields.
                safe_ev = self._sanitize_event(ev)
                lines.append(f"  [MARGIN_CALL] callId={safe_ev['callId']} "
                             f"required=${safe_ev['requiredAmountUSD']:,.0f} "
                             f"asset={safe_ev['requiredAsset']} "
                             f"penalty=${safe_ev['penaltyUSD']:,.0f} "
                             f"contractId={safe_ev['contractId'][:20]}...")
        else:
            lines.append("\nNo pending events.")

        lines.append("\n=== DECIDE WHAT TO DO ===")
        lines.append("Analyze the state above. What single action should the agent take right now?")
        lines.append("Respond with JSON only.")

        return "\n".join(lines)
