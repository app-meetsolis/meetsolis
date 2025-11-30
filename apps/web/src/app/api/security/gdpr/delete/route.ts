import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DataDeletionService } from '@/lib/security/gdpr';
import {
  createSanitizationMiddleware,
  secureSchemas,
} from '@/lib/security/sanitization';
import { z } from 'zod';

/**
 * GDPR Data Deletion Endpoint (Right to Erasure)
 * Allows users to request deletion of their personal data
 */

const deleteRequestSchema = z.object({
  userId: secureSchemas.safeText(50),
  confirmationToken: secureSchemas.safeText(100),
});

const sanitizeInput = createSanitizationMiddleware(deleteRequestSchema);

export async function DELETE(request: NextRequest) {
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
    const { userId, confirmationToken } = sanitizeInput(body);

    // Ensure user can only delete their own data
    if (clerkUserId !== userId) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You can only delete your own data',
        },
        { status: 403 }
      );
    }

    // TODO: Implement confirmation token validation in future
    // For now, just log it
    console.log(
      'Confirmation token provided:',
      confirmationToken ? 'Yes' : 'No'
    );

    await DataDeletionService.deleteUserData(userId, 'user_request');

    return NextResponse.json({
      success: true,
      message: 'User data has been successfully deleted',
    });
  } catch (error) {
    console.error('Data deletion error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to delete user data',
      },
      { status: 500 }
    );
  }
}
