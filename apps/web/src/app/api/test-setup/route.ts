import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const result: any = {
    timestamp: new Date().toISOString(),
    status: 'CHECKING',
    errors: [],
  };

  try {
    // 1. Clerk Auth
    const { userId: clerkUserId } = await auth();
    result.clerkUserId = clerkUserId || 'NOT_AUTHENTICATED';

    if (!clerkUserId) {
      result.errors.push('Not signed in to Clerk');
      result.status = 'FAILED';
      return NextResponse.json(result);
    }

    // 2. Supabase Connection
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      result.errors.push('Missing Supabase env vars');
      result.status = 'FAILED';
      return NextResponse.json(result);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Check if user exists in database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, clerk_id, email')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !user) {
      result.errors.push(`User not in database. Clerk ID: ${clerkUserId}`);
      result.fix = `Need to create user in database`;
      result.status = 'USER_NOT_FOUND';
      return NextResponse.json(result);
    }

    result.user = user;
    result.status = 'READY';

    return NextResponse.json(result);
  } catch (error: any) {
    result.errors.push(error.message);
    result.status = 'ERROR';
    return NextResponse.json(result);
  }
}
