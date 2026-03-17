---
phase: 02-payments-order-automation
plan: 02
subsystem: payments
tags: [webhook, prisma, nextjs, pix, crypto, mock-gateway]

# Dependency graph
requires:
  - phase: 02-01
    provides: Payment, PaymentLog models, hasActiveOrder, createMockGateway
provides:
  - POST /api/webhooks/payments with signature verification and idempotency
  - POST /api/payments/create with PLAN-03 concurrency check
  - /orders/[id]/pay checkout page with PIX and crypto options
affects: [03-vm-provisioning]

# Tech tracking
tech-stack:
  added: []
  patterns: [raw body webhook verification, PaymentLog idempotency, gateway-agnostic interface]

key-files:
  created:
    - src/app/api/webhooks/payments/route.ts
    - src/app/api/payments/create/route.ts
    - src/app/orders/[id]/pay/page.tsx
    - src/components/PaymentForm.tsx
  modified:
    - src/app/orders/page.tsx
    - src/app/api/webhooks/payments/route.test.ts
    - vitest.config.ts

key-decisions:
  - "Webhook uses request.text() for raw body before signature verification"
  - "PaymentLog unique gatewayEventId for idempotency; P2002 catch returns 200"
  - "PLAN-03 enforced in both payment intent API and webhook handler"

patterns-established:
  - "Webhook flow: verify signature → idempotency insert → load order → PLAN-03 check → state transitions"
  - "Checkout: server component loads order, client PaymentForm handles method selection and API calls"

requirements-completed: [PAY-01, PAY-02, PAY-03, PAY-04, PAY-05]

# Metrics
duration: ~15min
completed: 2026-03-17
---

# Phase 02 Plan 02: Payments Order Automation Summary

**Webhook handler with signature verification and idempotency; payment intent API with PLAN-03 concurrency check; checkout UI for PIX and crypto with crypto visually encouraged**

## Performance

- **Duration:** ~15 min
- **Tasks:** 3 completed
- **Files created:** 4
- **Files modified:** 3

## Accomplishments

- POST /api/webhooks/payments: raw body verification, PaymentLog idempotency (P2002), order transitions (paid/canceled), PLAN-03 check before marking paid
- POST /api/payments/create: auth, order validation, hasActiveOrder check (409 when active VM), gateway createPaymentIntent
- /orders page: "Pagar" link for pending_payment orders
- /orders/[id]/pay: order summary, PIX and crypto buttons (crypto with "Recomendado" badge), qrCode/redirect display, 409 error handling

## Task Commits

Git was not available in PATH during execution. Suggested commit messages:

1. **Task 1: Webhook handler** - `feat(02-02): webhook handler with signature verification and idempotency`
2. **Task 2: Payment intent API** - `feat(02-02): payment intent API with concurrency check`
3. **Task 3: Checkout UI** - `feat(02-02): checkout UI with PIX and crypto options`

## Files Created/Modified

- `src/app/api/webhooks/payments/route.ts` - Webhook handler: raw body, signature verification, PaymentLog idempotency, order transitions, PLAN-03
- `src/app/api/payments/create/route.ts` - Payment intent creation with auth and hasActiveOrder check
- `src/app/orders/[id]/pay/page.tsx` - Pay page with order summary and PaymentForm
- `src/components/PaymentForm.tsx` - Client component for PIX/crypto selection and payment creation
- `src/app/orders/page.tsx` - Added "Pagar" link for pending_payment orders
- `src/app/api/webhooks/payments/route.test.ts` - Unskipped tests, added mocks for DB-free execution
- `vitest.config.ts` - Added @ path alias for test imports

## Decisions Made

- Vitest path alias added for @/ imports (tests were failing to resolve @/lib/db)
- Webhook tests use vi.mock for prisma and hasActiveOrder to run without database
- Crypto option styled with emerald/green and "Recomendado" badge per PAY-02

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Vitest @ path alias**
- **Found during:** Task 1 (webhook route tests)
- **Issue:** Tests failed with "Failed to load url @/lib/db" - Vitest did not resolve tsconfig paths
- **Fix:** Added resolve.alias in vitest.config.ts for @ → ./src
- **Files modified:** vitest.config.ts
- **Verification:** npm run test passes

**2. [Rule 3 - Blocking] Webhook tests require database**
- **Found during:** Task 1 (test execution)
- **Issue:** Tests used real prisma; database not running caused failures
- **Fix:** Refactored tests to mock @/lib/db and @/lib/orders/concurrency
- **Files modified:** src/app/api/webhooks/payments/route.test.ts
- **Verification:** All 4 webhook tests pass without DB

---

**Total deviations:** 2 auto-fixed (both Rule 3 - blocking)
**Impact on plan:** Necessary for test execution in environments without database. No scope creep.

## Issues Encountered

- Git not in PATH on Windows - commits could not be made during execution. User may run commits manually.
- Next.js build EINVAL on .next cache - resolved by removing .next and rebuilding.

## User Setup Required

Per plan user_setup: Configure webhook URL in gateway dashboard to `https://your-domain/api/webhooks/payments`. Set `PAYMENT_WEBHOOK_SECRET` env var for production gateway. Mock gateway uses `x-test-signature: valid` for tests.

## Next Phase Readiness

- Payment flow complete: users can pay via PIX/crypto, webhook marks orders paid
- Ready for Phase 3: VM provisioning triggered when order status → paid
- Mock gateway in use; swap to real gateway adapter when chosen

## Self-Check: PASSED

- `src/app/api/webhooks/payments/route.ts` — FOUND
- `src/app/api/payments/create/route.ts` — FOUND
- `src/app/orders/[id]/pay/page.tsx` — FOUND
- `src/components/PaymentForm.tsx` — FOUND
- `npm run test` — passes (11 tests)
- `npm run build` — exits 0

---
*Phase: 02-payments-order-automation*
*Completed: 2026-03-17*
