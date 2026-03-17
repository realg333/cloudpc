[# Cloud Gaming VPS Brazil]

## What This Is

Cloud Gaming VPS Brazil is a cloud gaming rental platform focused on the Brazilian market. It lets users rent high‑performance Windows cloud PCs with GPUs for gaming, video editing, and remote desktop usage, paying via fixed‑time packages and connecting through Parsec directly from a web dashboard. The product targets Brazilian gamers and creators who cannot afford a gaming PC but want a smooth, low‑friction way to access powerful hardware on demand.

## Core Value

Users can quickly and reliably get a high‑performance Windows cloud PC with GPU, paid upfront in a fixed‑time package, and connect through a simple web dashboard with minimal friction and manual intervention.

## Current Milestone: v1.1 Frontend Polish

**Goal:** Premium frontend polish and conversion optimization — landing page redesign and dashboard refinement — with no backend, database, or API changes.

**Target features:**
- Landing Page Redesign — premium, high-conversion homepage; clear product explanation; trust signals; strong CTA to /plans
- Dashboard Polish — world-class premium cloud product experience; stronger hierarchy; clearer machine status; better remaining-time visibility; stronger Connect CTA

**Constraints:** Frontend only. No backend, database, or API changes. Use UI UX Pro Max skill throughout.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Landing page: premium, high-conversion homepage that explains product, builds trust, pushes to /plans — Phase 6
- ✓ Users can rent GPU cloud PCs using fixed‑time packages (e.g. 4h, 24h, weekly) — v1.0
- ✓ The system provisions and destroys Windows GPU VMs automatically based on successful payments and remaining time — v1.0
- ✓ Users have a self‑service dashboard showing active machines, remaining time, status, and a one‑click Parsec connection — v1.0
- ✓ Admins can monitor all active VMs, see which user owns each, and perform manual start/stop/terminate actions — v1.0
- ✓ The platform enforces one active VM per user and includes basic abuse controls (concurrency limits, logging, optional 2FA) — v1.0

### Active

<!-- Current scope. Building toward these. -->

- [ ] Dashboard: world-class premium experience with stronger hierarchy, clearer machine status, better remaining-time visibility, stronger Connect CTA

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Advanced device fingerprinting and anti‑sharing systems — deferred until after MVP validation.
- Complex analytics dashboards and cohort analysis — focus first on core provisioning and basic monitoring.
- Full KYC / document verification — MVP will use email registration, optional 2FA, and activity logs only.

## Context

- **Market**: Brazilian gamers and creators who cannot afford gaming PCs but have sufficient internet to stream gameplay/desktop sessions.
- **Product**: Time‑boxed GPU cloud PCs (Windows + Parsec) accessible via a browser dashboard, with plans like 4h, 24h, and weekly.
- **Pricing model**: Users buy fixed‑time packages (prepaid only); the platform internally pays cloud providers per hour and aims to keep a healthy margin via aggressive cost optimization.
- **Cloud provider**: Start with Vultr GPU instances, integrating strongly with their API for VM lifecycle automation. Architecture should allow adding more providers later via an abstraction over provider APIs.
- **VM profiles**: Multiple machine profiles (RAM, vCPU, GPU model, etc.) map to provider instance types, allowing flexible definitions rather than only rigid plans.
- **Payments**: PIX and crypto are processed by an existing gateway; this system only needs to react to payment confirmation webhooks and strongly encourage crypto usage.
- **User identity & security**: Email registration with optional 2FA, plus proper logging and records of user activity for basic compliance and abuse investigation.
- **Operations**: Service should run with minimal manual intervention; admin panel is internal for support and operational overrides, not for customers.
- **Shipped v1.0**: 5 phases, 15 plans. Auth, plans, payments, VM provisioning, dashboard, admin panel, and abuse controls all operational.

## Constraints

- **Tech Stack**: Modern web stack (e.g. Next.js) for the frontend, Node.js for backend services, and integration with Vultr's API for VM lifecycle.
- **Business Model**: Prepaid fixed‑time packages only for MVP (no wallets/balances); predictable pricing for users, cost optimization handled internally.
- **Region & Payments**: Focused on Brazilian users; must support PIX and crypto via existing payment gateway webhooks.
- **Timeline**: Prioritize launching a working MVP quickly over advanced analytics or complex anti‑fraud.
- **Operations**: System should be highly automated so day‑to‑day operations (provisioning, expiry, teardown) rarely require human intervention.
- **Abuse Protection**: MVP focuses on one active VM per user, basic logging, and optional 2FA; advanced device fingerprinting is explicitly deferred.

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use fixed‑time packages (4h/24h/weekly) instead of per‑hour billing for users | Provides predictable pricing and simpler UX while allowing internal infra cost optimization | ✓ Good — v1.0 |
| Start with Vultr GPU instances but keep provider‑agnostic architecture | Vultr offers suitable GPU VMs; abstraction keeps door open for other providers later | ✓ Good — v1.0 |
| Prepaid only (no wallet) for MVP | Simplifies billing and reduces edge cases; enough for initial launch | ✓ Good — v1.0 |
| Focus MVP on automation (payments → VM lifecycle) over analytics/advanced fraud | Validates core value quickly with minimal manual operation | ✓ Good — v1.0 |
| Trust strip replaces full TrustCard section | Reduces page length and hesitation; compact badges after hero | ✓ Good — Phase 6 |
| Secondary CTA "Como funciona" anchors to How it works | Soft conversion path before primary /plans CTA | ✓ Good — Phase 6 |
| text-slate-400 for body text on dark bg | Meets WCAG 4.5:1 contrast; text-slate-500 fails | ✓ Good — Phase 6 |

---
*Last updated: 2026-03-17 after Phase 6*
