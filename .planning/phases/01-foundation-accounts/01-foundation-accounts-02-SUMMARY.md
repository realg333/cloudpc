---
phase: 01-foundation-accounts
plan: 02
subsystem: plans, orders, database, ui
tags: prisma, next.js, react, postgres, plans, orders

# Dependency graph
requires:
  - phase: 01-foundation-accounts-01
    provides: User model, session auth (getSessionFromCookies), login/signup flow
provides:
  - MachineProfile, Plan, Order Prisma models with seed data
  - listPlanOptions catalog helper for plan/profile combinations
  - PlanCard component with PT-BR copy, PIX/crypto payment hints
  - /plans page (auth-protected) with card grid
  - POST/GET /api/orders for order creation and listing
  - /orders page listing user orders with status labels
affects: Phase 2 (Payments), Phase 3 (VM Provisioning)

# Tech tracking
tech-stack:
  added: ts-node (devDep for prisma seed)
  patterns: Server components with getSessionFromCookies for auth, client PlanCard for CTA with fetch

key-files:
  created: prisma/seed.ts, src/lib/plans/catalog.ts, src/components/PlanCard.tsx, src/app/plans/page.tsx, src/app/api/orders/route.ts, src/app/orders/page.tsx
  modified: prisma/schema.prisma, package.json, src/components/NavBar.tsx

key-decisions:
  - "Added @unique to MachineProfile.name and Plan.name for idempotent seed upserts"
  - "PlanCard is a client component to handle CTA click and POST to /api/orders"

patterns-established:
  - "Plans catalog: Cartesian product of active Plan × MachineProfile via listPlanOptions"
  - "Order API: getSessionFromCookies for auth, validate plan/profile exist and active before create"

requirements-completed: [PLAN-01, PLAN-02]

# Metrics
duration: ~25 min
completed: 2026-03-16
---

# Phase 1 Plan 2: Plans Catalog and Order Shells Summary

**Prisma schema with MachineProfile, Plan, Order; seed data; PT-BR card-based plans listing; order creation API and orders page.**

## Performance

- **Duration:** ~25 min
- **Tasks:** 3
- **Files created:** 6
- **Files modified:** 3

## Accomplishments

- MachineProfile, Plan, and Order models added to Prisma schema with proper relations and indexes
- Seed script with upserts for 3 machine profiles (Mid/High/Ultra GPU) and 3 plans (4h, 24h, semanal)
- `listPlanOptions()` returns all active plan × profile combinations for the UI
- PlanCard component shows profile name, GPU tier, RAM/CPU, duration, PIX/crypto copy with "Cripto recomendado" badge
- /plans page (auth-protected) renders grid of PlanCards; CTA creates order via POST /api/orders
- /orders page lists user orders with PT-BR status labels (e.g. "Aguardando pagamento")

## Task Commits

Git was not available in PATH during execution. Changes are ready to commit:

1. **Task 1:** Extend Prisma schema (MachineProfile, Plan, Order) + seed — `prisma/schema.prisma`, `prisma/seed.ts`, `package.json`
2. **Task 2:** Plan catalog helper, PlanCard, /plans page — `src/lib/plans/catalog.ts`, `src/components/PlanCard.tsx`, `src/app/plans/page.tsx`, `src/components/NavBar.tsx`
3. **Task 3:** Order API (POST/GET), orders page — `src/app/api/orders/route.ts`, `src/app/orders/page.tsx`

## Files Created/Modified

- `prisma/schema.prisma` — Added MachineProfile, Plan, Order; User.orders relation; @unique on name for upserts
- `prisma/seed.ts` — Upserts 3 MachineProfiles, 3 Plans; clears Order before seed
- `package.json` — prisma:seed script, ts-node devDep, prisma.seed config
- `src/lib/plans/catalog.ts` — listPlanOptions() returns plan × profile combinations
- `src/components/PlanCard.tsx` — Card with profile/plan info, CTA POSTs to /api/orders
- `src/app/plans/page.tsx` — Auth-protected plans listing
- `src/app/api/orders/route.ts` — POST (create order), GET (list user orders)
- `src/app/orders/page.tsx` — Auth-protected orders list
- `src/components/NavBar.tsx` — Added Planos link

## Decisions Made

- Added `@unique` to `MachineProfile.name` and `Plan.name` to support idempotent seed upserts
- PlanCard is a client component to handle button click and fetch; plans page remains a server component

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added @unique to MachineProfile.name and Plan.name**
- **Found during:** Task 1 (seed implementation)
- **Issue:** Plan specified "upserts" but Prisma upsert requires a unique field
- **Fix:** Added @unique to name on both models
- **Files modified:** prisma/schema.prisma

**2. [Rule 3 - Blocking] Regenerated Prisma client and cleaned .next**
- **Found during:** Task 2/3 (build)
- **Issue:** Prisma client lacked Order model; .next had stale symlink
- **Fix:** Ran `npx prisma generate`; removed .next and rebuilt
- **Verification:** npm run build succeeds

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both necessary for correctness. No scope creep.

## Issues Encountered

- **Database not reachable:** `npx prisma migrate dev --name init_plans` failed with "Can't reach database server at localhost:5432". User must have PostgreSQL running and DATABASE_URL configured in .env. Run `npx prisma migrate dev --name init_plans` and `npm run prisma:seed` after starting the database.
- **Git not in PATH:** Per-task commits could not be made. All changes are implemented and ready for manual commit.

## User Setup Required

None beyond existing .env (DATABASE_URL, SESSION_SECRET). Ensure PostgreSQL is running before running migrations and seed.

## Next Phase Readiness

- Plans catalog and order creation flow complete
- Ready for Phase 2 (Payments & Order Automation) to wire payment webhooks and transition orders from pending_payment to paid

## Self-Check: PASSED

All key files verified on disk: prisma/seed.ts, src/lib/plans/catalog.ts, src/components/PlanCard.tsx, src/app/plans/page.tsx, src/app/api/orders/route.ts, src/app/orders/page.tsx.

---
*Phase: 01-foundation-accounts*
*Completed: 2026-03-16*
