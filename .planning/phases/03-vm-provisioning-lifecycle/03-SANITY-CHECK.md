# Phase 3: Final Sanity Check

**Date:** 2026-03-16  
**Focus:** Duplicate webhook behavior, duplicate provisioning prevention, paid order → job/VM guarantee, build/tests

---

## 1. Duplicate Webhook Behavior ✅

| Scenario | Flow | Result |
|----------|------|--------|
| **Same eventId twice** | PaymentLog.create with `gatewayEventId` @unique → second P2002 → return 200 | Idempotent, no duplicate processing |
| **Two events, same payment** | First: transaction commits (order, payment, job, vm). Second: order.status=paid → early return at line 56-58 | Idempotent |
| **Concurrent webhooks** | Both see pending_payment. First commits. Second: `payment.findUnique` sees existing → skip create. `job.findUnique` sees existing → skip create | Conditional creates prevent P2002; no duplicates |

**Conclusion:** Duplicate webhooks are handled at PaymentLog (eventId) and inside the transaction (findUnique before create). No duplicate jobs or VMs.

---

## 2. Duplicate Provisioning Prevention ✅

| Layer | Mechanism |
|-------|-----------|
| **DB** | ProvisioningJob.orderId @unique, ProvisionedVm.orderId @unique |
| **Webhook** | findUnique before create; only create if missing |
| **Service** | Before createInstance: `findInstanceByLabel(cloudpc-{orderId})`. If found → reuse. If not → create |
| **Polling** | If vm.vultrInstanceId exists, skip create block; go straight to poll |

**Conclusion:** No duplicate VMs. Even if createInstance succeeded but DB update failed, next run finds the instance by label and reuses it.

---

## 3. Paid Order Always Creates Provisioning Job and VM Record ✅

| Guarantee | How |
|-----------|-----|
| **Atomicity** | Order update, payment create, job create, vm create in a single `$transaction(async (tx) => {...})` |
| **All-or-nothing** | If any step throws, transaction rolls back. No partial state. |
| **Conditional creates** | findUnique before create avoids P2002; we only create when missing. On first successful payment, both are null → both created. |

**Conclusion:** A paid order cannot exist without a ProvisioningJob and ProvisionedVm. They are created in the same transaction.

---

## 4. Build and Tests ✅

```
npm run build  → ✓ Compiled successfully
npm run test   → ✓ 11 tests passed (4 files)
```

**Conclusion:** No regression.

---

## Verdict

All four sanity-check areas pass. Phase 3 is ready for Phase 4.
