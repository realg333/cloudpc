---
phase: 1
slug: foundation-accounts
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | E2E: Playwright; Unit/API: Vitest |
| **Config file** | `playwright.config.ts`, `vitest.config.ts` (Wave 0 installs if missing) |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run && npx playwright test` |
| **Estimated runtime** | ~60–120 seconds (full suite) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`; optionally one relevant E2E: `npx playwright test <one-spec>`
- **After every plan wave:** Run full Vitest + full Playwright suite
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | AUTH-01, AUTH-02 | E2E | `npx playwright test signup login logout` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | AUTH-03, AUTH-04 | E2E | `npx playwright test 2fa session-persistence` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | AUTH-* | E2E | `npx playwright test auth` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | PLAN-01 | E2E | `npx playwright test plan-catalog` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | PLAN-02 | E2E | `npx playwright test create-order` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 2 | PLAN-* | E2E | `npx playwright test plans-orders` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/e2e/auth.spec.ts` (or similar) — signup, login, logout, session, 2FA (AUTH-01–04)
- [ ] `tests/e2e/plans-orders.spec.ts` — plan catalog (PLAN-01), create order and list (PLAN-02)
- [ ] `playwright.config.ts`, `vitest.config.ts` — create if no existing test config
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react playwright @playwright/test` (adjust for Next.js if using Next.js Vitest setup)

*No existing test infrastructure in project; all of the above are Wave 0.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Email verification link opens and marks user verified | AUTH-01 | Depends on real or test inbox | Click link from test email; confirm user can access protected route. |
| TOTP code from authenticator app | AUTH-03 | Device-specific | Enable 2FA in app; on next login enter code from Google Authenticator (or similar). |

*Other phase behaviors have automated verification (E2E/unit).*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter after Wave 0 and specs are green

**Approval:** pending
