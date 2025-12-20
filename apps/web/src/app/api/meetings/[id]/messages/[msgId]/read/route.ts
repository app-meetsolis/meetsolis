/**
 * Message Read Receipts API
 * Story 2.4 - Mark messages as read
 *
 * POST /api/meetings/[id]/messages/[msgId]/read - Mark message as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/meetings/[id]/messages/[msgId]/read
 * Mark message as read by current user
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; msgId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meetingId = params.id;
    const messageId = params.msgId;

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

    // Get message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('message_read_by')
      .eq('id', messageId)
      .eq('meeting_id', meetingId)
      .single();

    if (messageError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const currentReadBy = (message.message_read_by as any[]) || [];
    const alreadyRead = currentReadBy.some(r => r.user_id === user.id);

    if (alreadyRead) {
      return NextResponse.json({ success: true, alreadyRead: true });
    }

    // Add current user to read receipts
    const updatedReadBy = [
      ...currentReadBy,
      {
        user_id: user.id,
        read_at: new Date().toISOString(),
      },
    ];

    const { error: updateError } = await supabase
      .from('messages')
      .update({ message_read_by: updatedReadBy })
      .eq('id', messageId);

    if (updateError) {
      console.error('Failed to update read receipts:', updateError);
      return NextResponse.json(
        { error: 'Failed to update read receipts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      'Error in POST /api/meetings/[id]/messages/[msgId]/read:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
