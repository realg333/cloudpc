---
phase: 05-admin-operations-safety
plan: 01
subsystem: auth
tags: [next.js, prisma, admin, forbidden, authInterrupts]

# Dependency graph
requires:
  - phase: 01-foundation-accounts
    provides: User model, getSessionFromCookies, session auth
provides:
  - User.isAdmin field and migration
  - requireAdmin() helper (redirect login, 403 for non-admin)
  - /admin route with admin-only access
  - NavBar Admin link for admins
affects: [05-admin-operations-safety]

# Tech tracking
tech-stack:
  added: [authInterrupts experimental, forbidden from next/navigation]
  patterns: [layout-level requireAdmin guard, conditional nav by role]

key-files:
  created: [src/lib/auth/admin.ts, src/app/admin/layout.tsx, src/app/admin/page.tsx, prisma/migrations/20260317000000_add_user_is_admin/migration.sql]
  modified: [prisma/schema.prisma, next.config.mjs, prisma/seed.ts, src/components/NavBar.tsx]

key-decisions:
  - "Used Next.js forbidden() with authInterrupts for 403 (no redirect for non-admin)"
  - "ADMIN_EMAIL seed only updates existing users; create user first then re-run seed"

patterns-established:
  - "Admin guard: layout calls requireAdmin(), page can assume admin context"
  - "NavBar: async server component, getSessionFromCookies, conditional Admin link by isAdmin"

requirements-completed: [ADMIN-01, SAFE-04]

# Metrics
duration: ~15min
completed: 2026-03-17
---

# Phase 5 Plan 01: Admin Foundation Summary

**Admin auth with isAdmin field, requireAdmin helper, /admin shell, and NavBar Admin link for admins only**

## Performance

- **Duration:** ~15 min
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- User model has `isAdmin Boolean @default(false)`
- `requireAdmin()` in `src/lib/auth/admin.ts` — redirects to `/login?redirect=/admin` when unauthenticated, returns 403 via `forbidden()` when authenticated but not admin
- Admin layout and page at `/admin` with "Painel Admin" heading
- NavBar shows Admin link only when `session?.user?.isAdmin`
- Seed: `ADMIN_EMAIL` env promotes existing user to admin

## Task Commits

1. **Task 1: Add isAdmin to User and requireAdmin helper** - `eb5b599` (feat)
2. **Task 2: Admin panel shell at /admin** - `ad9b3ef` (feat)

## Files Created/Modified

- `prisma/schema.prisma` - Added isAdmin to User
- `next.config.mjs` - experimental.authInterrupts: true
- `src/lib/auth/admin.ts` - requireAdmin helper (created)
- `prisma/seed.ts` - ADMIN_EMAIL upsert for admin promotion
- `src/app/admin/layout.tsx` - requireAdmin guard (created)
- `src/app/admin/page.tsx` - Painel Admin shell (created)
- `src/components/NavBar.tsx` - async, Admin link for isAdmin

## Decisions Made

- Used Next.js 15 `forbidden()` with `authInterrupts: true` for 403 responses (no redirect for non-admin)
- ADMIN_EMAIL seed updates existing users only; user must exist before seed can promote

## Deviations from Plan

**1. [Rule 3 - Blocking] Migration created manually**
- **Found during:** Task 1
- **Issue:** Database unreachable (localhost:5432), `prisma migrate dev` failed
- **Fix:** Created migration SQL manually at `prisma/migrations/20260317000000_add_user_is_admin/migration.sql`
- **Note:** `prisma/migrations/` is gitignored; run `npx prisma migrate dev` when DB is available to apply

None other — plan executed as written.

## User Setup Required

- **Migration:** Run `npx prisma migrate dev` when PostgreSQL is running to apply the isAdmin column
- **First admin:** Set `ADMIN_EMAIL=your@email.com` and run `npx prisma db seed` after creating the user

## Self-Check: PASSED

- src/lib/auth/admin.ts, src/app/admin/page.tsx, src/app/admin/layout.tsx exist
- Commits eb5b599, ad9b3ef present in git log

## Next Phase Readiness

- Admin foundation complete; ready for 05-02 (ActionLog, VM list, terminate API)
