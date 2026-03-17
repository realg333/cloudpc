# Phase 3: VM Provisioning & Lifecycle - Context

**Gathered:** 2026-03-17  
**Status:** Ready for planning  
**Refinements:** Incorporated from user review of phase assumptions

## Phase Boundary

Phase 3 delivers **fully automated Windows GPU VM provisioning on Vultr**, including Parsec readiness, time tracking, and automatic teardown. Paid orders result in ready-to-use VMs that are destroyed when time expires.

## Core Architecture

**Flow:** Webhook → mark paid → enqueue provisioning → provisioning service handles lifecycle

**Critical:** Provisioning must **NOT** run inside the webhook handler. The webhook should:
- validate the webhook
- mark the order as paid
- trigger a provisioning job or state transition

Provisioning runs separately (background job or async process), preventing timeouts, duplicate provisioning, race conditions, and blocking the webhook response.

## Implementation Decisions

### 1. Provisioning Trigger (Async, Not In-Webhook)

- Webhook remains **lightweight and reliable**.
- On payment success: update order status, then **enqueue** a provisioning job (even if stored in DB as a job record).
- Start simple: model it as a job. Can upgrade to a proper queue (Bull, Inngest, etc.) later.
- **Idempotency per order:** Only one VM can ever be created per order. Use `orderId` as the idempotency key. Repeated webhook calls must not create duplicate VMs.

### 2. VM Lifecycle State Machine

Define clear states for visibility, retries, and safer transitions:

| State | Description |
|-------|-------------|
| `payment_confirmed` | Order paid; provisioning not yet requested |
| `provisioning_requested` | Job enqueued / state transition triggered |
| `provisioning` | Vultr API call in progress; waiting for instance |
| `vm_ready` | VM is ready; Parsec available; time counting |
| `expiring` | Time nearly up; grace period or pre-teardown logic |
| `destroying` | Teardown in progress |
| `destroyed` | VM stopped and destroyed; lifecycle complete |
| `failed` | Provisioning or teardown failed; needs admin review |

### 3. Vultr Integration

- **Use REST API directly** for MVP — no SDK. More control over retries, timeouts, and debugging.
- **Polling** for VM readiness (Vultr does not provide instance status webhooks).
- **Single region** for MVP to simplify image management, latency expectations, debugging, and cost tracking.

### 4. Machine Profile Catalog

- Extend `MachineProfile` with Vultr-specific fields: `vultrPlanId`, `vultrRegion` (or equivalent).
- Map to concrete Vultr GPU instance types and regions.
- Seed with real Vultr GPU plans.

### 5. Parsec Readiness

- **Prefer custom Windows image** with Parsec pre-installed. Critical for reliability.
- Use startup scripts only for final configuration if needed.
- Do **not** couple the model too early to Parsec-specific credentials.

### 6. Connection Model (Flexible for Phase 4)

Use a flexible structure instead of `parsecCredentials`:

- `connectionMethod` (e.g. `parsec`)
- `connectionState`
- `connectionMetadata`
- `windowsUsername`
- `secretReference` (if needed)

Keeps Phase 4 (Connect UX) flexible.

### 7. Precise Time Model

Track at least:

- `provisioningStartedAt` — when provisioning was requested
- `readyAt` — when VM became ready for use
- `expiresAt` — when time runs out (based on `readyAt` + duration + grace period)
- `destroyedAt` — when VM was destroyed

**Do not** assume `startedAt` equals `readyAt`. Expiration is based on actual readiness time.

### 8. Failure Visibility

Store structured failure data for admin review:

- `failureCode`
- `failureMessage`
- `lastProviderResponse`
- `retryCount`
- `nextRetryAt`

### 9. Reconciliation / Repair Process

A background process must periodically check:

- DB state vs Vultr state
- Missing instances (in DB but not in Vultr, or vice versa)
- Instances stuck in provisioning
- Instances not destroyed after expiration

**Critical** to prevent cost leaks.

### 10. Cost Safety Controls

Add basic safeguards:

- Max number of active VMs (configurable)
- Optional provisioning cap
- Ability to disable provisioning globally (kill switch)
- Detection of VMs that exceeded expected lifetime

Essential for GPU-based systems.

## Scope Boundaries

**In scope:**
- Vultr GPU instance creation and teardown via REST
- Parsec via custom image (or startup script for final config)
- Time tracking and automatic teardown
- VM metadata storage and state machine
- Error handling, retries, and admin visibility for failures
- Idempotency, reconciliation, and cost safety controls

**Out of scope:**
- User-facing dashboard (Phase 4)
- Admin panel UI (Phase 5)
- Multi-provider support beyond Vultr
- Real-time status updates (polling acceptable for MVP)
- Multi-region (single region for MVP)

## Canonical References

- `.planning/PROJECT.md` — product vision, constraints, Vultr as initial provider
- `.planning/REQUIREMENTS.md` — VM-01 through VM-07
- `.planning/ROADMAP.md` — Phase 3 definition
- `prisma/schema.prisma` — Order, MachineProfile, Plan models
- `src/app/api/webhooks/payments/route.ts` — payment webhook (must remain lightweight)

## Existing Code Insights

- **Order** model: `status`, `planId`, `machineProfileId`, `userId`, `amountCents`
- **MachineProfile**: `providerType`, `gpuTier`, `ramGb`, `cpuSummary` — needs Vultr plan/region mapping
- **Payment webhook**: marks order `paid`, enforces `hasActiveOrder` — will need to enqueue provisioning instead of (or in addition to) any future inline provisioning
- **Plan**: `durationHours` — used for time tracking

## Deferred Ideas

- Job queue (Bull, Inngest) — start with DB-backed job model
- Vultr SDK — use REST for MVP
- Multi-region — single region first
- Real-time status — polling is acceptable

---

*Phase: 03-vm-provisioning-lifecycle*  
*Context gathered: 2026-03-17*  
*Refinements incorporated from user review*
