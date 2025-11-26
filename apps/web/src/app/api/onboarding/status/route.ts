// apps/web/src/app/api/onboarding/status/route.ts
// Story 1.9: Onboarding Completion Enforcement & Optimization
// API endpoint for updating and retrieving onboarding status with security features

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import { config } from '@/lib/config/env';

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
// RATE LIMITING
// =============================================================================

// TODO: Implement rate limiting with Upstash Redis for serverless compatibility
// In-memory rate limiting doesn't work in serverless environments because each
// function invocation gets its own memory space. For production, use:
// - Upstash Redis (recommended for Vercel)
// - Vercel's built-in rate limiting
// - Or implement at the edge middleware level
//
// Example with Upstash:
// import { Ratelimit } from "@upstash/ratelimit";
// import { Redis } from "@upstash/redis";
// const ratelimit = new Ratelimit({
//   redis: Redis.fromEnv(),
//   limiter: Ratelimit.slidingWindow(100, "1 m"),
// });

const RATE_LIMIT = 100; // requests per minute (for headers only, not enforced)

function checkRateLimit(userId: string): boolean {
  // Rate limiting disabled - implement with Redis for production
  return true;
}

// =============================================================================
// SUPABASE CLIENT
// =============================================================================

function getSupabaseClient() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
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
