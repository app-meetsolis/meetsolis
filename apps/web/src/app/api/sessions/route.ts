/**
 * Sessions API
 * Story 3.1: Session DB Schema & API
 * Story 3.2: Manual Transcript Upload (multipart support + Storage)
 *
 * GET  /api/sessions?client_id=[id]  — list sessions (reverse-chronological)
 * POST /api/sessions                  — create session (JSON or multipart/form-data)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import mammoth from 'mammoth';
import { config } from '@/lib/config/env';
import { SessionCreateSchema } from '@meetsolis/shared';
import {
  checkTranscriptLimit,
  incrementTranscriptCount,
} from '@/lib/quota/transcriptQuota';
import { runSummarize } from '@/lib/sessions/summarize-session';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

async function getInternalUserId(clerkUserId: string) {
  const supabase = getSupabase();
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkUserId)
    .single();
  if (error || !user) return null;
  return user.id as string;
}

/**
 * GET /api/sessions?client_id=[id]
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    if (!clientId) {
      return NextResponse.json(
        {
          error: { code: 'VALIDATION_ERROR', message: 'client_id is required' },
        },
        { status: 400 }
      );
    }

    const userId = await getInternalUserId(clerkUserId);
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const supabase = getSupabase();

    // Verify client belongs to user
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

    const { data: sessions, error: queryError } = await supabase
      .from('sessions')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .order('session_date', { ascending: false });

    if (queryError) {
      console.error('[Sessions API] GET error:', queryError);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch sessions',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessions: sessions || [] }, { status: 200 });
  } catch (error) {
    console.error('[Sessions API] GET unexpected error:', error);
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

/**
 * Parse request body — supports JSON and multipart/form-data.
 * Returns normalized fields + optional file for Storage upload.
 */
async function parseSessionRequest(request: NextRequest): Promise<{
  fields: Record<string, string>;
  file: { bytes: ArrayBuffer; name: string; type: string } | null;
}> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const fields: Record<string, string> = {};
    let file: { bytes: ArrayBuffer; name: string; type: string } | null = null;

    for (const [key, value] of Array.from(formData.entries())) {
      if (value instanceof File) {
        if (value.size > 0) {
          file = {
            bytes: await value.arrayBuffer(),
            name: value.name,
            type: value.type,
          };
        }
      } else {
        fields[key] = value;
      }
    }
    return { fields, file };
  }

  // JSON fallback (backwards compat)
  const body = await request.json();
  return { fields: body, file: null };
}

/**
 * Upload file to Supabase Storage.
 * Path: transcripts/{userId}/{sessionId}/{filename}
 * Returns public URL or null on failure.
 */
async function uploadTranscriptFile(
  userId: string,
  sessionId: string,
  file: { bytes: ArrayBuffer; name: string; type: string }
): Promise<string | null> {
  try {
    const supabase = getSupabase();
    const path = `transcripts/${userId}/${sessionId}/${file.name}`;
    const { error } = await supabase.storage
      .from('transcripts')
      .upload(path, file.bytes, { contentType: file.type, upsert: false });

    if (error) {
      console.error('[Sessions API] Storage upload error:', error);
      return null;
    }

    const { data } = supabase.storage.from('transcripts').getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.error('[Sessions API] Storage upload unexpected error:', err);
    return null;
  }
}

/**
 * POST /api/sessions
 * Create a new session — accepts JSON or multipart/form-data.
 * Multipart: text fields + optional file (transcript file for Storage).
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { fields, file } = await parseSessionRequest(request);
    const validation = SessionCreateSchema.safeParse(fields);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid session data',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const {
      client_id,
      title,
      session_date,
      transcript_text,
      transcript_file_url: providedFileUrl,
      transcript_audio_url,
      summary,
      key_topics,
    } = validation.data;

    const userId = await getInternalUserId(clerkUserId);
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Server-side file size guard (client validates too, but enforce here for direct API calls)
    const MAX_FILE_BYTES = 25 * 1024 * 1024;
    if (file && file.bytes.byteLength > MAX_FILE_BYTES) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File exceeds 25MB limit',
          },
        },
        { status: 400 }
      );
    }

    // Check transcript quota (stub — always passes in Story 3.2)
    await checkTranscriptLimit(userId);

    // Server-side .docx parsing (mammoth requires Node.js Buffer, not browser ArrayBuffer)
    let resolvedTranscriptText = transcript_text || null;
    if (
      file &&
      file.name.toLowerCase().endsWith('.docx') &&
      !resolvedTranscriptText
    ) {
      try {
        const result = await mammoth.extractRawText({
          buffer: Buffer.from(file.bytes),
        });
        resolvedTranscriptText = result.value || null;
      } catch (err) {
        console.error('[Sessions API] .docx parse error:', err);
        // Non-fatal: session created without transcript_text
      }
    }

    const supabase = getSupabase();

    // Verify client ownership
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', client_id)
      .eq('user_id', userId)
      .single();

    if (!client) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Client not found' } },
        { status: 404 }
      );
    }

    // Create session record first (need ID for Storage path)
    const { data: newSession, error: insertError } = await supabase
      .from('sessions')
      .insert({
        client_id,
        user_id: userId,
        title,
        session_date,
        transcript_text: resolvedTranscriptText,
        transcript_file_url: providedFileUrl || null,
        transcript_audio_url: transcript_audio_url || null,
        summary: summary || null,
        key_topics: key_topics || [],
        status: 'pending',
      })
      .select()
      .single();

    if (insertError || !newSession) {
      console.error('[Sessions API] POST insert error:', insertError);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to create session',
          },
        },
        { status: 500 }
      );
    }

    // Upload file to Storage (if provided) and update session with URL
    if (file) {
      const fileUrl = await uploadTranscriptFile(userId, newSession.id, file);
      if (fileUrl) {
        await supabase
          .from('sessions')
          .update({ transcript_file_url: fileUrl })
          .eq('id', newSession.id);
        newSession.transcript_file_url = fileUrl;
      }
    }

    // Increment transcript count (stub in Story 3.2)
    await incrementTranscriptCount(userId);

    // Fire-and-forget summarization — call directly (no HTTP, no auth issues)
    runSummarize(newSession.id, userId).catch(err =>
      console.error('[Sessions API] Summarize trigger failed:', err)
    );

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error) {
    console.error('[Sessions API] POST unexpected error:', error);
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
