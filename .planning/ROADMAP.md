[# Roadmap: Cloud Gaming VPS Brazil]

This roadmap covers v1 of the Cloud Gaming VPS Brazil platform, mapping every v1 requirement to a phase with clear goals and success criteria.

## Summary

- **5 phases**  
- **32 v1 requirements**  
- All v1 requirements mapped to exactly one phase.

## Phase Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Foundation & Accounts | Basic auth, plans listing, and core project skeleton are in place. | AUTH-01–04, PLAN-01–02 | Users can sign up, log in, view available plans, and create an order shell. |
| 2 | Payments & Order Automation | Complete    | 2026-03-17 | Successful PIX/crypto payments reliably transition orders to “paid” and trigger provisioning, with one active VM per user. |
| 3 | 3/3 | Complete   | 2026-03-17 | Paid orders result in ready‑to‑use Windows GPU VMs that are automatically destroyed when time expires. |
| 4 | 2/2 | Complete    | 2026-03-17 | Users see status and remaining time clearly and can connect via Parsec from the dashboard without admin help. |
| 5 | 3/3 | Complete   | 2026-03-17 | Admins can operate the fleet safely, with logs and basic abuse/suspicious activity visibility. |

---

## Phase 1: Foundation & Accounts

**Goal:** Establish the core web stack, authentication, and plan browsing so users can sign up, log in, and see what they can buy.

**Requirements:**  
AUTH-01, AUTH-02, AUTH-03, AUTH-04, PLAN-01, PLAN-02

**Scope:**
- Set up the modern web stack (e.g. Next.js frontend + Node backend) with basic project structure.
- Implement email/password authentication with session management and optional 2FA toggle.
- Create public pages that explain the service and list available fixed‑time packages and machine profiles.
- Implement a basic “create order” flow that records the user’s chosen package and profile in the backend.

**Success Criteria:**
1. A new user can sign up with email/password, log in, log out, and remain logged in across refresh within a session timeout.
2. Logged‑in users can see a list of available plans (4h, 24h, weekly, etc.) and associated machine profiles.
3. Users can select a plan + profile and create an order record that is ready for payment (but does not yet provision VMs).
4. Optional 2FA can be enabled/disabled on accounts and is enforced on login when enabled.

**Plans:** 4/4 plans executed

Plans:
- [x] 01-foundation-accounts-00-PLAN.md — Wave 0: Playwright + Vitest config and E2E spec stubs (auth, plans-orders)
- [x] 01-foundation-accounts-01-PLAN.md — Auth foundation (Next.js skeleton, Prisma models, email/password + verification + 2FA)
- [x] 01-foundation-accounts-02-PLAN.md — Plans catalog and order shells (card UI, plan/profile models, order creation and listing)
- [x] 01-foundation-accounts-gaps-PLAN.md — Profile page and 2FA disable flow (verification gaps)

---

## Phase 2: Payments & Order Automation

**Goal:** Turn orders into paid reservations automatically via PIX/crypto webhooks, while enforcing one active VM per user.

**Requirements:**  
PLAN-03, PAY-01, PAY-02, PAY-03, PAY-04, PAY-05

**Scope:**
- Integrate with the existing payment gateway for PIX and crypto, focusing on webhook‑driven confirmation.
- Implement secure webhook endpoints, signature verification, and idempotency handling.
- Wire webhook events to order state transitions (unpaid → paid, expired/canceled).
- Introduce concurrency rules so only one active VM can exist per user at a time.

**Success Criteria:**
1. Test payments (PIX and crypto) result in webhook callbacks that reliably mark the matching order as paid.
2. Failed/expired payments are reflected as canceled orders, and no provisioning is triggered.
3. If a user already has an active VM, they cannot pay for or start a second concurrent VM (PLAN-03 enforced).
4. Payment flows are logged with enough detail to trace issues (order ID, user, amounts, method, timestamps).

**Plans:** 3/3 plans complete

Plans:
- [x] 02-00-PLAN.md — Wave 0: Test stubs (concurrency, gateway, webhook, E2E payments, fixtures)
- [x] 02-01-PLAN.md — Wave 1: Schema (Payment, PaymentLog, pricing), order amountCents, mock gateway
- [x] 02-02-PLAN.md — Wave 2: Webhook handler, payment intent API, checkout UI

---

## Phase 3: VM Provisioning & Lifecycle

**Goal:** Fully automate Windows GPU VM provisioning on Vultr, including Parsec readiness, time tracking, and teardown.

**Requirements:**  
VM-01, VM-02, VM-03, VM-04, VM-05, VM-06, VM-07

**Scope:**
- Design a machine profile catalog mapping to concrete Vultr GPU instance types and regions.
- Implement a provisioning service that:
  - Creates a Windows GPU VM using the selected machine profile when an order is paid.
  - Waits/polls until the VM is ready and records metadata (ID, IP, credentials, status).
  - Ensures Parsec is installed and running (via custom image, cloud‑init/startup scripts, or automation tooling).
- Implement time tracking based on package duration and VM start time, including a configurable grace period if desired.
- Implement automatic teardown that stops and destroys VMs when time expires and updates internal state.
- Implement robust error handling and retries for cloud API calls, surfacing failures for admin review.

**Success Criteria:**
1. Creating a paid order for a supported plan results in a Vultr Windows GPU VM being created and marked as “ready” in the system.
2. Parsec is available on the VM without manual steps; test users can connect successfully (once dashboard wiring is done).
3. Remaining time for an active VM decrements correctly and reaches zero at the expected time window.
4. When time expires, the VM is automatically stopped and destroyed via the Vultr API, and the user no longer sees it as active.
5. Provisioning or teardown failures are logged with enough detail and visible in admin interfaces for manual follow‑up.

**Plans:** 3/3 plans complete

Plans:
- [x] 03-01-PLAN.md — Schema (ProvisionedVm, ProvisioningJob), MachineProfile Vultr mapping, seed catalog
- [x] 03-02-PLAN.md — Webhook enqueue, Vultr REST client, provisioning service (create, poll, record metadata)
- [x] 03-03-PLAN.md — Time tracking, teardown, reconciliation, cost safety (max VMs, kill switch)

---

## Phase 4: User Dashboard Experience

**Goal:** Deliver a smooth, self‑service dashboard where users manage their machines and connect via Parsec.

**Requirements:**  
DASH-01, DASH-02, DASH-03, DASH-04, DASH-05

**Scope:**
- Build an authenticated dashboard that lists the user’s active and recent VMs.
- Show clear VM status (provisioning, running, stopping, terminated) and remaining time for active sessions.
- Implement start/stop controls within allowed rules and update time tracking accordingly.
- Integrate Parsec connection from the dashboard via a “Connect” button, exposing necessary credentials/links in a secure manner.
- Add basic history/usage views so users can see previous orders and top‑level activity records.

**Success Criteria:**
1. A user can log into the dashboard and immediately understand whether they currently have an active machine and how much time remains.
2. When a new order is paid, the user sees a VM move from “provisioning” to “ready” within a reasonable time, without refreshing manually.
3. The “Connect” button launches a working Parsec connection for a ready VM using stored credentials.
4. Users can issue start/stop commands from the dashboard and see the VM/state reflect those changes.
5. Users can view a simple history of past orders and basic usage logs (e.g. start/end timestamps).

**Plans:** 2/2 plans complete

Plans:
- [x] 04-01-PLAN.md — Wave 1: Dashboard shell, VM list, status, remaining time, polling
- [x] 04-02-PLAN.md — Wave 2: Connect/Parsec, start-stop placeholder, order history with usage

---

## Phase 5: Admin Operations & Safety

**Goal:** Provide internal tools for operating the fleet, monitoring health and cost, and handling basic abuse/suspicious activity.

**Requirements:**  
ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, SAFE-01, SAFE-02, SAFE-03, SAFE-04

**Scope:**
- Implement an internal admin panel with secure access (separate admin auth/roles).
- Build views listing all active VMs with user ownership, profile, provider IDs, start time, and remaining time.
- Add controls for admins to start/stop/terminate VMs, with these actions logged and executed via the provider API.
- Show basic infrastructure metrics (counts of active VMs, rough cost estimates per profile, recent failures).
- Centralize logs of key events (payments, provisioning, destruction, admin overrides) and surface simple suspicious‑activity indicators.
- Ensure that external‑facing endpoints and internal APIs follow good security practices (auth, authorization, validation).

**Success Criteria:**
1. Admins can see a real‑time view of all active VMs and who owns them, plus recent actions taken.
2. Admin‑initiated start/stop/terminate operations propagate correctly to Vultr and the internal database.
3. A minimal “infra health” view (e.g. total active VMs, error counts, rough cost) is available and understandable at a glance.
4. All critical actions are logged with user/admin identity, timestamps, and relevant context, and can be searched or filtered.
5. Basic suspicious‑activity signals (e.g. repeated failures, unusual restart patterns) are visible so you can manually intervene.

**Plans:** 3/3 plans complete

Plans:
- [x] 05-01-PLAN.md — Admin foundation (isAdmin, requireAdmin, /admin shell)
- [x] 05-02-PLAN.md — ActionLog, VM list, terminate API and UI
- [x] 05-03-PLAN.md — Health, logs, abuse signals, wire ActionLog to provisioning/teardown

---

## Next Steps

- Start with **Phase 1: Foundation & Accounts**.  
- When Phase 1 is complete, proceed to **Phase 2: Payments & Order Automation**, then follow the phases in order.  
- At any point, if scope changes (e.g. adding stronger anti‑abuse measures), update REQUIREMENTS.md and ROADMAP.md together to keep traceability accurate.

