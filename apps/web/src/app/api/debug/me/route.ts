/**
 * DEBUG ENDPOINT - Get current user's Clerk info
 * TEMPORARY - for development only
 */

import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json(
      {
        clerk_id: userId,
        email: user.emailAddresses[0]?.emailAddress,
        first_name: user.firstName,
        last_name: user.lastName,
        full_name: `${user.firstName} ${user.lastName}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
