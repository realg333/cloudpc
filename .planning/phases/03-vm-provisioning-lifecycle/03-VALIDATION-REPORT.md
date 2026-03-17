# Phase 3: VM Provisioning & Lifecycle — Full Validation Report

**Validated:** 2026-03-16  
**Scope:** VM creation, provisioning flow, readiness, Parsec, time tracking, teardown, error handling, idempotency

---

## Executive Summary

Phase 3 implementation is **largely complete** and aligns with the plans. Build and tests pass. Several issues should be addressed before Phase 4, including one **critical** idempotency gap that can create duplicate VMs.

| Area | Status | Notes |
|------|--------|-------|
| VM creation via Vultr API | ✅ OK | createInstance, getInstance, deleteInstance, listInstances |
| Provisioning flow after payment | ✅ Fixed | Job/VM creation in same transaction as order update |
| VM readiness detection | ✅ OK | Poll every 30s until active, max 15 min |
| Parsec availability | ✅ OK | connectionMethod='parsec', connectionState='ready'; image must have Parsec |
| Time tracking (startedAt, expiresAt) | ✅ OK | provisioningStartedAt, readyAt, expiresAt, destroyedAt; GRACE_PERIOD not used |
| Automatic teardown | ✅ OK | processExpiredVms, deleteInstance, order→completed |
| Error handling and retries | ✅ OK | failureCode, lastProviderResponse, nextRetryAt; no max retry cap |
| Idempotency (no duplicate VMs) | ✅ Fixed | findInstanceByLabel before create; reuse existing instance |

---

## 1. VM Creation via Vultr API

**Status:** ✅ OK

- `src/lib/vultr/client.ts`: REST client with `createInstance`, `getInstance`, `deleteInstance`, `listInstances`
- Uses `fetch`, no SDK; `VULTR_API_KEY` required
- Error body captured for `lastProviderResponse`
- `createInstance` sends region, plan, os_id, label, hostname

---

## 2. Provisioning Flow After Payment

**Status:** ✅ Fixed

**Flow:** Webhook marks order paid → creates ProvisioningJob + ProvisionedVm → cron processor runs `processProvisioningJobs` → `processOneJob` creates VM via Vultr.

**Fix applied:** Order update, Payment create, ProvisioningJob create, and ProvisionedVm create are now in a **single interactive transaction**. Conditional creates (findUnique before create) ensure idempotency without P2002 throws. Either all succeed or the transaction rolls back — no paid order can exist without a provisioning job.

---

## 3. VM Readiness Detection

**Status:** ✅ OK

- Polls `vultr.getInstance(id)` every 30s until `status === 'active'`
- Max duration 15 minutes; on timeout sets `PROVISIONING_TIMEOUT`
- On active: sets `readyAt`, `expiresAt`, `connectionMethod`, `connectionState`

---

## 4. Parsec Availability

**Status:** ✅ OK (with deployment caveat)

- `connectionMethod: 'parsec'`, `connectionState: 'ready'` when VM is ready
- Uses `VULTR_WINDOWS_GPU_OS_ID` (default 215) for Windows GPU image
- Parsec must be pre-installed on the image; this is a deployment concern, not enforced in code

---

## 5. Time Tracking (startedAt, expiresAt)

**Status:** ✅ OK

- `provisioningStartedAt` set when entering `provisioning`
- `readyAt` set when VM becomes active
- `expiresAt = readyAt + plan.durationHours`
- `destroyedAt` set on teardown
- `time-tracking.ts`: `getRemainingMinutes`, `isExpired`, `computeExpiresAt` exported for dashboard

**Note:** `computeExpiresAt` supports `GRACE_PERIOD_MINUTES`, but `service.ts` computes `expiresAt` inline and does not use it. Grace period is never applied to new VMs. If intentional, document; otherwise use `computeExpiresAt` in the service.

---

## 6. Automatic Teardown

**Status:** ✅ OK

- `teardown.ts`: `processExpiredVms` finds `vm_ready`/`expiring` with `expiresAt < now`
- Calls `vultr.deleteInstance`, sets `destroyedAt`, `status=destroyed`
- Updates Order `status=completed`
- Cron at `src/app/api/cron/process-teardown/route.ts`, protected by `CRON_SECRET`
- Errors stored in `failureCode`, `failureMessage`, `lastProviderResponse`

---

## 7. Error Handling and Retries

**Status:** ✅ OK

- Vultr errors: `failureCode`, `failureMessage`, `lastProviderResponse` (includes body)
- Retries: `retryCount`, `nextRetryAt`; backoff 30 min on error, 1 hr on timeout
- Job stays `pending` so it can be retried after `nextRetryAt`
- `MISSING_PROFILE` and other permanent failures retry indefinitely (no max retry cap)

**Recommendation:** Add `maxRetryCount` (e.g. 5) and mark job/vm as permanently failed after that.

---

## 8. Idempotency (No Duplicate VMs per Order)

**Status:** ✅ Fixed

**Webhook idempotency:** ✅ OK  
- Single transaction: order, payment, job, vm  
- Conditional creates (findUnique before create) avoid P2002  
- Duplicate webhooks do not create duplicate jobs/VMs

**Service idempotency:** ✅ Fixed  
- Before `createInstance`, calls `vultr.findInstanceByLabel(cloudpc-{orderId})`  
- If instance exists (e.g. createInstance succeeded but DB update failed), reuses it  
- No duplicate VMs even when DB update fails or process crashes

---

## Additional Findings

| Finding | Severity | Details |
|---------|----------|---------|
| `listInstances` pagination | Low | Vultr API supports cursor pagination; current impl may miss orphans if >100 instances |
| Reconciliation orphans | Info | Orphans are logged only; no automatic destroy (acceptable for MVP) |
| `config.ts` orphan | Info | VERIFICATION.md notes orphaned config module; cost-safety uses env vars directly |

---

## Verification Commands

```bash
npm run build   # ✓ Passes
npm run test    # ✓ 11 tests pass
```

---

## Recommendations Before Phase 4

1. ~~**Critical:** Fix idempotency gap~~ ✅ Done — `findInstanceByLabel` before create, reuse if found.
2. ~~**High:** Move ProvisioningJob and ProvisionedVm creation into the same transaction~~ ✅ Done — single interactive transaction.
3. **Medium:** Add `maxRetryCount` and stop retrying after a limit.
4. **Low:** Use `computeExpiresAt` in the service if grace period is desired, or document that it is not used.
5. **Low:** Add pagination to `listInstances` for reconciliation if many instances are expected.

---

*Validation completed 2026-03-16*
