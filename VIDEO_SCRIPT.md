# Mandate Protocol — Video Script
**Duration:** 3:00 exatas | **Format:** Screen recording + narração
**Tool:** QuickTime (Mac) ou Loom | **Resolution:** 1920×1080

---

## Setup antes de gravar

```
1. Abrir Chrome em localhost:3000
2. Zoom do browser: 90% (mais conteúdo visível)
3. Dashboard em segundo plano: abrir localhost:3000/dashboard e expandir
   ACT-001 (Rebalance) para mostrar o AI rationale já aberto
4. VS Code aberto com InstitutionMandate.daml — linha 95 (assertMsg) visível
5. Microfone testado, silêncio no ambiente
```

---

## BLOCO 1 — O PROBLEMA [0:00 – 0:18]
**Tela:** Fundo preto ou slide simples. Sem site ainda.

> *"Institutions want to automate treasury operations with AI.*
> *The problem isn't the AI.*
> *The problem is: where does authority live?*
> *If it lives in code — you're trusting software.*
> *If it lives in the ledger — the protocol enforces it.*
> *That's the difference between a demo and something institutions can actually deploy."*

**Palavras:** 52 | **Pace:** lento, pausado | **Tom:** direto, sem hype

---

## BLOCO 2 — SOLUÇÃO + LANDING PAGE [0:18 – 0:40]
**Tela:** Abrir localhost:3000. Scroll lento até o "How It Works".

**Ação na tela:**
- [0:18] Site carrega — parar no hero "Where treasury flows. Within limits you define."
- [0:25] Scroll devagar até a seção "Authority Model" — mostrar os 3 blocos azuis + bloco verde do agente

> *"This is Mandate Protocol — an AI treasury agent built on Canton Network.*
> *The agent's authority flows through three cryptographic layers.*
> *Institution Mandate sets the absolute ceiling.*
> *Operational Mandate sets the risk parameters.*
> *The Agent Session is the time-limited token the AI operates within.*
> *Each layer can only tighten the one above. Never loosen it."*

**Palavras:** 58 | **Dedo apontando** para cada bloco enquanto fala

---

## BLOCO 3 — LOGIN [0:40 – 0:52]
**Tela:** Clicar "Access Dashboard" no header. Página de login carrega.

**Ação na tela:**
- Institution: "Bank A" (já selecionado)
- Role: clicar em "Treasury Manager" (fica highlighted em azul)
- Clicar "Enter Dashboard" — mostrar o loading "Connecting to ledger..."

> *"We're logging in as the Treasury Manager at Bank A.*
> *Each stakeholder — Treasury, Compliance, Regulator — sees a completely different view.*
> *The ledger enforces what each can access."*

**Palavras:** 32

---

## BLOCO 4 — DASHBOARD OVERVIEW [0:52 – 1:18]
**Tela:** Dashboard carrega na aba Treasury Manager.

**Ação na tela:**
- [0:52] Mostrar os 4 stat cards: Pool $5.2M | 12% vol | 2 actions | 8h session
- [1:00] Hover devagar no pie chart (Bond 60%, Treasury 30%, Cash 10%)
- [1:06] Apontar para as Session Limit bars (Daily Volume: 12% usado)

> *"The collateral pool is $5.2 million — bonds, treasuries, and cash.*
> *The agent has already executed two operations today.*
> *It consumed $250,000 of the $2 million daily volume limit.*
> *The session expires in 8 hours — after that, the treasury manager must renew it."*

**Palavras:** 50

---

## BLOCO 5 — O MOMENTO CENTRAL: AI RATIONALE ON-CHAIN [1:18 – 1:55]
**Tela:** Activity Feed. ACT-001 já está expandida mostrando o rationale.

**Ação na tela:**
- [1:18] Câmera já mostra o rationale expandido do ACT-001 (Rebalance)
- [1:20] Apontar para o texto "AI Rationale (stored on-chain)" com ícone de cadeado
- [1:28] Apontar para os limit checks verdes: single_action_cap ✓ / daily_volume_cap ✓

> *"Here's what makes this different from every other AI treasury product.*
> *Every action the agent takes creates an immutable contract on the Canton ledger.*
> *This reasoning is stored permanently — verbatim, tamper-proof.*
> *Bond drifted to 67%. Target is 60%. Agent rebalanced $100,000.*
> *Three limits checked. All passed. On-chain."*

**Palavras:** 57

- [1:42] Clicar no ACT-002 (MarginCallResponse) para expandir

> *"And here — a margin call from Bank B. $150,000 Treasury required.*
> *$15,000 penalty if defaulted.*
> *The agent responded automatically, within its limits.*
> *No human needed. No phone call. No delay."*

**Palavras:** 38

---

## BLOCO 6 — SIMULAÇÃO AO VIVO [1:55 – 2:18]
**Tela:** Clicar o botão "⚡ Simulate Margin Call" no header.

**Ação na tela:**
- [1:55] Clicar o botão laranja "⚡ Simulate Margin Call"
- [1:57] Banner laranja aparece: "Margin Call Incoming — MC-2026-0055 · BankC · $80k"
- [2:02] Banner muda para azul: "Agent Reasoning..." com spinner girando
- [2:08] Banner verde: "Margin Call Responded — $80k Treasury posted"
- [2:12] Novo ACT-003 aparece no topo do feed — clicar para abrir o rationale

> *"Let me show this live.*
> *A margin call just arrived from Bank C — $80,000 Treasury, one-hour deadline.*
> *Watch the agent reason.*
> [pausa 4s — deixar o spinner girar]
> *Responded. $80,000 posted. AgentAction contract created.*
> *The AI's reasoning is already on the Canton ledger."*

**Palavras:** 48

---

## BLOCO 7 — REGULADOR: O ARGUMENTO DE PRIVACIDADE [2:18 – 2:36]
**Tela:** Clicar na aba "Regulator".

**Ação na tela:**
- [2:18] Clicar aba "Regulator"
- [2:20] Pausar no banner azul "Privacy Preserved"
- [2:24] Scroll down para o audit log — mostrar o AI rationale visível
- [2:30] Apontar para "Collateral pool balances are private to the institution"

> *"Switch to the Regulator view.*
> *Full audit log. Every decision. Every AI rationale — verbatim.*
> [apontar para o banner]
> *But the regulator cannot see the pool balance.*
> *Not a permission flag. Canton's sub-transaction privacy enforces this at the protocol level.*
> *Auditability and confidentiality — simultaneously."*

**Palavras:** 55

---

## BLOCO 8 — PROVA TÉCNICA: O DAML [2:36 – 2:48]
**Tela:** Alt+Tab para VS Code com InstitutionMandate.daml aberto.

**Ação na tela:**
- Mostrar as linhas dos `assertMsg` no choice `ExecuteRebalance` (linhas ~95-100)
- Highlight nas 3 linhas de assertMsg

> *"This is the Daml contract running on Canton.*
> *These assertions execute before every agent action.*
> *If daily volume is exceeded — the ledger rejects the transaction.*
> *Not the app. The ledger.*
> *We tested 12 scenarios — including forced limit violations. All enforced."*

**Palavras:** 48

---

## BLOCO 9 — CONTROLE + FECHAR [2:48 – 3:00]
**Tela:** Voltar para o dashboard. Clicar "Pause Agent".

**Ação na tela:**
- [2:48] Alt+Tab de volta ao dashboard
- [2:49] Clicar "Pause Agent" — status muda para "Agent Paused" em amarelo
- [2:52] Voltar para localhost:3000 (landing page)

> *"The Treasury Manager can pause the agent instantly.*
> *The mandate is always in human hands.*
> [landing page abre]
> *Mandate Protocol.*
> *Autonomous treasury intelligence, with authority you can trust.*
> *Built on Canton Network."*

**Palavras:** 38

---

## Resumo de Tempo

| Bloco | Tema | Duração |
|-------|------|---------|
| 1 | O Problema | 0:18 |
| 2 | Solução + Landing | 0:22 |
| 3 | Login | 0:12 |
| 4 | Dashboard Overview | 0:26 |
| 5 | AI Rationale on-chain | 0:37 |
| 6 | Simulação ao vivo | 0:23 |
| 7 | Regulador + Privacy | 0:18 |
| 8 | Prova técnica (Daml) | 0:12 |
| 9 | Controle + Fechar | 0:12 |
| **Total** | | **3:00** |

---

## Critérios do Hackathon → Como o vídeo cobre

| Critério | Como está coberto no vídeo |
|---|---|
| **Technical execution** | Bloco 6 (simulação ao vivo) + Bloco 8 (Daml assertMsg) |
| **Originality** | Bloco 5 (AI rationale on-chain — "diferente de todo outro produto") |
| **User experience** | Blocos 3-7 (flow completo, UI clara, 3 papéis distintos) |
| **Real-world applicability** | Bloco 1 (problema real) + Bloco 6 (margin call real) |

---

## Dicas de Gravação

- **Mouse:** mova devagar e deliberadamente — aponte para o que está falando
- **Pausa no Bloco 6:** deixar o spinner girar ~4 segundos sem falar — cria tensão
- **Highlight no hover:** use o cursor para circular/hover sobre elementos importantes
- **Corte no VS Code:** rápido, 10 segundos máximo — só para dar credibilidade técnica
- **Resolução:** 1920×1080 obrigatório para legibilidade do código
- **Zoom:** no momento do Daml, dar Cmd+= para aumentar o font size no VS Code antes de gravar
