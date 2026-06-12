"""Canton JSON API client — wraps all ledger interactions."""

import httpx
import json
import os
from typing import Any, Optional
from dataclasses import dataclass


@dataclass
class Contract:
    contract_id: str
    template_id: str
    payload: dict[str, Any]


class CantonClient:
    """Thin async client over the Canton HTTP JSON API v2."""

    def __init__(
        self,
        base_url: str = "http://localhost:7575",
        party_id: str = "",
        token: str = "",
    ):
        self.base_url = base_url.rstrip("/")
        self.party_id = party_id

        # Security: enforce HTTPS for any non-localhost endpoint.
        # Canton DevNet/MainNet require TLS. Sandbox on localhost is the only exception.
        is_localhost = any(h in self.base_url for h in ("localhost", "127.0.0.1", "0.0.0.0"))
        if not is_localhost and self.base_url.startswith("http://"):
            raise ValueError(
                f"TLS required for non-localhost Canton endpoints. "
                f"Use https:// for: {self.base_url}"
            )

        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        self._client = httpx.AsyncClient(
            base_url=self.base_url,
            headers=headers,
            timeout=30.0,
            verify=not is_localhost,  # enforce cert verification for DevNet/MainNet
        )

    async def close(self):
        await self._client.aclose()

    # ------------------------------------------------------------------ #
    #  Query helpers                                                       #
    # ------------------------------------------------------------------ #

    async def query_contracts(self, template_id: str) -> list[Contract]:
        """Return all active contracts of a given template visible to our party."""
        resp = await self._client.post(
            "/v2/query",
            json={
                "templateIds": [template_id],
                "readers": [self.party_id],
            },
        )
        resp.raise_for_status()
        data = resp.json()
        results = []
        for item in data.get("activeContracts", []):
            results.append(Contract(
                contract_id=item["contractId"],
                template_id=template_id,
                payload=item["payload"],
            ))
        return results

    async def get_contract(self, contract_id: str) -> Optional[Contract]:
        """Fetch a single contract by ID."""
        resp = await self._client.post(
            "/v2/query",
            json={
                "contractIds": [contract_id],
                "readers": [self.party_id],
            },
        )
        resp.raise_for_status()
        data = resp.json()
        contracts = data.get("activeContracts", [])
        if not contracts:
            return None
        item = contracts[0]
        return Contract(
            contract_id=item["contractId"],
            template_id=item["templateId"],
            payload=item["payload"],
        )

    # ------------------------------------------------------------------ #
    #  Command helpers                                                     #
    # ------------------------------------------------------------------ #

    async def exercise_choice(
        self,
        template_id: str,
        contract_id: str,
        choice_name: str,
        choice_args: dict[str, Any],
    ) -> dict[str, Any]:
        """Exercise a choice on a contract."""
        resp = await self._client.post(
            "/v2/exercise",
            json={
                "templateId": template_id,
                "contractId": contract_id,
                "choice": choice_name,
                "argument": choice_args,
                "actAs": [self.party_id],
            },
        )
        resp.raise_for_status()
        return resp.json()

    async def create_contract(
        self,
        template_id: str,
        payload: dict[str, Any],
    ) -> str:
        """Create a contract, return the new contract ID."""
        resp = await self._client.post(
            "/v2/create",
            json={
                "templateId": template_id,
                "payload": payload,
                "actAs": [self.party_id],
            },
        )
        resp.raise_for_status()
        return resp.json()["contractId"]

    # ------------------------------------------------------------------ #
    #  Specific domain queries                                             #
    # ------------------------------------------------------------------ #

    async def get_agent_session(self, session_contract_id: str) -> Optional[Contract]:
        return await self.get_contract(session_contract_id)

    async def get_open_margin_calls(self) -> list[Contract]:
        all_calls = await self.query_contracts(
            "MandateProtocol.CollateralPool:MarginCall"
        )
        return [c for c in all_calls if c.payload.get("isOpen") is True]

    async def get_collateral_pool(self) -> Optional[Contract]:
        pools = await self.query_contracts(
            "MandateProtocol.CollateralPool:CollateralPool"
        )
        return pools[0] if pools else None

    async def get_recent_actions(self, limit: int = 20) -> list[Contract]:
        actions = await self.query_contracts(
            "MandateProtocol.InstitutionMandate:AgentAction"
        )
        return actions[-limit:]
