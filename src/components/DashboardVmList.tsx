'use client';

import { useState, useEffect, useRef } from 'react';
import VmStatusCard from '@/components/VmStatusCard';

const POLL_INTERVAL_MS = 15 * 1000;
const MAX_POLL_DURATION_MS = 20 * 60 * 1000;

const PROVISIONING_STATUSES = ['provisioning', 'payment_confirmed'];
const TERMINAL_STATUSES = ['vm_ready', 'destroyed', 'failed'];
const ACTIVE_STATUSES = ['vm_ready', 'expiring'];

export interface DashboardVm {
  id: string;
  status: string;
  statusLabel?: string;
  readyAt: string | null;
  expiresAt: string | null;
  connectionMethod?: string | null;
  connectionState?: string | null;
  machineProfileName: string;
  planName: string;
}

interface DashboardVmListProps {
  initialVms: DashboardVm[];
}

function hasProvisioningVms(vms: DashboardVm[]): boolean {
  return vms.some((v) => PROVISIONING_STATUSES.includes(v.status));
}

function allTerminal(vms: DashboardVm[]): boolean {
  return vms.length > 0 && vms.every((v) => TERMINAL_STATUSES.includes(v.status));
}

function isConnectable(vm: DashboardVm): boolean {
  return vm.status === 'vm_ready' && vm.connectionState === 'ready';
}

function isActive(vm: DashboardVm): boolean {
  return ACTIVE_STATUSES.includes(vm.status);
}

export default function DashboardVmList({ initialVms }: DashboardVmListProps) {
  const [vms, setVms] = useState<DashboardVm[]>(initialVms);
  const pollStartRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    pollStartRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!hasProvisioningVms(vms)) return;
    if (allTerminal(vms)) return;
    const startedAt = pollStartRef.current;
    if (startedAt == null) return;
    if (Date.now() - startedAt > MAX_POLL_DURATION_MS) return;

    const poll = async () => {
      const t0 = pollStartRef.current;
      if (t0 == null) return;
      if (Date.now() - t0 > MAX_POLL_DURATION_MS) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      try {
        const res = await fetch('/api/dashboard/vms');
        if (res.ok) {
          const data = await res.json();
          setVms(data.vms);
        }
      } catch {
        // ignore fetch errors
      }
    };

    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [vms]);

  // Sort: connectable first, then active (ready/expiring), then provisioning, then terminal
  const sorted = [...vms].sort((a, b) => {
    const order = ['vm_ready', 'expiring', 'provisioning', 'payment_confirmed', 'destroying', 'destroyed', 'failed'];
    const aIdx = order.indexOf(a.status);
    const bIdx = order.indexOf(b.status);
    if (aIdx !== bIdx) return aIdx - bIdx;
    // Same status: prefer connectable
    if (isConnectable(a) && !isConnectable(b)) return -1;
    if (!isConnectable(a) && isConnectable(b)) return 1;
    return 0;
  });

  // Featured: active (ready/expiring) first, else first provisioning
  const featuredVm =
    sorted.find((v) => isActive(v)) ?? sorted.find((v) => PROVISIONING_STATUSES.includes(v.status));
  const otherVms = sorted.filter((v) => v.id !== featuredVm?.id);

  return (
    <div className="space-y-10">
      {/* Hero: Active machine as focal point */}
      {featuredVm && (
        <section aria-labelledby="active-vm-heading">
          <h2 id="active-vm-heading" className="sr-only">
            Máquina ativa
          </h2>
          <div className="rounded-2xl bg-[#12121a] p-1 ring-1 ring-white/5">
            <VmStatusCard
              vm={{
                id: featuredVm.id,
                status: featuredVm.status,
                readyAt: featuredVm.readyAt ? new Date(featuredVm.readyAt) : null,
                expiresAt: featuredVm.expiresAt ? new Date(featuredVm.expiresAt) : null,
                machineProfileName: featuredVm.machineProfileName,
                planName: featuredVm.planName,
                connectionMethod: featuredVm.connectionMethod,
                connectionState: featuredVm.connectionState,
              }}
              featured
            />
          </div>
        </section>
      )}

      {/* Other machines - compact list */}
      {otherVms.length > 0 && (
        <section>
          <h2 id="other-vms-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Outras máquinas
          </h2>
          <ul className="space-y-5" role="list" aria-labelledby="other-vms-heading" aria-label="Outras máquinas virtuais">
            {otherVms.map((vm) => (
              <li key={vm.id}>
                <VmStatusCard
                  vm={{
                    id: vm.id,
                    status: vm.status,
                    readyAt: vm.readyAt ? new Date(vm.readyAt) : null,
                    expiresAt: vm.expiresAt ? new Date(vm.expiresAt) : null,
                    machineProfileName: vm.machineProfileName,
                    planName: vm.planName,
                    connectionMethod: vm.connectionMethod,
                    connectionState: vm.connectionState,
                  }}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
