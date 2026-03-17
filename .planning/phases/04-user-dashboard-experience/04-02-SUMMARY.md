---
phase: 04-user-dashboard-experience
plan: 02
subsystem: ui, api
tags: [parsec, clipboard, nextjs, prisma, dashboard, orders]

# Dependency graph
requires:
  - phase: 04-01
    provides: Dashboard shell, VM list, status, remaining time, polling
provides:
  - Secure connection details API (GET /api/dashboard/vms/[id]/connection)
  - Connect button in VmStatusCard for Parsec flow
  - VM state display and start/stop placeholder
  - Order history with provisionedVm usage records (readyAt, destroyedAt/expiresAt)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [client component for Connect button with fetch + clipboard]

key-files:
  created:
    - src/app/api/dashboard/vms/[id]/connection/route.ts
  modified:
    - src/components/VmStatusCard.tsx
    - src/app/orders/page.tsx
    - src/app/dashboard/page.tsx

key-decisions:
  - "Connect copies hostname/IP/peerId to clipboard; user pastes into Parsec (no parsec:// URL)"
  - "Start/stop is placeholder only; Vultr GPU instances use expiry-based teardown"

patterns-established:
  - "Connection API: auth + ownership check, 400 when VM not ready"

requirements-completed: [DASH-03, DASH-04, DASH-05]

# Metrics
duration: ~25min
completed: 2026-03-17
---

# Phase 4 Plan 02: Connect/Parsec, Order History Summary

**Connect button copies Parsec connection details to clipboard; VM state display with start/stop placeholder; order history with usage timestamps**

## Performance

- **Duration:** ~25 min
- **Tasks:** 3
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments

- GET /api/dashboard/vms/[id]/connection with auth, ownership check, and 400 when VM not ready
- Connect button in VmStatusCard when vm_ready + connectionState=ready; copies hostname/IP/peerId to clipboard
- Estado: Rodando for vm_ready/expiring; disabled Parar button with tooltip
- Orders page includes provisionedVm with usage records (Iniciado em, Encerrado em)
- Dashboard links to /orders (Ver histórico de pedidos)

## Task Commits

Each task was committed atomically:

1. **Task 1: Connection API and Connect button** - `37e6d49` (feat)
2. **Task 2: Start/stop state and placeholder** - `eef82d6` (feat)
3. **Task 3: Order history with usage records** - `1bd665a` (feat)

## Files Created/Modified

- `src/app/api/dashboard/vms/[id]/connection/route.ts` - GET endpoint returning ipAddress, hostname, connectionMethod, peerId
- `src/components/VmStatusCard.tsx` - Connect button, Estado: Rodando, disabled Parar button
- `src/app/orders/page.tsx` - provisionedVm include, Máquina column with usage timestamps
- `src/app/dashboard/page.tsx` - Link to /orders

## Decisions Made

- Connect flow: copy to clipboard (hostname, IP, optional peerId); user pastes into Parsec or finds computer in app
- Start/stop: placeholder only; Vultr GPU instances run until expiry
- No windowsUsername/password in connection response (Parsec uses peer_id or host discovery)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 4 complete; ready for Phase 5 (Admin Operations & Safety)
- DASH-03, DASH-04, DASH-05 requirements satisfied

## Self-Check: PASSED

- 04-02-SUMMARY.md exists
- Commits 37e6d49, eef82d6, 1bd665a present

---
*Phase: 04-user-dashboard-experience*
*Completed: 2026-03-17*
