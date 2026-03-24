# Requirements: Cloud Gaming VPS Brazil

**Defined:** 2026-03-17
**Milestone:** v1.2 Real Infra & Payments Integration
**Core Value:** Users can quickly and reliably get a high‑performance Windows cloud PC with GPU, paid upfront in a fixed‑time package, and connect through a simple web dashboard with minimal friction and manual intervention.

## v1.2 Requirements

Requirements for milestone v1.2. Focus: production-ready real infrastructure and payments. No major frontend redesign.

### Vultr Integration

- [ ] **VULT-01**: System uses real Vultr API key (from .env) for all VM operations
- [ ] **VULT-02**: MachineProfiles map to real Vultr GPU plans and regions (configurable, validated)
- [ ] **VULT-03**: Instance creation, status polling, and teardown work correctly against real Vultr API
- [ ] **VULT-04**: VM labeling and idempotency logic work in production (no duplicate instances for same order)
- [ ] **VULT-05**: Parsec readiness validated via stable approach (custom image or reliable startup script)

### Payment Gateway

- [ ] **PAY-01**: Mock payment gateway replaced with real provider (via existing gateway integration)
- [ ] **PAY-02**: System creates real payment intents (PIX QR code and crypto invoice)
- [ ] **PAY-03**: Webhook signatures and payloads are validated before processing
- [ ] **PAY-04**: Payment handling is idempotent (duplicate webhooks do not cause duplicate provisioning)
- [ ] **PAY-05**: Order state transitions are correct: pending → paid → provisioning (no invalid states)

### End-to-End Flow

- [ ] **FLOW-01**: Full real flow works: user → plan → payment → webhook → VM → dashboard → teardown
- [ ] **FLOW-02**: Payment not completed leaves order in pending state; no VM created
- [ ] **FLOW-03**: Duplicate webhook does not create duplicate VM or corrupt order state
- [ ] **FLOW-04**: Provisioning failure is handled; no paid order left without VM attempt (retry or refund path)
- [ ] **FLOW-05**: No duplicate VM creation for same order under any condition

### Environment & Deployment

- [x] **ENV-01**: .env finalized with real keys and secrets (Vultr, payment gateway, etc.)
- [x] **ENV-02**: CRON routes configured for teardown and provisioning jobs
- [x] **ENV-03**: Webhook endpoints reachable (public URL or tunneling for development)
- [x] **ENV-04**: Basic production deployment configuration prepared (even if simple)

### Cost Control & Safety

- [x] **COST-01**: Strict "1 active VM per user" enforced at all times
- [x] **COST-02**: Basic cost guardrails in place (max active VMs, kill switch)
- [ ] **COST-03**: Teardown runs correctly for expired VMs (no orphan instances)
- [ ] **COST-04**: Orphan VM prevention: no VM left running without valid paid order

### Observability & Debugging

- [ ] **OBS-01**: Structured logs for payment events (intent created, webhook received, order updated)
- [ ] **OBS-02**: Structured logs for provisioning events (VM created, status changes, teardown)
- [ ] **OBS-03**: Structured logs for admin actions (terminate, manual overrides)
- [ ] **OBS-04**: Admin panel shows failure visibility (failed orders, stuck provisioning, errors)
- [ ] **OBS-05**: Debugging production issues is straightforward (logs, admin visibility, traceability)

### Frontend UX & Checkout (Phase 12)

- [x] **FE-01**: Existing site structure and header names remain unchanged while applying visual redesign
- [x] **FE-02**: Payment and checkout UI adopts a high-tech black/purple visual language with consistent tokens
- [x] **FE-03**: Checkout and payment pages are fully responsive across mobile, tablet, desktop, and full HD screens
- [x] **FE-04**: Motion is purposeful (status/loading/confirmation/error), subtle, and respects reduced-motion preferences
- [x] **FE-05**: PIX/QR states and production limitation feedback are explicit, user-friendly, and actionable

## Future Requirements

Deferred to future releases.

(No items deferred from v1.2)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Major frontend redesign | UI already polished in v1.1 |
| New user-facing features | Focus on reliability and real operation |
| Advanced analytics | Deferred until core flow validated |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ENV-01 | Phase 8 | Complete |
| ENV-02 | Phase 8 | Complete |
| ENV-03 | Phase 8 | Complete |
| ENV-04 | Phase 8 | Complete |
| COST-01 | Phase 8 | Complete |
| COST-02 | Phase 8 | Complete |
| PAY-01 | Phase 9 | Pending |
| PAY-02 | Phase 9 | Pending |
| PAY-03 | Phase 9 | Pending |
| PAY-04 | Phase 9 | Pending |
| PAY-05 | Phase 9 | Pending |
| OBS-01 | Phase 9 | Pending |
| VULT-01 | Phase 10 | Pending |
| VULT-02 | Phase 10 | Pending |
| VULT-03 | Phase 10 | Pending |
| VULT-04 | Phase 10 | Pending |
| VULT-05 | Phase 10 | Pending |
| OBS-02 | Phase 10 | Pending |
| FLOW-01 | Phase 11 | Pending |
| FLOW-02 | Phase 11 | Pending |
| FLOW-03 | Phase 11 | Pending |
| FLOW-04 | Phase 11 | Pending |
| FLOW-05 | Phase 11 | Pending |
| COST-03 | Phase 11 | Pending |
| COST-04 | Phase 11 | Pending |
| OBS-03 | Phase 11 | Pending |
| OBS-04 | Phase 11 | Pending |
| OBS-05 | Phase 11 | Pending |
| FE-01 | Phase 12 | Complete |
| FE-02 | Phase 12 | Complete |
| FE-03 | Phase 12 | Complete |
| FE-04 | Phase 12 | Complete |
| FE-05 | Phase 12 | Complete |

**Coverage:**
- v1.2 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-17*
*Last updated: 2026-03-17 after v1.2 milestone definition*
