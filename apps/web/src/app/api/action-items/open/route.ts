/**
 * Story 7.6 — Open action items.
 *
 * GET /api/action-items/open
 *   ?client_id=<id>            → per-client open items (OpenActionItem[])
 *     &exclude_session=<id>    → omit items from this session (carry-forward)
 *     &assignee=client|coach|unknown
 *   (no client_id)             → across-clients aggregate (OpenItemsAcrossClients)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import type { ActionItemAssignee } from '@meetsolis/shared';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';
import {
  getOpenItemsForClient,
  getOpenItemsAcrossClients,
} from '@/lib/action-items/get-open-items';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

const ASSIGNEES: ActionItemAssignee[] = ['coach', 'client', 'unknown'];

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const supabase = getSupabase();
    const userId = await getInternalUserId(supabase, clerkUserId);
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    // No client_id → dashboard aggregate across all of the coach's clients.
    if (!clientId) {
      const data = await getOpenItemsAcrossClients(userId);
      return NextResponse.json(data, { status: 200 });
    }

    // Per-client: verify ownership before exposing items.
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('user_id', userId)
      .single();

    if (!client) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Client not found' } },
        { status: 404 }
      );
    }

    const assigneeParam = searchParams.get('assignee');
    const assignee =
      assigneeParam && ASSIGNEES.includes(assigneeParam as ActionItemAssignee)
        ? (assigneeParam as ActionItemAssignee)
        : undefined;

    const items = await getOpenItemsForClient(clientId, {
      excludeSessionId: searchParams.get('exclude_session') ?? undefined,
      assignee,
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error('[ActionItems/open API] GET error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
