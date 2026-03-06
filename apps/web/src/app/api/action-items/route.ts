import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { ActionItemCreateSchema } from '@meetsolis/shared';

function supabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED' } },
        { status: 401 }
      );

    const body = await request.json();
    const validation = ActionItemCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: { code: 'VALIDATION_ERROR', details: validation.error.errors },
        },
        { status: 400 }
      );
    }

    const db = supabase();
    const { data, error } = await db
      .from('action_items')
      .insert({ ...validation.data, user_id: clerkUserId })
      .select()
      .single();

    if (error || !data) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[Action Items API] POST error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
