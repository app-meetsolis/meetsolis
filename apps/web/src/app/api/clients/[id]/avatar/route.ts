/**
 * Story 7.7 — POST /api/clients/[id]/avatar
 *
 * Multipart upload of a client avatar image to Supabase Storage bucket
 * `client-avatars`. Validates size (≤5MB) + MIME (jpeg/png/webp), stores at
 * `{userId}/{clientId}.{ext}`, sets clients.avatar_url to the public URL.
 *
 * The bucket must be created manually in Supabase dashboard:
 *   - name: client-avatars
 *   - public: yes (URLs are guessable but contain UUIDs only — internal
 *     Supabase user_id + client_id, no Clerk identity / email / name).
 *     If a higher privacy bar is needed later, switch to signed URLs.
 *   - file size limit: 5 MB
 *   - allowed MIME: image/jpeg, image/png, image/webp
 *
 * RLS policy (defense-in-depth — we use service role key here):
 *   CREATE POLICY "client-avatars-rw" ON storage.objects FOR ALL
 *     USING (bucket_id = 'client-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';

export const runtime = 'nodejs';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BYTES = 5 * 1024 * 1024;
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const BUCKET = 'client-avatars';

function err(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    if (!UUID_REGEX.test(clientId)) {
      return err('INVALID_ID', 'Invalid client ID', 400);
    }

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return err('UNAUTHORIZED', 'Authentication required', 401);

    const form = await request.formData().catch(() => null);
    if (!form) return err('VALIDATION_ERROR', 'Expected multipart body', 400);

    const file = form.get('file');
    if (!(file instanceof File))
      return err('VALIDATION_ERROR', 'Missing or invalid file field', 400);

    const ext = MIME_TO_EXT[file.type];
    if (!ext) return err('VALIDATION_ERROR', 'Use JPG, PNG, or WebP.', 400);

    if (file.size > MAX_BYTES)
      return err('FILE_TOO_LARGE', 'Image must be 5MB or smaller.', 413);

    const supabase = createClient(
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );
    const userId = await getInternalUserId(supabase, clerkUserId);
    if (!userId) return err('USER_NOT_FOUND', 'User not found', 404);

    // Confirm client belongs to user before uploading
    const { data: existingClient, error: clientErr } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('user_id', userId)
      .maybeSingle();

    if (clientErr) {
      console.error('[ClientAvatar] Fetch client error:', clientErr);
      return err('INTERNAL_ERROR', 'Failed to load client', 500);
    }
    if (!existingClient) {
      return err('CLIENT_NOT_FOUND', 'Client not found or access denied', 404);
    }

    const path = `${userId}/${clientId}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadErr) {
      console.error('[ClientAvatar] Upload error:', uploadErr);
      const msg = /not found|bucket/.test(uploadErr.message ?? '')
        ? 'Avatar storage not configured. Ask admin to create the client-avatars bucket.'
        : 'Failed to upload avatar.';
      return err('UPLOAD_FAILED', msg, 500);
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    // Cache-buster so the new image replaces the old one without a hard reload
    const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { error: updateErr } = await supabase
      .from('clients')
      .update({ avatar_url: avatarUrl })
      .eq('id', clientId)
      .eq('user_id', userId);

    if (updateErr) {
      console.error('[ClientAvatar] Update error:', updateErr);
      return err('INTERNAL_ERROR', 'Failed to update client avatar', 500);
    }

    return NextResponse.json({ avatar_url: avatarUrl }, { status: 200 });
  } catch (error) {
    console.error('[ClientAvatar] POST error:', error);
    return err('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}
