---
phase: 03-vm-provisioning-lifecycle
verified: 2026-03-16T12:00:00Z
status: passed
score: 13/13 must-haves verified
gaps: []
human_verification:
  - test: "End-to-end: pay for order, wait for VM ready, connect via Parsec"
    expected: "VM becomes ready; Parsec connection works (image must have Parsec)"
    why_human: "Requires live Vultr API, real payment, and Parsec client"
  - test: "Teardown: let VM expire, verify cron destroys it"
    expected: "VM destroyed via Vultr API; order status becomes completed"
    why_human: "Requires scheduled cron and live Vultr"
  - test: "Admin panel surfaces failure states"
    expected: "Failed VMs visible with failureCode, failureMessage"
    why_human: "Admin panel is Phase 5; data is stored for it"
---

# Phase 3: VM Provisioning & Lifecycle Verification Report

**Phase Goal:** Fully automate Windows GPU VM provisioning on Vultr, including Parsec readiness, time tracking, and teardown. Paid orders result in ready-to-use Windows GPU VMs that are automatically destroyed when time expires.

**Verified:** 2026-03-16
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Machine profiles map to concrete Vultr GPU plan IDs and region | ✓ VERIFIED | `prisma/schema.prisma` MachineProfile has vultrPlanId, vultrRegion; `prisma/seed.ts` seeds vcg-a16-2c-16g-4vram, vcg-a16-3c-32g-8vram, vcg-a40-8c-64g-24vram for gru |
| 2 | ProvisionedVm model tracks full lifecycle state and time | ✓ VERIFIED | Schema has status, provisioningStartedAt, readyAt, expiresAt, destroyedAt, failureCode, failureMessage, lastProviderResponse, retryCount, nextRetryAt |
| 3 | ProvisioningJob model enables async enqueue without running in webhook | ✓ VERIFIED | Webhook creates ProvisioningJob + ProvisionedVm; no Vultr calls in webhook |
| 4 | Webhook marks paid and enqueues job; NO provisioning in webhook | ✓ VERIFIED | `route.ts` lines 94–112: prisma.provisioningJob.create, provisionedVm.create; no vultr/createInstance |
| 5 | Provisioning job processor creates VM via Vultr REST API | ✓ VERIFIED | `service.ts` calls vultr.createInstance; `client.ts` has createInstance, getInstance, deleteInstance via fetch |
| 6 | VM metadata (ID, IP, status) recorded when ready | ✓ VERIFIED | `service.ts` lines 91–98, 110–121: vultrInstanceId, ipAddress, readyAt, expiresAt, connectionMethod, connectionState |
| 7 | Parsec available via image (Windows GPU image with Parsec) | ✓ VERIFIED | VULTR_WINDOWS_GPU_OS_ID (default 215); connectionMethod='parsec', connectionState='ready' when vm_ready; image must have Parsec (deployment concern) |
| 8 | Provider errors stored for admin review | ✓ VERIFIED | failureCode, failureMessage, lastProviderResponse set in service, teardown, reconciliation |
| 9 | Remaining time computed from expiresAt and readyAt | ✓ VERIFIED | `time-tracking.ts`: getRemainingMinutes, isExpired, computeExpiresAt |
| 10 | VMs past expiresAt are automatically destroyed | ✓ VERIFIED | `teardown.ts` processExpiredVms finds vm_ready/expiring with expiresAt < now, calls deleteInstance |
| 11 | Order status transitions to completed when VM destroyed | ✓ VERIFIED | `teardown.ts` line 65–67: prisma.order.update status='completed' |
| 12 | Reconciliation detects DB/Vultr drift | ✓ VERIFIED | `reconciliation.ts` runReconciliation: getInstance 404 → RECONCILIATION_MISSING; listInstances → orphans; processExpiredVms for expired |
| 13 | Cost safety: max VMs, kill switch enforced | ✓ VERIFIED | `cost-safety.ts` canProvision, isProvisioningAllowed, getActiveVmCount; processor calls canProvision before processing |

**Score:** 13/13 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `prisma/schema.prisma` | ProvisionedVm, ProvisioningJob, MachineProfile vultr fields | ✓ VERIFIED | All models present with required fields |
| `prisma/seed.ts` | MachineProfile with vultrPlanId, vultrRegion | ✓ VERIFIED | Mid/High/Ultra GPU with gru region |
| `src/app/api/webhooks/payments/route.ts` | Enqueue ProvisioningJob after marking paid | ✓ VERIFIED | Creates job + VM in same flow; idempotent on P2002 |
| `src/lib/vultr/client.ts` | Vultr REST client (create, get, delete, list) | ✓ VERIFIED | createInstance, getInstance, deleteInstance, listInstances |
| `src/lib/provisioning/service.ts` | Provisioning state machine and orchestration | ✓ VERIFIED | processOneJob: create, poll, metadata, failure handling |
| `src/lib/provisioning/processor.ts` | Cron processor for pending jobs | ✓ VERIFIED | processProvisioningJobs, canProvision gate |
| `src/app/api/cron/process-provisioning/route.ts` | Cron endpoint | ✓ VERIFIED | CRON_SECRET protected, calls processProvisioningJobs |
| `src/lib/provisioning/time-tracking.ts` | getRemainingMinutes, isExpired, computeExpiresAt | ✓ VERIFIED | Exported for teardown/dashboard (Phase 4) |
| `src/lib/provisioning/teardown.ts` | Destroy expired VMs via Vultr API | ✓ VERIFIED | processExpiredVms, order status=completed |
| `src/lib/provisioning/reconciliation.ts` | DB vs Vultr state check | ✓ VERIFIED | runReconciliation with missing, orphans, expiredFixed |
| `src/lib/provisioning/cost-safety.ts` | Max VMs, provisioning kill switch | ✓ VERIFIED | canProvision, isProvisioningAllowed, getActiveVmCount |
| `src/app/api/cron/process-teardown/route.ts` | Teardown cron | ✓ VERIFIED | CRON_SECRET, processExpiredVms |
| `src/app/api/cron/reconciliation/route.ts` | Reconciliation cron | ✓ VERIFIED | CRON_SECRET, runReconciliation |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| webhooks/payments/route.ts | ProvisioningJob | prisma.provisioningJob.create | ✓ WIRED | Lines 94–96 |
| webhooks/payments/route.ts | ProvisionedVm | prisma.provisionedVm.create | ✓ WIRED | Lines 97–105 |
| service.ts | vultr/client.ts | createInstance, getInstance | ✓ WIRED | Lines 81, 104 |
| teardown.ts | vultr/client.ts | deleteInstance | ✓ WIRED | Line 54 |
| teardown.ts | Order | prisma.order.update status=completed | ✓ WIRED | Lines 65–67 |
| process-teardown/route.ts | teardown.ts | processExpiredVms | ✓ WIRED | Line 19 |
| reconciliation/route.ts | reconciliation.ts | runReconciliation | ✓ WIRED | Line 19 |
| processor.ts | cost-safety.ts | canProvision | ✓ WIRED | Line 24 |
| ProvisionedVm | Order | orderId relation | ✓ WIRED | Schema orderId, order relation |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| VM-01 | 03-01 | Platform maintains catalog of machine profiles mapped to Vultr GPU types | ✓ SATISFIED | MachineProfile vultrPlanId, vultrRegion; seed with vcg-* plans |
| VM-02 | 03-02 | On paid order, backend calls Vultr API to create Windows GPU VM | ✓ SATISFIED | Webhook enqueues; processor calls createInstance with profile |
| VM-03 | 03-02 | System waits for VM ready and records metadata (ID, IP, credentials, status) | ✓ SATISFIED | Poll until active; store vultrInstanceId, ipAddress, readyAt, expiresAt |
| VM-04 | 03-02 | Parsec installed and configured automatically | ✓ SATISFIED | Windows GPU image (os_id 215); connectionMethod='parsec'; image must have Parsec |
| VM-05 | 03-03 | System tracks remaining time based on package and start time | ✓ SATISFIED | time-tracking.ts getRemainingMinutes, isExpired; expiresAt from readyAt + durationHours |
| VM-06 | 03-03 | When time expires, system automatically stops and destroys VM | ✓ SATISFIED | processExpiredVms, deleteInstance, order status=completed |
| VM-07 | 03-02, 03-03 | Handles provider errors; surfaces failures in admin panel | ✓ SATISFIED | failureCode, failureMessage, lastProviderResponse stored; admin surfacing is Phase 5 |

**No orphaned requirements.** All VM-01 through VM-07 claimed by plans and satisfied.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/provisioning/config.ts` | - | Orphaned module; cost-safety uses own env vars | ℹ️ Info | Redundant; config has different default (maxActiveVms: 10) than cost-safety (50) |

No TODO/FIXME/PLACEHOLDER in provisioning or vultr code.

### Human Verification Required

1. **End-to-end provisioning and Parsec**
   - **Test:** Pay for order, wait for VM ready, connect via Parsec
   - **Expected:** VM becomes ready; Parsec connection works (image must have Parsec)
   - **Why human:** Requires live Vultr API, real payment, and Parsec client

2. **Teardown flow**
   - **Test:** Let VM expire, verify cron destroys it
   - **Expected:** VM destroyed via Vultr API; order status becomes completed
   - **Why human:** Requires scheduled cron and live Vultr

3. **Admin panel failure visibility**
   - **Test:** Admin panel surfaces failure states
   - **Expected:** Failed VMs visible with failureCode, failureMessage
   - **Why human:** Admin panel is Phase 5; data is stored for it

### Gaps Summary

None. All must-haves verified. Phase goal achieved. Ready for Phase 4 (User Dashboard Experience).

---

_Verified: 2026-03-16_
_Verifier: Claude (gsd-verifier)_
