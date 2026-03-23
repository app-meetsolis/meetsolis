/**
 * Signed Upload URL API
 * Story 3.3: Auto-Transcription
 *
 * POST /api/sessions/upload-url
 * Returns a signed Supabase Storage URL for direct client→Storage audio upload.
 * Bypasses Vercel's 4.5MB body limit for large audio files (up to 500MB).
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

export async function POST(request: NextRequest) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const userId = await getInternalUserId(getSupabase(), clerkUserId);
  if (!userId) {
    return NextResponse.json(
      { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
      { status: 404 }
    );
  }

  let body: { filename?: string; contentType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON body' } },
      { status: 400 }
    );
  }

  const { filename, contentType } = body;
  if (!filename || !contentType) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'filename and contentType required',
        },
      },
      { status: 400 }
    );
  }

  const supabase = getSupabase();
  const uniqueId = crypto.randomUUID();
  const path = `transcripts/${userId}/${uniqueId}/${Date.now()}-${filename}`;

  const { data, error } = await supabase.storage
    .from('transcripts')
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error('[upload-url] Signed URL error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create upload URL',
        },
      },
      { status: 500 }
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from('transcripts')
    .getPublicUrl(path);

  return NextResponse.json(
    {
      signedUrl: data.signedUrl,
      path,
      publicUrl: publicUrlData.publicUrl,
    },
    { status: 200 }
  );
}
