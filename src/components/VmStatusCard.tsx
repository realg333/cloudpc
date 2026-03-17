'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { getRemainingMinutes, isExpired } from '@/lib/provisioning/time-tracking';

function statusLabel(status: string): string {
  switch (status) {
    case 'payment_confirmed':
      return 'Confirmando pagamento';
    case 'provisioning':
      return 'Provisionando';
    case 'vm_ready':
      return 'Pronto';
    case 'expiring':
      return 'Expirando';
    case 'destroying':
      return 'Encerrando';
    case 'destroyed':
      return 'Encerrado';
    case 'failed':
      return 'Falhou';
    default:
      return status;
  }
}

export interface VmStatusCardProps {
  vm: {
    id: string;
    status: string;
    readyAt: Date | null;
    expiresAt: Date | null;
    machineProfileName: string;
    planName: string;
    connectionMethod?: string | null;
    connectionState?: string | null;
  };
  /** When true, renders as hero focal point with dominant CTA */
  featured?: boolean;
}

function getTimeProgressPercent(readyAt: Date | null, expiresAt: Date | null): number | null {
  if (!readyAt || !expiresAt) return null;
  const now = Date.now();
  const start = readyAt.getTime();
  const end = expiresAt.getTime();
  if (end <= now) return 100;
  if (now < start) return 0;
  return Math.round(((now - start) / (end - start)) * 100);
}

function formatRemaining(remaining: number | null, expired: boolean): string {
  if (remaining === null) return '—';
  if (expired) return 'Expirado';
  if (remaining === 0) return 'Expirado';
  if (remaining < 60) return `${remaining} min`;
  const h = Math.floor(remaining / 60);
  const m = remaining % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export default function VmStatusCard({ vm, featured = false }: VmStatusCardProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(() =>
    getRemainingMinutes({ readyAt: vm.readyAt, expiresAt: vm.expiresAt })
  );
  const expired = isExpired({ expiresAt: vm.expiresAt });

  // Client-side countdown: every 60s normally, every 1s when < 5 min remaining
  useEffect(() => {
    if (vm.readyAt == null || vm.expiresAt == null) return;
    const compute = () =>
      getRemainingMinutes({ readyAt: vm.readyAt, expiresAt: vm.expiresAt });
    setRemaining(compute());
    const id = setInterval(() => {
      const next = compute();
      setRemaining(next);
    }, remaining != null && remaining < 5 && remaining > 0 ? 1000 : 60000);
    return () => clearInterval(id);
  }, [vm.readyAt, vm.expiresAt, remaining]);
  const isProvisioning = vm.status === 'provisioning' || vm.status === 'payment_confirmed';
  const isActive = vm.status === 'vm_ready' || vm.status === 'expiring';
  const canConnect = vm.status === 'vm_ready' && vm.connectionState === 'ready';
  const isTerminal = vm.status === 'destroyed' || vm.status === 'failed';

  const timeProgress = useMemo(
    () => getTimeProgressPercent(vm.readyAt, vm.expiresAt),
    [vm.readyAt, vm.expiresAt]
  );

  async function handleConnect() {
    setLoading(true);
    setCopyStatus('idle');
    try {
      const res = await fetch(`/api/dashboard/vms/${vm.id}/connection`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao obter dados de conexão');
      }
      const data = await res.json();
      let text = '';
      if (data.peerId) {
        text = `Host: ${data.hostname || data.ipAddress || 'N/A'}\nIP: ${data.ipAddress || 'N/A'}\nParsec Peer ID: ${data.peerId}`;
      } else {
        text = `Host: ${data.hostname || data.ipAddress || 'N/A'}\nIP: ${data.ipAddress || 'N/A'}`;
      }
      await navigator.clipboard.writeText(text);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 3000);
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  }

  // Status-specific visual treatment (dark theme)
  const statusConfig = useMemo(() => {
    if (isProvisioning) {
      return {
        card: 'bg-[#16161f] border-amber-500/40 border',
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        accent: 'amber',
      };
    }
    if (isActive && canConnect) {
      return {
        card: 'bg-[#16161f] border-emerald-500/40 border',
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-400',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        accent: 'emerald',
      };
    }
    if (vm.status === 'expiring' || vm.status === 'destroying') {
      return {
        card: 'bg-[#16161f] border-orange-500/40 border',
        iconBg: 'bg-orange-500/20',
        iconColor: 'text-orange-400',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        accent: 'orange',
      };
    }
    if (isTerminal) {
      return {
        card: 'bg-[#16161f] border-white/5 border',
        iconBg: 'bg-slate-500/20',
        iconColor: 'text-slate-400',
        badge: 'bg-slate-500/20 text-slate-400 border-slate-500/20',
        accent: 'slate',
      };
    }
    return {
      card: 'bg-[#16161f] border-white/10 border',
      iconBg: 'bg-slate-500/20',
      iconColor: 'text-slate-400',
      badge: 'bg-slate-500/20 text-slate-400 border-slate-500/20',
      accent: 'slate',
    };
  }, [isProvisioning, isActive, canConnect, isTerminal, vm.status]);

  const StatusIcon = () => {
    const iconClass = `h-5 w-5 ${statusConfig.iconColor}`;
    if (isProvisioning)
      return <Loader2 className={`${iconClass} animate-spin`} aria-hidden />;
    if (vm.status === 'vm_ready')
      return <CheckCircle2 className={iconClass} aria-hidden />;
    if (vm.status === 'expiring' || vm.status === 'destroying')
      return <Clock className={iconClass} aria-hidden />;
    if (vm.status === 'failed')
      return <AlertCircle className="h-5 w-5 text-red-400" aria-hidden />;
    return <XCircle className={iconClass} aria-hidden />;
  };

  const progressBarColor =
    expired || (timeProgress ?? 0) >= 90
      ? 'bg-red-500'
      : (timeProgress ?? 0) >= 70
        ? 'bg-orange-500'
        : 'bg-emerald-500';

  return (
    <article
      className={`rounded-2xl shadow-sm transition-all duration-300 ${
        featured ? 'p-6 sm:p-8 shadow-lg' : 'p-5'
      } ${statusConfig.card}`}
      aria-labelledby={`vm-title-${vm.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div
            className={`flex shrink-0 items-center justify-center rounded-xl ${statusConfig.iconBg} ${statusConfig.iconColor} ${
              featured ? 'h-14 w-14' : 'h-11 w-11'
            }`}
          >
            <StatusIcon />
          </div>
          <div className="min-w-0">
            <h3
              id={`vm-title-${vm.id}`}
              className={`font-semibold text-white truncate ${featured ? 'text-xl sm:text-2xl' : ''}`}
            >
              {vm.machineProfileName}
            </h3>
            <p className={`mt-0.5 text-slate-400 ${featured ? 'text-base' : 'text-sm'}`}>
              {vm.planName}
            </p>
            <span
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusConfig.badge}`}
            >
              {statusLabel(vm.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Provisioning: intentional loading (skeleton-style, not generic spinner) */}
      {isProvisioning && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full w-1/3 animate-shimmer-provision rounded-full bg-amber-500/30 motion-reduce:animate-none"
                aria-hidden
              />
            </div>
            <span className="text-sm font-medium text-amber-300">Provisionando</span>
          </div>
          <p className="text-sm text-slate-400">
            Sua VM está sendo configurada. Geralmente leva 2–5 minutos.
          </p>
        </div>
      )}

      {/* Active: Time indicator + Connect CTA */}
      {isActive && !isProvisioning && (
        <>
          {/* Visual time indicator */}
          {timeProgress !== null && vm.readyAt && vm.expiresAt && (
            <div className="mt-6">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-slate-400">Tempo restante</span>
                <span
                  className={`tabular-nums ${
                    featured ? 'text-2xl font-bold' : 'text-lg font-semibold'
                  } ${
                    expired || (remaining ?? 0) === 0
                      ? 'text-red-400'
                      : (remaining ?? 999) < 30
                        ? 'text-red-400 animate-pulse motion-reduce:animate-none'
                        : (remaining ?? 999) < 60
                          ? 'text-orange-400'
                          : expired || (timeProgress ?? 0) >= 90
                            ? 'text-red-400'
                            : (timeProgress ?? 0) >= 70
                              ? 'text-orange-400'
                              : 'text-white'
                  }`}
                >
                  {formatRemaining(remaining, expired)}
                </span>
              </div>
              <div
                className={`mt-2 w-full overflow-hidden rounded-full bg-white/10 ${
                  featured ? 'h-3' : 'h-2.5'
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${progressBarColor}`}
                  style={{ width: `${Math.min(100, timeProgress ?? 0)}%` }}
                />
              </div>
            </div>
          )}

          {/* Connect CTA - dominant when featured */}
          {canConnect && (
            <div className={`flex flex-col gap-4 ${featured ? 'mt-8' : 'mt-4'}`}>
              <button
                type="button"
                onClick={handleConnect}
                disabled={loading}
                className={`group relative inline-flex cursor-pointer items-center justify-center gap-3 rounded-xl font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed ${
                  featured
                    ? 'min-h-[56px] bg-primary px-8 py-4 text-lg shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.99] disabled:opacity-60'
                    : 'min-h-[48px] bg-primary px-6 py-3 text-base hover:bg-primary-hover focus:ring-offset-2 disabled:opacity-50'
                }`}
              >
                {loading ? (
                  <>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-white animate-spin" aria-hidden />
                      Conectando...
                    </span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 shrink-0" aria-hidden />
                    Conectar agora
                    <ChevronRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </>
                )}
              </button>
              {copyStatus === 'copied' && (
                <span className="flex items-center gap-2 text-sm text-emerald-600" role="status">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                  Copiado! Abra o Parsec e conecte usando o endereço.
                </span>
              )}
              {copyStatus === 'error' && (
                <span className="flex items-center gap-2 text-sm text-red-600" role="alert">
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                  Erro ao copiar. Tente novamente.
                </span>
              )}
              <a
                href="https://parsec.app/downloads"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-hover transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                Baixar Parsec →
              </a>
            </div>
          )}

          {/* Active but no connect (e.g. expiring, connection not ready) */}
          {isActive && !canConnect && (
            <div className="mt-4 text-sm text-slate-400">
              <p>Estado: Rodando</p>
              <p className="mt-1 font-medium tabular-nums">
                {expired ? 'Expirado' : `Tempo restante: ${remaining ?? 0} minutos`}
              </p>
            </div>
          )}
        </>
      )}

      {/* Terminal state */}
      {(vm.status === 'destroyed' || vm.status === 'failed') && (
        <div className="mt-4 text-sm text-slate-400">
          {expired && <p>Expirado</p>}
        </div>
      )}

      {/* Disabled Stop button when active (no connect available) */}
      {isActive && !canConnect && (
        <div className="mt-4">
          <button
            type="button"
            disabled
            title="Em breve — o tempo continua contando até o fim do período"
            aria-disabled="true"
            className="inline-flex min-h-[44px] cursor-not-allowed items-center justify-center rounded-lg border border-white/10 bg-slate-500/20 px-4 py-2.5 text-sm font-medium text-slate-400 opacity-60"
          >
            Parar
          </button>
        </div>
      )}
    </article>
  );
}
