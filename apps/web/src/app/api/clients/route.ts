/**
 * Clients API Route
 * Story 2.1: Client CRUD & Database Schema
 *
 * POST /api/clients - Create new client
 * GET /api/clients - List all clients for authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { ClientCreateSchema } from '@meetsolis/shared';

/**
 * POST /api/clients
 * Create a new client
 *
 * Request body: { name, company?, role?, email?, phone?, website?, linkedin_url? }
 * Response: 201 { client } | 400 | 403 | 409 | 500
 */
export async function POST(request: NextRequest) {
  try {
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
    const validationResult = ClientCreateSchema.safeParse(body);

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

    const clientData = validationResult.data;

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

    // Check user tier limit
    const { data: userPrefs } = await supabase
      .from('user_preferences')
      .select('max_clients')
      .eq('user_id', userId)
      .single();

    // Default to free tier if no preferences found
    const maxClients = userPrefs?.max_clients || 3;

    // Count existing clients
    const { count, error: countError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('[Clients API] Failed to count clients:', countError);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to check client limit',
          },
        },
        { status: 500 }
      );
    }

    // Enforce tier limit
    if (count !== null && count >= maxClients) {
      return NextResponse.json(
        {
          error: {
            code: 'TIER_LIMIT_EXCEEDED',
            message: `Client limit reached (${count}/${maxClients})`,
            limit: maxClients,
            current: count,
          },
        },
        { status: 403 }
      );
    }

    // Check for duplicate email (if provided and not empty)
    if (clientData.email && clientData.email.trim() !== '') {
      const { data: existingClient, error: dupError } = await supabase
        .from('clients')
        .select('id, email')
        .eq('user_id', userId)
        .eq('email', clientData.email)
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

      if (existingClient) {
        return NextResponse.json(
          {
            error: {
              code: 'DUPLICATE_CLIENT',
              message: 'A client with this email already exists',
              existingClientId: existingClient.id,
            },
          },
          { status: 409 }
        );
      }
    }

    // Insert client
    const { data: newClient, error: insertError } = await supabase
      .from('clients')
      .insert({
        user_id: userId,
        name: clientData.name,
        company: clientData.company || null,
        role: clientData.role || null,
        email: clientData.email || null,
        phone: clientData.phone || null,
        website: clientData.website || null,
        linkedin_url: clientData.linkedin_url || null,
        tags: clientData.tags || [],
        status: clientData.status || 'active',
      })
      .select()
      .single();

    if (insertError || !newClient) {
      console.error('[Clients API] Failed to create client:', insertError);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to create client',
          },
        },
        { status: 500 }
      );
    }

    // Return created client
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('[Clients API] POST error:', error);
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
 * GET /api/clients
 * List all clients for authenticated user
 *
 * Response: 200 { clients: [] } | 401 | 500
 */
export async function GET() {
  try {
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

    // Query clients for user, ordered by created_at DESC
    const { data: clients, error: queryError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (queryError) {
      console.error('[Clients API] Failed to fetch clients:', queryError);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch clients',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ clients: clients || [] }, { status: 200 });
  } catch (error) {
    console.error('[Clients API] GET error:', error);
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
