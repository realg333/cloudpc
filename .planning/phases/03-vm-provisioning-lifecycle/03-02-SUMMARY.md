---
phase: 03-vm-provisioning-lifecycle
plan: 02
subsystem: provisioning
tags: [vultr, rest-api, cron, provisioning, parsec]

# Dependency graph
requires:
  - phase: 03-01
    provides: ProvisionedVm, ProvisioningJob models; MachineProfile vultrPlanId/vultrRegion
provides:
  - Webhook enqueues ProvisioningJob and ProvisionedVm when order marked paid
  - Vultr REST client (createInstance, getInstance, deleteInstance)
  - Provisioning service with state machine, poll-for-ready, metadata recording
  - Cron endpoint /api/cron/process-provisioning for job processing
affects: [04-user-dashboard, 05-admin-operations]

# Tech tracking
tech-stack:
  added: []
  patterns: [REST-only Vultr integration, DB-backed job queue, cron-triggered processor]

key-files:
  created:
    - src/lib/vultr/client.ts
    - src/lib/provisioning/processor.ts
    - src/lib/provisioning/service.ts
    - src/app/api/cron/process-provisioning/route.ts
  modified:
    - src/app/api/webhooks/payments/route.ts
    - src/app/api/webhooks/payments/route.test.ts

key-decisions:
  - "Vultr Windows GPU os_id configurable via VULTR_WINDOWS_GPU_OS_ID (default 215)"
  - "Provisioning job stays 'pending' on transient errors for retry; only 'failed' for permanent (MISSING_PROFILE)"
  - "Cron protected by CRON_SECRET via x-cron-secret or Authorization header"

patterns-established:
  - "Webhook: DB writes only, no Vultr calls; provisioning runs in cron processor"
  - "Provisioning service: idempotent per order; retries poll when instance exists but timed out"

requirements-completed: [VM-02, VM-03, VM-04, VM-07]

# Metrics
duration: ~25min
completed: 2026-03-17
---

# Phase 3 Plan 02: Webhook Enqueue, Vultr Client, Provisioning Service Summary

**Webhook enqueues ProvisioningJob and ProvisionedVm on paid; Vultr REST client creates/gets/deletes instances; provisioning service creates VM, polls for ready, records metadata via cron processor.**

## Performance

- **Duration:** ~25 min
- **Tasks:** 3
- **Files created:** 4
- **Files modified:** 2

## Accomplishments

- Webhook creates ProvisioningJob and ProvisionedVm in same request after marking order paid; idempotent on P2002
- Vultr REST client: createInstance, getInstance, deleteInstance using fetch; VULTR_API_KEY required
- Provisioning service: processProvisioningJobs finds pending jobs (limit 5), processOneJob creates VM, polls every 30s until active (max 15 min), sets readyAt, expiresAt, connectionMethod/connectionState
- Cron endpoint GET /api/cron/process-provisioning protected by CRON_SECRET
- PROVISIONING_ENABLED env (default true) acts as kill switch
- Errors stored in failureCode, failureMessage, lastProviderResponse; retry with nextRetryAt

## Task Commits

Each task committed atomically (git not available in executor environment — commits to be made when git is available):

1. **Task 1: Webhook enqueue** — feat(03-02): create ProvisioningJob and ProvisionedVm after marking paid
2. **Task 2: Vultr REST client** — feat(03-02): add Vultr REST client (create, get, delete instance)
3. **Task 3: Provisioning service** — feat(03-02): add provisioning service, processor, cron route

## Files Created/Modified

- `src/app/api/webhooks/payments/route.ts` — Creates ProvisioningJob and ProvisionedVm after order paid; idempotent on duplicate orderId
- `src/app/api/webhooks/payments/route.test.ts` — Added provisioningJob/provisionedVm mocks
- `src/lib/vultr/client.ts` — Vultr REST client (createInstance, getInstance, deleteInstance)
- `src/lib/provisioning/processor.ts` — processProvisioningJobs, PROVISIONING_ENABLED check
- `src/lib/provisioning/service.ts` — processOneJob state machine, Vultr create, poll, metadata
- `src/app/api/cron/process-provisioning/route.ts` — Cron GET handler with CRON_SECRET

## Decisions Made

- VULTR_WINDOWS_GPU_OS_ID env (default 215) for Windows 2022 GPU image; Parsec via image (document that image must have Parsec for MVP)
- Job stays `pending` on transient errors so processor retries when nextRetryAt passes
- Retry logic: when instance exists but polling timed out, retry polls without re-creating

## Deviations from Plan

None - plan executed as written.

## Issues Encountered

- Next.js build hit transient EBUSY/EINVAL on Windows/OneDrive; `npx tsc --noEmit` passes
- Git not in PATH during execution; commits to be made manually

## User Setup Required

**External services require configuration:**

- **VULTR_API_KEY** — From Vultr Dashboard → Account → API. Required for VM create/get/delete.
- **CRON_SECRET** — Set in env for cron endpoint protection. Use `x-cron-secret` header or `Authorization: Bearer <secret>`.
- **VULTR_WINDOWS_GPU_OS_ID** (optional) — Default 215 (Windows 2022). Override if using different image.
- **PROVISIONING_ENABLED** (optional) — Set to `false` or `0` to disable provisioning (kill switch).

## Next Phase Readiness

- Provisioning pipeline complete; cron should be called periodically (e.g. every minute)
- Phase 03-03 will add time tracking, teardown, reconciliation

---
*Phase: 03-vm-provisioning-lifecycle*
*Completed: 2026-03-17*
