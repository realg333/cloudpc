# Phase 1: Foundation & Accounts - Context

**Gathered:** 2026-03-16  
**Status:** Ready for planning

## Phase Boundary

Phase 1 delivers the **foundational web stack, authentication, and plan browsing** so that users can:
- sign up and log in with low-friction email/password + email verification
- optionally enable 2FA with an authenticator app
- see available fixed-time packages combined with machine profiles in a simple card layout
- create an order shell for a chosen plan + profile (without yet provisioning VMs)

New capabilities like payments, VM provisioning, dashboards with live machine status, and admin tooling are handled in later phases.

## Implementation Decisions

### Auth UX & Security

- Users authenticate with **email + password**, with **required email verification** before access to core functionality.
- **2FA is optional**, implemented via **authenticator apps** (e.g. Google Authenticator) rather than SMS or email codes.
- Sessions should be **low-friction but safe**: they persist across browser refresh and expire after a **reasonable inactivity period** (e.g. on the order of hours, not days).
- No KYC or document verification is required in this phase/MVP; **basic logging of user activity** will cover minimal compliance needs.
- The overall auth flow should prioritize **speed and simplicity for Brazilian users** while still feeling modern and trustworthy.

### Plan & Machine Profile Presentation

- Plans are displayed as a **card layout**, not a dense table.
- Each card represents a **combination of a fixed-time package and a machine profile** (e.g. “4h – Mid GPU”, “24h – High GPU”).
- Cards show only the most relevant technical info:
  - machine profile name
  - GPU performance tier (e.g. “Mid”, “High”, “Ultra”)
  - short **RAM + CPU summary**
  - **duration** of the package
- The UI should **avoid overwhelming users with raw specs** (exact cores, clock speeds, etc.) while still feeling credible to gamers and creators.
- Payment methods on the purchase flow/cards should **clearly show both PIX and cryptocurrency**, with **crypto visually encouraged** (e.g. priority highlight or microcopy) but **PIX still clearly available**.

### Initial Dashboard & Navigation Skeleton

- After login, the **first experience** should immediately show **current machine status** when that’s available (later phases will wire live data).
- Planned high-level navigation:
  - `Dashboard`
  - `Minhas Máquinas` (My Machines)
  - `Pedidos` (Orders)
  - `Cobranças` (Billing)
  - `Perfil` (Profile)
- For Phase 1, these tabs can exist as **stubs**, with the main focus on:
  - **Dashboard**: future home of active machine status, remaining time, and connect button.
  - **Orders**: list of created orders (from plan selection) even before payments/provisioning exist.
- The platform should clearly communicate a **self-service mental model**: users sign up, choose a plan, pay, receive a machine, and connect — **no admin involvement assumed anywhere in the UI wording**.

### Language, Branding & Localization

- **Primary language** is **Brazilian Portuguese** across the UI.
- Technical terms such as **GPU, CPU, VM, Connect** can remain in English where they are standard or clearer than translations.
- Tone: **modern, technical, but approachable** — friendly to gamers, video editors, programmers, and power users who need a strong remote PC.
- Visual/UX feel should emphasize **fast, simple, and reliable** service, avoiding cluttered dashboards or overly “corporate” style.
- Copy and labels should assume **self-service usage**, not enterprise/managed hosting.

### Claude’s Discretion

- Exact **session timeout duration** and **remember-me behavior** can be chosen following best practices for consumer SaaS in Brazil, as long as they match “low friction, secure enough” and are not excessively long-lived.
- Concrete **card layout details** (icons, typography, exact hierarchy) are up to design/implementation as long as:
  - the key fields (profile name, GPU tier, RAM/CPU summary, duration) are clearly visible
  - crypto is slightly highlighted over PIX without hiding PIX.
- Initial navigation styling and ordering (e.g. whether “Dashboard” or “Minhas Máquinas” is the default) can be tuned during UI design, provided the first screen clearly exposes current machine/plan status once backend support exists.

## Canonical References

Downstream agents should read these before planning or implementing this phase:

### Project & Roadmap

- `.planning/PROJECT.md` — overall product vision, constraints, and target users for Cloud Gaming VPS Brazil.
- `.planning/REQUIREMENTS.md` — v1 requirements, especially:
  - AUTH-01–04 (Authentication & Accounts)
  - PLAN-01–02 (Plans & Ordering)
- `.planning/ROADMAP.md` — Phase 1 definition (“Foundation & Accounts”), including scope and success criteria.

## Existing Code Insights

No existing application code has been defined or mapped yet for this project; Phase 1 will establish the **initial stack, structure, and patterns** that later phases build on.

## Specific Ideas

- Authentication should feel **fast and low-friction**, with verification and optional 2FA as **supportive safety**, not obstacles.
- Plan cards should feel similar to **modern cloud gaming / VPS products**, but tuned for Brazilian users and simplified to the essentials.
- The logged-in experience should clearly answer **“Do I have a machine now? If so, how much time is left?”** once later phases hook in the data.

## Deferred Ideas

- Detailed dashboard behaviors (live machine status, remaining time countdown, connect button implementation) are scoped to **later phases (especially Phase 4)** and will be decided there.
- Payments, webhooks, VM provisioning, and admin tooling are intentionally deferred to subsequent phases and should not influence implementation choices here beyond the self-service mental model.

---

*Phase: 01-foundation-accounts*  
*Context gathered: 2026-03-16*

