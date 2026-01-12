/**
 * Client Next Steps API Route
 * Story 2.6: Client Detail View (Enhanced) - Task 14
 *
 * PUT /api/clients/[id]/next-steps - Update next steps for a client
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { nextStepsUpdateSchema } from '@/lib/validations/actionItems';

/**
 * PUT /api/clients/[id]/next-steps
 * Update the next_steps array for a client
 *
 * Request body: { next_steps: string[] }
 * Response: 200 { client: Client } | 400 | 401 | 404 | 500
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const clientId = params.id;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = nextStepsUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid next steps data',
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { next_steps } = validationResult.data;

    // Create Supabase client
    const supabase = createClient(
      config.supabase.url!,
      config.supabase.serviceRoleKey!
    );

    // Get internal user_id from clerk_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !user) {
      console.error('[Next Steps API] User not found:', userError);
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const userId = user.id;

    // Verify client exists and belongs to user
    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingClient) {
      return NextResponse.json(
        { error: { code: 'CLIENT_NOT_FOUND', message: 'Client not found' } },
        { status: 404 }
      );
    }

    // Update next_steps field
    const { data: client, error: updateError } = await supabase
      .from('clients')
      .update({ next_steps })
      .eq('id', clientId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error(
        '[Next Steps API] Failed to update next steps:',
        updateError
      );
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update next steps',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      client,
    });
  } catch (error) {
    console.error('[Next Steps API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
