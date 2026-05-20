/**
 * POST /api/brief/generate-pending
 * Cron-triggered (every 5 min) — generates Coach Briefs for eligible events.
 * Auth: Authorization: Bearer ${CRON_SECRET}
 */

import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config/env';
import { generatePendingBriefs } from '@/lib/brief/generate-pending';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const expected = config.security.cronSecret;
  if (!expected) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get('authorization') ?? '';
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await generatePendingBriefs();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[brief:generate-pending] unexpected error:', message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
