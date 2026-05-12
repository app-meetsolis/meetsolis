/**
 * GET /api/calendar/connect — initiates Google Calendar OAuth.
 * Sets CSRF state cookie, redirects to Google authorize URL.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { randomBytes } from 'crypto';
import {
  buildOAuth2Client,
  CALENDAR_SCOPES,
} from '@/lib/services/calendar/google-calendar';
import { config } from '@/lib/config';

export const runtime = 'nodejs';

const STATE_COOKIE = '__Host-calendar_state';
const STATE_TTL_SECONDS = 5 * 60;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const state = randomBytes(32).toString('hex');
  const oauth2 = buildOAuth2Client();
  const authUrl = oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // ensures refresh_token issued on re-auth
    scope: CALENDAR_SCOPES,
    state,
  });

  const isProd = config.app.env === 'production';
  // __Host- prefix requires Secure + Path=/ + no Domain
  const cookieName = isProd ? STATE_COOKIE : 'calendar_state';

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(cookieName, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: STATE_TTL_SECONDS,
  });

  return response;
}
