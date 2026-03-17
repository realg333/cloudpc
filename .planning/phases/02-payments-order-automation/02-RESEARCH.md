# Phase 2: Payments & Order Automation - Research

**Researched:** 2026-03-16  
**Domain:** Brazilian payment gateways (PIX + crypto), webhook security, order state automation  
**Confidence:** MEDIUM

## Summary

Phase 2 integrates payment confirmation via webhooks so orders transition from `pending_payment` to `paid` or `canceled`. No single Brazilian gateway offers both PIX and native cryptocurrency in one product; the recommended approach is a **gateway-agnostic abstraction** with pluggable adapters (e.g., Mercado Pago for PIX, OxaPay or similar for crypto), or to pick one primary gateway and add a second for crypto if needed.

Webhook security requires **signature verification** (gateway-specific: HMAC, x-signature, or auth token) and **idempotency** via a unique `gatewayEventId` stored in a `PaymentLog` table with a database unique constraint to prevent race-condition double-processing.

**PLAN-03** (one active VM per user) is enforced in Phase 2 by treating any order with `status = 'paid'` as "has active reservation." Before creating a payment intent and in the webhook handler, the system checks that the user has no other paid order.

**Primary recommendation:** Implement a gateway-agnostic `PaymentGateway` interface, add `Payment` and `PaymentLog` models, enforce webhook signature + idempotency, and recommend Mercado Pago (PIX) + OxaPay or similar (crypto) as concrete adapters if the gateway is TBD.

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Existing gateway:** PIX and crypto processed by existing gateway; system reacts to payment confirmation webhooks only.
- **Integration model:** Webhook-driven confirmation — no polling.
- **Methods:** PIX and cryptocurrency; crypto visually encouraged in UI.
- **No wallet/balance:** Prepaid fixed-time packages only; users pay per order at checkout.
- **Webhook security:** Signature verification using gateway-provided secret; idempotency via order ID + payment ID.
- **Order transitions:** `pending_payment` → `paid` on success; `pending_payment` → `canceled` on failed/expired.
- **PLAN-03:** One active VM per user; enforcement before payment intent creation and in webhook handler.
- **Logging:** Order ID, user ID, amount, payment method, timestamp, webhook event type, outcome.

### Claude's Discretion

- **Gateway choice:** Recommend concrete options (Mercado Pago, PagSeguro, Asaas, crypto gateways) or gateway-agnostic interface if TBD.
- **Pricing storage:** Plan/Order may need amount fields; catalog may need price per plan+profile.
- **Payment intent creation:** Whether checkout creates payment link, QR code, or redirect — depends on gateway API.

### Deferred Ideas (OUT OF SCOPE)

- VM provisioning (Phase 3) — webhook marks paid, provisioning triggered but not implemented here.
- Admin payment logs UI (Phase 5) — logging in place, admin views later.
- Refunds, partial payments, subscription billing — out of scope for MVP.

</user_constraints>

---

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PLAN-03 | System enforces one active VM per user; cannot start another concurrently | Treat `status = 'paid'` as active reservation; check before payment intent and in webhook handler |
| PAY-01 | User can pay for order via PIX using existing gateway | Mercado Pago, Asaas, PixToPay, or adapter pattern; webhook confirms payment |
| PAY-02 | User can pay via cryptocurrency, crypto encouraged in UI | OxaPay, Binance Pay, or crypto adapter; PlanCard already shows "Cripto recomendado" |
| PAY-03 | Backend exposes secure webhook endpoint for payment confirmations | Signature verification + idempotency; gateway-specific headers (x-signature, authToken, Stripe-Signature pattern) |
| PAY-04 | On successful payment webhook, order marked paid and provisioning triggered | Order status → `paid`; provisioning stub/hook for Phase 3 |
| PAY-05 | On failed/expired payment, order canceled, no provisioning | Order status → `canceled`; no provisioning |

</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|-------------|
| Prisma | ^6.0.0 (existing) | ORM, schema | Already in project; Payment, PaymentLog models |
| Next.js 15 | ^15.0.0 (existing) | App Router, API routes | Webhook at `/api/webhooks/payments/route.ts` |
| crypto (Node) | built-in | HMAC-SHA256 signature verification | No extra deps; standard for webhook verification |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | (if not present) | Webhook payload validation | Validate incoming webhook body shape |
| @mercadopago/sdk-node | latest | Mercado Pago API (PIX) | If Mercado Pago chosen for PIX |
| (crypto gateway SDK) | TBD | Crypto payments | If OxaPay/Binance/other chosen |

### Gateway Options (Brazil, PIX + Crypto)

| Gateway | PIX | Crypto | Webhook Auth | Notes |
|---------|-----|--------|--------------|-------|
| Mercado Pago | ✅ | ❌ | x-signature | Dominant in Brazil; PIX via Checkout Transparente |
| Asaas | ✅ | ❌ | asaas-access-token | PIX, boleto; authToken in header |
| PixToPay | ✅ | ❌ | Idempotent webhooks | PIX-focused; 5s response requirement |
| OxaPay | ❌ | ✅ | HMAC | Crypto gateway for Brazil |
| Binance Pay + PIX | ✅ (via PIX) | ✅ | TBD | 2025 integration; crypto→BRL→PIX |

**No single gateway offers both PIX and native crypto in one API.** Options: (1) Two adapters (e.g., Mercado Pago + OxaPay), (2) Binance Pay if it fits, (3) Gateway-agnostic interface with one PIX + one crypto adapter.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom gateway abstraction | Direct Mercado Pago only | Simpler but locks to one provider; no crypto |
| PayKit / NodePay | Custom thin interface | PayKit is Stripe/PayPal-focused; NodePay less maintained; custom fits webhook-only flow |

**Installation (if adding gateway SDKs):**

```bash
npm install @mercadopago/sdk-node zod
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   ├── payments/
│   │   ├── gateway.ts          # PaymentGateway interface
│   │   ├── mercadopago.ts      # Mercado Pago adapter (PIX)
│   │   └── (crypto-adapter).ts # Crypto adapter if needed
│   └── orders/
│       └── concurrency.ts      # hasActiveOrder(userId) for PLAN-03
├── app/
│   ├── api/
│   │   ├── orders/             # Existing
│   │   ├── payments/           # Create payment intent / link
│   │   └── webhooks/
│   │       └── payments/
│   │           └── route.ts     # Webhook handler
└── ...
```

### Pattern 1: Gateway-Agnostic Interface

**What:** Abstract payment creation and webhook parsing behind a common interface.  
**When to use:** Gateway is TBD or multiple gateways (PIX + crypto) needed.

```typescript
// src/lib/payments/gateway.ts
export interface PaymentGateway {
  createPaymentIntent(params: {
    orderId: string;
    amountCents: number;
    currency: string;
    method: 'pix' | 'crypto';
    metadata?: Record<string, string>;
  }): Promise<{ paymentId: string; qrCode?: string; redirectUrl?: string }>;
  verifyWebhookSignature(payload: string, headers: Record<string, string>): boolean;
  parseWebhookPayload(body: unknown): { eventId: string; eventType: string; orderId: string; status: 'paid' | 'failed' | 'expired' } | null;
}
```

### Pattern 2: Webhook Handler Flow

**What:** Verify signature → check idempotency (PaymentLog) → process → log.  
**When to use:** All webhook endpoints.

```
1. Parse raw body (do NOT use req.json() first — need raw for signature)
2. Verify signature using gateway secret → 401 if invalid
3. Parse payload → 400 if invalid
4. Check PaymentLog for gatewayEventId (unique) → if exists, return 200 (idempotent ack)
5. Check user has no other paid order (PLAN-03) if status=paid
6. Update Order status, create Payment, insert PaymentLog
7. Return 200
```

### Pattern 3: PLAN-03 Concurrency Check (Phase 2)

**What:** "Active VM" = any order with `status = 'paid'` for that user (no VM model yet).  
**When to use:** Before creating payment intent; inside webhook when processing success.

```typescript
// src/lib/orders/concurrency.ts
export async function hasActiveOrder(userId: string): Promise<boolean> {
  const paid = await prisma.order.findFirst({
    where: { userId, status: 'paid' },
  });
  return !!paid;
}
```

### Anti-Patterns to Avoid

- **Using `request.json()` before signature verification:** Signature is computed over raw body; parsing changes it. Read raw body first, verify, then parse.
- **Application-level idempotency only:** Two concurrent webhooks can both pass an in-memory/application check. Use a **unique constraint on `gatewayEventId`** in PaymentLog so only one insert succeeds.
- **Returning 4xx/5xx for duplicate webhooks:** Gateways retry; return 200 for already-processed events to stop retries.
- **Long processing before 200:** Return 200 quickly, then process async if needed, or process fast. Timeouts cause retries and duplicate delivery.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Webhook signature verification | Custom crypto logic from scratch | Gateway SDK or standard HMAC pattern per provider docs | Edge cases (timestamp validation, replay), encoding gotchas |
| Idempotency storage | In-memory Set or app-level flag | PaymentLog table with unique(gatewayEventId) | Survives restarts; prevents race conditions |
| Payment amount matching | Fuzzy or manual matching | Store amountCents on Order; verify in webhook | Prevents misapplication of payments |
| QR code generation for PIX | Custom PIX QR encoding | Gateway API returns QR/link | PIX format and encoding are spec-specific |

**Key insight:** Payment webhooks use at-least-once delivery; duplicates are normal. The only robust deduplication is a database unique constraint on the gateway's event ID.

---

## Common Pitfalls

### Pitfall 1: Signature Verification with Parsed Body

**What goes wrong:** Developer parses `request.json()` then verifies signature on `JSON.stringify(parsed)`. Fails because gateway signs the exact bytes received (whitespace, key order may differ).  
**Why it happens:** Convenience of using parsed body.  
**How to avoid:** Read `request.text()` or `request.arrayBuffer()` for raw body; verify signature on that; then parse.  
**Warning signs:** Intermittent 401s in production; signature works in tests with manually constructed payloads.

### Pitfall 2: Race Condition in Idempotency Check

**What goes wrong:** Two webhook deliveries run concurrently; both check "event not processed," both proceed, order marked paid twice or duplicate provisioning.  
**Why it happens:** Check-then-insert is not atomic.  
**How to avoid:** `INSERT INTO PaymentLog (gatewayEventId, ...)` with unique constraint; catch duplicate key error and return 200.  
**Warning signs:** Duplicate payment logs in testing under load; double provisioning.

### Pitfall 3: PLAN-03 Race (Payment After Concurrent Order)

**What goes wrong:** User has Order A (paid). User creates Order B, passes concurrency check, starts payment. Webhook for Order B arrives. If Order A was just paid, both could be "active."  
**Why it happens:** Check at intent creation vs. check at webhook are separate moments.  
**How to avoid:** Webhook handler must re-check `hasActiveOrder(userId)` before marking Order B paid. If user already has paid order for a *different* order, reject (mark Order B canceled, log, return 200).

### Pitfall 4: Slow Webhook Response

**What goes wrong:** Webhook does DB updates, external calls, then returns 200. Gateway times out (often 5–30s), retries, duplicate events.  
**Why it happens:** Complex logic before response.  
**How to avoid:** Keep handler fast; return 200 within a few seconds. If heavy work needed, enqueue and process async, but ensure idempotency so retries are safe.

---

## Code Examples

### Webhook Signature Verification (Stripe-style HMAC)

```typescript
// Pattern used by Stripe, many others. Verify before parsing.
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const [timestamp, expectedSig] = signature.split(',')
    .reduce((acc, part) => {
      const [k, v] = part.split('=');
      if (k === 't') acc[0] = v;
      if (k === 'v1') acc[1] = v;
      return acc;
    }, ['', '']);
  const signed = `${timestamp}.${payload}`;
  const hmac = crypto.createHmac('sha256', secret).update(signed).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expectedSig, 'hex'), Buffer.from(hmac, 'hex'));
}
```

Source: Stripe webhook signature pattern — https://stripe.com/docs/webhooks/signatures

### Idempotent Webhook Handler (Prisma)

```typescript
// After signature verification and payload parse
const eventId = payload.id; // gateway event ID
try {
  await prisma.paymentLog.create({
    data: {
      gatewayEventId: eventId,
      eventType: payload.event,
      orderId: payload.data.orderId,
      processedAt: new Date(),
    },
  });
} catch (e) {
  if (e.code === 'P2002') {
    // Unique constraint violation — already processed
    return NextResponse.json({ received: true }, { status: 200 });
  }
  throw e;
}
// Continue with order update...
```

### PLAN-03 Check Before Payment Intent

```typescript
// In POST /api/payments/create or equivalent
const hasActive = await hasActiveOrder(session.user.id);
if (hasActive) {
  return NextResponse.json(
    { error: 'Você já possui uma máquina ativa. Aguarde o término para contratar outra.' },
    { status: 409 }
  );
}
```

---

## Schema Recommendations

### Payment Model

```prisma
model Payment {
  id               String   @id @default(cuid())
  orderId          String   @unique
  order            Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  gatewayPaymentId String
  amountCents      Int
  currency         String   @default("BRL")
  method           String   // "pix" | "crypto"
  status           String   // "pending" | "completed" | "failed" | "expired"
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([gatewayPaymentId])
}
```

### PaymentLog Model (Idempotency + Audit)

```prisma
model PaymentLog {
  id              String   @id @default(cuid())
  gatewayEventId  String   @unique  // Gateway's event ID — unique constraint is critical
  eventType       String
  orderId         String?
  outcome         String   // "paid" | "canceled" | "ignored"
  processedAt     DateTime @default(now())
  metadata        Json?    // Optional: payload summary for debugging

  @@index([orderId])
}
```

### Order Additions

```prisma
model Order {
  // ... existing fields
  amountCents    Int?     // Required for payment matching; add to Plan or Plan+Profile
  currency      String?  @default("BRL")
  payments      Payment[]
}
```

### Pricing Source

Plan and MachineProfile currently have no price. Options:

1. **Plan.priceCents** — One price per plan (simplest).
2. **PlanPricing** — Junction: (planId, machineProfileId) → priceCents (flexible).
3. **MachineProfile.priceCents** — Price per profile; plan adds multiplier (more complex).

Recommendation: Add `priceCents Int` to `Plan` for MVP (same price for all profiles), or add `PlanPricing` if plan+profile combinations have different prices.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Polling for payment status | Webhook-driven confirmation | Standard since ~2020 | Lower latency, less load |
| No signature verification | x-signature / HMAC / authToken | Provider-dependent | Required for production |
| Application-level idempotency | DB unique constraint on event ID | Best practice 2024+ | Prevents race-condition duplicates |
| Mercado Pago complex x-signature | Simplified x-signature | Feb 2024 | Easier validation |

**Deprecated/outdated:**

- Polling payment status: Use webhooks.
- Ignoring webhook retries: Always return 200 for duplicates to avoid infinite retry loops.

---

## Open Questions

1. **Which gateway(s) will be used?**
   - What we know: PROJECT.md says "existing gateway" but doesn't name it.
   - What's unclear: Single vs. dual gateway (PIX + crypto).
   - Recommendation: Implement gateway-agnostic interface; recommend Mercado Pago (PIX) + OxaPay or similar (crypto) as adapters. If one gateway is chosen later, add one adapter.

2. **Pricing model: Plan-only or Plan+Profile?**
   - What we know: No price fields exist.
   - What's unclear: Same price for all profiles or different?
   - Recommendation: Add `Plan.priceCents` for MVP; extend to PlanPricing if needed.

3. **Payment intent creation flow**
   - What we know: Checkout creates order, redirects to /orders.
   - What's unclear: Does user click "Pay" on /orders and get QR/redirect, or is payment created at order creation?
   - Recommendation: Add "Pagar" action on pending orders; API creates payment intent, returns QR/link; user pays; webhook confirms.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 2.x (unit) + Playwright 1.49 (E2E) |
| Config file | `vitest.config.ts`, `playwright.config.ts` |
| Quick run command | `npm run test` |
| Full suite command | `npm run test` + `npm run test:e2e` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| PLAN-03 | Block payment when user has paid order | unit | `npm run test -- src/lib/orders/concurrency.test.ts` | ❌ Wave 0 |
| PAY-01 | PIX payment flow creates intent, webhook marks paid | unit + E2E | `npm run test` / `npm run test:e2e` | ❌ Wave 0 |
| PAY-02 | Crypto payment flow, UI encourages crypto | unit + E2E | `npm run test` / `npm run test:e2e` | ❌ Wave 0 |
| PAY-03 | Webhook verifies signature, rejects invalid | unit | `npm run test -- src/app/api/webhooks/payments/*.test.ts` | ❌ Wave 0 |
| PAY-04 | Success webhook → order paid | unit | `npm run test` | ❌ Wave 0 |
| PAY-05 | Failed/expired webhook → order canceled | unit | `npm run test` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run test`
- **Per wave merge:** `npm run test` + `npm run test:e2e`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/orders/concurrency.test.ts` — covers PLAN-03
- [ ] `src/lib/payments/gateway.test.ts` — adapter interface
- [ ] `src/app/api/webhooks/payments/route.test.ts` — webhook handler (signature, idempotency)
- [ ] `tests/e2e/payments.spec.ts` — E2E payment flow (can use mocked webhook)
- [ ] Fixtures: mock webhook payloads for PIX/crypto success/failure

---

## Sources

### Primary (HIGH confidence)

- Mercado Pago Developers — webhooks, x-signature (2024 update)
- Asaas Docs — webhook events, authToken security
- Stripe Docs — webhook signatures, idempotency patterns

### Secondary (MEDIUM confidence)

- WebSearch — Brazilian gateways (Mercado Pago, Asaas, OxaPay, PixToPay, Binance Pay)
- WebSearch — payment webhook idempotency best practices
- HookMesh / Stripe duplicate events — idempotency guide

### Tertiary (LOW confidence)

- Single gateway PIX+crypto in Brazil — no clear single provider found; recommend dual adapters or gateway-agnostic design

---

## Metadata

**Confidence breakdown:**

- Standard stack: MEDIUM — gateway choice TBD; Prisma/Next.js patterns are standard
- Architecture: HIGH — webhook patterns and idempotency are well-established
- Pitfalls: HIGH — documented from Stripe, Mercado Pago, and idempotency guides

**Research date:** 2026-03-16  
**Valid until:** ~30 days (gateway APIs stable; new Brazilian crypto integrations may emerge)
