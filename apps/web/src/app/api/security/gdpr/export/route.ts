import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DataExporter } from '@/lib/security/gdpr';
import {
  createSanitizationMiddleware,
  secureSchemas,
} from '@/lib/security/sanitization';
import { z } from 'zod';

/**
 * GDPR Data Export Endpoint
 * Allows users to export their personal data
 */

const exportRequestSchema = z.object({
  userId: secureSchemas.safeText(50),
});

const sanitizeInput = createSanitizationMiddleware(exportRequestSchema);

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId } = sanitizeInput(body);

    // Ensure user can only export their own data
    if (clerkUserId !== userId) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You can only export your own data',
        },
        { status: 403 }
      );
    }

    const exportData = await DataExporter.exportUserData(userId);

    return NextResponse.json({
      success: true,
      data: exportData,
      message: 'Data export completed successfully',
    });
  } catch (error) {
    console.error('Data export error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to export user data',
      },
      { status: 500 }
    );
  }
}
