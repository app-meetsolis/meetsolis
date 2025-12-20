/**
 * Messages API Routes
 * Story 2.4 - Real-Time Messaging and Chat Features
 *
 * GET /api/meetings/[id]/messages - Fetch message history
 * POST /api/meetings/[id]/messages - Send new message
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const MESSAGE_RATE_LIMIT = 10; // messages per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

// Zod schema for message creation
const createMessageSchema = z.object({
  content: z.string().min(1).max(1000),
  type: z.enum(['public', 'private', 'system']).default('public'),
  recipient_id: z.string().uuid().optional().nullable(),
  file_id: z.string().uuid().optional().nullable(),
});

/**
 * GET /api/meetings/[id]/messages
 * Fetch message history with pagination
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meetingIdOrCode = params.id;
    const { searchParams } = new URL(req.url);

    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type') || undefined;
    const search = searchParams.get('search') || undefined;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if meetingId is UUID or meeting_code
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        meetingIdOrCode
      );

    // Look up meeting to get UUID
    const { data: meeting, error: meetingLookupError } = await supabase
      .from('meetings')
      .select('id')
      .eq(isUUID ? 'id' : 'meeting_code', meetingIdOrCode)
      .single();

    if (meetingLookupError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meetingId = meeting.id; // Use actual UUID

    // Build query
    let query = supabase
      .from('messages')
      .select('*')
      .eq('meeting_id', meetingId)
      .eq('is_deleted', false)
      .order('timestamp', { ascending: true });

    // Filter by type
    if (type) {
      query = query.eq('type', type);
    }

    // Search filter
    if (search) {
      query = query.ilike('content', `%${search}%`);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: messages, error } = await query;

    if (error) {
      console.error('Failed to fetch messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error in GET /api/meetings/[id]/messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/meetings/[id]/messages
 * Send new message with rate limiting
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

    const meetingIdOrCode = params.id;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if meetingId is UUID or meeting_code
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        meetingIdOrCode
      );

    // Look up meeting to get UUID and settings
    const { data: meeting, error: meetingLookupError } = await supabase
      .from('meetings')
      .select('id, settings')
      .eq(isUUID ? 'id' : 'meeting_code', meetingIdOrCode)
      .single();

    if (meetingLookupError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meetingId = meeting.id; // Use actual UUID

    // Rate limiting
    const rateLimitKey = `${userId}:${meetingId}`;
    const now = Date.now();
    const userRateLimit = rateLimitMap.get(rateLimitKey);

    if (userRateLimit) {
      if (now < userRateLimit.resetAt) {
        if (userRateLimit.count >= MESSAGE_RATE_LIMIT) {
          return NextResponse.json(
            {
              error:
                'Rate limit exceeded. Please wait before sending more messages.',
            },
            { status: 429 }
          );
        }
        userRateLimit.count++;
      } else {
        rateLimitMap.set(rateLimitKey, {
          count: 1,
          resetAt: now + RATE_LIMIT_WINDOW,
        });
      }
    } else {
      rateLimitMap.set(rateLimitKey, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW,
      });
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = createMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { content, type, recipient_id, file_id } = validation.data;

    // Sanitize content to prevent XSS
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

    // Verify user is participant in meeting
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id')
      .eq('meeting_id', meetingId)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Not a participant in this meeting' },
        { status: 403 }
      );
    }

    // Check if chat is enabled
    const settings = meeting.settings as any;
    if (type === 'public' && settings.chat_enabled === false) {
      return NextResponse.json(
        { error: 'Public chat is disabled by host' },
        { status: 403 }
      );
    }

    if (type === 'private' && settings.private_chat_enabled === false) {
      return NextResponse.json(
        { error: 'Private chat is disabled by host' },
        { status: 403 }
      );
    }

    // Create message
    const { data: message, error: createError } = await supabase
      .from('messages')
      .insert({
        meeting_id: meetingId,
        sender_id: user.id,
        content: sanitizedContent,
        type,
        recipient_id,
        file_id,
        timestamp: new Date().toISOString(),
        metadata: {},
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create message:', createError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/meetings/[id]/messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
