'use client';

import { useState, useEffect, useRef } from 'react';
import VmStatusCard from '@/components/VmStatusCard';

const POLL_INTERVAL_MS = 15 * 1000;
const MAX_POLL_DURATION_MS = 20 * 60 * 1000;

const PROVISIONING_STATUSES = ['provisioning', 'payment_confirmed'];
const TERMINAL_STATUSES = ['vm_ready', 'destroyed', 'failed'];

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

export default function DashboardVmList({ initialVms }: DashboardVmListProps) {
  const [vms, setVms] = useState<DashboardVm[]>(initialVms);
  const pollStartRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hasProvisioningVms(vms)) return;
    if (allTerminal(vms)) return;
    if (Date.now() - pollStartRef.current > MAX_POLL_DURATION_MS) return;

    const poll = async () => {
      if (Date.now() - pollStartRef.current > MAX_POLL_DURATION_MS) {
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

  const activeFirst = [...vms].sort((a, b) => {
    const active = ['vm_ready', 'expiring', 'provisioning', 'payment_confirmed'];
    const aIdx = active.indexOf(a.status);
    const bIdx = active.indexOf(b.status);
    if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx;
    if (aIdx >= 0) return -1;
    if (bIdx >= 0) return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      {activeFirst.map((vm) => (
        <VmStatusCard
          key={vm.id}
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
      ))}
    </div>
  );
}
