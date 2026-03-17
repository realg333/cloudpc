/**
 * Time tracking utilities for ProvisionedVm lifecycle.
 * Computes remaining time, expiry, and expiresAt from readyAt + duration.
 */

import type { ProvisionedVm } from '@prisma/client';

const GRACE_PERIOD_MINUTES = parseInt(process.env.GRACE_PERIOD_MINUTES ?? '0', 10) || 0;

/**
 * Return minutes until expiry. If expiresAt passed, return 0.
 * If readyAt is null (VM not yet ready), return null.
 */
export function getRemainingMinutes(vm: Pick<ProvisionedVm, 'readyAt' | 'expiresAt'>): number | null {
  if (vm.readyAt == null) return null;
  if (vm.expiresAt == null) return null;

  const now = new Date();
  if (vm.expiresAt <= now) return 0;

  const ms = vm.expiresAt.getTime() - now.getTime();
  return Math.floor(ms / (60 * 1000));
}

/**
 * Return true if expiresAt exists and has passed.
 */
export function isExpired(vm: Pick<ProvisionedVm, 'expiresAt'>): boolean {
  if (vm.expiresAt == null) return false;
  return vm.expiresAt < new Date();
}

/**
 * Compute expiresAt from readyAt + durationHours.
 * Adds optional grace period from GRACE_PERIOD_MINUTES env (default 0).
 */
export function computeExpiresAt(
  readyAt: Date,
  durationHours: number
): Date {
  const base = new Date(readyAt.getTime() + durationHours * 60 * 60 * 1000);
  if (GRACE_PERIOD_MINUTES > 0) {
    return new Date(base.getTime() + GRACE_PERIOD_MINUTES * 60 * 1000);
  }
  return base;
}
