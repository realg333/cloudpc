import { redirect, forbidden } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/auth/session';
import type { User, Session } from '@prisma/client';

/**
 * Determines if a user has admin access.
 * Checks: 1) user.isAdmin from DB, 2) ADMIN_EMAIL env (case-insensitive match).
 */
export function isUserAdmin(user: User): boolean {
  if (user.isAdmin) return true;
  const adminEmail = process.env.ADMIN_EMAIL?.trim()?.toLowerCase();
  if (!adminEmail) return false;
  return user.email.trim().toLowerCase() === adminEmail;
}

/**
 * Requires admin access. Redirects to login if unauthenticated,
 * returns 403 if authenticated but not admin.
 */
export async function requireAdmin(): Promise<{ user: User; session: Session }> {
  const result = await getSessionFromCookies();
  if (!result) {
    redirect('/login?redirect=/admin');
  }
  if (!isUserAdmin(result.user)) {
    forbidden();
  }
  return result;
}

/**
 * Get admin user from request (for Route Handlers).
 * Returns { error: 401 } if unauthenticated, { error: 403 } if not admin,
 * or { user } if admin.
 */
export async function getAdminFromRequest(
  _request?: Request
): Promise<{ error: 401 } | { error: 403 } | { user: User }> {
  const session = await getSessionFromCookies();
  if (!session) return { error: 401 };
  if (!isUserAdmin(session.user)) return { error: 403 };
  return { user: session.user };
}
