"""
Mandate Protocol — AI Agent Core
Polls the Canton ledger, reasons with Claude, submits actions.
"""

import asyncio
import os
import json
import logging
import httpx
from datetime import datetime
from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import print as rprint

from canton_client import CantonClient
from ai_reasoner import AIReasoner, AgentDecision

load_dotenv()
console = Console()
log = logging.getLogger("mandate-agent")


# ------------------------------------------------------------------ #
#  Mock market prices (replace with Chainlink oracle in production)   #
# ------------------------------------------------------------------ #
MOCK_PRICES = {
    "Bond":     1_000.0,
    "Treasury": 1_000.0,
    "Cash":     1.0,
    "Equity":   150.0,
    "Commodity": 85.0,
}

TEMPLATE = {
    "session":  "MandateProtocol.InstitutionMandate:AgentSession",
    "pool":     "MandateProtocol.CollateralPool:CollateralPool",
    "margin":   "MandateProtocol.CollateralPool:MarginCall",
}


class MandateAgent:
    def __init__(self):
        self.canton = CantonClient(
            base_url=os.getenv("CANTON_JSON_API_URL", "http://localhost:7575"),
            party_id=os.getenv("CANTON_PARTY_ID", ""),
            token=os.getenv("CANTON_TOKEN", ""),
        )
        self.reasoner = AIReasoner(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
        self.session_contract_id = os.getenv("AGENT_SESSION_CONTRACT_ID", "")
        self.poll_interval = int(os.getenv("POLL_INTERVAL_SECONDS", "3"))
        self.action_count = 0

    async def run(self):
        console.print(Panel.fit(
            "[bold green]Mandate Protocol Agent[/bold green]\n"
            "Autonomous treasury management on Canton Network",
            border_style="green",
        ))

        while True:
            try:
                await self._tick()
            except Exception as e:
                console.print(f"[red]Agent error: {e}[/red]")
                log.exception("Agent tick failed")

            await asyncio.sleep(self.poll_interval)

    async def _tick(self):
        # 1. Read ledger state
        session_contract = await self.canton.get_agent_session(self.session_contract_id)
        if not session_contract:
            console.print("[yellow]No active session found — waiting...[/yellow]")
            return

        # Guard: validate session expiry before acting.
        # The Daml contract also enforces this, but checking here avoids
        # burning Claude API tokens on a session that's already expired.
        session_payload = session_contract.payload
        issued_at = session_payload.get("issuedAt")
        valid_for_hours = session_payload.get("validForHours", 0)
        if issued_at and valid_for_hours:
            from datetime import datetime, timezone
            try:
                issued_dt = datetime.fromisoformat(issued_at.replace("Z", "+00:00"))
                elapsed_hours = (datetime.now(timezone.utc) - issued_dt).total_seconds() / 3600
                if elapsed_hours > valid_for_hours:
                    console.print("[yellow]Session expired — waiting for treasury manager to renew[/yellow]")
                    return
            except ValueError:
                pass  # non-parseable timestamp — let the ledger enforce

        pool = await self.canton.get_collateral_pool()
        margin_calls = await self.canton.get_open_margin_calls()

        session = session_contract.payload
        pool_data = pool.payload if pool else None

        # 2. Build events list from open margin calls
        events = []
        for mc in margin_calls:
            events.append({
                "type": "MARGIN_CALL",
                "callId": mc.payload.get("callId"),
                "requiredAmountUSD": mc.payload.get("requiredAmountUSD"),
                "requiredAsset": mc.payload.get("requiredAsset"),
                "deadline": mc.payload.get("deadline"),
                "penaltyUSD": mc.payload.get("penaltyUSD"),
                "contractId": mc.contract_id,
            })

        # 3. Display current state
        self._display_state(session, pool_data, events)

        # 4. Ask Claude to reason
        console.print("[cyan]Asking Claude to reason...[/cyan]")
        result = self.reasoner.reason(session, pool_data, events, MOCK_PRICES)

        self._display_decision(result)

        # 5. Execute if not no_action
        if result.decision == AgentDecision.NO_ACTION:
            console.print("[dim]No action needed this tick.[/dim]")
            return

        if result.confidence < 0.6:
            console.print(f"[yellow]Low confidence ({result.confidence:.0%}) — escalating to human[/yellow]")
            await self._escalate(session_contract, result)
            return

        await self._execute(session_contract, pool, margin_calls, result)

    async def _execute(self, session_contract, pool, margin_calls, result):
        sid = session_contract.contract_id

        try:
            if result.decision == AgentDecision.REBALANCE:
                response = await self.canton.exercise_choice(
                    TEMPLATE["session"], sid, "ExecuteRebalance",
                    {
                        "fromAsset": result.asset,
                        "toAsset": result.to_asset,
                        "amount": result.amount,
                        "aiRationale": result.rationale,
                    }
                )
                self._log_success("Rebalance", result, response)

            elif result.decision == AgentDecision.RESPOND_MARGIN_CALL and margin_calls:
                mc = margin_calls[0]
                response = await self.canton.exercise_choice(
                    TEMPLATE["session"], sid, "RespondToMarginCall",
                    {
                        "callId": mc.payload.get("callId"),
                        "amount": result.amount,
                        "asset": result.asset,
                        "aiRationale": result.rationale,
                    }
                )
                # Also accept on the margin call contract
                await self.canton.exercise_choice(
                    TEMPLATE["margin"], mc.contract_id, "AcceptCall",
                    {
                        "postedAmountUSD": result.amount,
                        "agentSessionId": sid,
                    }
                )
                self._log_success("MarginCallResponse", result, response)

            elif result.decision == AgentDecision.ESCALATE_HUMAN:
                await self._escalate(session_contract, result)

        except httpx.HTTPStatusError as e:
            if "LIMIT_EXCEEDED" in str(e.response.text):
                console.print("[red]✗ Action blocked by ledger — limit exceeded[/red]")
            else:
                console.print(f"[red]✗ Ledger rejected action: {e.response.text}[/red]")

    async def _escalate(self, session_contract, result):
        await self.canton.exercise_choice(
            TEMPLATE["session"],
            session_contract.contract_id,
            "RequestHumanApproval",
            {
                "reason": result.rationale,
                "proposedAmount": result.amount,
                "proposedAsset": result.asset,
                "proposedAction": result.decision.value.title(),
            }
        )
        console.print("[yellow]✓ Escalation request submitted to treasury manager[/yellow]")

    def _display_state(self, session, pool, events):
        self.action_count += 1
        ts = datetime.now().strftime("%H:%M:%S")
        console.rule(f"[dim]Tick #{self.action_count} — {ts}[/dim]")

        if pool:
            t = Table(show_header=False, box=None, padding=(0, 1))
            t.add_row("Pool value", f"${pool.get('totalValueUSD', 0):>12,.0f}")
            t.add_row("Utilization", f"{pool.get('utilizationRatio', 0)*100:>11.1f}%")
            vol_used = session.get("volumeUsedTodayUSD", 0)
            vol_max  = session.get("maxDailyVolumeUSD", 1)
            t.add_row("Daily vol used", f"${vol_used:>10,.0f} / ${vol_max:,.0f}")
            t.add_row("Margin calls", f"{len(events):>12}")
            console.print(t)

    def _display_decision(self, result):
        color = {
            AgentDecision.NO_ACTION:          "dim",
            AgentDecision.REBALANCE:          "cyan",
            AgentDecision.RESPOND_MARGIN_CALL:"yellow",
            AgentDecision.POST_COLLATERAL:    "blue",
            AgentDecision.ESCALATE_HUMAN:     "red",
            AgentDecision.CONFIRM_SETTLEMENT: "green",
        }.get(result.decision, "white")

        console.print(
            f"[{color}]Decision: {result.decision.value.upper()}[/{color}] "
            f"| ${result.amount:,.0f} {result.asset}"
            + (f" → {result.to_asset}" if result.to_asset else "")
            + f" | confidence {result.confidence:.0%}"
        )
        console.print(f"[dim]Rationale: {result.rationale[:120]}...[/dim]")
        if result.risk_flags:
            console.print(f"[yellow]Risk flags: {', '.join(result.risk_flags)}[/yellow]")

    def _log_success(self, action_type, result, response):
        console.print(
            f"[green]✓ {action_type} submitted[/green] — "
            f"rationale stored on-chain in AgentAction"
        )
        if "events" in response:
            for ev in response["events"]:
                if ev.get("templateId", "").endswith("AgentAction"):
                    console.print(f"  [dim]AgentAction contract: {ev.get('contractId', '')[:20]}...[/dim]")


async def main():
    agent = MandateAgent()
    await agent.run()


if __name__ == "__main__":
    asyncio.run(main())
