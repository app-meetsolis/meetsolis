import { NextRequest, NextResponse } from 'next/server';
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
    const body = await request.json();
    const { userId, confirmationToken } = sanitizeInput(body);

    // TODO: Add authentication and confirmation token validation
    // const currentUser = await getCurrentUser(request);
    // if (currentUser.id !== userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    // TODO: Validate confirmation token
    // const isValidToken = await validateDeletionToken(userId, confirmationToken);
    // if (!isValidToken) {
    //   return NextResponse.json({ error: 'Invalid confirmation token' }, { status: 400 });
    // }

    // Log confirmation token for future implementation
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
