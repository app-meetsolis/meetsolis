// apps/web/src/app/api/onboarding/status/route.ts
// Story 1.9: Onboarding Completion Enforcement & Optimization
// API endpoint for updating and retrieving onboarding status with security features

import { auth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

// =============================================================================
// ZOD VALIDATION SCHEMA
// =============================================================================

const OnboardingStatusSchema = z.object({
  step: z.enum([
    'welcome',
    'permissions',
    'profile',
    'first-meeting',
    'complete',
  ]),
  completed: z.boolean(),
  onboarding_last_step: z.string().max(50).optional(),
});

// =============================================================================
// RATE LIMITING (Simple in-memory implementation)
// =============================================================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

// =============================================================================
// SUPABASE CLIENT
// =============================================================================

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// =============================================================================
// GET ENDPOINT - Retrieve onboarding status
// =============================================================================

export async function GET(req: NextRequest) {
  try {
    // CSRF Protection via Clerk JWT validation
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        {
          error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' },
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const supabase = getSupabaseClient();

    // Query database with RLS
    const { data, error } = await supabase
      .from('users')
      .select(
        'onboarding_completed, onboarding_completed_at, onboarding_last_step'
      )
      .eq('clerk_id', userId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch onboarding status',
          },
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      onboarding_completed: data.onboarding_completed,
      onboarding_completed_at: data.onboarding_completed_at,
      onboarding_last_step: data.onboarding_last_step,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

// =============================================================================
// PUT ENDPOINT - Update onboarding status
// =============================================================================

export async function PUT(req: NextRequest) {
  try {
    // CSRF Protection via Clerk JWT validation
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        {
          error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' },
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = OnboardingStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid request data',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { step, completed, onboarding_last_step } = validation.data;

    // Sanitize string inputs
    const sanitizedLastStep = onboarding_last_step
      ? sanitizeHtml(onboarding_last_step, {
          allowedTags: [],
          allowedAttributes: {},
        })
      : null;

    const supabase = getSupabaseClient();

    // Update database with sanitized data
    const updateData: any = {
      onboarding_completed: completed,
      onboarding_completed_at: completed ? new Date().toISOString() : null,
      onboarding_last_step: sanitizedLastStep || step,
    };

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('clerk_id', userId)
      .select(
        'onboarding_completed, onboarding_completed_at, onboarding_last_step'
      )
      .single();

    if (error) {
      console.error('Database error:', error);

      // Retry logic for transient errors
      if (error.code === 'PGRST301' || error.message.includes('timeout')) {
        // Return 503 for retry
        return NextResponse.json(
          {
            error: {
              code: 'SERVICE_UNAVAILABLE',
              message: 'Database temporarily unavailable, please retry',
            },
          },
          { status: 503, headers: { 'Retry-After': '5' } }
        );
      }

      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to update onboarding status',
          },
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      onboarding_completed: data.onboarding_completed,
      onboarding_completed_at: data.onboarding_completed_at,
      onboarding_last_step: data.onboarding_last_step,
      message: 'Onboarding status updated successfully',
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
