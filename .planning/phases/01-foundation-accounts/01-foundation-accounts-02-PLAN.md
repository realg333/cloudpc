---
phase: 01-foundation-accounts
plan: 02
type: execute
wave: 2
depends_on:
  - 01-foundation-accounts-01
files_modified:
  - prisma/schema.prisma
  - prisma/seed.ts
  - src/lib/plans/catalog.ts
  - src/app/plans/page.tsx
  - src/components/PlanCard.tsx
  - src/app/api/orders/route.ts
  - src/app/orders/page.tsx
autonomous: true
requirements:
  - PLAN-01
  - PLAN-02
user_setup: []
must_haves:
  truths:
    - "Logged-in users can see a list of available fixed-time packages and associated machine profiles in a simple, credible card layout."
    - "Each card clearly shows the machine profile name, GPU performance tier, RAM/CPU summary, and package duration without overwhelming technical detail."
    - "From the plans listing, a logged-in user can select a plan + profile combination and create an order record stored in the backend."
    - "Created orders are visible in a basic orders list, marked as not yet paid and not yet provisioned."
  artifacts:
    - path: "prisma/schema.prisma"
      provides: "Plan, MachineProfile, and Order models representing purchasable time packages and selected combinations."
      contains:
        - "model MachineProfile"
        - "model Plan"
        - "model Order"
    - path: "prisma/seed.ts"
      provides: "Seed data for common MachineProfile and Plan records (e.g. 4h, 24h, weekly) used by the UI."
      contains:
        - "await prisma.machineProfile.createMany"
        - "await prisma.plan.createMany"
    - path: "src/lib/plans/catalog.ts"
      provides: "Helper functions to load plan + machine profile combinations for the UI."
      contains:
        - "export async function listPlanOptions"
    - path: "src/components/PlanCard.tsx"
      provides: "Reusable card component rendering a plan + profile combo in PT-BR with GPU tier, RAM/CPU summary, and duration."
      min_lines: 60
    - path: "src/app/plans/page.tsx"
      provides: "Plans listing page showing cards for all available plan/profile combinations with CTA to create an order."
      min_lines: 80
    - path: "src/app/api/orders/route.ts"
      provides: "API route for creating orders associated with the current user, plan, and machine profile."
      contains:
        - "export async function POST"
    - path: "src/app/orders/page.tsx"
      provides: "Basic orders page listing the user’s created orders and their current high-level status."
      min_lines: 60
  key_links:
    - from: "src/app/plans/page.tsx"
      to: "src/lib/plans/catalog.ts"
      via: "Server-side loader or React hook to fetch plan/profile combinations."
      pattern: "listPlanOptions"
    - from: "src/app/plans/page.tsx"
      to: "src/app/api/orders/route.ts"
      via: "Client-side POST request to create a new order when user clicks a CTA on a card."
      pattern: "/api/orders"
    - from: "src/app/api/orders/route.ts"
      to: "prisma/schema.prisma"
      via: "Prisma calls using Plan, MachineProfile, Order, and User relations."
      pattern: "prisma.order.create"
    - from: "src/app/orders/page.tsx"
      to: "src/app/api/orders/route.ts"
      via: "Data loading for the current user's orders."
      pattern: "/api/orders"
---

<objective>
Implement plans and ordering foundations so that authenticated users can browse fixed-time package and machine profile combinations in a card layout, then create and review non-paid, non-provisioning order records in the backend.

Purpose: Give users clear visibility into what they can buy and allow them to create an order shell that later phases will connect to payments and VM provisioning.
Output: Database models, seed data, UI components, and API routes that satisfy PLAN-01 and PLAN-02 without yet integrating payments or VM lifecycle.
</objective>

<execution_context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/ROADMAP.md
@.planning/phases/01-foundation-accounts/01-CONTEXT.md
@.planning/phases/01-foundation-accounts/01-foundation-accounts-01-PLAN.md
</execution_context>

<context>
Plans & ordering must satisfy:
- PLAN-01: User can view available fixed-time packages and associated machine profiles.
- PLAN-02: User can select a plan and machine profile and create an order.

UI constraints from context:
- Use a card layout, not a dense table.
- Each card shows profile name, GPU tier label, RAM + CPU summary, and package duration.
- Clearly show PIX and crypto as payment methods in copy, with crypto visually encouraged but PIX still available (actual payment wiring happens in Phase 2).

Auth foundation from Plan 01:
- Users are authenticated via sessions and can be identified via `User` in Prisma.
- Orders must associate to the current authenticated user but should not yet trigger payments or VM provisioning.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extend Prisma schema with plans, machine profiles, and orders</name>
  <files>
    prisma/schema.prisma,
    prisma/seed.ts
  </files>
  <read_first>
    prisma/schema.prisma,
    .planning/REQUIREMENTS.md,
    .planning/phases/01-foundation-accounts/01-CONTEXT.md
  </read_first>
  <action>
  - Open `prisma/schema.prisma` and, building on the existing `User` and Session-related models from Plan 01, add:
    - `model MachineProfile` with fields: `id String @id @default(cuid())`, `name String`, `gpuTier String`, `ramGb Int`, `cpuSummary String`, `providerType String`, `isActive Boolean @default(true)`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`, and relation `orders Order[]`.
    - `model Plan` with fields: `id String @id @default(cuid())`, `name String`, `durationHours Int`, `description String?`, `isActive Boolean @default(true)`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`, and relation `orders Order[]`.
    - `model Order` with fields: `id String @id @default(cuid())`, `userId String`, `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`, `planId String`, `plan Plan @relation(fields: [planId], references: [id], onDelete: Restrict)`, `machineProfileId String`, `machineProfile MachineProfile @relation(fields: [machineProfileId], references: [id], onDelete: Restrict)`, `status String @default("pending_payment")`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`.
  - Ensure referential integrity in `Order` relations by defining `@@index([userId])`, `@@index([planId])`, and `@@index([machineProfileId])` as appropriate for common queries.
  - Create `prisma/seed.ts` that:
    - Imports `PrismaClient` from `@prisma/client`.
    - Defines a `main()` function that clears existing `Order` records (if any), then upserts at least three `MachineProfile` records (e.g. `"Mid GPU"`, `"High GPU"`, `"Ultra GPU"`) with realistic `ramGb`, `cpuSummary`, and `providerType` strings (e.g. `"vultr-gpu-mid"`).
    - Upserts at least three `Plan` records representing durations like 4 hours, 24 hours, and 7 days, with Portuguese-friendly names (e.g. `"Pacote 4h"`, `"Pacote 24h"`, `"Pacote semanal"`).
    - Logs a concise message on completion and gracefully disconnects from Prisma.
  - Add an npm script in `package.json` named `"prisma:seed"` that runs `ts-node` or `node` on `prisma/seed.ts` (depending on whether the file is authored in TypeScript or JavaScript) and configure Prisma's `schema.prisma` `generator client` block to reference `seed = "ts-node prisma/seed.ts"` or equivalent if using Prisma's built-in seeding.
  - Run `npx prisma migrate dev --name init_plans` (or equivalent) and execute the seed script to ensure initial data for plans and machine profiles exist.
  </action>
  <verify>
    npx prisma validate; npx prisma migrate dev --name init_plans; npm run prisma:seed.
    <automated>npx prisma validate</automated>
  </verify>
  <acceptance_criteria>
    - `prisma/schema.prisma` contains `model MachineProfile`, `model Plan`, and `model Order` definitions with the fields and relations described.
    - `prisma/schema.prisma` includes indexes on `Order` for `userId`, `planId`, and `machineProfileId`.
    - `prisma/seed.ts` imports `PrismaClient` and calls `prisma.machineProfile.createMany` and `prisma.plan.createMany` (or upserts) to create at least three records each.
    - Running `npx prisma validate` exits with code 0 and `npx prisma migrate dev --name init_plans` completes successfully.
    - Running `npm run prisma:seed` completes and, when checked via Prisma Studio or direct query, `MachineProfile` and `Plan` tables contain the seeded data.
  </acceptance_criteria>
  <done>
    The database schema includes MachineProfile, Plan, and Order models and initial seed data for plan and profile catalogs, enabling the UI and API to work with real records.
  </done>
</task>

<task type="auto">
  <name>Task 2: Implement plan catalog helper and card-based plans listing UI</name>
  <files>
    src/lib/plans/catalog.ts,
    src/components/PlanCard.tsx,
    src/app/plans/page.tsx
  </files>
  <read_first>
    src/lib/db.ts,
    prisma/schema.prisma,
    .planning/phases/01-foundation-accounts/01-CONTEXT.md
  </read_first>
  <action>
  - Create `src/lib/plans/catalog.ts` that:
    - Imports the shared `prisma` client.
    - Exports `export async function listPlanOptions()` which queries active `Plan` and `MachineProfile` records and returns an array of objects combining a plan with a machine profile, including fields: `planId`, `planName`, `durationHours`, `machineProfileId`, `profileName`, `gpuTier`, `ramGb`, and `cpuSummary`.
  - Implement `src/components/PlanCard.tsx` as a reusable React component (TypeScript) that accepts props for the fields returned by `listPlanOptions` plus a CTA handler and renders:
    - Profile name, GPU tier (e.g. "GPU: Mid", "GPU: High"), RAM/CPU summary (e.g. "16 GB RAM, 4 vCPUs"), and duration (e.g. "4 horas").
    - PT-BR text describing that payment will be via PIX or crypto, with crypto visually encouraged (e.g. a small badge "Cripto recomendado" and text indicating PIX is also available).
    - A clearly distinguished call-to-action button labeled in PT-BR (e.g. "Escolher plano") that triggers order creation.
  - Implement `src/app/plans/page.tsx` as a server component that:
    - Ensures the user is authenticated (using the session helper from Plan 01 or a server-side equivalent) and redirects to `/login` if not.
    - Calls `listPlanOptions()` to load all plan/profile combinations.
    - Renders a responsive grid of `PlanCard` components that respect the card-layout requirement and show the fields described in the phase context, in PT-BR.
    - Includes explanatory text at the top in PT-BR summarizing how fixed-time packages and machine profiles work.
  </action>
  <verify>
    npm run build (or npm run lint && npm run build) succeeds; visiting /plans while logged in shows a grid of cards from seeded data.
    <automated>npx playwright test plan-catalog</automated>
  </verify>
  <acceptance_criteria>
    - `src/lib/plans/catalog.ts` exports a function named `listPlanOptions` that uses Prisma to read from `Plan` and `MachineProfile` and returns combined data including duration, GPU tier, and RAM/CPU summary.
    - `src/components/PlanCard.tsx` is a TypeScript React component that takes props including `planName`, `durationHours`, `profileName`, `gpuTier`, `ramGb`, and `cpuSummary` and renders them within a visually distinct card.
    - `src/components/PlanCard.tsx` includes PT-BR microcopy that mentions both PIX and crypto payments and visually encourages crypto (e.g. text or badge referencing "Cripto recomendado").
    - `src/app/plans/page.tsx` imports and uses `listPlanOptions` and `PlanCard`, and contains text in PT-BR describing fixed-time packages and machine profiles.
    - When the backend is running with seeded data and an authenticated session, requesting `/plans` returns cards representing each seeded combination.
  </acceptance_criteria>
  <done>
    Authenticated users see a PT-BR card-based plans listing that surfaces plan and machine profile combinations with the required fields and payment hints, satisfying PLAN-01.
  </done>
</task>

<task type="auto">
  <name>Task 3: Implement order creation API and basic orders page</name>
  <files>
    src/app/api/orders/route.ts,
    src/app/orders/page.tsx
  </files>
  <read_first>
    prisma/schema.prisma,
    src/lib/db.ts,
    src/lib/plans/catalog.ts,
    .planning/REQUIREMENTS.md,
    .planning/phases/01-foundation-accounts/01-CONTEXT.md
  </read_first>
  <action>
  - Implement `src/app/api/orders/route.ts` for the App Router with:
    - A `POST` handler that:
      - Confirms the request is authenticated using the existing session mechanism and obtains the current `User` ID.
      - Accepts JSON body parameters `planId` and `machineProfileId`.
      - Validates that the referenced `Plan` and `MachineProfile` exist and are active.
      - Creates a new `Order` row with `status = "pending_payment"` linked to the current user, plan, and machine profile.
      - Returns the created order data (ID, plan/profile, status) as JSON.
    - A `GET` handler that:
      - Requires authentication.
      - Returns a list of the current user's orders (ID, plan name, profile name, status, createdAt).
  - Update `src/components/PlanCard.tsx` or `src/app/plans/page.tsx` so that clicking the CTA button on a card:
      - Sends a `POST` request to `/api/orders` with the corresponding `planId` and `machineProfileId`.
      - On success, navigates the user to `/orders` or shows a success message indicating the order shell was created and is awaiting payment.
  - Implement `src/app/orders/page.tsx` as a server component that:
      - Requires authentication.
      - Loads the current user's orders (either by calling `/api/orders` internally or using Prisma directly).
      - Renders a simple PT-BR table or list showing each order's creation date, plan name, machine profile name, and status text such as "Aguardando pagamento" for `pending_payment`.
      - Clearly indicates that payment and machine provisioning are handled later (e.g. static text mentioning that this is only an order shell for now).
  </action>
  <verify>
    npm run build succeeds. Manual: logged in, visit /plans, click CTA, confirm order on /orders with pending_payment.
    <automated>npx playwright test create-order</automated>
  </verify>
  <acceptance_criteria>
    - `src/app/api/orders/route.ts` exports at least `POST` and `GET` handlers using the App Router API route conventions.
    - The `POST` handler in `/api/orders` creates an `Order` row linked to a valid `User`, `Plan`, and `MachineProfile` with `status = "pending_payment"`.
    - The `GET` handler in `/api/orders` returns only orders for the authenticated user.
    - Clicking the CTA on a plan card issues a `POST` request to `/api/orders` with `planId` and `machineProfileId` and navigates or responds on success.
    - `src/app/orders/page.tsx` lists at least one field for each order: plan name, machine profile name, and a PT-BR status string including "Aguardando pagamento" for pending orders.
  </acceptance_criteria>
  <done>
    Logged-in users can create order shells from the plans page and see their orders in a basic orders view, with no payments or VM provisioning triggered yet, satisfying PLAN-02.
  </done>
</task>

</tasks>

<verification>
- `npx prisma validate` and `npx prisma migrate dev --name init_plans` complete without errors.
- `npm run prisma:seed` populates MachineProfile and Plan tables.
- `npm run build` (and `npm run lint` if configured) succeeds.
- Manual browser tests confirm:
  - `/plans` shows seeded plan/profile combinations as cards in PT-BR.
  - Creating an order from a card results in a new `Order` row with `pending_payment` status.
  - `/orders` lists the created orders and clearly indicates they are awaiting payment and provisioning in later phases.
</verification>

<success_criteria>
- PLAN-01 and PLAN-02 requirements are fully satisfied for Phase 1: users can view available plans with machine profiles and create backend order records without side effects.
- The plan and catalog structures created here cleanly support later phases that will add payments, VM provisioning, and richer dashboards without needing major rewrites.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-accounts/01-foundation-accounts-02-SUMMARY.md` summarizing the plan/catalog models, seed data, UI, and order creation flow.
</output>

