---
phase: 01-foundation-accounts
plan: 00
type: execute
wave: 0
depends_on: []
files_modified:
  - package.json
  - playwright.config.ts
  - vitest.config.ts
  - tests/e2e/auth.spec.ts
  - tests/e2e/plans-orders.spec.ts
autonomous: true
requirements: []
user_setup: []
must_haves:
  truths:
    - "Playwright and Vitest are installed and configured so E2E and unit test commands run."
    - "E2E spec stubs exist for auth (AUTH-01–04) and plans/orders (PLAN-01–02) so per-task automated commands are available."
  artifacts:
    - path: "playwright.config.ts"
      provides: "Playwright E2E config for Next.js app (baseURL, testDir)."
    - path: "vitest.config.ts"
      provides: "Vitest config for unit/API tests."
    - path: "tests/e2e/auth.spec.ts"
      provides: "E2E stub for signup, login, logout, 2FA, session-persistence; enables npx playwright test auth (and signup/login/logout, 2fa, session-persistence)."
    - path: "tests/e2e/plans-orders.spec.ts"
      provides: "E2E stub for plan catalog and create-order; enables npx playwright test plan-catalog, create-order, plans-orders."
  key_links: []
---

<objective>
Install and configure Playwright and Vitest, and add E2E spec stubs that map to AUTH-01–04 and PLAN-01–02 so the automated verification commands referenced in 01-VALIDATION.md exist. Wave 0 runs before Plan 01 (wave 1) and Plan 02 (wave 2).

Purpose: Satisfy Nyquist compliance by providing test infrastructure and stub specs so every subsequent plan task can include an &lt;automated&gt; verify command.
Output: playwright.config.ts, vitest.config.ts, tests/e2e/auth.spec.ts, tests/e2e/plans-orders.spec.ts, and package.json scripts/deps updated. Commands: npx vitest run, npx playwright test, npx playwright test auth, npx playwright test plans-orders (and filtered variants) succeed or run stub tests.
</objective>

<execution_context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/01-foundation-accounts/01-VALIDATION.md
</execution_context>

<context>
Phase 1 validation (01-VALIDATION.md) requires:
- E2E: Playwright; Unit/API: Vitest.
- Wave 0 must create tests/e2e/auth.spec.ts (AUTH-01–04) and tests/e2e/plans-orders.spec.ts (PLAN-01–02).
- Per-task automated commands: npx playwright test signup login logout, npx playwright test 2fa session-persistence, npx playwright test auth, npx playwright test plan-catalog, npx playwright test create-order, npx playwright test plans-orders.
No existing test infrastructure; all config and specs are created in this plan.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install and configure Playwright and Vitest</name>
  <files>package.json, playwright.config.ts, vitest.config.ts</files>
  <read_first>.planning/phases/01-foundation-accounts/01-VALIDATION.md</read_first>
  <action>
  - Add dev dependencies: playwright, @playwright/test, vitest, and if needed @vitejs/plugin-react or Next.js-compatible Vitest setup (e.g. vitest with jsdom for component tests). Use npm or the project package manager.
  - Create playwright.config.ts at project root with: baseURL pointing to local dev (e.g. http://localhost:3000), testDir set to tests/e2e (or equivalent), and timeout/reporter suitable for CI. Ensure projects or default config allow running by spec file or name (e.g. npx playwright test auth runs auth.spec.ts).
  - Create vitest.config.ts at project root with globals or define setup so npx vitest run executes; include test file pattern (e.g. src/**/*.test.ts or tests/unit/**/*.test.ts). If the project is Next.js and has no unit tests yet, config may simply allow vitest run to complete with zero tests or one trivial test.
  - Add to package.json scripts if missing: "test": "vitest run" and "test:e2e": "playwright test", so npx vitest run and npx playwright test are the standard commands.
  </action>
  <verify>
    npx vitest run exits 0 (with zero or one placeholder test). npx playwright test --list runs without error once config exists.
    <automated>npx vitest run</automated>
  </verify>
  <acceptance_criteria>
    - package.json includes @playwright/test and vitest in devDependencies.
    - playwright.config.ts and vitest.config.ts exist and are valid; npx vitest run completes; npx playwright test (with or without specs) does not fail due to missing config.
  </acceptance_criteria>
  <done>
    Playwright and Vitest are installed and configured; npx vitest run and npx playwright test are usable.
  </done>
</task>

<task type="auto">
  <name>Task 2: Add E2E spec stubs for auth and plans-orders</name>
  <files>tests/e2e/auth.spec.ts, tests/e2e/plans-orders.spec.ts</files>
  <read_first>.planning/phases/01-foundation-accounts/01-VALIDATION.md</read_first>
  <action>
  - Create tests/e2e/auth.spec.ts with Playwright test structure. Include at least one stub test (e.g. test('auth stub', async ({ page }) => { ... })) or test.describe('auth', () => { ... }) so that npx playwright test auth runs this file (matching "auth" in path or title). Optionally add placeholder tests or test.skip for signup, login, logout, 2fa, session-persistence so that npx playwright test signup login logout and npx playwright test 2fa session-persistence list or run stubs. Stub tests may skip or expect a minimal assertion (e.g. expect(true).toBe(true)) so the suite passes until Plan 01 implements flows.
  - Create tests/e2e/plans-orders.spec.ts with stub tests so that npx playwright test plan-catalog, npx playwright test create-order, and npx playwright test plans-orders run or list this file (e.g. describe/titles containing "plan-catalog", "create-order", or "plans-orders"). One placeholder test that passes is sufficient.
  - Ensure testDir in playwright.config.ts is set so these files are discovered (e.g. tests/e2e).
  </action>
  <verify>
    Stub specs run without config errors; stubs may skip or pass.
    <automated>npx playwright test auth</automated>
    <automated>npx playwright test plans-orders</automated>
  </verify>
  <acceptance_criteria>
    - tests/e2e/auth.spec.ts exists; npx playwright test auth executes without config errors.
    - tests/e2e/plans-orders.spec.ts exists; npx playwright test plans-orders (or plan-catalog / create-order) executes without config errors.
  </acceptance_criteria>
  <done>
    E2E spec stubs exist so VALIDATION.md Wave 0 requirements are met and plans 01–02 can reference automated Playwright commands in their verify blocks.
  </done>
</task>

</tasks>

<verification>
- npx vitest run completes successfully.
- npx playwright test auth and npx playwright test plans-orders complete successfully (stubs may be skip or placeholder).
</verification>

<success_criteria>
- Playwright and Vitest configs and spec stubs are in place; Phase 1 plans 01 and 02 can use &lt;automated&gt; commands per 01-VALIDATION.md.
</success_criteria>

<output>
No SUMMARY required for Wave 0 unless project convention requires it. Optionally create 01-foundation-accounts-00-SUMMARY.md noting installed frameworks and stub paths.
</output>
