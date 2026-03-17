---
phase: 03-vm-provisioning-lifecycle
plan: 03
subsystem: provisioning
tags: [vultr, cron, teardown, reconciliation, cost-safety]

# Dependency graph
requires:
  - phase: 03-vm-provisioning-lifecycle
    provides: ProvisionedVm, Order models; Vultr client; provisioning service
provides:
  - Time tracking (getRemainingMinutes, isExpired, computeExpiresAt)
  - Teardown flow (processExpiredVms) — destroy expired VMs, mark order completed
  - Reconciliation (runReconciliation) — DB vs Vultr drift detection
  - Cost safety (canProvision, kill switch, max VMs)
affects: [04-connect-ux]

# Tech tracking
tech-stack:
  added: []
  patterns: [cron CRON_SECRET protection, Vultr listInstances for reconciliation]

key-files:
  created:
    - src/lib/provisioning/time-tracking.ts
    - src/lib/provisioning/teardown.ts
    - src/lib/provisioning/cost-safety.ts
    - src/lib/provisioning/reconciliation.ts
    - src/app/api/cron/process-teardown/route.ts
    - src/app/api/cron/reconciliation/route.ts
  modified:
    - src/lib/vultr/client.ts (listInstances)
    - src/lib/provisioning/processor.ts (canProvision gate)

key-decisions:
  - "Kill switch via PROVISIONING_ENABLED; max VMs via VULTR_MAX_ACTIVE_VMS (default 50)"
  - "Reconciliation marks DB-only missing instances as failed, logs orphans; calls processExpiredVms for expired cleanup"
  - "hasActiveOrder already excludes completed orders — no change needed"

patterns-established:
  - "Cron routes: x-cron-secret or Bearer token, return 200 with summary payload"
  - "Teardown: vm_ready/expiring → destroying → destroyed; Order → completed on success"

requirements-completed: [VM-05, VM-06, VM-07]

# Metrics
duration: ~15min
completed: 2026-03-17
---

# Phase 3 Plan 03: Time Tracking, Teardown, Reconciliation, Cost Safety Summary

**Time tracking utilities, automatic teardown of expired VMs via Vultr API, DB vs Vultr reconciliation, and cost safety controls (kill switch, max VMs) with cron endpoints.**

## Performance

- **Duration:** ~15 min
- **Tasks:** 3
- **Files created:** 6
- **Files modified:** 2

## Accomplishments

- **Time tracking:** `getRemainingMinutes`, `isExpired`, `computeExpiresAt` with optional GRACE_PERIOD_MINUTES
- **Teardown:** `processExpiredVms()` finds expired VMs (vm_ready/expiring, expiresAt < now), calls `deleteInstance`, sets destroyedAt, status=destroyed, Order status=completed
- **Cron process-teardown:** GET `/api/cron/process-teardown` protected by CRON_SECRET, returns `{ destroyed: N }`
- **Cost safety:** `isProvisioningAllowed`, `getActiveVmCount`, `canProvision`; processor skips jobs when canProvision false, sets nextRetryAt
- **Reconciliation:** `runReconciliation()` checks DB VMs vs Vultr (404 → RECONCILIATION_MISSING), detects orphans, calls processExpiredVms for expired cleanup
- **Cron reconciliation:** GET `/api/cron/reconciliation` protected by CRON_SECRET, returns `{ checked, missing, orphans, expiredFixed }`
- **Vultr listInstances:** Added to client for reconciliation

## Task Commits

Git was not available in the execution environment. Intended atomic commits:

1. **Task 1: Time tracking and remaining time** - `feat(03-03): add time-tracking utilities`
2. **Task 2: Teardown — destroy expired VMs** - `feat(03-03): add teardown flow and process-teardown cron`
3. **Task 3: Reconciliation and cost safety** - `feat(03-03): add cost-safety, reconciliation, update processor`

## Files Created/Modified

- `src/lib/provisioning/time-tracking.ts` — getRemainingMinutes, isExpired, computeExpiresAt
- `src/lib/provisioning/teardown.ts` — processExpiredVms
- `src/lib/provisioning/cost-safety.ts` — isProvisioningAllowed, getActiveVmCount, canProvision
- `src/lib/provisioning/reconciliation.ts` — runReconciliation
- `src/app/api/cron/process-teardown/route.ts` — cron handler
- `src/app/api/cron/reconciliation/route.ts` — cron handler
- `src/lib/vultr/client.ts` — listInstances()
- `src/lib/provisioning/processor.ts` — canProvision gate, nextRetryAt on skip

## Decisions Made

- Kill switch via PROVISIONING_ENABLED (default true); max VMs via VULTR_MAX_ACTIVE_VMS (default 50)
- Reconciliation: mark missing (404) as failed with RECONCILIATION_MISSING; log orphans; call processExpiredVms for expired VMs
- hasActiveOrder (status='paid') already excludes completed — verified, no change

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **Build:** Initial build failed with EINVAL readlink on `.next` (OneDrive sync). Resolved by removing `.next` and rebuilding.
- **Git:** Not available in execution environment; commits not performed.

## Self-Check: PASSED

All created files verified present. Git was unavailable; commits not performed.

## Next Phase Readiness

- Time tracking, teardown, reconciliation, and cost safety in place
- Cron endpoints ready for scheduler (e.g. Vercel Cron, external cron)
- Phase 4 (Connect UX) can use getRemainingMinutes for dashboard display

---
*Phase: 03-vm-provisioning-lifecycle*
*Completed: 2026-03-17*
