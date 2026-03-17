# Phase 8: Environment & Cost Foundation — Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Production deployment environment is ready and cost guardrails are active. All real keys and secrets in .env; CRON jobs run teardown and provisioning; webhook endpoints reachable; "1 active VM per user" enforced; basic cost guardrails (max VMs, kill switch) configured and active.
</domain>

<decisions>
## Implementation Decisions

### Payment Gateway
- **Mercado Pago** — Use Mercado Pago for PIX (and crypto if supported); configure webhook secret and API keys in .env

### Hosting
- **Vercel** — Deploy the app on Vercel; production URL will be used for webhooks and cron

### CRON
- **Vercel Cron** — Use Vercel's built-in cron to call process-teardown, process-provisioning, and reconciliation endpoints at configured intervals

### Webhook URL
- Production: `https://your-domain/api/webhooks/payments` (replace `your-domain` with actual Vercel deployment URL)
- Configure this URL in Mercado Pago dashboard for payment confirmation webhooks

### "1 Active VM per User" — Defense in Depth
- **Add check in provisioning processor** — Before processing a provisioning job, verify the user does not already have an active VM (or active paid order). Reuse `hasActiveOrder` or equivalent; if user already has active VM, reject/skip the job and log.
- Existing enforcement at payment intent creation and webhook handler remains; this adds a second gate at provisioning time.

### Cost Guardrails
- **Initial VM cap: 10** — Set `VULTR_MAX_ACTIVE_VMS=10` as initial production default (override via .env)
- Kill switch: `PROVISIONING_ENABLED` — already implemented in cost-safety.ts

### Claude's Discretion
- Exact CRON intervals (e.g. teardown every 5 min, provisioning every 1 min, reconciliation every 15 min)
- .env.example structure and documentation
- Dev tunneling approach for local webhook testing (ngrok, Cloudflare Tunnel, etc.)
- Mercado Pago adapter implementation details (Phase 9 will integrate; Phase 8 prepares env vars)
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope
- `.planning/ROADMAP.md` — Phase 8 goal, requirements, success criteria
- `.planning/REQUIREMENTS.md` — ENV-01, ENV-02, ENV-03, ENV-04, COST-01, COST-02

### Existing code
- `src/lib/provisioning/cost-safety.ts` — getActiveVmCount, canProvision, isProvisioningAllowed, VULTR_MAX_ACTIVE_VMS
- `src/lib/provisioning/processor.ts` — processProvisioningJobs, canProvision gate
- `src/lib/orders/concurrency.ts` — hasActiveOrder (PLAN-03)
- `src/app/api/cron/process-teardown/route.ts` — teardown cron endpoint
- `src/app/api/cron/process-provisioning/route.ts` — provisioning cron endpoint
- `src/app/api/cron/reconciliation/route.ts` — reconciliation cron endpoint
- `src/app/api/webhooks/payments/route.ts` — payment webhook (currently mock gateway)
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `hasActiveOrder` — Used at payment intent and webhook; will be reused in provisioning processor
- `cost-safety.ts` — getActiveVmCount, canProvision, isProvisioningAllowed; VULTR_MAX_ACTIVE_VMS from env (default 50), PROVISIONING_ENABLED
- `processor.ts` — processProvisioningJobs; calls canProvision before processing; needs to add per-user check

### Established Patterns
- CRON endpoints: GET with `x-cron-secret` or `Authorization: Bearer <token>`; env.CRON_SECRET
- Env vars: VULTR_API_KEY, CRON_SECRET, PROVISIONING_ENABLED, VULTR_MAX_ACTIVE_VMS, GRACE_PERIOD_MINUTES, VULTR_WINDOWS_GPU_OS_ID, SESSION_SECRET, RESEND_API_KEY, ADMIN_EMAIL

### Integration Points
- Vercel: vercel.json for cron config
- Mercado Pago: PAYMENT_WEBHOOK_SECRET (or equivalent) for webhook signature verification
</code_context>

<specifics>
## Specific Ideas

- Gateway: Mercado Pago
- Host: Vercel
- Cron: Vercel Cron
- Webhook URL: https://your-domain/api/webhooks/payments
- Defense in depth: add hasActiveOrder (or equivalent) check in provisioning processor before creating VM
- Initial VM cap: 10

</specifics>

<deferred>
## Deferred Ideas

- Real Mercado Pago integration (payment intents, webhook adapter) — Phase 9
- Real Vultr integration — Phase 10
- End-to-end flow validation — Phase 11
</deferred>

---
*Phase: 08-environment-cost-foundation*
*Context gathered: 2026-03-17*
