[# Roadmap: Cloud Gaming VPS Brazil]

## Milestones

- ✅ **v1.0 MVP** — Phases 1–5 (shipped 2026-03-17)
- ✅ **v1.1 Frontend Polish** — Phases 6–7 (shipped 2026-03-17)
- 🚧 **v1.2 Real Infra & Payments Integration** — Phases 8–11 (in progress)

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

---

## v1.2 Real Infra & Payments Integration (Phases 8–11)

**Milestone Goal:** Turn the current system into a fully working, revenue-generating product with real payments, real VM provisioning, and end-to-end validated flow.

**Phase Numbering:** Phases 8–11 (continuing from v1.1)

- [x] **Phase 8: Environment & Cost Foundation** — .env, CRON, webhooks reachable, 1 VM per user guardrails (2 plans) (completed 2026-03-17)
- [ ] **Phase 9: Real Payment Gateway** — PIX + crypto, webhook validation, idempotent handling
- [ ] **Phase 10: Real Vultr Integration** — Production API, MachineProfiles, Parsec-ready instances
- [ ] **Phase 11: End-to-End & Teardown** — Full flow validated, failure handling, orphan prevention, observability

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

## Progress

**Execution Order:**
Phases 8–9 and 8–10 can run in parallel after Phase 8; Phase 11 requires both 9 and 10.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 8. Environment & Cost Foundation | 2/2 | Complete   | 2026-03-17 | - |
| 9. Real Payment Gateway | v1.2 | 0/0 | Not started | - |
| 10. Real Vultr Integration | v1.2 | 0/0 | Not started | - |
| 11. End-to-End & Teardown | v1.2 | 0/0 | Not started | - |
