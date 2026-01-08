/**
 * Client Detail API Route
 * Story 2.1: Client CRUD & Database Schema
 *
 * GET /api/clients/[id] - Get client details
 * PUT /api/clients/[id] - Update client
 * DELETE /api/clients/[id] - Delete client (with CASCADE)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { ClientUpdateSchema } from '@meetsolis/shared';

/**
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * GET /api/clients/[id]
 * Get client details
 *
 * Response: 200 { client } | 400 | 401 | 404 | 500
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate client ID format
    const clientId = params.id;
    if (!isValidUUID(clientId)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid client ID format' } },
        { status: 400 }
      );
    }

    // Authenticate user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

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
      console.error('[Clients API] User not found:', userError);
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const userId = user.id;

    // Query client by id and user_id (RLS enforcement)
    const { data: client, error: queryError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('user_id', userId)
      .maybeSingle();

    if (queryError) {
      console.error('[Clients API] Failed to fetch client:', queryError);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch client',
          },
        },
        { status: 500 }
      );
    }

    if (!client) {
      return NextResponse.json(
        {
          error: {
            code: 'CLIENT_NOT_FOUND',
            message: 'Client not found or access denied',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(client, { status: 200 });
  } catch (error) {
    console.error('[Clients API] GET [id] error:', error);
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

/**
 * PUT /api/clients/[id]
 * Update client
 *
 * Request body: { name?, company?, role?, email?, phone?, website?, linkedin_url? }
 * Response: 200 { client } | 400 | 401 | 404 | 409 | 500
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate client ID format
    const clientId = params.id;
    if (!isValidUUID(clientId)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid client ID format' } },
        { status: 400 }
      );
    }

    // Authenticate user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = ClientUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid client data',
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

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
      console.error('[Clients API] User not found:', userError);
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const userId = user.id;

    // Check if client exists and belongs to user
    const { data: existingClient, error: fetchError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('[Clients API] Failed to fetch client:', fetchError);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to check client existence',
          },
        },
        { status: 500 }
      );
    }

    if (!existingClient) {
      return NextResponse.json(
        {
          error: {
            code: 'CLIENT_NOT_FOUND',
            message: 'Client not found or access denied',
          },
        },
        { status: 404 }
      );
    }

    // Check for duplicate email (if email is being updated and not empty)
    if (updateData.email && updateData.email.trim() !== '') {
      const { data: duplicateClient, error: dupError } = await supabase
        .from('clients')
        .select('id, email')
        .eq('user_id', userId)
        .eq('email', updateData.email)
        .neq('id', clientId) // Exclude current client
        .maybeSingle();

      if (dupError) {
        console.error('[Clients API] Duplicate check failed:', dupError);
        return NextResponse.json(
          {
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Failed to check for duplicate client',
            },
          },
          { status: 500 }
        );
      }

      if (duplicateClient) {
        return NextResponse.json(
          {
            error: {
              code: 'DUPLICATE_CLIENT',
              message: 'A client with this email already exists',
              existingClientId: duplicateClient.id,
            },
          },
          { status: 409 }
        );
      }
    }

    // Update client (updated_at will be auto-updated by trigger)
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', clientId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError || !updatedClient) {
      console.error('[Clients API] Failed to update client:', updateError);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update client',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error) {
    console.error('[Clients API] PUT [id] error:', error);
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

/**
 * DELETE /api/clients/[id]
 * Delete client (CASCADE deletes meetings, action_items, embeddings)
 *
 * Response: 204 No Content | 400 | 401 | 404 | 500
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate client ID format
    const clientId = params.id;
    if (!isValidUUID(clientId)) {
      return NextResponse.json(
        { error: { code: 'INVALID_ID', message: 'Invalid client ID format' } },
        { status: 400 }
      );
    }

    // Authenticate user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

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
      console.error('[Clients API] User not found:', userError);
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const userId = user.id;

    // Check if client exists and belongs to user
    const { data: existingClient, error: fetchError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('[Clients API] Failed to fetch client:', fetchError);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to check client existence',
          },
        },
        { status: 500 }
      );
    }

    if (!existingClient) {
      return NextResponse.json(
        {
          error: {
            code: 'CLIENT_NOT_FOUND',
            message: 'Client not found or access denied',
          },
        },
        { status: 404 }
      );
    }

    // Delete client (CASCADE will automatically delete related meetings, action_items, embeddings)
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('[Clients API] Failed to delete client:', deleteError);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to delete client',
          },
        },
        { status: 500 }
      );
    }

    // Return 204 No Content on successful deletion
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[Clients API] DELETE [id] error:', error);
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
