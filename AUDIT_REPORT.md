# Relatório de Auditoria — Mandate Protocol
**Data:** 12 de junho de 2026 · **Escopo:** repositório completo (Daml, agent Python, frontend Next.js, scripts, docs, deploy) · **Contexto:** Build on Canton Hackathon (submissão até 13/jul)

---

## 1. Resumo executivo

O projeto está bem posicionado para os 4 critérios de julgamento (execução técnica, originalidade, UX e aplicabilidade real). A auditoria encontrou **3 bugs funcionais reais**, **2 problemas de deploy/submissão** e **1 problema de segurança**, todos corrigidos nesta sessão. Restam melhorias recomendadas, priorizadas na seção 4.

| Área | Status pré-auditoria | Status pós-correção |
|------|---------------------|---------------------|
| Contratos Daml | ✅ Sólidos (12 testes e2e) | ✅ Sem mudanças necessárias |
| Agent Python | ❌ Não conectaria ao ledger | ✅ Corrigido |
| Frontend | ⚠️ Navegação e botões mortos | ✅ Corrigido |
| Deploy | ⚠️ Desatualizado | 🔄 Aguardando redeploy |
| Segurança | ⚠️ Token no git remote | ✅ Limpo (revogar token!) |
| Requisitos de submissão | ⚠️ Link live ausente no README | ✅ Corrigido |

---

## 2. Problemas encontrados e corrigidos

### 2.1 Funcionais (críticos)

**F1 — Agent: template IDs inexistentes.** `agent.py` e `canton_client.py` referenciavam `MandateProtocol.InstitutionMandate:AgentSession` etc., mas os módulos Daml chamam-se `InstitutionMandate` e `CollateralPool` (sem prefixo). Toda query/exercise falharia. → Corrigido para o formato `<módulo>:<entidade>`.

**F2 — Agent: endpoints de API errados.** O cliente usava `/v2/query`, `/v2/exercise`, `/v2/create` com corpo no formato v1. O `daml json-api` do SDK 2.10 (iniciado pelo `start-local.sh`) serve `/v1/*`. → Migrado para `/v1/query`, `/v1/fetch`, `/v1/exercise`, `/v1/create` com parsing correto de `{"result": ...}`.

**F3 — Agent: enum inválido.** `RequestHumanApproval` enviava `proposedAction: "Respond_Margin_Call"` (via `.title()`), que não é construtor do `ActionType` Daml. O ledger rejeitaria toda escalação. → Mapa explícito decisão → construtor (`MarginCallResponse`, `HumanEscalation`, etc.).

**F4 — Agent: JSON API exige JWT mesmo no sandbox.** O `.env.example` dizia "leave empty", mas o JSON API sempre precisa de token para identificar a party. → Auto-geração de dev JWT (HS256, secret `secret`) para localhost, sem dependência nova; documentado no `.env.example`.

### 2.2 Frontend (UX / ações mortas)

**F5 — Sidebar não funcional.** Os 6 itens de navegação só mudavam o highlight; o conteúdo era fixo por role. → Navegação agora renderiza seções reais: Dashboard, Agent Sessions, Collateral Pool, Margin Calls (com painel de calls abertas), Action Log e Settings. Nav é por role (Compliance: Overview/Audit Log/Controls; Regulator: Overview/Agent Actions). Título do header acompanha a seção.

**F6 — Botão "Halt Agent" sem ação.** → Agora pede confirmação, invalida a sessão (estado), mostra banner "EmergencyPause record created on-chain" e o status do header muda para "Agent Halted".

**F7 — Rodapé do login citava `localhost:7575` em produção.** → Texto neutro de ambiente demo.

### 2.3 Deploy e submissão

**D1 — Deploy Vercel 2 commits atrás.** A versão no ar não tem os security headers (CSP, HSTS, X-Frame-Options) e o botão "View on GitHub" aponta para `https://github.com` genérico. → Push feito; redeploy pendente de token.

**D2 — README sem link do produto live** (requisito de submissão: "Link to live product"). → Adicionados links live + repo no topo do README.

**D3 — LICENSE ausente** (README declara MIT). → Arquivo LICENSE criado.

**D4 — frontend/README era boilerplate do create-next-app.** → Substituído por doc do projeto.

### 2.4 Segurança

**S1 — Token GitHub (gho_...) embutido na URL do remote git.** Qualquer processo local podia lê-lo. → URL limpa. **Ação sua: revogar o token em github.com/settings/tokens.**

**S2 — Positivos:** sem segredos no histórico do git (varrido); `.gitignore` cobre `.env`/`.dar`/logs; cliente Python tem proteção SSRF + TLS obrigatório fora de localhost; sanitização anti-prompt-injection nos eventos de counterparty; headers de segurança no `next.config.ts`; validação de role/institution no dashboard sem fallback privilegiado.

---

## 3. O que está bom (manter)

- **Daml:** modelo de 3 camadas com `assertMsg` antes de cada choice, testes cobrindo casos de rejeição (over-limit, asset não permitido), DVP atômico. É o coração do pitch e está limpo.
- **Narrativa:** "AI rationale on-chain" é diferencial claro de originalidade; o frontend expõe isso bem (rationale expandível por ação).
- **Demo interativa:** "Simulate Margin Call" com estados incoming → reasoning → responded é ótima para o vídeo de 3 min.
- **Docs:** README, USER_GUIDE, PITCH_DECK e VIDEO_SCRIPT já alinhados aos critérios de julgamento.

---

## 4. Melhorias recomendadas (priorizadas)

### Alta prioridade (antes da submissão — 21/jun a 13/jul)

1. **Conectar o frontend ao ledger real.** Hoje o dashboard é 100% mock. Mesmo um modo híbrido (busca `AgentAction` reais via JSON API quando disponível, fallback para mock) elevaria muito "Technical execution". Esforço: ~1 dia.
2. **Gravar o vídeo de 3 min** seguindo o VIDEO_SCRIPT.md — requisito de submissão. O fluxo Simulate Margin Call + visão Regulator é o clímax.
3. **Gerar o deck** a partir do PITCH_DECK.md (PDF/slides) — requisito de submissão.
4. **CI no GitHub Actions:** job 1 `daml test` (com cache do SDK), job 2 `npm run build` + `tsc --noEmit`. Badge no README sinaliza "code clean & tested" para os juízes. Esforço: ~1h.
5. **Conectar Git integration na Vercel** para todo push fazer deploy automático (evita o site desatualizado de novo).

### Média prioridade

6. **Rodar o agente contra Canton DevNet** (não só sandbox) e documentar — "Built on Canton" fica muito mais forte se há evidência em DevNet.
7. **Demonstrar a privacidade de verdade:** um script/cena onde BankB tenta ler o pool de BankA e falha. Privacidade é o tema central do hackathon; hoje ela é afirmada, não demonstrada.
8. **Persistir o estado do demo no frontend** (ações simuladas somem no refresh) — sessionStorage em memória do React basta para a demo gravada.
9. **Tratamento de erros do agente:** retry/backoff no polling, mensagem clara se o JSON API cair, validação do JSON do Claude com retry em parse error.
10. **Preencher a seção Team do README** com nomes/contatos (juízes olham).

### Baixa prioridade / roadmap

11. Oráculo de preços real (substituir MOCK_PRICES) — já sinalizado no código.
12. Multi-pool e multi-sessão no agente (hoje pega `pools[0]` e uma sessão fixa).
13. Testes unitários Python (pytest) para `ai_reasoner._sanitize_event` e mapeamentos.
14. Acessibilidade do dashboard: contraste dos textos `#4A5878` sobre `#0B0F1A` fica abaixo de WCAG AA em alguns pontos.
15. i18n — landing em inglês, ok para o hackathon.

---

## 5. Checklist de submissão (Encode/Canton)

| Requisito | Status |
|-----------|--------|
| Repositório público | ✅ github.com/EdCryptoFi/mandate-protocol |
| Link para produto live | ✅ mandate-protocol.vercel.app (redeploy pendente) |
| Deck de apresentação | ⚠️ Conteúdo pronto (PITCH_DECK.md), falta gerar slides |
| Vídeo 3 min com demo | ❌ Roteiro pronto (VIDEO_SCRIPT.md), falta gravar |
| Criar projeto + equipe na plataforma até 21/jun 23:59 UTC-12 | ⚠️ Confirmar na plataforma Encode |

**Eventos:** Launch 15/jun 13:30 (GMT-3) · Tech Deep Dive 17/jun 10:00 · Ecosystem Overview 23/jun 10:00 · Finale 13/jul.
