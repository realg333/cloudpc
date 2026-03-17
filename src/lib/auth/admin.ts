import { redirect, forbidden } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/auth/session';
import type { User, Session } from '@prisma/client';

/**
 * Requires admin access. Redirects to login if unauthenticated,
 * returns 403 if authenticated but not admin.
 */
export async function requireAdmin(): Promise<{ user: User; session: Session }> {
  const result = await getSessionFromCookies();
  if (!result) {
    redirect('/login?redirect=/admin');
  }
  if (!result.user.isAdmin) {
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
  if (!session.user.isAdmin) return { error: 403 };
  return { user: session.user };
}
