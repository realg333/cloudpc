# Phase 2: Payments & Order Automation - Context

**Gathered:** 2026-03-16  
**Status:** Ready for planning  
**Source:** ROADMAP.md, REQUIREMENTS.md, PROJECT.md, Phase 1 CONTEXT

## Phase Boundary

Phase 2 delivers **payment integration and order automation** so that:
- Users can pay for orders via PIX or cryptocurrency using an existing payment gateway
- Webhook callbacks reliably mark orders as paid or canceled
- One active VM per user is enforced (PLAN-03) before allowing payment
- Payment flows are logged for traceability

New capabilities like VM provisioning, dashboard with live status, and admin tooling are handled in later phases.

## Implementation Decisions

### Payment Gateway

- **Existing gateway:** PROJECT.md states "PIX and crypto are processed by an existing gateway; this system only needs to react to payment confirmation webhooks."
- **Integration model:** Webhook-driven confirmation — no polling; gateway sends callbacks on payment success/failure/expiry.
- **Methods:** PIX and cryptocurrency; crypto is visually encouraged in UI (Phase 1 PlanCard already shows "Cripto recomendado").
- **No wallet/balance:** Prepaid fixed-time packages only; users pay per order at checkout.

### Webhook Security & Idempotency

- Webhook endpoints must verify **signature** using gateway-provided secret.
- **Idempotency:** Duplicate webhook deliveries must not double-process; use order ID + payment ID (or equivalent) to deduplicate.
- Failed signature verification → 401; invalid payload → 400; already-processed → 200 (acknowledge idempotently).

### Order State Transitions

- `pending_payment` → `paid` on successful payment webhook; triggers provisioning in Phase 3.
- `pending_payment` → `canceled` on failed/expired payment webhook; no provisioning.
- No other transitions in this phase (VM lifecycle is Phase 3).

### Concurrency Rule (PLAN-03)

- **One active VM per user:** If a user already has an active VM (or an order in `paid` status awaiting provisioning), they cannot pay for or start a second concurrent VM.
- Enforcement points: (1) before creating payment intent — block if user has active VM; (2) webhook handler — reject payment for order if user already has active VM (edge case: race).
- "Active VM" definition for Phase 2: order with `status = 'paid'` and no corresponding terminated VM yet, OR any order that would result in a running VM. Phase 3 will introduce VM/Reservation models; for now, treat `paid` orders as "has active reservation."

### Logging

- Log: order ID, user ID, amount, payment method (PIX/crypto), timestamp, webhook event type, outcome.
- Enough detail to trace issues (PAY-05, SAFE-02).

### Claude's Discretion

- **Gateway choice:** PROJECT.md says "existing gateway" but does not name it. Research should recommend concrete options (e.g. Mercado Pago, PagSeguro, Asaas, or crypto-specific gateways) or define a gateway-agnostic interface if the gateway is TBD.
- **Pricing storage:** Plan/Order may need amount fields; catalog may need price per plan+profile. Implementation detail.
- **Payment intent creation:** Whether checkout creates a payment link, QR code, or redirect — depends on gateway API.

## Canonical References

### Project & Roadmap

- `.planning/PROJECT.md` — product vision, constraints (PIX + crypto via existing gateway).
- `.planning/REQUIREMENTS.md` — PLAN-03, PAY-01 through PAY-05.
- `.planning/ROADMAP.md` — Phase 2 definition, scope, success criteria.

### Existing Code

- `prisma/schema.prisma` — Order model with `status` (default `pending_payment`).
- `src/app/api/orders/route.ts` — POST creates order, GET lists orders.
- `src/app/orders/page.tsx` — orders list UI.
- `src/components/PlanCard.tsx` — "Escolher plano" creates order, redirects to /orders; already shows PIX/crypto messaging.
- `src/lib/plans/catalog.ts` — plan options.

## Existing Code Insights

- Order has: `id`, `userId`, `planId`, `machineProfileId`, `status`, `createdAt`, `updatedAt`.
- No `amount` or `currency` on Order yet — may need for payment matching.
- No Payment or PaymentLog models — Phase 2 will add these for idempotency and audit.
- Plan + MachineProfile have no price fields — research/plan must address pricing source.

## Specific Ideas

- Checkout flow: user on /orders sees pending orders; selects one → payment page with PIX QR / crypto address; gateway sends webhook on confirmation.
- Crypto should be clearly encouraged (Phase 1 already does this in PlanCard).
- Concurrency check: before showing payment options, verify user has no active VM/paid order.

## Deferred Ideas

- VM provisioning (Phase 3) — webhook marks paid, provisioning is triggered but not implemented here.
- Admin payment logs UI (Phase 5) — logging is in place, admin views come later.
- Refunds, partial payments, subscription billing — out of scope for MVP.

---

*Phase: 02-payments-order-automation*  
*Context gathered: 2026-03-16*
