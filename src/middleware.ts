import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'session';
const SESSION_ID_HEADER = 'x-session-id';

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return new TextEncoder().encode('');
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.next();
  }

  const secret = getSecret();
  if (secret.length === 0) {
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const sessionId = payload.sessionId as string;
    if (!sessionId) return NextResponse.next();

    const exp = payload.exp;
    if (exp && exp * 1000 < Date.now()) {
      return NextResponse.next();
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(SESSION_ID_HEADER, sessionId);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
