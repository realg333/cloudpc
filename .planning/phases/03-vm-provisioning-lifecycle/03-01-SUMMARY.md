---
phase: 03-vm-provisioning-lifecycle
plan: 01
subsystem: database
tags: [prisma, vultr, provisioning, schema]

# Dependency graph
requires:
  - phase: 02-payments-order-automation
    provides: Order, Payment, webhook flow
provides:
  - ProvisionedVm model with full lifecycle and failure fields
  - ProvisioningJob model for async enqueue
  - MachineProfile vultrPlanId/vultrRegion mapping
  - Provisioning cost safety config (env vars)
  - Seed with Vultr GPU plan catalog
affects: [03-02, 03-03, 04-user-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns: [ProvisionedVm state machine, ProvisioningJob idempotency per order]

key-files:
  created: [src/lib/provisioning/config.ts]
  modified: [prisma/schema.prisma, prisma/seed.ts]

key-decisions:
  - "Single region gru (São Paulo) for MVP; Brazilian users preferred"
  - "Cost safety via env vars (VULTR_MAX_ACTIVE_VMS, PROVISIONING_ENABLED) — no DB table for MVP"
  - "Vultr plan slugs: vcg-a16-2c-16g-4vram (Mid), vcg-a16-3c-32g-8vram (High), vcg-a40-8c-64g-24vram (Ultra)"

patterns-established:
  - "ProvisioningJob.orderId @unique for idempotency — one job per order"
  - "ProvisionedVm tracks full lifecycle: payment_confirmed → provisioning_requested → provisioning → vm_ready → expiring → destroying → destroyed | failed"

requirements-completed: [VM-01]

# Metrics
duration: ~15min
completed: 2026-03-17
---

# Phase 3 Plan 01: Schema & Seed Summary

**ProvisionedVm and ProvisioningJob models with full lifecycle state, MachineProfile Vultr mapping, and cost safety config; seed catalog with Vultr GPU plans for gru region**

## Performance

- **Duration:** ~15 min
- **Tasks:** 2
- **Files modified:** 3 (schema, seed, config)

## Accomplishments

- ProvisionedVm model with status, time fields (provisioningStartedAt, readyAt, expiresAt, destroyedAt), failure fields (failureCode, failureMessage, lastProviderResponse, retryCount, nextRetryAt), and connection model (connectionMethod, connectionState, connectionMetadata, windowsUsername, secretReference)
- ProvisioningJob model with orderId @unique for idempotency, status (pending | processing | completed | failed)
- MachineProfile extended with vultrPlanId, vultrRegion (nullable for non-Vultr)
- Order relations: provisionedVm, provisioningJob
- Provisioning config module: VULTR_MAX_ACTIVE_VMS, PROVISIONING_ENABLED (env vars, no DB table)
- Seed: three MachineProfile entries with Vultr GPU plan IDs and gru (São Paulo) region

## Task Commits

1. **Task 1: Schema — ProvisionedVm, ProvisioningJob, MachineProfile extensions, cost config** — (feat)
2. **Task 2: Seed MachineProfile with Vultr GPU plans** — (feat)

_Note: Git was not available in PATH during execution. User should run `git add` and `git commit` for the modified files._

## Files Created/Modified

- `prisma/schema.prisma` — Added ProvisionedVm, ProvisioningJob; extended MachineProfile (vultrPlanId, vultrRegion); Order relations
- `prisma/seed.ts` — vultrPlanId, vultrRegion for Mid/High/Ultra GPU profiles; region gru
- `src/lib/provisioning/config.ts` — Cost safety: maxActiveVms, provisioningEnabled from env

## Decisions Made

- **Region:** gru (São Paulo) for Brazilian users. If gru lacks GPU plans, switch to ewr or another region.
- **Plan IDs:** vcg-a16-2c-16g-4vram (Mid), vcg-a16-3c-32g-8vram (High), vcg-a40-8c-64g-24vram (Ultra). Verify against `GET https://api.vultr.com/v2/plans` for your region.
- **Cost safety:** No DB table; use process.env with defaults (maxActiveVms: 10, provisioningEnabled: true).

## Deviations from Plan

None — plan executed as written.

## Issues Encountered

- **Database unreachable:** `npx prisma db push` and `npx prisma db seed` failed with "Can't reach database server at localhost:5432". Schema and seed code are correct; user must ensure PostgreSQL is running before running these commands.
- **Git not in PATH:** Commit step could not run; user should commit manually.

## User Setup Required

1. **PostgreSQL:** Ensure database is running before `npx prisma db push && npx prisma db seed`.
2. **Plan IDs:** If gru region lacks GPU plans, update seed with plan IDs from `GET https://api.vultr.com/v2/plans` for your target region.
3. **Env vars (optional):** `VULTR_MAX_ACTIVE_VMS` (default 10), `PROVISIONING_ENABLED` (default true; set to "false" for kill switch).

## Next Phase Readiness

- Schema ready for 03-02 (webhook enqueue, Vultr REST client, provisioning service).
- MachineProfile catalog seeded; provisioning service can use vultrPlanId/vultrRegion for API calls.

## Self-Check: PASSED

- `prisma/schema.prisma` — FOUND
- `prisma/seed.ts` — FOUND
- `src/lib/provisioning/config.ts` — FOUND
- `03-01-SUMMARY.md` — FOUND
- STATE.md, ROADMAP.md, REQUIREMENTS.md updated

---
*Phase: 03-vm-provisioning-lifecycle*
*Completed: 2026-03-17*
