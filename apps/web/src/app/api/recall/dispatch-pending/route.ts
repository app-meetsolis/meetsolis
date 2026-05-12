/**
 * POST /api/recall/dispatch-pending
 * Cron-triggered (every 2 min) — dispatches Recall.ai bots for eligible events.
 * Auth: Authorization: Bearer ${CRON_SECRET}
 */

import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config/env';
import { dispatchPendingBots } from '@/lib/services/recall/dispatch-pending';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const expected = config.security.cronSecret
    ? `Bearer ${config.security.cronSecret}`
    : null;

  if (!expected || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await dispatchPendingBots();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[recall:dispatch-pending] unexpected error:', message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
