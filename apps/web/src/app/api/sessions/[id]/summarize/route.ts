/**
 * POST /api/sessions/[id]/summarize
 * Trigger AI summarization for a session.
 * Returns: { summary, action_items, key_topics, title }
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { getAIProvider } from '@/lib/ai/index';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { checkTranscriptLimit } from '@/lib/billing/checkUsage';

function supabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!UUID_RE.test(params.id)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid session ID' } },
        { status: 400 }
      );
    }

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED' } },
        { status: 401 }
      );

    const usage = await checkTranscriptLimit(clerkUserId);
    if (!usage.allowed) {
      return NextResponse.json(
        { error: { code: 'USAGE_LIMIT_EXCEEDED', message: usage.reason } },
        { status: 403 }
      );
    }

    const db = supabase();

    // Fetch session + client
    const { data: session } = await db
      .from('sessions')
      .select('*, clients(name, company, role, goal, start_date)')
      .eq('id', params.id)
      .eq('user_id', clerkUserId)
      .single();

    if (!session)
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      );
    if (!session.transcript_text) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_TRANSCRIPT',
            message: 'Session has no transcript text to summarize',
          },
        },
        { status: 400 }
      );
    }
    if (session.status === 'processing') {
      return NextResponse.json(
        {
          error: {
            code: 'ALREADY_PROCESSING',
            message: 'Session is already being processed',
          },
        },
        { status: 409 }
      );
    }

    // Mark as processing
    await db
      .from('sessions')
      .update({ status: 'processing' })
      .eq('id', params.id);

    const client = session.clients as {
      name: string;
      company?: string;
      role?: string;
      goal?: string;
      start_date?: string;
    };
    const ai = getAIProvider();

    let result;
    try {
      result = await ai.summarizeSession(session.transcript_text, {
        name: client.name,
        company: client.company,
        role: client.role,
        goal: client.goal,
        coachingSince: client.start_date,
      });
    } catch (aiError) {
      await db.from('sessions').update({ status: 'error' }).eq('id', params.id);
      throw aiError;
    }

    // Generate embedding of summary for RAG
    const embedding = await generateEmbedding(result.summary);

    // Update session with summary
    const { data: updatedSession } = await db
      .from('sessions')
      .update({
        title: result.title,
        summary: result.summary,
        key_topics: result.key_topics,
        embedding,
        status: 'complete',
      })
      .eq('id', params.id)
      .select()
      .single();

    // Create action items
    if (result.action_items.length > 0) {
      await db.from('action_items').insert(
        result.action_items.map((text: string) => ({
          session_id: params.id,
          client_id: session.client_id,
          user_id: clerkUserId,
          text,
        }))
      );
    }

    return NextResponse.json({
      session: updatedSession,
      action_items: result.action_items,
    });
  } catch (error) {
    console.error('[Sessions/Summarize] POST error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to summarize session',
        },
      },
      { status: 500 }
    );
  }
}
