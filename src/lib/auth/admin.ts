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
