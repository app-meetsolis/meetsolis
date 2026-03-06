/**
 * POST /api/intelligence/query
 * Solis Intelligence — RAG-powered Q&A over client session history
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { getAIProvider } from '@/lib/ai/index';
import { buildSessionContext } from '@/lib/ai/solis';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { checkQueryLimit, incrementQueryCount } from '@/lib/billing/checkUsage';
import { z } from 'zod';

function supabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

const QuerySchema = z.object({
  query: z.string().min(1).max(1000),
  client_id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED' } },
        { status: 401 }
      );

    const body = await request.json();
    const validation = QuerySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: { code: 'VALIDATION_ERROR', details: validation.error.errors },
        },
        { status: 400 }
      );
    }

    const { query, client_id } = validation.data;

    // Check quota
    const usage = await checkQueryLimit(clerkUserId);
    if (!usage.allowed) {
      return NextResponse.json(
        { error: { code: 'USAGE_LIMIT_EXCEEDED', message: usage.reason } },
        { status: 403 }
      );
    }

    const db = supabase();

    // Fetch client context if provided
    let clientCtx = { name: 'Unknown Client' };
    if (client_id) {
      const { data: user } = await db
        .from('users')
        .select('id')
        .eq('clerk_id', clerkUserId)
        .single();
      if (user) {
        const { data: client } = await db
          .from('clients')
          .select('name, company, role, goal')
          .eq('id', client_id)
          .eq('user_id', user.id)
          .single();
        if (client) clientCtx = client;
      }
    }

    // Fetch all sessions for context (filter by client if provided)
    const sessionsQuery = db
      .from('sessions')
      .select('id, client_id, title, session_date, summary, transcript_text')
      .eq('user_id', clerkUserId)
      .eq('status', 'complete')
      .order('session_date', { ascending: false })
      .limit(20);

    if (client_id) sessionsQuery.eq('client_id', client_id);

    const { data: allSessions } = await sessionsQuery;
    const sessions = allSessions || [];

    // Hybrid RAG: get semantic results via pgvector (best-effort)
    let semanticSessions: typeof sessions = [];
    try {
      const embedding = await generateEmbedding(query);
      const { data: semantic } = await db.rpc('match_sessions', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 3,
        filter_user_id: clerkUserId,
        filter_client_id: client_id || null,
      });
      if (semantic && semantic.length > 0) {
        const ids = new Set(semantic.map((s: { id: string }) => s.id));
        semanticSessions = sessions.filter(s => ids.has(s.id));
      }
    } catch {
      // pgvector not yet available or no embeddings — fall back to recency only
    }

    const contextSessions = buildSessionContext(sessions, semanticSessions);

    const ai = getAIProvider();
    const result = await ai.queryIntelligence(
      query,
      contextSessions,
      clientCtx
    );

    // Store query
    await db.from('solis_queries').insert({
      user_id: clerkUserId,
      client_id: client_id || null,
      query,
      response: result.answer,
      source_session_ids: result.sources.map(s => s.session_id),
    });

    await incrementQueryCount(clerkUserId);

    return NextResponse.json({
      answer: result.answer,
      sources: result.sources,
      usage: { current: (usage.current || 0) + 1, limit: usage.limit },
    });
  } catch (error) {
    console.error('[Intelligence/Query] POST error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to process query' } },
      { status: 500 }
    );
  }
}
