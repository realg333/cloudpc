import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/auth/session';
import LoginForm from './LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string; verified?: string; signup?: string; email?: string; email_sent?: string; email_failed?: string }>;
}) {
  const session = await getSessionFromCookies();
  const params = await searchParams;
  if (session) {
    const redirectTo =
      params.redirect && params.redirect.startsWith('/') && !params.redirect.startsWith('//')
        ? params.redirect
        : '/';
    redirect(redirectTo);
  }
  return (
    <LoginForm
      redirectParam={params.redirect}
      errorParam={params.error}
      verifiedParam={params.verified}
      signupParam={params.signup}
      emailParam={params.email ?? ''}
      emailFailedParam={params.email_failed === '1'}
    />
  );
}
