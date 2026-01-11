import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
  };

  try {
    // 1. Check Clerk auth
    const { userId: clerkUserId } = await auth();
    diagnostics.checks.clerkAuth = clerkUserId
      ? '✓ Authenticated'
      : '✗ Not authenticated';
    diagnostics.clerkUserId = clerkUserId;

    if (!clerkUserId) {
      diagnostics.errors.push('User not authenticated with Clerk');
      return NextResponse.json(diagnostics);
    }

    // 2. Check env vars
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    diagnostics.checks.envVars = {
      supabaseUrl: supabaseUrl ? '✓ Set' : '✗ Missing',
      supabaseKey: supabaseKey ? '✓ Set' : '✗ Missing',
    };

    if (!supabaseUrl || !supabaseKey) {
      diagnostics.errors.push('Missing Supabase environment variables');
      return NextResponse.json(diagnostics);
    }

    // 3. Check Supabase connection
    const supabase = createClient(supabaseUrl, supabaseKey);
    diagnostics.checks.supabaseConnection = '✓ Client created';

    // 4. Check users table exists
    const { data: tablesCheck, error: tablesError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (tablesError) {
      diagnostics.checks.usersTable = `✗ Error: ${tablesError.message}`;
      diagnostics.errors.push(`Users table error: ${tablesError.message}`);
    } else {
      diagnostics.checks.usersTable = '✓ Table exists';
    }

    // 5. Check if current user exists in database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, clerk_id, email, created_at')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError) {
      diagnostics.checks.userInDb = `✗ Not found: ${userError.message}`;
      diagnostics.errors.push(`User not in database. Clerk ID: ${clerkUserId}`);
      diagnostics.solution = 'Run migration or create user manually';
    } else {
      diagnostics.checks.userInDb = '✓ User exists in database';
      diagnostics.user = user;
    }

    // 6. Check clients table
    const { data: clientsCheck, error: clientsError } = await supabase
      .from('clients')
      .select('id')
      .limit(1);

    if (clientsError) {
      diagnostics.checks.clientsTable = `✗ Error: ${clientsError.message}`;
      diagnostics.errors.push(`Clients table error: ${clientsError.message}`);
    } else {
      diagnostics.checks.clientsTable = '✓ Table exists';
    }

    // 7. Check user_preferences table
    const { data: prefsCheck, error: prefsError } = await supabase
      .from('user_preferences')
      .select('id')
      .limit(1);

    if (prefsError) {
      diagnostics.checks.userPreferencesTable = `✗ Error: ${prefsError.message}`;
      diagnostics.errors.push(
        `User preferences table error: ${prefsError.message}`
      );
    } else {
      diagnostics.checks.userPreferencesTable = '✓ Table exists';
    }

    diagnostics.status =
      diagnostics.errors.length === 0 ? 'READY' : 'ISSUES_FOUND';

    return NextResponse.json(diagnostics);
  } catch (error: any) {
    diagnostics.checks.generalError = `✗ ${error.message}`;
    diagnostics.errors.push(error.message);
    diagnostics.stack = error.stack;
    return NextResponse.json(diagnostics, { status: 500 });
  }
}
