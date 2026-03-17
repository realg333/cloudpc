import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/auth/session';

export default async function BillingPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/login?redirect=/billing');
  }
  redirect('/orders');
}
