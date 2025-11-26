import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';

// Initialize Supabase client
const supabase = createClient(
  config.supabase.url!,
  config.supabase.serviceRoleKey!
);

/**
 * GET /api/users/[id]/clerk-id
 * Get Clerk ID for a user by their database UUID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = params;

    // Fetch clerk_id from users table
    const { data: user, error } = await supabase
      .from('users')
      .select('clerk_id')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      clerk_id: user.clerk_id,
    });
  } catch (error) {
    console.error('Error fetching clerk_id:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
