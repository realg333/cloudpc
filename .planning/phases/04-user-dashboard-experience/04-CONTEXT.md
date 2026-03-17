# Phase 4: User Dashboard Experience — Context

**Gathered:** 2026-03-16  
**Status:** Ready for planning  
**Source:** ROADMAP, REQUIREMENTS, prior phases

## Phase Boundary

Deliver a smooth, self-service dashboard where users manage their machines and connect via Parsec. Users see active and recent VMs, status, remaining time, and a working Parsec connection flow. Basic order history and usage records.

## Implementation Decisions

### Dashboard Scope
- Authenticated dashboard listing user's active and recent VMs
- VM status: provisioning, vm_ready, expiring, destroying, destroyed, failed
- Remaining time for active sessions (use `getRemainingMinutes` from time-tracking.ts)
- Start/stop controls within allowed rules (time continues counting while VM runs)
- Parsec connection via "Connect" button when VM is ready
- Order history and basic usage records

### Data Model (Existing)
- ProvisionedVm: status, readyAt, expiresAt, connectionMethod, connectionState, connectionMetadata, ipAddress, windowsUsername
- Order → ProvisionedVm (one-to-one via orderId)
- time-tracking.ts: getRemainingMinutes(vm), isExpired(vm)

### Parsec Connection
- connectionMethod='parsec', connectionState='ready' when vm_ready
- Connect button must launch Parsec connection flow (Parsec protocol or app link)
- Credentials/links exposed securely (no plaintext in HTML; use API or signed tokens)

### Real-Time Updates
- Success criteria: "user sees VM move from provisioning to ready without refreshing manually"
- Polling or server-sent events acceptable for MVP; avoid blocking on WebSockets if not needed

### Claude's Discretion
- Layout style (cards vs list vs table)
- Polling interval for status updates
- Parsec launch mechanism (parsec:// URL, app protocol, or copy-paste credentials)
- Start/stop API design (if Vultr supports it; Phase 3 teardown is expiry-based)

## Canonical References

- `.planning/ROADMAP.md` — Phase 4 scope and success criteria
- `.planning/REQUIREMENTS.md` — DASH-01 through DASH-05
- `prisma/schema.prisma` — ProvisionedVm, Order, MachineProfile
- `src/lib/provisioning/time-tracking.ts` — getRemainingMinutes, isExpired
- `src/app/orders/page.tsx` — Existing orders list pattern
- `src/app/layout.tsx` — NavBar, layout structure

## Existing Code Insights

### Reusable Assets
- NavBar, layout with pt-BR
- getSessionFromCookies for auth
- Orders page: prisma.order.findMany with plan, machineProfile
- statusLabel pattern for status display

### Integration Points
- Dashboard route: /dashboard or / (home when logged in)
- Orders page can link to dashboard or be merged
- ProvisionedVm fetched via Order relation or direct query by userId

### Patterns
- Server components with redirect for unauthenticated
- Tailwind, rounded-lg borders, indigo primary

## Deferred Ideas

- WebSockets for real-time (polling acceptable for MVP)
- Advanced Parsec config (host settings, resolution) — use defaults
- Multi-VM future (Phase 3 enforces one active per user)

---

*Phase: 04-user-dashboard-experience*  
*Context gathered: 2026-03-16*
