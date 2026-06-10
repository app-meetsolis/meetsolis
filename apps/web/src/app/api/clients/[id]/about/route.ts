/**
 * Story 7.7 — PATCH /api/clients/[id]/about
 *
 * Partial update of ABOUT-section fields: industry, company_size, about_notes,
 * start_date. Sanitizes free-text fields (about_notes, industry) before write.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import sanitizeHtml from 'sanitize-html';
import { ClientAboutPatchSchema } from '@meetsolis/shared';
import { config } from '@/lib/config/env';
import { getInternalUserId } from '@/lib/helpers/user';

export const runtime = 'nodejs';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function err(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

function sanitize(value: string | null | undefined): string | null | undefined {
  if (value === null || value === undefined) return value;
  return sanitizeHtml(value, SANITIZE_OPTIONS);
}

export async function PATCH(
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return err('VALIDATION_ERROR', 'Invalid JSON body', 400);
    }

    const parsed = ClientAboutPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid ABOUT payload',
            details: parsed.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const updatePayload: Record<string, unknown> = {};
    if ('industry' in data) updatePayload.industry = sanitize(data.industry);
    if ('company_size' in data)
      updatePayload.company_size = data.company_size ?? null;
    if ('about_notes' in data)
      updatePayload.about_notes = sanitize(data.about_notes);
    if ('start_date' in data)
      updatePayload.start_date = data.start_date ?? null;

    const supabase = createClient(
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );
    const userId = await getInternalUserId(supabase, clerkUserId);
    if (!userId) return err('USER_NOT_FOUND', 'User not found', 404);

    const { data: updated, error: updateErr } = await supabase
      .from('clients')
      .update(updatePayload)
      .eq('id', clientId)
      .eq('user_id', userId)
      .select('industry, company_size, about_notes, start_date')
      .maybeSingle();

    if (updateErr) {
      console.error('[ClientAbout] Update error:', updateErr);
      return err('INTERNAL_ERROR', 'Failed to update ABOUT', 500);
    }
    if (!updated) {
      return err('CLIENT_NOT_FOUND', 'Client not found or access denied', 404);
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[ClientAbout] PATCH error:', error);
    return err('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}
