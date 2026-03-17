---
phase: 05-admin-operations-safety
plan: 03
subsystem: admin
tags: [admin, health, logs, action-log, abuse-signals, prisma]

# Dependency graph
requires:
  - phase: 05-admin-operations-safety
    provides: Admin foundation, VM list, terminate API
provides:
  - Admin health API (active count, per-profile counts, recent failures, abuse signals)
  - Admin logs API (ActionLog + PaymentLog)
  - createActionLog wired to provisioning (vm_ready) and teardown (destroyed)
  - AdminHealthSection and AdminLogsSection UI components
affects: [admin, monitoring]

# Tech tracking
tech-stack:
  added: []
  patterns: [admin API pattern with getAdminFromRequest, abuse signal aggregation]

key-files:
  created:
    - src/app/api/admin/health/route.ts
    - src/app/api/admin/logs/route.ts
    - src/components/AdminHealthSection.tsx
    - src/components/AdminLogsSection.tsx
  modified:
    - src/lib/provisioning/service.ts
    - src/lib/provisioning/teardown.ts
    - src/app/admin/page.tsx

key-decisions:
  - "Abuse signals computed in-memory from raw queries (no Prisma groupBy having) for compatibility"
  - "roughCostPerProfile returns '—' placeholder (MachineProfile has no hourlyRateCents)"

patterns-established:
  - "Admin health/logs APIs: getAdminFromRequest, 401/403, JSON response"

requirements-completed: [ADMIN-04, ADMIN-05, SAFE-01, SAFE-03]

# Metrics
duration: ~15min
completed: 2026-03-17
---

# Phase 5 Plan 3: Admin Health, Logs, and Abuse Signals Summary

**Admin health API (counts, failures, cost placeholder, abuse signals), logs API (ActionLog + PaymentLog), createActionLog wired to provisioning and teardown, and Admin health + logs UI sections.**

## Performance

- **Duration:** ~15 min
- **Tasks:** 3
- **Files modified:** 7 (4 created, 3 modified)

## Accomplishments

- createActionLog called when VM becomes vm_ready (provisioning) and when VM is destroyed (teardown)
- GET /api/admin/health returns activeVmCount, perProfileCounts, recentFailures, abuseSignals
- GET /api/admin/logs returns actionLogs and paymentLogs with optional entityType/limit params
- AdminHealthSection: total VMs, per-profile table, recent failures, abuse signals, SAFE-01 conformity badge
- AdminLogsSection: unified chronological view of ActionLog and PaymentLog

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire createActionLog to provisioning and teardown** - `4272143` (feat)
2. **Task 2: Admin health and logs APIs** - `312a76f` (feat)
3. **Task 3: Admin health and logs UI sections** - `dd68809` (feat)

## Files Created/Modified

- `src/app/api/admin/health/route.ts` - Health metrics and abuse signals API
- `src/app/api/admin/logs/route.ts` - ActionLog and PaymentLog API
- `src/components/AdminHealthSection.tsx` - Health UI (counts, failures, abuse)
- `src/components/AdminLogsSection.tsx` - Unified logs table
- `src/lib/provisioning/service.ts` - createActionLog on vm_ready
- `src/lib/provisioning/teardown.ts` - createActionLog on destroyed
- `src/app/admin/page.tsx` - AdminHealthSection and AdminLogsSection

## Decisions Made

- Used in-memory aggregation for abuse signals (repeated failed webhooks, provisioning errors, unusual restarts) instead of Prisma groupBy `having` for compatibility across Prisma versions
- roughCostPerProfile returns "—" placeholder; MachineProfile has no hourlyRateCents in schema

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Self-Check: PASSED

All created files exist. All task commits (4272143, 312a76f, dd68809) verified.

## Next Phase Readiness

- Admin health and logs complete; Phase 5 has 3 plans; 05-03 completes the health/logs/abuse visibility scope
- Ready for Phase 5 verification or additional admin features

---
*Phase: 05-admin-operations-safety*
*Completed: 2026-03-17*
