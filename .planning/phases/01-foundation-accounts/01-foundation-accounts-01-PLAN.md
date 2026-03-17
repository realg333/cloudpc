---
phase: 01-foundation-accounts
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - next.config.mjs
  - tsconfig.json
  - src/app/layout.tsx
  - src/app/page.tsx
  - src/components/NavBar.tsx
  - src/app/(auth)/signup/page.tsx
  - src/app/(auth)/login/page.tsx
  - src/app/(auth)/logout/route.ts
  - src/app/(auth)/verify-email/route.ts
  - src/app/(auth)/two-factor/setup/page.tsx
  - src/app/(auth)/two-factor/verify/route.ts
  - src/app/api/auth/session/route.ts
  - src/lib/auth/session.ts
  - src/lib/auth/password.ts
  - src/lib/auth/twoFactor.ts
  - src/lib/db.ts
  - prisma/schema.prisma
  - prisma/migrations/
  - .env.example
autonomous: true
requirements:
  - AUTH-01
  - AUTH-02
  - AUTH-03
  - AUTH-04
user_setup: []
must_haves:
  truths:
    - "User can sign up with email and password, receiving a verification email that must be confirmed before accessing authenticated areas."
    - "User can log in with verified credentials and log out, with sessions persisting across browser refresh within a reasonable timeout."
    - "User can optionally enable and disable 2FA via authenticator app, and when enabled, login requires a valid one-time code."
    - "Sessions expire after a reasonable period of inactivity to balance security and low-friction UX."
  artifacts:
    - path: "prisma/schema.prisma"
      provides: "User, EmailVerificationToken, Session, and TwoFactorSecret models for authentication and session management."
      contains:
        - "model User"
        - "model Session"
        - "model EmailVerificationToken"
        - "model TwoFactorSecret"
    - path: "src/lib/db.ts"
      provides: "Database client for Prisma with a single shared instance."
      contains:
        - "import { PrismaClient } from \"@prisma/client\""
        - "export const prisma"
    - path: "src/lib/auth/session.ts"
      provides: "Helpers to create, validate, and destroy session cookies bound to Session records."
      contains:
        - "export async function createSession"
        - "export async function getSession"
        - "export async function destroySession"
    - path: "src/lib/auth/password.ts"
      provides: "Password hashing and verification utilities using bcrypt."
      contains:
        - "export async function hashPassword"
        - "export async function verifyPassword"
    - path: "src/lib/auth/twoFactor.ts"
      provides: "TOTP-based 2FA secret generation and verification helpers."
      contains:
        - "export function generateTwoFactorSecret"
        - "export function generateTwoFactorOtpauthUrl"
        - "export function verifyTwoFactorCode"
    - path: "src/app/(auth)/signup/page.tsx"
      provides: "Signup form UI and POST handler to create unverified users and send verification email."
      min_lines: 80
    - path: "src/app/(auth)/login/page.tsx"
      provides: "Login form UI with conditional 2FA step when enabled."
      min_lines: 80
    - path: "src/app/(auth)/verify-email/route.ts"
      provides: "API route that marks EmailVerificationToken as used and flags user as verified."
      contains:
        - "export async function GET"
  key_links:
    - from: "src/app/(auth)/signup/page.tsx"
      to: "src/app/(auth)/verify-email/route.ts"
      via: "Verification email link containing token that hits the verify-email GET route."
      pattern: "verify-email\\?token="
    - from: "src/app/(auth)/login/page.tsx"
      to: "src/lib/auth/session.ts"
      via: "Successful login uses createSession to set httpOnly cookie."
      pattern: "createSession"
    - from: "src/app/(auth)/two-factor/setup/page.tsx"
      to: "src/lib/auth/twoFactor.ts"
      via: "2FA setup page calls generateTwoFactorSecret and generateTwoFactorOtpauthUrl."
      pattern: "generateTwoFactorSecret"
    - from: "src/app/(auth)/two-factor/verify/route.ts"
      to: "src/lib/auth/twoFactor.ts"
      via: "API route verifies submitted TOTP code against stored secret."
      pattern: "verifyTwoFactorCode"
    - from: "src/app/api/auth/session/route.ts"
      to: "src/lib/auth/session.ts"
      via: "Session API uses getSession to return current user data."
      pattern: "getSession"
---

<objective>
Establish the core Next.js application skeleton, database layer, and authentication system (email/password with verification, sessions, and optional TOTP 2FA) so users can securely sign up, log in, log out, and maintain sessions across refresh with a reasonable timeout.

Purpose: Provide a modern, low-friction auth foundation tailored to Brazilian users that future phases can build on for payments, dashboards, and VM management.
Output: A working Next.js app with Prisma-backed user accounts, session cookies, email verification, and optional authenticator-based 2FA flows.
</objective>

<execution_context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/ROADMAP.md
@.planning/phases/01-foundation-accounts/01-CONTEXT.md
</execution_context>

<context>
Wave 0 (01-foundation-accounts-00) must run first to provide Playwright/Vitest config and E2E spec stubs; Plan 01 assumes those exist for &lt;automated&gt; verify commands.

Auth must satisfy:
- AUTH-01: signup with email + password.
- AUTH-02: secure login/logout.
- AUTH-03: optional 2FA via authenticator app.
- AUTH-04: session persistence across refresh with reasonable timeout.

Stack assumptions:
- Next.js App Router with TypeScript, running on Node.js.
- Prisma as ORM, backed by PostgreSQL (or SQLite for local dev with env-configured DATABASE_URL).
- Cookies for session tracking using httpOnly, secure cookies and a Session table.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Initialize Next.js app skeleton and navigation</name>
  <files>
    package.json,
    next.config.mjs,
    tsconfig.json,
    src/app/layout.tsx,
    src/app/page.tsx,
    src/components/NavBar.tsx,
    src/app/(auth)/signup/page.tsx,
    src/app/(auth)/login/page.tsx
  </files>
  <read_first>
    .planning/PROJECT.md,
    .planning/ROADMAP.md,
    .planning/REQUIREMENTS.md,
    .planning/phases/01-foundation-accounts/01-CONTEXT.md
  </read_first>
  <action>
  - Use `create-next-app` (or equivalent manual setup) to initialize a Next.js App Router project with TypeScript enabled, producing `package.json`, `next.config.mjs`, and `tsconfig.json`.
  - Configure `package.json` scripts for `dev`, `build`, and `start`, and include dependencies: `"next"`, `"react"`, `"react-dom"`, `"@types/react"`, `"@types/node"`, `"typescript"`, and a CSS solution (Tailwind CSS or equivalent) suitable for a modern dashboard UI.
  - Create `src/app/layout.tsx` implementing a root layout in Brazilian Portuguese, with `<html lang="pt-BR">`, a basic `<body>` theme, and a persistent `NavBar` component.
  - Implement `src/components/NavBar.tsx` with navigation links (Portuguese labels) for `Dashboard`, `Minhas Máquinas`, `Pedidos`, `Cobranças`, and `Perfil`, and auth-aware links for `Entrar` (login) and `Criar conta` (signup); links should point to `/`, `/machines`, `/orders`, `/billing`, `/profile`, `/login`, and `/signup`.
  - Implement `src/app/page.tsx` as a simple landing/dashboard stub in PT-BR that briefly explains the service (Cloud Gaming VPS Brazil) and clearly guides new users to sign up or log in.
  - Create stub React pages for `src/app/(auth)/signup/page.tsx` and `src/app/(auth)/login/page.tsx` with basic form layouts (email, password) and headings in PT-BR, but without wiring to backend yet.
  </action>
  <verify>
    npm run lint (if configured) and npm run build both succeed without errors.
    <automated>npx playwright test --list</automated>
  </verify>
  <acceptance_criteria>
    - `package.json` contains `"next"` and `"react"` in `dependencies` and a `"dev"` script invoking `next dev`.
    - `src/app/layout.tsx` contains `<html lang="pt-BR">` and renders a `NavBar` component.
    - `src/components/NavBar.tsx` exports a React component and contains the routes `/`, `/machines`, `/orders`, `/billing`, `/profile`, `/login`, `/signup` with PT-BR labels.
    - `src/app/page.tsx` renders PT-BR text mentioning "Cloud Gaming VPS Brazil" and clearly provides links or buttons to `/login` and `/signup`.
    - `src/app/(auth)/signup/page.tsx` and `src/app/(auth)/login/page.tsx` both export default React components with forms containing `email` and `password` input fields.
  </acceptance_criteria>
  <done>
    A Next.js app skeleton exists with Portuguese layout, navigation, and stub signup/login pages matching the Cloud Gaming VPS Brazil branding and navigation structure described in the phase context.
  </done>
</task>

<task type="auto">
  <name>Task 2: Set up Prisma database layer and auth models</name>
  <files>
    prisma/schema.prisma,
    src/lib/db.ts,
    .env.example
  </files>
  <read_first>
    prisma/schema.prisma (if exists),
    .planning/PROJECT.md,
    .planning/REQUIREMENTS.md,
    .planning/phases/01-foundation-accounts/01-CONTEXT.md
  </read_first>
  <action>
  - Add Prisma to the project by installing `@prisma/client` and `prisma` packages and configuring a `prisma` section in `package.json` with `"schema": "prisma/schema.prisma"`.
  - Create `.env.example` with a `DATABASE_URL=` placeholder using a PostgreSQL-style URI (`postgresql://user:password@localhost:5432/cloud_gaming_vps`) and a `SESSION_SECRET=` placeholder for signing cookies or tokens.
  - Create `prisma/schema.prisma` defining:
    - A `datasource db` block using provider `"postgresql"` and `url = env("DATABASE_URL")`.
    - A `generator client` block for Prisma Client.
    - A `model User` with at least: `id String @id @default(cuid())`, `email String @unique`, `passwordHash String`, `emailVerifiedAt DateTime?`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`, and a relation to `Session[]` and `TwoFactorSecret?`.
    - A `model Session` with: `id String @id @default(cuid())`, `userId String`, `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`, `createdAt DateTime @default(now())`, `expiresAt DateTime`, and an optional `ipAddress String?` for basic logging.
    - A `model EmailVerificationToken` with: `id String @id @default(cuid())`, `userId String`, `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`, `token String @unique`, `expiresAt DateTime`, `usedAt DateTime?`.
    - A `model TwoFactorSecret` with: `id String @id @default(cuid())`, `userId String @unique`, `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`, `secret String`, `createdAt DateTime @default(now())`, `disabledAt DateTime?`.
  - Create `src/lib/db.ts` exporting a singleton PrismaClient instance (using the recommended `globalThis` pattern to avoid multiple instances in dev).
  - Run `npx prisma generate` so that the Prisma Client is generated and ready for use.
  </action>
  <verify>
    npx prisma validate && npx prisma generate
    <automated>npx prisma validate</automated>
  </verify>
  <acceptance_criteria>
    - `package.json` includes `@prisma/client` and `prisma` in `dependencies` or `devDependencies`.
    - `.env.example` contains lines starting with `DATABASE_URL=` and `SESSION_SECRET=`.
    - `prisma/schema.prisma` contains `datasource db` with `provider = "postgresql"` and `url = env("DATABASE_URL")`.
    - `prisma/schema.prisma` contains `model User`, `model Session`, `model EmailVerificationToken`, and `model TwoFactorSecret` with the fields described in the action.
    - `src/lib/db.ts` exports a `prisma` client instance (e.g. `export const prisma = globalThis.prisma || new PrismaClient()`).
    - Running `npx prisma validate` exits with code 0 and reports a valid schema.
  </acceptance_criteria>
  <done>
    The project has a working Prisma setup with a User, Session, EmailVerificationToken, and TwoFactorSecret schema plus a reusable `prisma` client, ready for authentication logic to use.
  </done>
</task>

<task type="auto">
  <name>Task 3: Implement email/password auth, verification, sessions, and optional TOTP 2FA</name>
  <files>
    src/lib/auth/password.ts,
    src/lib/auth/twoFactor.ts,
    src/lib/auth/session.ts,
    src/app/(auth)/signup/page.tsx,
    src/app/(auth)/login/page.tsx,
    src/app/(auth)/logout/route.ts,
    src/app/(auth)/verify-email/route.ts,
    src/app/(auth)/two-factor/setup/page.tsx,
    src/app/(auth)/two-factor/verify/route.ts,
    src/app/api/auth/session/route.ts
  </files>
  <read_first>
    prisma/schema.prisma,
    src/lib/db.ts,
    src/app/(auth)/signup/page.tsx,
    src/app/(auth)/login/page.tsx,
    .planning/REQUIREMENTS.md,
    .planning/phases/01-foundation-accounts/01-CONTEXT.md
  </read_first>
  <action>
  - Implement `src/lib/auth/password.ts` using `bcrypt` (or `bcryptjs`) with two exported async functions:
    - `hashPassword(plain: string): Promise<string>` that returns a salted hash using at least 10 salt rounds.
    - `verifyPassword(plain: string, hash: string): Promise<boolean>` that compares a candidate password against a stored hash.
  - Implement `src/lib/auth/session.ts` that:
    - Reads `SESSION_SECRET` from `process.env` and fails fast if not set in non-test environments.
    - Exposes `createSession(userId: string, response: NextResponse): Promise<void>` to create a Session record with an `expiresAt` roughly 8 hours from creation and set an httpOnly, secure cookie (e.g. `session`) containing a signed opaque session ID or token bound to that record.
    - Exposes `getSession(request: NextRequest): Promise<{ user: User; session: Session } | null>` that validates the cookie, loads the Session+User via Prisma, and returns null if missing/expired.
    - Exposes `destroySession(request: NextRequest, response: NextResponse): Promise<void>` that deletes the Session record (if present) and clears the session cookie.
  - Implement `src/lib/auth/twoFactor.ts` using a TOTP library such as `otplib`:
    - `generateTwoFactorSecret(userId: string)` that creates a new random secret and stores it in `TwoFactorSecret` associated with the user.
    - `generateTwoFactorOtpauthUrl(secret: string, email: string)` that returns an `otpauth://` URL scoped to the Cloud Gaming VPS Brazil service name, for use in QR codes.
    - `verifyTwoFactorCode(secret: string, code: string): boolean` that verifies a 6-digit TOTP code for the given secret.
  - Wire up the signup page `src/app/(auth)/signup/page.tsx` to:
    - Accept email, password, and password confirmation.
    - On submission, create a new `User` with `emailVerifiedAt = null` and `passwordHash = hashPassword(password)` if email is unused.
    - Create an `EmailVerificationToken` row with unique `token` and an expiry (e.g. 24 hours in the future).
    - Trigger a placeholder call to send an email (implementation can be a stub now) that includes a link to `/verify-email?token=...`.
  - Implement `src/app/(auth)/verify-email/route.ts` with a `GET` handler that:
    - Reads `token` from the querystring, finds a non-expired, unused `EmailVerificationToken`.
    - Sets the associated user's `emailVerifiedAt` to `now`, marks the token as used, and redirects to `/login` with a success state on success; otherwise redirects to an error page or `/login` with an error.
  - Wire up the login page `src/app/(auth)/login/page.tsx` to:
    - Allow a user with verified email to submit email and password.
    - Look up the `User`, ensure `emailVerifiedAt` is not null, verify `passwordHash`, and if successful:
      - If the user has an active `TwoFactorSecret`, either:
        - show a 2FA code input step and verify using `verifyTwoFactorCode` before calling `createSession`, or
        - post to a `/two-factor/verify` route to complete the login.
      - If the user does not have 2FA enabled, call `createSession` immediately and redirect to `/`.
  - Implement `src/app/(auth)/logout/route.ts` with a handler that calls `destroySession` and redirects to `/`.
  - Implement `src/app/(auth)/two-factor/setup/page.tsx` that:
    - Requires an authenticated user (using `getSession`).
    - Calls `generateTwoFactorSecret` and `generateTwoFactorOtpauthUrl` and renders a QR code (or at minimum the raw secret/URL) the user can scan with an authenticator app, along with a form to enter a 6-digit code to confirm activation.
    - On successful verification, keeps the stored secret active; on failure, surfaces a clear error in PT-BR.
  - Implement `src/app/(auth)/two-factor/verify/route.ts` that:
    - Accepts a POST with `code` (and context to know which user/session is being verified).
    - Loads the user's `TwoFactorSecret` and calls `verifyTwoFactorCode` to validate the TOTP code.
    - On success, completes login by creating a session and redirecting to `/`; on failure, returns a 401-style response or redirects with an error.
  - Implement `src/app/api/auth/session/route.ts` with an authenticated `GET` handler that:
    - Uses `getSession` to retrieve the current user and returns JSON with basic user data (id, email, 2FA enabled flag) or 401 if not logged in.
  </action>
  <verify>
    npm test (if tests exist) or npm run lint && npm run build.
    Manual flows using npm run dev: create user, verify email, log in with/without 2FA, confirm session persistence.
    <automated>npx playwright test auth</automated>
  </verify>
  <acceptance_criteria>
    - `src/lib/auth/password.ts` contains exports named `hashPassword` and `verifyPassword` and uses `bcrypt` or `bcryptjs`.
    - `src/lib/auth/session.ts` reads `SESSION_SECRET` from `process.env` and exports `createSession`, `getSession`, and `destroySession` functions.
    - `src/lib/auth/twoFactor.ts` exports functions `generateTwoFactorSecret`, `generateTwoFactorOtpauthUrl`, and `verifyTwoFactorCode`.
    - `src/app/(auth)/signup/page.tsx` creates a `User` row with `emailVerifiedAt = null` and an `EmailVerificationToken` row when a new email signs up.
    - `src/app/(auth)/verify-email/route.ts` marks the corresponding user as verified (`emailVerifiedAt` not null) when called with a valid, non-expired token.
    - Logging in with valid credentials and a verified email sets an httpOnly cookie and persists the session across at least one page refresh.
    - When a `TwoFactorSecret` exists for the user, login requires a valid TOTP code before creating a session; providing an invalid code prevents session creation.
  </acceptance_criteria>
  <done>
    Users can sign up, verify their email, log in, log out, and optionally enable authenticator-based 2FA with sessions that persist across refresh and expire after a reasonable timeout, fulfilling AUTH-01 through AUTH-04.
  </done>
</task>

</tasks>

<verification>
- `npx prisma validate && npx prisma generate` pass without errors.
- `npm run build` (and `npm run lint` if configured) succeeds.
- Manual browser tests confirm:
  - New user signup with email/password creates an unverified account and sends a verification link.
  - Verification link flow marks the user as verified and allows login.
  - Login sets a session cookie that persists on refresh and expires after the configured inactivity period.
  - Enabling 2FA requires scanning a secret and confirming via TOTP code, and subsequent logins require the code.
</verification>

<success_criteria>
- Authentication requirements AUTH-01, AUTH-02, AUTH-03, and AUTH-04 are satisfied with concrete flows implemented in the Next.js app.
- The project has a stable database schema and auth helper modules that later plans can reuse for dashboard, payments, and VM flows.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-accounts/01-foundation-accounts-01-SUMMARY.md` summarizing the implemented auth stack, DB models, and user flows.
</output>

