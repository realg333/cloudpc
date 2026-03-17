import { getSessionFromCookies } from '@/lib/auth/session';
import { isUserAdmin } from '@/lib/auth/admin';
import NavBarContent from './NavBarContent';

export default async function NavBar() {
  const session = await getSessionFromCookies();

  return (
    <NavBarContent
      isLoggedIn={!!session}
      isAdmin={!!(session?.user && isUserAdmin(session.user))}
    />
  );
}
