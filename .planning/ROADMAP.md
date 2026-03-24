[# Roadmap: Cloud Gaming VPS Brazil]

## Milestones

- ✅ **v1.0 MVP** — Phases 1–5 (shipped 2026-03-17)
- ✅ **v1.1 Frontend Polish** — Phases 6–7 (shipped 2026-03-17)
- 🚧 **v1.2 Real Infra & Payments Integration** — Phases 8–12 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1–5) — SHIPPED 2026-03-17</summary>

- [x] Phase 1: Foundation & Accounts (4/4 plans) — completed 2026-03-17
- [x] Phase 2: Payments & Order Automation (3/3 plans) — completed 2026-03-17
- [x] Phase 3: VM Provisioning & Lifecycle (3/3 plans) — completed 2026-03-17
- [x] Phase 4: User Dashboard Experience (2/2 plans) — completed 2026-03-17
- [x] Phase 5: Admin Operations & Safety (3/3 plans) — completed 2026-03-17

Full details: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

</details>

<details>
<summary>✅ v1.1 Frontend Polish (Phases 6–7) — SHIPPED 2026-03-17</summary>

- [x] Phase 6: Landing Page Redesign (2/2 plans) — completed 2026-03-17
- [x] Phase 7: Dashboard Polish (3/3 plans) — completed 2026-03-17

Full details: [milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md)

</details>

## v1.2 Real Infra & Payments Integration (Phases 8–12)

**Milestone Goal:** Turn the current system into a fully working, revenue-generating product with real payments, real VM provisioning, and end-to-end validated flow.

**Phase Numbering:** Phases 8–12 (continuing from v1.1)

- [x] **Phase 8: Environment & Cost Foundation** — .env, CRON, webhooks reachable, 1 VM per user guardrails (2 plans) (completed 2026-03-17)
- [x] **Phase 8.1: Session persistence fix** — getBaseUrl em redirects, SESSION_SECRET, sessão persistente (completed 2026-03-18)
- [ ] **Phase 8.1.1: Session + email fix** — sessão ainda não persiste; emails não enviam (2 plans)
- [ ] **Phase 9: Real Payment Gateway** — PIX + crypto, webhook validation, idempotent handling
- [ ] **Phase 10: Real Vultr Integration** — Production API, MachineProfiles, Parsec-ready instances
- [ ] **Phase 11: End-to-End & Teardown** — Full flow validated, failure handling, orphan prevention, observability
- [x] **Phase 12: Frontend — checkout, PIX e UX** — UI/fluxo de pagamento; gateway validado em local; limitações de hospedagem (ex.: Vercel) tratadas até migração (completed 2026-03-24)

## Phase Details

### Phase 8: Environment & Cost Foundation
**Goal**: Production deployment environment is ready and cost guardrails are active.
**Depends on**: Nothing (first phase of v1.2)
**Requirements**: ENV-01, ENV-02, ENV-03, ENV-04, COST-01, COST-02
**Success Criteria** (what must be TRUE):
  1. All real keys and secrets are in .env (Vultr, payment gateway); no hardcoded credentials
  2. CRON jobs run teardown and provisioning at configured intervals; webhook endpoints reachable
  3. Basic production deployment configuration is prepared (even if simple)
  4. "1 active VM per user" is enforced at all times; system rejects attempts to create more
  5. Basic cost guardrails (max active VMs, kill switch) are configured and active
**Plans**: 2 plans

Plans:
- [ ] 08-01-PLAN.md — Environment & deployment (.env.example, vercel.json cron)
- [ ] 08-02-PLAN.md — Cost guardrails (VULTR_MAX_ACTIVE_VMS=10, hasOtherActiveOrder gate)

### Phase 08.1: Session persistence fix (INSERTED)

**Goal:** Sessão de autenticação persiste corretamente; usuário não é redirecionado para login indevidamente.
**Depends on:** Phase 8
**Requirements**: AUTH-04 (session persists across refresh)
**Success Criteria** (what must be TRUE):
  1. `getBaseUrl(request)` usado em todos os redirects (logout, 2FA verify, signup, verify-email) — evita URL interna em Vercel
  2. `SESSION_SECRET` documentado e verificado em produção
  3. Sessão mantida ao navegar entre páginas; sem loop de redirect; sem redirect indevido após login
**Plans:** 1/1 plans complete

Context: [SESSION_SCAN_REPORT.md](../SESSION_SCAN_REPORT.md)

### Phase 08.1.1: Session persistence and email delivery fix (INSERTED)

**Goal:** Sessão persiste ao navegar; emails de verificação são enviados em produção.
**Depends on:** Phase 8.1
**Requirements**: AUTH-04, signup flow (email verification)
**Success Criteria** (what must be TRUE):
  1. Sessão mantida ao clicar em Minhas Máquinas, Pedidos, Perfil — sem redirect para login
  2. Signup envia email de verificação; usuário recebe link e consegue ativar conta
  3. RESEND_API_KEY configurada no Vercel; verifyUrl usa base URL pública
**Plans:** 2 plans (08.1.1-01 diagnostics + email, 08.1.1-02 middleware + login feedback)

**Problemas reportados:**
- Phase 8.1 (getBaseUrl + prefetch=false) não resolveu sessão
- Emails não estão sendo enviados; criar perfil falha

### Phase 9: Real Payment Gateway
**Goal**: Real payment intents (PIX + crypto) with validated webhooks and idempotent handling.
**Depends on**: Phase 8
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, OBS-01
**Success Criteria** (what must be TRUE):
  1. Mock payment gateway replaced with real provider; user can create real payment intent (PIX QR code or crypto invoice)
  2. Webhook signatures and payloads are validated before processing; invalid requests are rejected
  3. Duplicate webhooks do not cause duplicate provisioning or duplicate orders
  4. Order state transitions are correct: pending → paid → provisioning (no invalid states)
  5. Payment events are logged in structured format (intent created, webhook received, order updated)
**Plans**: TBD

### Phase 10: Real Vultr Integration
**Goal**: Real VM lifecycle against production Vultr API with Parsec-ready instances.
**Depends on**: Phase 8
**Requirements**: VULT-01, VULT-02, VULT-03, VULT-04, VULT-05, OBS-02
**Success Criteria** (what must be TRUE):
  1. All VM operations use real Vultr API key from .env
  2. MachineProfiles map to real Vultr GPU plans and regions; config is validated
  3. Instance creation, status polling, and teardown work; VM labeling and idempotency prevent duplicate instances
  4. Parsec-ready instances are provisioned (stable via custom image or startup script)
  5. Provisioning events are logged in structured format (VM created, status changes, teardown)
**Plans**: TBD

### Phase 11: End-to-End & Teardown
**Goal**: Full real flow validated with failure handling, reliable teardown, and admin visibility.
**Depends on**: Phase 9, Phase 10
**Requirements**: FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05, COST-03, COST-04, OBS-03, OBS-04, OBS-05
**Success Criteria** (what must be TRUE):
  1. Full real flow works: user → plan → payment → webhook → VM → dashboard → teardown
  2. Payment not completed leaves order pending; duplicate webhook does not duplicate VM or corrupt state
  3. Provisioning failure is handled; no paid order left without VM attempt (retry or refund path)
  4. No duplicate VM for same order under any condition; teardown runs for expired VMs; no orphan instances
  5. Admin panel shows failure visibility; admin actions logged; debugging production issues is straightforward
**Plans**: TBD

### Phase 12: Frontend — checkout, pagamento PIX e UX

**Goal:** Priorizar alterações no **front** (checkout, exibição de PIX/QR, estados do pedido, feedback e acessibilidade), alinhadas ao gateway Asaas já validado em ambiente local. Documentar e contornar na UI o que for limitação de **hospedagem em produção** (ex.: Vercel) até a migração planejada — sem tratar a troca de host nesta fase.

**Depends on:** Phase 9 (contratos/APIs de pagamento reais). Pode ser executada em paralelo às fases 10–11 quando as rotas de pagamento estiverem estáveis.

**Requirements**: FE-01, FE-02, FE-03, FE-04, FE-05

**Success Criteria** (rascunho — refinar em `$gsd-plan-phase 12`):

  1. Fluxo de checkout e página de pagamento refletem estados reais (pendente, pago, expirado) com cópia clara em PT-BR
  2. QR/PIX e instruções exibidos de forma confiável quando a API retornar dados válidos
  3. Comportamento em produção documentado quando a plataforma de hospedagem limitar timeouts, cold start ou edge cases (mensagens ao usuário, retries visíveis onde fizer sentido)

**Plans:** 3/3 plans complete

Plans:
- [ ] 12-01-PLAN.md — Design tokens, motion utilitário e contrato de status/mensagens para pagamentos
- [ ] 12-02-PLAN.md — Redesign da página de pagamento e PaymentForm com PIX/QR + feedback de limitação em produção
- [ ] 12-03-PLAN.md — Redesign responsivo de Meus pedidos + teste automatizado do contrato de status/copy

## Progress

**Execution Order:**
Phase 8.1 runs after Phase 8 (urgent session fix). Phases 8.1–9 and 8.1–10 can run in parallel; Phase 11 requires both 9 and 10. **Phase 12** foca no front e pode avançar em paralelo a 10/11 após dependências mínimas da API de pagamento (Fase 9).

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 8. Environment & Cost Foundation | 2/2 | Complete | 2026-03-17 | - |
| **8.1. Session persistence fix** | v1.2 | 1/1 | Complete | 2026-03-18 |
| **8.1.1. Session + email fix** | v1.2 | 0/2 | Not started | - |
| 9. Real Payment Gateway | v1.2 | 0/0 | Not started | - |
| 10. Real Vultr Integration | v1.2 | 0/0 | Not started | - |
| 11. End-to-End & Teardown | v1.2 | 0/0 | Not started | - |
| **12. Frontend — checkout, PIX e UX** | v1.2 | 0/0 | Not planned | - |
