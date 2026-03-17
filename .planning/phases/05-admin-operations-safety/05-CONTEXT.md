# Phase 5: Admin Operations & Safety — Context

**Gathered:** 2026-03-17  
**Status:** Ready for planning  
**Source:** ROADMAP, REQUIREMENTS, user focus

## Phase Boundary

Provide internal tools for operating the fleet, monitoring health and cost, and handling basic abuse/suspicious activity. **Keep it simple and aligned with MVP scope.**

## User Focus (Priority Order)

1. **Admin VM monitoring** — List all active VMs with user ownership, profile, provider IDs, start time, remaining time
2. **Basic cost visibility** — Counts of active VMs, rough cost estimates per profile, recent failures
3. **Manual VM control** — Start/stop/terminate via admin panel, actions reflected in Vultr and DB
4. **Logs and failure visibility** — Centralize key events (payments, provisioning, destruction, admin overrides); searchable/filterable
5. **Basic abuse detection signals** — Repeated failures, unusual restart patterns, surfaced for manual intervention

## Implementation Decisions

### Admin Auth
- Add `isAdmin` boolean to User model (env-seeded or migration)
- Admin panel at `/admin` — redirect to `/login` if unauthenticated; 403 if not admin
- Reuse getSessionFromCookies; add `requireAdmin()` helper

### VM Monitoring
- Admin view: all ProvisionedVm with status in (provisioning, vm_ready, expiring, destroying)
- Include: order.user.email, machineProfile.name, vultrInstanceId, readyAt, expiresAt, getRemainingMinutes
- Polling or manual refresh acceptable for MVP

### Cost Visibility
- Use existing getActiveVmCount from cost-safety.ts
- Per-profile counts: group by machineProfileId
- Rough cost: MachineProfile hourly rate (if available) or placeholder "—" for MVP
- Recent failures: ProvisionedVm with status=failed, last 24h

### Manual VM Control
- **Terminate:** Call vultr.deleteInstance, update ProvisionedVm status, log action
- **Start/Stop:** Vultr GPU instances use expiry-based teardown; if Vultr supports halt/start, add; otherwise placeholder only

### Logging
- **ActionLog** model: action, actorId (userId or adminId), actorType ('user'|'admin'|'system'), entityType ('order'|'provisionedVm'|'payment'), entityId, metadata (Json), createdAt
- Log: payment processed, VM created, VM destroyed, admin terminate, admin override
- PaymentLog already exists for webhook events

### Abuse Signals
- Repeated failed payment webhooks (same user/order): count from PaymentLog
- Repeated provisioning errors (same user): count by order.userId + failureCode
- Unusual restarts: count ProvisionedVm created per user in last 7d — flag if > 3

### Claude's Discretion
- Layout for admin panel (table vs cards)
- ActionLog schema details
- Cost per profile (MachineProfile may need hourlyRateCents or similar)

## Canonical References

- `.planning/ROADMAP.md` — Phase 5 scope and success criteria
- `.planning/REQUIREMENTS.md` — ADMIN-01 through ADMIN-05, SAFE-01 through SAFE-04
- `prisma/schema.prisma` — User, ProvisionedVm, Order, MachineProfile, PaymentLog
- `src/lib/provisioning/time-tracking.ts` — getRemainingMinutes, isExpired
- `src/lib/provisioning/teardown.ts` — processExpiredVms, vultr.deleteInstance
- `src/lib/provisioning/cost-safety.ts` — getActiveVmCount, canProvision
- `src/lib/vultr/client.ts` — deleteInstance, getInstance, listInstances
- `src/app/dashboard/page.tsx` — Dashboard pattern for auth

## Existing Code Insights

### Reusable Assets
- getSessionFromCookies for auth
- Vultr client: deleteInstance, getInstance
- cost-safety: getActiveVmCount
- time-tracking: getRemainingMinutes, isExpired
- PaymentLog for payment events

### Integration Points
- Admin route: /admin
- Admin APIs: /api/admin/vms, /api/admin/vms/[id]/terminate, /api/admin/logs, /api/admin/health

### Patterns
- Server components with redirect for unauthenticated
- Tailwind, rounded-lg borders, indigo primary (match dashboard)

## Deferred Ideas

- WebSockets for admin real-time (polling acceptable for MVP)
- Advanced analytics dashboards
- Automated abuse throttling (manual intervention only for MVP)

---

*Phase: 05-admin-operations-safety*  
*Context gathered: 2026-03-17*
