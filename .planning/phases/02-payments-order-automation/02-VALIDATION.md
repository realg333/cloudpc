---
phase: 2
slug: payments-order-automation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Unit: Vitest 2.x; E2E: Playwright 1.49 |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test && npm run test:e2e` |
| **Estimated runtime** | ~60–120 seconds (full suite) |

---

## Sampling Rate

- **After every task commit:** Run `npm run test`
- **After every plan wave:** Run `npm run test` + `npm run test:e2e`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | PLAN-03 | unit | `npm run test -- src/lib/orders/concurrency.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | PAY-03 | unit | `npm run test -- src/app/api/webhooks/payments/*.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | PAY-01, PAY-02 | unit + E2E | `npm run test` / `npm run test:e2e` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | PAY-04 | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 2 | PAY-05 | unit | `npm run test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/orders/concurrency.test.ts` — covers PLAN-03 (hasActiveOrder)
- [ ] `src/lib/payments/gateway.test.ts` — adapter interface
- [ ] `src/app/api/webhooks/payments/route.test.ts` — webhook handler (signature, idempotency)
- [ ] `tests/e2e/payments.spec.ts` — E2E payment flow (can use mocked webhook)
- [ ] Fixtures: mock webhook payloads for PIX/crypto success/failure

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real PIX payment confirmation | PAY-01 | Requires live gateway | Use gateway sandbox; complete PIX flow; verify webhook received and order marked paid. |
| Real crypto payment confirmation | PAY-02 | Requires live gateway | Use gateway sandbox; complete crypto flow; verify webhook received and order marked paid. |

*Other phase behaviors have automated verification (unit/E2E with mocks).*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter after Wave 0 and specs are green

**Approval:** pending
