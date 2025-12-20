/**
 * File Upload API
 * Story 2.4 - File Attachments
 *
 * POST /api/meetings/[id]/files/upload - Create file record after Supabase Storage upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Zod schema for file record creation
const createFileSchema = z.object({
  filename: z.string().min(1).max(255),
  file_size: z
    .number()
    .positive()
    .max(10 * 1024 * 1024), // 10MB max
  mime_type: z.string().min(1),
  storage_path: z.string().min(1),
  url: z.string().url(),
});

/**
 * POST /api/meetings/[id]/files/upload
 * Create file record in database
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meetingId = params.id;

    // Parse and validate request body
    const body = await req.json();
    const validation = createFileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { filename, file_size, mime_type, storage_path, url } =
      validation.data;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from Clerk ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create file record
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration

    const { data: file, error: createError } = await (supabase as any)
      .from('files')
      .insert({
        meeting_id: meetingId,
        user_id: user.id,
        filename,
        file_size,
        mime_type,
        storage_path,
        url,
        expires_at: expiresAt.toISOString(),
        deleted: false,
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create file record:', createError);
      return NextResponse.json(
        { error: 'Failed to create file record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ file }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/meetings/[id]/files/upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
