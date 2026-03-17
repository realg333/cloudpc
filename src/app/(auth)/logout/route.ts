import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url));
  await destroySession(request, response);
  return response;
}
