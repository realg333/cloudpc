---
phase: 01-foundation-accounts
plan: gaps
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/profile/page.tsx
  - src/app/api/auth/two-factor/disable/route.ts
autonomous: true
gap_closure: true
requirements:
  - AUTH-03
must_haves:
  truths:
    - "Profile page exists and is accessible from NavBar and two-factor/setup"
    - "User can disable 2FA via profile page with password confirmation"
  artifacts:
    - path: src/app/profile/page.tsx
      provides: "Authenticated profile stub with 2FA status and actions"
    - path: src/app/api/auth/two-factor/disable/route.ts
      provides: "POST endpoint to set TwoFactorSecret.disabledAt"
  key_links:
    - from: src/app/profile/page.tsx
      to: /api/auth/two-factor/disable
      via: "form POST or fetch when Desativar 2FA clicked"
    - from: src/app/api/auth/two-factor/disable/route.ts
      to: prisma.twoFactorSecret
      via: "update with disabledAt = new Date()"
---

<objective>
Close Phase 1 verification gaps: (1) add profile page so /profile no longer 404s; (2) add 2FA disable flow so AUTH-03 "enable and disable" is fully satisfied.
Purpose: NavBar and two-factor/setup link to /profile; TwoFactorSecret.disabledAt exists but nothing sets it.
Output: Working profile page + disable API + UI to disable 2FA.
</objective>

<execution_context>
@C:/Users/realg/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/realg/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-foundation-accounts/01-VERIFICATION.md
@.planning/phases/01-foundation-accounts/01-CONTEXT.md

## Existing patterns

- Auth: `getSessionFromCookies()` for server components; `getSession(request)` for API routes
- 2FA check: `getTwoFactorSecret(userId)` returns secret if enabled, null if disabled or no record
- Schema: `TwoFactorSecret.disabledAt` — set to `new Date()` to disable
- Password: `verifyPassword(plain, user.passwordHash)` from `@/lib/auth/password`
- PT-BR copy throughout; Tailwind classes consistent with plans/orders pages
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add profile page</name>
  <files>src/app/profile/page.tsx</files>
  <read_first>
    - src/app/plans/page.tsx (auth + redirect pattern)
    - src/app/(auth)/two-factor/setup/page.tsx (2FA setup link, PT-BR)
    - src/lib/auth/twoFactor.ts (getTwoFactorSecret — returns null when disabled)
  </read_first>
  <action>
Create src/app/profile/page.tsx as a server component.

1. Auth: Call getSessionFromCookies(). If null, redirect('/login?redirect=/profile').
2. 2FA status: Query prisma.twoFactorSecret.findUnique({ where: { userId: session.user.id } }). User has 2FA enabled iff row exists AND row.disabledAt === null.
3. Layout: Minimal authenticated stub. PT-BR copy. Section "Segurança" with:
   - If 2FA enabled: "Autenticação em duas etapas: Ativada" + form (method="post" action="/api/auth/two-factor/disable") with input name="password" type="password" required, button "Desativar 2FA".
   - If 2FA disabled: "Autenticação em duas etapas: Desativada" + Link to /two-factor/setup "Ativar 2FA".
4. Handle searchParams: success=2fa-disabled → show "2FA desativado com sucesso."; error=invalid-password → "Senha incorreta."; error=missing-password → "Informe sua senha."
5. Include Link back to / or dashboard. Use same Tailwind patterns as plans/orders (max-w, mx-auto, text-gray-900, etc.).
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -3</automated>
  </verify>
  <acceptance_criteria>
    - /profile returns 200 when user is authenticated (not 404)
    - Unauthenticated redirects to /login?redirect=/profile
    - Page shows 2FA status (Ativada/Desativada) in PT-BR
    - When 2FA disabled: link to /two-factor/setup "Ativar 2FA"
    - When 2FA enabled: form with password field and "Desativar 2FA" button POSTing to /api/auth/two-factor/disable
  </acceptance_criteria>
  <done>Profile page exists; NavBar and two-factor/setup "Voltar ao perfil" links work; 2FA status and actions visible.</done>
</task>

<task type="auto">
  <name>Task 2: Add 2FA disable API and wire form</name>
  <files>src/app/api/auth/two-factor/disable/route.ts</files>
  <read_first>
    - src/app/api/auth/two-factor/setup/confirm/route.ts (getSession, redirect pattern)
    - src/lib/auth/password.ts (verifyPassword)
    - src/lib/auth/twoFactor.ts (getTwoFactorSecret — schema has disabledAt)
    - prisma/schema.prisma (TwoFactorSecret model)
  </read_first>
  <action>
Create src/app/api/auth/two-factor/disable/route.ts.

1. Export POST handler. Use getSession(request). If !session, redirect to /login.
2. Parse formData: password = formData.get('password')?.toString(). If !password, redirect to /profile?error=missing-password.
3. Load user with passwordHash: prisma.user.findUnique({ where: { id: session.user.id } }). If !user, redirect /login.
4. Verify password: await verifyPassword(password, user.passwordHash). If invalid, redirect to /profile?error=invalid-password.
5. Update TwoFactorSecret: const secret = await prisma.twoFactorSecret.findFirst({ where: { userId: session.user.id, disabledAt: null } }); if (secret) await prisma.twoFactorSecret.update({ where: { id: secret.id }, data: { disabledAt: new Date() } }).
6. Redirect to /profile?success=2fa-disabled.
7. Import: NextRequest, NextResponse from next/server; getSession from @/lib/auth/session; verifyPassword from @/lib/auth/password; prisma from @/lib/db.
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - POST /api/auth/two-factor/disable with valid session and correct password sets TwoFactorSecret.disabledAt
    - Invalid password redirects to /profile?error=invalid-password
    - Missing password redirects to /profile?error=missing-password
    - Success redirects to /profile?success=2fa-disabled
    - Profile page form in Task 1 POSTs to this route
  </acceptance_criteria>
  <done>2FA can be disabled from profile page; disable requires password confirmation; AUTH-03 enable/disable fully satisfied.</done>
</task>

</tasks>

<verification>
- Visit /profile while logged in: page loads, no 404
- With 2FA enabled: "Desativar 2FA" form visible; submit with correct password → redirect to /profile?success=2fa-disabled; 2FA status shows Desativada
- With 2FA disabled: "Ativar 2FA" link to /two-factor/setup
- NavBar "Perfil" and two-factor/setup "Voltar ao perfil" both resolve to /profile
</verification>

<success_criteria>
- Gap 1 (2FA disable): User can disable 2FA from profile with password confirmation
- Gap 2 (profile page): /profile exists, returns 200 when authenticated, linked from NavBar and two-factor/setup
</success_criteria>

<output>
After completion, create .planning/phases/01-foundation-accounts/01-foundation-accounts-gaps-SUMMARY.md
</output>
