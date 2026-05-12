/**
 * GET /api/calendar/callback — Google OAuth callback.
 * Validates state, exchanges code, encrypts + stores tokens, triggers initial sync.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getInternalUserId } from '@/lib/helpers/user';
import { buildOAuth2Client } from '@/lib/services/calendar/google-calendar';
import { encryptToken } from '@/lib/services/calendar/token-encryption';
import { syncUserEvents } from '@/lib/services/calendar/sync-user-events';
import { config } from '@/lib/config';

export const runtime = 'nodejs';

const STATE_COOKIE_PROD = '__Host-calendar_state';
const STATE_COOKIE_DEV = 'calendar_state';

function settingsUrl(params: Record<string, string>): string {
  const qs = new URLSearchParams(params).toString();
  return `${config.app.url}/settings/preferences?${qs}`;
}

export async function GET(req: NextRequest) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.redirect(`${config.app.url}/sign-in`);
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  if (errorParam) {
    return NextResponse.redirect(settingsUrl({ calendar: 'denied' }));
  }
  if (!code || !stateParam) {
    return NextResponse.redirect(settingsUrl({ calendar: 'error' }));
  }

  const isProd = config.app.env === 'production';
  const cookieName = isProd ? STATE_COOKIE_PROD : STATE_COOKIE_DEV;
  const stateCookie = req.cookies.get(cookieName)?.value;

  const response = NextResponse.redirect(
    settingsUrl({ calendar: 'connected' })
  );
  // Always clear state cookie after use
  response.cookies.set(cookieName, '', { path: '/', maxAge: 0 });

  if (!stateCookie || stateCookie !== stateParam) {
    return NextResponse.redirect(
      settingsUrl({ calendar: 'error', reason: 'state_mismatch' })
    );
  }

  // Exchange code for tokens
  const oauth2 = buildOAuth2Client();
  let tokens;
  try {
    const result = await oauth2.getToken(code);
    tokens = result.tokens;
  } catch {
    return NextResponse.redirect(
      settingsUrl({ calendar: 'error', reason: 'token_exchange_failed' })
    );
  }

  if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
    return NextResponse.redirect(
      settingsUrl({ calendar: 'error', reason: 'incomplete_tokens' })
    );
  }

  // Fetch Google account email for display
  oauth2.setCredentials(tokens);
  let googleEmail = '';
  try {
    const oauth2Api = google.oauth2({ version: 'v2', auth: oauth2 });
    const me = await oauth2Api.userinfo.get();
    googleEmail = me.data.email ?? '';
  } catch {
    googleEmail = '';
  }

  const supabase = getSupabaseServerClient();
  const userId = await getInternalUserId(supabase, clerkUserId);
  if (!userId) {
    return NextResponse.redirect(
      settingsUrl({ calendar: 'error', reason: 'user_not_found' })
    );
  }

  // Upsert encrypted tokens
  const { error: upsertErr } = await supabase
    .from('user_calendar_tokens')
    .upsert(
      {
        user_id: userId,
        access_token_encrypted: encryptToken(tokens.access_token),
        refresh_token_encrypted: encryptToken(tokens.refresh_token),
        expiry_at: new Date(tokens.expiry_date).toISOString(),
        google_account_email: googleEmail,
        connection_broken: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (upsertErr) {
    return NextResponse.redirect(
      settingsUrl({ calendar: 'error', reason: 'store_failed' })
    );
  }

  // Fire-and-forget initial sync — don't block the redirect.
  // Errors are logged server-side; user can manually refresh if needed.
  syncUserEvents(supabase, userId).catch(err => {
    console.error('[calendar/callback] initial sync failed:', err);
  });

  return response;
}
