---
phase: 07-dashboard-polish
plan: 02
subsystem: ui
tags: [react, tailwind, dark-theme, vm-status, countdown, cta]

# Dependency graph
requires:
  - phase: 07-dashboard-polish
    provides: dark-plans wrapper, globals.css tokens
provides:
  - VmStatusCard with dark theme, status clarity, prominent time display, dominant Connect CTA
affects: [dashboard, plans]

# Tech tracking
tech-stack:
  added: []
  patterns: [dark-theme statusConfig, client-side countdown with useEffect, dm-cta gradient]

key-files:
  created: []
  modified: [src/components/VmStatusCard.tsx]

key-decisions:
  - "Dark theme statusConfig: amber (provisioning), emerald (ready+connect), orange (expiring/destroying), slate (terminal)"
  - "Countdown: 60s interval normally, 1s when <5 min remaining for real-time last minutes"
  - "Connect CTA: orange gradient (#f97316→#ea580c), prominent shadow, min-h-[60px] when featured"

patterns-established:
  - "VmStatusCard statusConfig pattern: card/iconBg/iconColor/badge per status with dark theme"
  - "Time urgency: text-orange-400 (30-60 min), text-red-400 + animate-pulse (<30 min), motion-reduce:animate-none"

requirements-completed: [DASH-02, DASH-03, DASH-04]

# Metrics
duration: ~15min
completed: 2026-03-17
---

# Phase 7 Plan 2: VmStatusCard Dark Theme & CTA Summary

**VmStatusCard dark theme with distinct status colors, prominent remaining-time countdown and progress bar, and dominant Connect CTA when VM is connectable**

## Performance

- **Duration:** ~15 min
- **Tasks:** 3
- **Files modified:** 1 (VmStatusCard.tsx)

## Accomplishments

- Dark theme statusConfig: each status (provisioning, ready, expiring, destroyed) visually distinct with colored borders and badges
- Client-side countdown: remaining time updates every 60s or 1s when <5 min; "Tempo restante" label, tabular-nums, urgency styling
- Progress bar: bg-white/10 track, emerald/orange/red fill by usage; h-3 when featured
- Connect CTA: orange gradient, prominent shadow, min-h-[60px] featured, aria-label for accessibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Apply dark theme statusConfig — each status visually distinct** - `8f45bfb` (feat)
2. **Task 2: Make remaining time prominent — countdown + progress bar** - `f3005f0` (feat)
3. **Task 3: Make Connect CTA the strongest element** - `1197e5b` (feat)

## Files Created/Modified

- `src/components/VmStatusCard.tsx` - Dark theme statusConfig, countdown state+useEffect, time display, Connect button styling

## Decisions Made

- Status colors: amber (provisioning), emerald (ready+canConnect), orange (expiring/destroying), slate (terminal/default)
- Countdown interval: 60s normally, 1s when remaining <5 min for real-time last minutes
- Connect button: dm-cta gradient (#f97316→#ea580c), shadow for prominence, focus ring offset for dark bg

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- VmStatusCard ready for dashboard integration
- Status clarity, time display, and Connect CTA meet DASH-02, DASH-03, DASH-04

## Self-Check: PASSED

- SUMMARY.md exists
- Commits 8f45bfb, f3005f0, 1197e5b verified

---
*Phase: 07-dashboard-polish*
*Completed: 2026-03-17*
