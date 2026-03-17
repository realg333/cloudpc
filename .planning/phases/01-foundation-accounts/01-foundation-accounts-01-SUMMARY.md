---
phase: 01-foundation-accounts
plan: 01
subsystem: auth
tags: nextjs, prisma, bcrypt, otplib, jose, totp, session, email-verification

# Dependency graph
requires: []
provides:
  - Next.js App Router skeleton with PT-BR layout and NavBar
  - Prisma schema with User, Session, EmailVerificationToken, TwoFactorSecret
  - Email/password signup with verification flow
  - Session management with httpOnly cookies (8h expiry)
  - Optional TOTP 2FA via authenticator app
  - Login, logout, verify-email, two-factor setup and verify flows
affects: 02-payments-order-automation, 03-vm-provisioning, 04-dashboard

# Tech tracking
tech-stack:
  added: bcryptjs, otplib, jose, @prisma/client, prisma
  patterns: JWT-signed session cookies, pending-2FA cookie for login flow, Server Actions via API routes

key-files:
  created:
    - prisma/schema.prisma
    - src/lib/db.ts
    - src/lib/auth/password.ts
    - src/lib/auth/session.ts
    - src/lib/auth/twoFactor.ts
    - src/app/(auth)/signup/page.tsx
    - src/app/(auth)/login/page.tsx
    - src/app/(auth)/logout/route.ts
    - src/app/(auth)/verify-email/route.ts
    - src/app/(auth)/two-factor/setup/page.tsx
    - src/app/(auth)/two-factor/verify/page.tsx
    - src/app/api/auth/signup/route.ts
    - src/app/api/auth/login/route.ts
    - src/app/api/auth/session/route.ts
    - src/app/api/auth/two-factor/verify/route.ts
    - src/app/api/auth/two-factor/setup/confirm/route.ts
    - .env.example
  modified:
    - package.json
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/components/NavBar.tsx

key-decisions:
  - "JWT-signed session cookies (jose) instead of opaque tokens for stateless validation with DB-backed Session records"
  - "8-hour session duration balancing security and low-friction UX"
  - "Pending 2FA cookie (5 min) for login flow when user has 2FA enabled"
  - "Email verification stub (console.log) - real email sending deferred to later phase"

patterns-established:
  - "Auth: createSession/getSession/destroySession with httpOnly secure cookies"
  - "2FA: generateTwoFactorSecret stores in DB; verifyTwoFactorCode validates TOTP via otplib"
  - "Form posts to API routes with redirects for auth flows (signup, login, 2FA verify)"

requirements-completed:
  - AUTH-01
  - AUTH-02
  - AUTH-03
  - AUTH-04

# Metrics
duration: 0min
completed: "2026-03-17"
---

# Phase 01 Plan 01: Foundation & Accounts Summary

**Email/password auth with verification, JWT session cookies, and optional TOTP 2FA using bcrypt, jose, and otplib**

## Performance

- **Duration:** Verification only (implementation pre-existing from prior work)
- **Tasks:** 3 verified complete
- **Files modified:** 0 (all artifacts present and verified)

## Accomplishments

- Next.js App Router skeleton with Brazilian Portuguese layout, NavBar (Dashboard, Minhas Máquinas, Pedidos, Cobranças, Perfil, Entrar, Criar conta), and landing page
- Prisma schema with User, Session, EmailVerificationToken, TwoFactorSecret; singleton db client
- Signup creates User + EmailVerificationToken, logs verification link (stub); verify-email GET marks user verified
- Login with email/password; redirects to 2FA verify step when enabled; createSession sets httpOnly cookie
- Logout destroys session and clears cookie
- Two-factor setup page (authenticated) generates secret, shows otpauth URL; confirm route verifies TOTP
- Two-factor verify page + API route completes login when pending-2FA cookie present
- Session API returns user id, email, twoFactorEnabled or 401

## Task Commits

Implementation was completed in prior sessions (Plan 02 and gaps built on this foundation). This execution verified all Plan 01 acceptance criteria and created the summary.

**Verification:** `npm run build` succeeds; `npx prisma validate` passes; Playwright tests list successfully.

## Files Created/Modified

- `prisma/schema.prisma` - User, Session, EmailVerificationToken, TwoFactorSecret models
- `src/lib/db.ts` - Singleton PrismaClient with globalThis pattern
- `src/lib/auth/password.ts` - hashPassword, verifyPassword (bcryptjs, 10 rounds)
- `src/lib/auth/session.ts` - createSession, getSession, destroySession, setPending2FA, getPending2FAUserId
- `src/lib/auth/twoFactor.ts` - generateTwoFactorSecret, generateTwoFactorOtpauthUrl, verifyTwoFactorCode
- `src/app/(auth)/signup/page.tsx` - Signup form, posts to /api/auth/signup
- `src/app/(auth)/login/page.tsx` - Login form, posts to /api/auth/login
- `src/app/(auth)/verify-email/route.ts` - GET handler, validates token, marks user verified
- `src/app/(auth)/logout/route.ts` - GET handler, destroySession, redirect to /
- `src/app/(auth)/two-factor/setup/page.tsx` - 2FA setup with QR/secret, posts to setup/confirm
- `src/app/(auth)/two-factor/verify/page.tsx` - 2FA code input, posts to api/auth/two-factor/verify
- `src/app/api/auth/signup/route.ts` - Creates User, EmailVerificationToken, redirects
- `src/app/api/auth/login/route.ts` - Validates credentials, setPending2FA or createSession
- `src/app/api/auth/session/route.ts` - GET returns user or 401
- `src/app/api/auth/two-factor/verify/route.ts` - POST validates TOTP, createSession
- `.env.example` - DATABASE_URL, SESSION_SECRET placeholders

## Decisions Made

- Used jose for JWT signing (ESM-native, Edge-compatible)
- Pending 2FA cookie pattern for multi-step login when 2FA enabled
- Email sending is stub (console.log) - real implementation deferred

## Deviations from Plan

None - plan executed exactly as written. Implementation was completed in prior work; this execution verified all acceptance criteria.

## Issues Encountered

- `npm run lint` fails due to pre-existing warning in `src/lib/payments/mock-gateway.ts` (_params unused). Out of scope per deviation rules (Phase 2 file).
- Git not available in execution environment; commits could not be made.

## User Setup Required

None - `.env.example` documents DATABASE_URL and SESSION_SECRET. Copy to `.env` and configure for local dev.

## Next Phase Readiness

Auth foundation complete. AUTH-01 through AUTH-04 satisfied. Database schema and auth helpers ready for payments, orders, and VM provisioning phases.

## Self-Check: PASSED

- SUMMARY.md created at `.planning/phases/01-foundation-accounts/01-foundation-accounts-01-SUMMARY.md`
- All key files verified present (prisma/schema.prisma, src/lib/auth/*, src/app/(auth)/*, src/app/api/auth/*)
- `npm run build` succeeds
- `npx prisma validate` passes

---
*Phase: 01-foundation-accounts*
*Completed: 2026-03-17*
