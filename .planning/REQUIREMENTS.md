[# Requirements: Cloud Gaming VPS Brazil]

**Defined:** 2026-03-16  
**Core Value:** Users can quickly and reliably get a high‑performance Windows cloud PC with GPU, paid upfront in a fixed‑time package, and connect through a simple web dashboard with minimal friction and manual intervention.

## v1 Requirements

Requirements for initial release. Each will map to roadmap phases.

### Authentication & Accounts

- [x] **AUTH-01**: User can sign up with email and password.
- [x] **AUTH-02**: User can log in and log out securely.
- [x] **AUTH-03**: User can enable optional 2FA for additional account security.
- [x] **AUTH-04**: User session persists across browser refresh within a reasonable timeout.

### Plans & Ordering

- [x] **PLAN-01**: User can view available fixed‑time packages (e.g. 4h, 24h, weekly) and associated machine profiles.
- [x] **PLAN-02**: User can select a plan and machine profile and create an order.
- [x] **PLAN-03**: System enforces one active VM per user; if a user already has an active VM, they cannot start another concurrently.

### Payments & Webhooks

- [x] **PAY-01**: User can pay for an order via PIX, using the existing payment gateway.
- [x] **PAY-02**: User can pay for an order via cryptocurrency, using the existing payment gateway, with crypto clearly encouraged in the UI.
- [x] **PAY-03**: Backend exposes a secure webhook endpoint to receive payment confirmations from the gateway.
- [x] **PAY-04**: On successful payment webhook, the system marks the order as paid and triggers VM provisioning automatically.
- [x] **PAY-05**: On failed or expired payment, the order is canceled and no VM is provisioned.

### VM Provisioning & Lifecycle

- [x] **VM-01**: Platform maintains a catalog of machine profiles mapped to specific Vultr GPU instance types (RAM, vCPU, GPU model, region, etc.).
- [x] **VM-02**: On a paid order, backend calls Vultr API to create a Windows GPU VM using the selected machine profile.
- [x] **VM-03**: The system waits for the VM to become ready and records its metadata (ID, IP, credentials, status) in the database.
- [x] **VM-04**: Each provisioned VM has Parsec installed and configured automatically (via image, startup scripts, or automation) so the user can connect without manual setup.
- [x] **VM-05**: The system tracks remaining time for each VM based on the purchased package and start time.
- [x] **VM-06**: When remaining time reaches zero (plus any grace period), the system automatically stops and destroys the VM through the cloud provider API.
- [x] **VM-07**: The system handles provider/API errors gracefully and surfaces failure states in the admin panel for manual intervention.

### User Dashboard

- [x] **DASH-01**: User can see a list of their active and recent VMs in the dashboard.
- [x] **DASH-02**: Dashboard shows current VM status (provisioning, running, stopping, terminated) and remaining time for active VMs.
- [x] **DASH-03**: User can start and stop their VM from the dashboard, within allowed rules (e.g. time continues counting down while the VM is running).
- [x] **DASH-04**: When a VM is ready, the dashboard shows connection details and a “Connect” button that launches the Parsec connection flow.
- [x] **DASH-05**: Users can see their order history and high‑level usage records for compliance/audit.

### Admin Panel & Operations

- [ ] **ADMIN-01**: Admin can log into an internal admin panel with secure access controls.
- [ ] **ADMIN-02**: Admin can view all active VMs, including owning user, machine profile, start time, and remaining time.
- [ ] **ADMIN-03**: Admin can manually start, stop, and terminate any VM via the admin panel, with actions reflected in the provider and database.
- [ ] **ADMIN-04**: Admin can view basic infrastructure monitoring data (counts of active VMs, recent failures, basic cost estimates per machine/profile).
- [ ] **ADMIN-05**: Admin can view logs of key events (payments, provisioning, destruction, admin overrides) for compliance and debugging.

### Security, Abuse & Compliance

- [ ] **SAFE-01**: System enforces a maximum of one active VM per user account at any time.
- [ ] **SAFE-02**: All critical actions (payments processed, VM created/destroyed, admin overrides) are logged with timestamps and user identifiers.
- [ ] **SAFE-03**: Basic suspicious‑activity monitoring exists (e.g. repeated failed payment webhooks, repeated provisioning errors, unusually frequent restarts) and is surfaced in admin views or logs.
- [ ] **SAFE-04**: External‑facing endpoints (dashboard, webhooks, APIs) are protected with authentication, authorization, and input validation aligned with best practices.

## v2 Requirements

Deferred to future releases. Tracked but not in current roadmap.

### Advanced Analytics & Reporting

- **ANAL-01**: Detailed revenue vs infrastructure cost dashboards over time.
- **ANAL-02**: Per‑user and per‑plan profitability analysis.

### Advanced Abuse Prevention

- **ABUSE-01**: Device fingerprinting and stronger multi‑login detection to prevent account sharing.
- **ABUSE-02**: Automated flagging and throttling of suspicious accounts based on behavioral patterns.

### User Experience Enhancements

- **UX-01**: In‑app support chat or ticketing integration.
- **UX-02**: Localized content and microcopy optimization for Brazilian Portuguese across all flows.

## Out of Scope

Explicitly excluded for now to prevent scope creep.

| Feature | Reason |
|--------|--------|
| Native mobile apps | Web dashboard is sufficient for MVP; mobile can come later. |
| Full KYC / document verification | Not required for initial product; increases friction and complexity. |
| Multi‑cloud auto‑optimization | Start with Vultr only; multi‑provider optimization can be revisited after validation. |

## Traceability

Which phases cover which requirements. To be updated when the roadmap is created.

| Requirement | Phase | Status |
|------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| PLAN-01 | Phase 1 | Complete |
| PLAN-02 | Phase 1 | Complete |
| PLAN-03 | Phase 2 | Complete |
| PAY-01  | Phase 2 | Complete |
| PAY-02  | Phase 2 | Complete |
| PAY-03  | Phase 2 | Complete |
| PAY-04  | Phase 2 | Complete |
| PAY-05  | Phase 2 | Complete |
| VM-01   | Phase 3 | Complete |
| VM-02   | Phase 3 | Complete |
| VM-03   | Phase 3 | Complete |
| VM-04   | Phase 3 | Complete |
| VM-05   | Phase 3 | Complete |
| VM-06   | Phase 3 | Complete |
| VM-07   | Phase 3 | Complete |
| DASH-01 | Phase 4 | Pending |
| DASH-02 | Phase 4 | Pending |
| DASH-03 | Phase 4 | Complete |
| DASH-04 | Phase 4 | Complete |
| DASH-05 | Phase 4 | Complete |
| ADMIN-01 | Phase 5 | Pending |
| ADMIN-02 | Phase 5 | Pending |
| ADMIN-03 | Phase 5 | Pending |
| ADMIN-04 | Phase 5 | Pending |
| ADMIN-05 | Phase 5 | Pending |
| SAFE-01 | Phase 5 | Pending |
| SAFE-02 | Phase 5 | Pending |
| SAFE-03 | Phase 5 | Pending |
| SAFE-04 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 32 total  
- Mapped to phases: 32  
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-16*  
*Last updated: 2026-03-16 after initial definition*

