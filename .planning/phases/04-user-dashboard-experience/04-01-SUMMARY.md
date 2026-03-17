---
phase: 04-user-dashboard-experience
plan: 01
subsystem: ui
tags: [nextjs, react, prisma, polling, dashboard]

# Dependency graph
requires:
  - phase: 03-vm-provisioning-lifecycle
    provides: ProvisionedVm model, time-tracking (getRemainingMinutes, isExpired)
provides:
  - Dashboard shell at /dashboard with VM list
  - GET /api/dashboard/vms for user's VMs
  - VmStatusCard with status badge and remaining time
  - DashboardVmList with 15s polling for provisioning status updates
affects: [04-02 Connect/Parsec, order history]

# Tech tracking
tech-stack:
  added: []
  patterns: [server component + client polling wrapper, status badge color mapping]

key-files:
  created: [src/app/api/dashboard/vms/route.ts, src/app/dashboard/page.tsx, src/components/VmStatusCard.tsx, src/components/DashboardVmList.tsx]
  modified: []

key-decisions:
  - "15s poll interval when provisioning VMs exist; stop after 20 min or when all terminal"
  - "Status labels in pt-BR: Provisionando, Pronto, Expirando, Encerrando, Encerrado, Falhou"

patterns-established:
  - "Dashboard: server fetches initial data, client wrapper polls for updates when provisioning"

requirements-completed: [DASH-01, DASH-02]

# Metrics
duration: ~15min
completed: 2026-03-17
---

# Phase 4 Plan 01: Dashboard Shell Summary

**Dashboard with VM list, status display, remaining time, and 15s polling for provisioning-to-ready updates without manual refresh**

## Performance

- **Duration:** ~15 min
- **Tasks:** 3
- **Files modified:** 4 created

## Accomplishments

- GET /api/dashboard/vms returns user's VMs with status, readyAt, expiresAt, machineProfileName, planName; 401 when unauthenticated
- Dashboard page at /dashboard with redirect to /login when unauthenticated
- VmStatusCard shows status badge (amber/green/orange/gray), remaining time via getRemainingMinutes, "Expirado" when expired
- DashboardVmList polls every 15s when provisioning/payment_confirmed VMs exist; stops when all terminal or after 20 min

## Task Commits

Each task was committed atomically:

1. **Task 1: Dashboard API and VM list** - `39d5ebc` (feat)
2. **Task 2: Dashboard page and VmStatusCard** - `8fcf711` (feat)
3. **Task 3: Polling for real-time status updates** - `1e1d204` (feat)

## Files Created/Modified

- `src/app/api/dashboard/vms/route.ts` - GET endpoint for user VMs, auth, status labels
- `src/app/dashboard/page.tsx` - Server component, redirect, initial fetch, empty state
- `src/components/VmStatusCard.tsx` - VM card with status badge, remaining time, getRemainingMinutes/isExpired
- `src/components/DashboardVmList.tsx` - Client component with useState, useEffect polling

## Decisions Made

- 15s poll interval (configurable constant) balances responsiveness and server load
- Poll only when provisioning or payment_confirmed VMs exist; stop when all vm_ready/destroyed/failed
- Active VMs (vm_ready, expiring) shown first in list

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Windows EBUSY/EINVAL during build (file locking); resolved by clean .next and rebuild

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Dashboard shell complete; ready for 04-02 (Connect/Parsec, start-stop, order history)
- NavBar may need dashboard link (check layout/nav)

## Self-Check: PASSED

All created files exist. Commits 39d5ebc, 8fcf711, 1e1d204 verified.

---
*Phase: 04-user-dashboard-experience*
*Completed: 2026-03-17*
