# Phase 1: Foundation & Accounts - Research

**Researched:** 2026-03-16  
**Domain:** Web stack (Next.js), authentication (email/password, verification, TOTP 2FA), session management, plan catalog, order creation  
**Confidence:** HIGH

## Summary

Phase 1 establishes a greenfield Next.js App Router app with authentication (email/password, required email verification, optional TOTP 2FA), session management with configurable expiry and sliding refresh, a public plan catalog in card layout, and an authenticated create-order flow that stores order shells for later payment and provisioning.

**Primary recommendation:** Use **Better Auth** with Prisma for auth (email/password, built-in email verification, 2FA plugin with TOTP). Use **Next.js 15+** App Router and **Prisma** for the rest of the stack. Do not hand-roll auth, email delivery, or TOTP. Session “inactivity” is achieved via `session.expiresIn` (e.g. 8 hours) and `session.updateAge` (e.g. 30 minutes) so that activity extends the session and true inactivity expires it within hours.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Auth:** Email + password; **required email verification** before access to core functionality. **2FA optional** via **authenticator apps** (e.g. Google Authenticator), not SMS or email codes.
- **Sessions:** Low-friction but safe; persist across refresh; expire after a **reasonable inactivity period** (e.g. on the order of hours, not days).
- **Plan presentation:** **Card layout**; each card = fixed-time package + machine profile. Show: profile name, GPU tier, short RAM/CPU summary, duration. Avoid raw specs; PIX and crypto both visible, **crypto visually encouraged**.
- **Navigation:** Dashboard, Minhas Máquinas, Pedidos, Cobranças, Perfil — stubs in Phase 1; focus on Dashboard (stub) and **Orders** (list of created orders).
- **Language:** **Brazilian Portuguese** across UI; technical terms (GPU, CPU, VM, Connect) may stay in English. Tone: modern, technical, approachable; self-service mental model.

### Claude's Discretion

- Exact **session timeout duration** and **remember-me behavior** (best practices for consumer SaaS in Brazil; “low friction, secure enough”; not excessively long-lived).
- **Card layout details** (icons, typography, hierarchy) as long as key fields are visible and crypto is slightly highlighted over PIX without hiding PIX.
- **Navigation default** (Dashboard vs Minhas Máquinas) and styling tunable in UI design.

### Deferred Ideas (OUT OF SCOPE)

- Detailed dashboard behaviors (live machine status, remaining time, connect button) — **later phases (e.g. Phase 4)**.
- Payments, webhooks, VM provisioning, admin tooling — **do not influence Phase 1** beyond self-service mental model.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | User can sign up with email and password. | Better Auth `emailAndPassword.enabled`, `signUpEmail`; Prisma User model; Zod for validation. |
| AUTH-02 | User can log in and log out securely. | Better Auth `signIn.email`, `signOut`; session in DB or cookie cache; secure cookies. |
| AUTH-03 | User can enable optional 2FA for additional account security. | Better Auth `twoFactor` plugin: TOTP (authenticator app), backup codes, enable/disable with password. |
| AUTH-04 | User session persists across browser refresh within a reasonable timeout. | Better Auth `session.expiresIn` + `session.updateAge` (sliding); database or cookie-cache sessions. |
| PLAN-01 | User can view available fixed-time packages and associated machine profiles. | Public route; Package + MachineProfile (or Plan join) models; card UI with profile name, GPU tier, RAM/CPU summary, duration. |
| PLAN-02 | User can select a plan and machine profile and create an order. | Authenticated route; Order model (userId, packageId, machineProfileId, status e.g. pending_payment); create-order API + redirect to Orders. |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x (or 16.x) | React framework, App Router, API routes, server actions | Project constraint; App Router is current standard; RSC + server actions for forms. |
| Better Auth | 1.5.x | Auth: email/password, email verification, 2FA (TOTP), sessions | Built-in email verification + 2FA plugin; Prisma adapter; session expiresIn/updateAge; recommended for new projects (Auth.js maintenance moving to Better Auth). |
| Prisma | 7.x | ORM, migrations, type-safe DB access | Project constraint (PROJECT.md); Better Auth has official Prisma adapter; single schema for User, Session, Order, Package, MachineProfile. |
| PostgreSQL | (runtime) | Primary database | Fits Prisma + Better Auth; use SQLite only for local dev if desired. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 3.x | Schema validation (forms, API bodies) | Sign-up/login forms, create-order payloads, env validation. |
| better-auth/react | (bundled) | `createAuthClient`, `useSession`, signIn/signOut | Client-side auth in React components. |
| Resend or Nodemailer | latest | Sending verification and transactional emails | Better Auth `sendVerificationEmail`; avoid blocking with `void sendEmail()`. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Better Auth | Auth.js (next-auth v5) | Auth.js: more docs/examples; email verification and TOTP are custom (signIn callback + otplib). Better Auth: built-in verification + 2FA plugin, recommended for new apps. |
| Prisma | Drizzle | Both supported by Better Auth; Prisma is specified in project constraints. |

**Installation (example):**

```bash
npx create-next-app@latest . --typescript --eslint --app --src-dir
npm install better-auth @prisma/client
npm install -D prisma
npm install zod
# Optional: npm install resend  # or nodemailer for sendVerificationEmail
npx prisma init
```

**Version verification (as of 2026-03-16):**  
`next` 16.1.7, `next-auth` 4.24.13, `better-auth` 1.5.5, `@prisma/client` 7.5.0, `otplib` 13.3.0 (only if not using Better Auth 2FA).

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── (auth)/           # login, signup, verify-email, 2fa
│   ├── (marketing)/      # landing, plan catalog (public)
│   ├── (dashboard)/      # layout with nav; dashboard, pedidos, perfil stubs
│   ├── api/
│   │   ├── auth/[...all]/route.ts   # Better Auth handler
│   │   └── orders/                  # create order, list orders
│   └── layout.tsx
├── lib/
│   ├── auth.ts           # betterAuth({ database: prismaAdapter(...), ... })
│   ├── auth-client.ts    # createAuthClient from better-auth/react
│   └── db.ts             # PrismaClient singleton
├── components/           # UI: plan cards, order list, forms
└── prisma/
    └── schema.prisma
```

### Pattern 1: Auth config with email verification and 2FA

**What:** Single Better Auth instance with Prisma, email verification required, 2FA plugin (TOTP).  
**When:** Phase 1 auth foundation.  
**Example:**

```typescript
// lib/auth.ts — Source: Better Auth docs (email verification + 2FA)
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import { PrismaClient } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, requireEmailVerification: true },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({ to: user.email, subject: "Verifique seu e-mail", text: url });
    },
    sendOnSignUp: true,
  },
  session: {
    expiresIn: 60 * 60 * 8,   // 8 hours
    updateAge: 60 * 30,       // 30 min — sliding window
  },
  appName: "Cloud Gaming VPS Brazil",
  plugins: [twoFactor()],
});
```

### Pattern 2: Plan catalog and order creation

**What:** Public server component or page that fetches packages + machine profiles; cards link to create-order; create-order is an authenticated server action or API that creates an Order record.  
**When:** PLAN-01, PLAN-02.  
**Example (conceptual):**

```typescript
// Plan card: show package duration + profile name, GPU tier, RAM/CPU summary
// Create order: POST /api/orders or server action with session check
// Order model: userId, packageId, machineProfileId, status (e.g. "pending_payment"), createdAt
```

### Anti-Patterns to Avoid

- **Hand-rolling auth:** Do not implement JWT/session or email verification from scratch; use Better Auth.
- **Blocking on sendVerificationEmail:** Use `void sendEmail(...)` (or waitUntil on serverless) to avoid timing leaks.
- **Storing raw passwords:** Better Auth hashes; never store or log plain passwords.
- **Skipping email verification for “convenience”:** CONTEXT requires verification before core access; enforce in auth config.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth (login, signup, session) | Custom JWT + DB sessions | Better Auth | Secure cookies, CSRF, adapter pattern, 2FA plugin. |
| Email verification | Custom tokens + routes | Better Auth emailVerification + sendVerificationEmail | Token lifecycle, requireEmailVerification. |
| TOTP 2FA | Custom otplib + UI only | Better Auth twoFactor plugin | Enable/disable, verify, backup codes, trusted devices. |
| Sending email | Raw SMTP in route | Resend or Nodemailer in sendVerificationEmail | Deliverability, retries, not blocking handler. |
| Password hashing | Manual bcrypt in API | Better Auth (built-in) | Salt, cost, constant-time comparison. |

**Key insight:** Auth and email/TOTP have many edge cases (token expiry, replay, rate limits, session invalidation). Using Better Auth avoids security and UX bugs.

## Common Pitfalls

### Pitfall 1: Session cookie not refreshing (inactivity feels “sticky”)

**What goes wrong:** Session appears to last too long or not extend on activity.  
**Why it happens:** Better Auth session refresh depends on `updateAge` and when `getSession`/session checks run; cookie `maxAge` refresh has had reported issues in some setups.  
**How to avoid:** Prefer database sessions (default with Prisma adapter); set `session.expiresIn` (e.g. 8h) and `session.updateAge` (e.g. 30 min); test logout after idle and after activity.  
**Warning signs:** Users stay logged in for days with no activity, or get logged out too often during active use.

### Pitfall 2: Email verification timing / info leakage

**What goes wrong:** Attackers infer whether an email is registered from response time or message.  
**Why it happens:** Awaiting `sendVerificationEmail` in the handler.  
**How to avoid:** Call `void sendEmail(...)` (or use serverless `waitUntil`) so the response is not delayed by email delivery.  
**Warning signs:** Slow sign-up when SMTP is slow; different error messages for “email exists” vs “invalid”.

### Pitfall 3: 2FA redirect loop or missing step

**What goes wrong:** After login, users with 2FA enabled don’t see the TOTP step or get redirected incorrectly.  
**Why it happens:** Client doesn’t handle `twoFactorRedirect` or `onTwoFactorRedirect`; cookies not forwarded in server-side 2FA flow.  
**How to avoid:** Use Better Auth client plugin `twoFactorClient({ onTwoFactorRedirect: () => router.push("/2fa") })` and show TOTP input on that page; on server, forward cookies between `signInEmail` and `verifyTOTP`.  
**Warning signs:** User enters password, then sees dashboard without TOTP, or 2FA page never appears.

### Pitfall 4: Plan/order data model too rigid

**What goes wrong:** Plans as a single table with every combo (package × profile) doesn’t scale or match “package + machine profile” wording.  
**How to avoid:** Model `Package` (duration, name), `MachineProfile` (name, gpuTier, ramCpuSummary), and either a `Plan` join table or derive “plan” as (packageId + machineProfileId). Order references package + profile.  
**Warning signs:** Dozens of plan rows for small catalog; hard to add new durations or profiles.

## Code Examples

Verified patterns from official sources:

### Better Auth route handler (Next.js App Router)

```typescript
// app/api/auth/[...all]/route.ts — Source: better-auth.com/docs/installation
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

### Email verification (require before login)

```typescript
// lib/auth.ts — Source: better-auth.com/docs/concepts/email
emailVerification: {
  sendVerificationEmail: async ({ user, url }) => {
    void sendEmail({ to: user.email, subject: "Verifique seu e-mail", text: url });
  },
  sendOnSignUp: true,
},
emailAndPassword: { requireEmailVerification: true },
```

### Session expiry and sliding (inactivity in hours)

```typescript
// lib/auth.ts — Source: better-auth.com/docs/concepts/session-management
session: {
  expiresIn: 60 * 60 * 8,  // 8 hours
  updateAge: 60 * 30,      // 30 min — refresh expiry on activity
}
```

### 2FA client redirect

```typescript
// lib/auth-client.ts — Source: better-auth.com/docs/plugins/2fa
import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/2fa";
      },
    }),
  ],
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| NextAuth v4 (Pages) | Auth.js v5 / Better Auth + App Router | 2024–2025 | App Router catch-all `/api/auth/[...all]`; Better Auth recommended for new projects. |
| Custom email verification | Better Auth emailVerification + requireEmailVerification | — | No custom token tables; single config. |
| Custom TOTP in NextAuth | Better Auth twoFactor plugin | — | Built-in enable/verify/backup codes. |

**Deprecated/outdated:** Relying on NextAuth v4 without planning for v5/Better Auth for new apps. Using SMS or email OTP for 2FA when CONTEXT specifies authenticator app (TOTP).

## Open Questions

1. **Email provider for Brazil**  
   - What we know: Resend and Nodemailer work; deliverability in Brazil may depend on provider and domain.  
   - What’s unclear: Whether to recommend a specific provider (e.g. Resend, SendGrid) for Phase 1.  
   - Recommendation: Implement `sendVerificationEmail` with one provider (e.g. Resend); keep interface simple so it can be swapped.

2. **Session duration exact values**  
   - What we know: CONTEXT says “hours, not days”; Claude’s discretion allowed.  
   - What’s unclear: Exact hours (e.g. 8 vs 12) and updateAge (e.g. 30 min).  
   - Recommendation: Start with `expiresIn: 8 * 3600`, `updateAge: 30 * 60`; document in config so product can tune later.

## Validation Architecture

`workflow.nyquist_validation` is enabled in `.planning/config.json`. This section defines how to verify Phase 1 deliverables in an automated or repeatable way.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | **E2E:** Playwright (recommended). **Unit/API:** Vitest. |
| Config file | `playwright.config.ts` (E2E), `vitest.config.ts` (unit/API) — create in Wave 0 if not present. |
| Quick run command | `npx vitest run` (unit) or `npx playwright test --project=chromium` (E2E subset) |
| Full suite command | `npx vitest run && npx playwright test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|---------------------|--------------|
| AUTH-01 | Sign up with email/password creates user and sends verification | E2E + optional unit (API) | `npx playwright test signup` / `npx vitest run tests/auth` | ❌ Wave 0 |
| AUTH-02 | Login and logout work; session persists on refresh until expiry | E2E | `npx playwright test login logout session` | ❌ Wave 0 |
| AUTH-03 | User can enable 2FA (TOTP) and must pass 2FA on next login when enabled | E2E (or manual for TOTP device) | `npx playwright test 2fa` | ❌ Wave 0 |
| AUTH-04 | Session persists across refresh; expires after inactivity (configurable) | E2E or API (session cookie + time) | `npx playwright test session-persistence` | ❌ Wave 0 |
| PLAN-01 | Anonymous user can open plan catalog and see cards (profile, GPU tier, RAM/CPU, duration) | E2E | `npx playwright test plan-catalog` | ❌ Wave 0 |
| PLAN-02 | Logged-in user can select plan + profile and create order; order appears in list | E2E | `npx playwright test create-order` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run` (fast); optionally one relevant E2E: `npx playwright test <one-spec>`.
- **Per wave merge:** Full Vitest + full Playwright suite.
- **Phase gate:** Full suite green before `/gsd:verify-work`.

### Wave 0 Gaps

- [ ] `tests/e2e/auth.spec.ts` (or similar) — signup, login, logout, session, 2FA (AUTH-01–04).
- [ ] `tests/e2e/plans-orders.spec.ts` — plan catalog (PLAN-01), create order and list (PLAN-02).
- [ ] `tests/unit/auth` or `tests/api/orders` — optional; Vitest for server actions or API routes.
- [ ] `playwright.config.ts`, `vitest.config.ts` — create if no existing test config.
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react playwright @playwright/test` (adjust for Next.js if using Next.js Vitest setup).

*No existing test infrastructure detected in the project; all of the above are Wave 0 gaps.*

## Sources

### Primary (HIGH confidence)

- better-auth.com/docs/installation — Next.js setup, Prisma adapter, emailAndPassword, mount handler.
- better-auth.com/docs/concepts/email — sendVerificationEmail, requireEmailVerification, sendOnSignUp.
- better-auth.com/docs/plugins/2fa — TOTP enable/verify, backup codes, onTwoFactorRedirect.
- better-auth.com/docs/concepts/session-management — expiresIn, updateAge, cookie cache.
- nextjs.org/docs/app/building-your-application/authentication — Server Actions, form validation, auth libraries.

### Secondary (MEDIUM confidence)

- WebSearch: Next.js 15 App Router auth, Auth.js session maxAge/updateAge, Better Auth vs Auth.js migration, Prisma Next.js 15, TOTP npm (otplib), email verification Node.js patterns — verified against official docs where applicable.

### Tertiary (LOW confidence)

- Community reports of session cookie refresh issues (Better Auth GitHub issues) — document as pitfall; behavior may be environment-dependent.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — Better Auth and Next.js docs and npm versions checked; Prisma from project constraints.
- Architecture: HIGH — Structure follows Next.js App Router and Better Auth conventions.
- Pitfalls: MEDIUM — Some from official docs; cookie refresh from issue reports.

**Research date:** 2026-03-16  
**Valid until:** ~30 days for stack choices; re-check Better Auth and Next.js release notes if Phase 1 is delayed.
