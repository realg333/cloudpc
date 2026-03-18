import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth/session';
import { getBaseUrl } from '@/lib/auth/getBaseUrl';

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const response = NextResponse.redirect(new URL('/', baseUrl));
  await destroySession(request, response);
  return response;
}
