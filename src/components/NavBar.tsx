import { getSessionFromCookies } from '@/lib/auth/session';
import NavBarContent from './NavBarContent';

export default async function NavBar() {
  const session = await getSessionFromCookies();

  return (
    <NavBarContent
      isLoggedIn={!!session}
      isAdmin={!!session?.user?.isAdmin}
    />
  );
}
