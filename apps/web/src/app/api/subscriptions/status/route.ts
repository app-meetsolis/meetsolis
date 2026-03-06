import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED' } },
        { status: 401 }
      );

    const supabase = createClient(
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );
    const { data } = await supabase
      .from('subscriptions')
      .select('plan, status, current_period_end')
      .eq('user_id', clerkUserId)
      .single();

    return NextResponse.json(data || { plan: 'free', status: 'active' });
  } catch {
    return NextResponse.json({ plan: 'free', status: 'active' });
  }
}
