/**
 * POST /api/intelligence/query
 * Story 4.2: Solis Q&A — Hybrid RAG
 *
 * Body: { query: string, client_id?: string }
 * Response: { answer: string, citations: [{ session_id, session_date, title }] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { UpgradeRequiredError } from '@meetsolis/shared';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';
import { checkQueryLimit, incrementQueryCount } from '@/lib/billing/checkUsage';
import { buildSolisContext, parseSolisResponse } from '@/lib/ai/solis';
import { SOLIS_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { ServiceFactory } from '@/lib/service-factory';

const QuerySchema = z.object({
  query: z.string().min(3).max(500).trim(),
  client_id: z.string().uuid().optional(),
});

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // 2. Input validation
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON body' } },
        { status: 400 }
      );
    }

    const parsed = QuerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Invalid input',
          },
        },
        { status: 400 }
      );
    }

    const { query, client_id: clientId } = parsed.data;

    // 3. User lookup
    const supabase = getSupabase();
    const userId = await getInternalUserId(supabase, clerkUserId);
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // 4. Usage limit check
    try {
      await checkQueryLimit(userId);
    } catch (err) {
      if (err instanceof UpgradeRequiredError) {
        return NextResponse.json(
          {
            error: {
              code: 'LIMIT_EXCEEDED',
              message: 'Query limit reached. Upgrade to Pro for more queries.',
              type: 'query',
            },
          },
          { status: 403 }
        );
      }
      throw err;
    }

    // 5. Client ownership check (if client_id provided)
    if (clientId) {
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .eq('user_id', userId)
        .maybeSingle();
      if (!client) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Client not found' } },
          { status: 404 }
        );
      }
    }

    // 6. Build RAG context
    const { sessions, prompt } = await buildSolisContext(
      query,
      userId,
      clientId
    );

    // 7. AI query
    let rawResponse: string;
    try {
      rawResponse = await ServiceFactory.createAIService().querySolis(
        SOLIS_SYSTEM_PROMPT,
        prompt
      );
    } catch (err) {
      console.error('[query] AI error:', err);
      return NextResponse.json(
        { error: { code: 'AI_ERROR', message: 'AI service unavailable' } },
        { status: 500 }
      );
    }

    // 8. Parse response
    const { answer, citations } = parseSolisResponse(rawResponse, sessions);

    // 9. Store query in solis_queries
    const { error: insertError } = await supabase.from('solis_queries').insert({
      user_id: userId,
      client_id: clientId ?? null,
      query,
      response: answer,
      citations,
    });
    if (insertError) {
      console.error(
        '[query] Failed to store solis_query:',
        insertError.message
      );
    }

    // 10. Increment usage
    await incrementQueryCount(userId);

    // 11. Return
    return NextResponse.json({ answer, citations }, { status: 200 });
  } catch (err) {
    console.error('[POST /api/intelligence/query]', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
