import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import type { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { User, Session } from '@prisma/client';

const SESSION_COOKIE = 'session';
const SESSION_DURATION_HOURS = 8;

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV !== 'test') {
    throw new Error('SESSION_SECRET is not set');
  }
  return new TextEncoder().encode(secret || 'test-secret');
}

export async function createSession(userId: string, response: NextResponse): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);
  const session = await prisma.session.create({
    data: { userId, expiresAt },
  });
  const token = await new SignJWT({ sessionId: session.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresAt)
    .sign(getSecret());
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

export async function getSession(request: NextRequest): Promise<{ user: User; session: Session } | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sessionId = payload.sessionId as string;
    if (!sessionId) return null;
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) return null;
    return { user: session.user, session };
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<{ user: User; session: Session } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sessionId = payload.sessionId as string;
    if (!sessionId) return null;
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) return null;
    return { user: session.user, session };
  } catch {
    return null;
  }
}

export async function destroySession(request: NextRequest, response: NextResponse): Promise<void> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecret());
      const sessionId = payload.sessionId as string;
      if (sessionId) await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
    } catch {
      // ignore
    }
  }
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

const PENDING_2FA_COOKIE = 'pending2fa';
const PENDING_2FA_MAX_AGE = 5 * 60; // 5 minutes

export async function setPending2FA(userId: string, response: NextResponse): Promise<void> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${PENDING_2FA_MAX_AGE}s`)
    .sign(getSecret());
  response.cookies.set(PENDING_2FA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: PENDING_2FA_MAX_AGE,
    path: '/',
  });
}

export async function getPending2FAUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(PENDING_2FA_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return (payload.userId as string) ?? null;
  } catch {
    return null;
  }
}

export function clearPending2FA(response: NextResponse): void {
  response.cookies.set(PENDING_2FA_COOKIE, '', { httpOnly: true, maxAge: 0, path: '/' });
}
