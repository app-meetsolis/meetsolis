import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { ActionItemUpdateSchema } from '@meetsolis/shared';

function supabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!UUID_RE.test(params.id)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID' } },
        { status: 400 }
      );
    }
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED' } },
        { status: 401 }
      );

    const body = await request.json();
    const validation = ActionItemUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    const db = supabase();
    const { data, error } = await db
      .from('action_items')
      .update(validation.data)
      .eq('id', params.id)
      .eq('user_id', clerkUserId)
      .select()
      .single();

    if (error || !data)
      return NextResponse.json(
        { error: { code: 'NOT_FOUND' } },
        { status: 404 }
      );
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!UUID_RE.test(params.id)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID' } },
        { status: 400 }
      );
    }
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED' } },
        { status: 401 }
      );

    const db = supabase();
    await db
      .from('action_items')
      .delete()
      .eq('id', params.id)
      .eq('user_id', clerkUserId);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
