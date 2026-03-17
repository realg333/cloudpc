# Phase 7: Dashboard Polish — Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Premium cloud infrastructure control panel experience. Stronger hierarchy, clearer machine status, better remaining-time visibility, stronger Connect CTA. Frontend only. Use UI UX Pro Max skill throughout. No backend or API changes.
</domain>

<decisions>
## Implementation Decisions

### Visual Style
- Dark mode (align with landing page)
- Subtle indigo/violet accents
- No childish gaming visuals
- Clean, sharp, modern
- Premium feel: fast, technical, high-end
- Avoid clutter and generic SaaS look

### Active Machine Focus
- Active machine must dominate the page visually
- First thing the user sees and understands instantly
- Use layout and visual hierarchy to make it the focal point

### Connect CTA
- Connect button must be the strongest element on the page
- Feel immediate, high-value, impossible to miss
- Primary action, highest visibility

### Remaining Time
- Highly visible and visually strong
- Not just text — important and dynamic
- Should feel prominent and engaging (e.g. countdown, progress, or both)

### Status Clarity
- Each state must be clearly different: provisioning, ready, expiring, destroyed
- Use color, layout, and visual hierarchy to make states obvious
- No ambiguity — user instantly knows machine state

### UX Clarity
- User should always know: what is happening, what they can do next
- Clear feedback and guidance at every step

### Empty States
- If no machine exists: guide user to /plans
- Persuasive, not dead — compelling CTA and value proposition

### Claude's Discretion
- Exact layout and component structure
- Specific color tokens for each status (within dark + indigo/violet palette)
- Typography and spacing refinements
- Countdown vs progress bar vs hybrid for remaining time
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope
- `.planning/ROADMAP.md` — Phase 7 goal, requirements, success criteria
- `.planning/REQUIREMENTS.md` — DASH-01, DASH-02, DASH-03, DASH-04, DASH-05

### Design & UX
- `skills/ui-ux-pro-max/SKILL.md` — UI UX Pro Max guidelines (accessibility, hierarchy, touch targets, contrast)
- `src/app/globals.css` — Design tokens, `.dark-plans` tokens, dark mode variables

### Implementation
- `src/app/dashboard/page.tsx` — Dashboard page, layout, empty state
- `src/components/DashboardVmList.tsx` — VM list, featured VM logic, polling
- `src/components/VmStatusCard.tsx` — Status card, Connect CTA, time display, status visuals
- `src/components/NavBar.tsx` — Nav integration
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `VmStatusCard` — Status icons (Loader2, CheckCircle2, Clock, AlertCircle, XCircle), status config (amber/emerald/orange/slate), progress bar, Connect button, copy-to-clipboard flow
- `DashboardVmList` — Featured VM + other VMs, polling for provisioning, sort order
- `globals.css` — `.dark-plans` tokens (dm-bg, dm-bg-elevated, dm-bg-card, dm-border, dm-accent, dm-cta, dm-success), `prefers-reduced-motion`

### Established Patterns
- Current dashboard: light theme (slate-900, white, emerald/amber) — needs dark alignment
- Status flow: payment_confirmed → provisioning → vm_ready → expiring → destroying → destroyed/failed
- Connect: fetches `/api/dashboard/vms/{id}/connection`, copies Parsec info to clipboard
- Featured VM: first active (ready/expiring) or first provisioning

### Integration Points
- Route: `/dashboard` (src/app/dashboard/page.tsx)
- NavBar links to /dashboard, /plans, /orders
- Data: prisma.provisionedVm with order, plan, machineProfile
</code_context>

<specifics>
## Specific Ideas

- Premium cloud infrastructure control panel — not generic SaaS
- Active machine dominates — first thing user sees
- Connect CTA: strongest element, immediate, high-value, impossible to miss
- Remaining time: not just text — dynamic, important, prominent
- Status states: provisioning, ready, expiring, destroyed — each visually distinct
- Empty state: persuasive guide to /plans, not dead
- Dark mode, indigo/violet accents, clean and sharp
</specifics>

<deferred>
## Deferred Ideas

- Backend or API changes — out of scope for v1.1
- New features beyond polish — scoped to conversion and UX improvements only
</deferred>

---
*Phase: 07-dashboard-polish*
*Context gathered: 2026-03-17*
