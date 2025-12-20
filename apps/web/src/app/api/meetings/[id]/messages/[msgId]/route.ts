/**
 * Message Actions API Routes
 * Story 2.4 - Edit and Delete Messages
 *
 * PUT /api/meetings/[id]/messages/[msgId] - Edit message
 * DELETE /api/meetings/[id]/messages/[msgId] - Delete message
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const EDIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// Zod schema for message update
const updateMessageSchema = z.object({
  content: z.string().min(1).max(1000),
});

/**
 * PUT /api/meetings/[id]/messages/[msgId]
 * Edit message (sender only, within 5 minutes)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; msgId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meetingIdOrCode = params.id;
    const messageId = params.msgId;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Resolve meeting_code to UUID
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        meetingIdOrCode
      );

    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id')
      .eq(isUUID ? 'id' : 'meeting_code', meetingIdOrCode)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meetingId = meeting.id;

    // Parse and validate request body
    const body = await req.json();
    const validation = updateMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Sanitize content
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'discard',
    });

    // Get user from Clerk ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('sender_id, timestamp, is_deleted')
      .eq('id', messageId)
      .eq('meeting_id', meetingId) // Now uses UUID
      .single();

    if (messageError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Check if user is sender
    if (message.sender_id !== user.id) {
      return NextResponse.json(
        { error: 'Only sender can edit message' },
        { status: 403 }
      );
    }

    // Check if message is deleted
    if (message.is_deleted) {
      return NextResponse.json(
        { error: 'Cannot edit deleted message' },
        { status: 400 }
      );
    }

    // Check if within edit window (5 minutes)
    const messageTime = new Date(message.timestamp).getTime();
    const now = Date.now();
    if (now - messageTime > EDIT_WINDOW_MS) {
      return NextResponse.json(
        { error: 'Edit window expired (5 minutes)' },
        { status: 400 }
      );
    }

    // Update message
    const { data: updatedMessage, error: updateError } = await supabase
      .from('messages')
      .update({
        content: sanitizedContent,
        edited_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update message:', updateError);
      return NextResponse.json(
        { error: 'Failed to update message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: updatedMessage });
  } catch (error) {
    console.error('Error in PUT /api/meetings/[id]/messages/[msgId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/meetings/[id]/messages/[msgId]
 * Delete message (sender or host only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; msgId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meetingIdOrCode = params.id;
    const messageId = params.msgId;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Resolve meeting_code to UUID
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        meetingIdOrCode
      );

    const { data: meeting, error: meetingLookupError } = await supabase
      .from('meetings')
      .select('id, host_id')
      .eq(isUUID ? 'id' : 'meeting_code', meetingIdOrCode)
      .single();

    if (meetingLookupError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meetingId = meeting.id;

    // Get user from Clerk ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('id', messageId)
      .eq('meeting_id', meetingId) // Now uses UUID
      .single();

    if (messageError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Check if user is sender or host
    const isSender = message.sender_id === user.id;
    const isHost = meeting.host_id === user.id;

    if (!isSender && !isHost) {
      return NextResponse.json(
        { error: 'Only sender or host can delete message' },
        { status: 403 }
      );
    }

    // Soft delete message
    const { error: deleteError } = await supabase
      .from('messages')
      .update({ is_deleted: true })
      .eq('id', messageId);

    if (deleteError) {
      console.error('Failed to delete message:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      'Error in DELETE /api/meetings/[id]/messages/[msgId]:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
