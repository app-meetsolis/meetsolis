/**
 * Clerk Webhook Handler
 * Handles user lifecycle events from Clerk and syncs with Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import {
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from '@/services/auth';
import { config } from '@/lib/config/env';

/**
 * Verify webhook signature from Clerk
 */
function verifyWebhook(req: NextRequest, body: string): WebhookEvent | null {
  const WEBHOOK_SECRET = config.clerk.webhookSecret;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET environment variable');
    return null;
  }

  // Get headers for verification
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers');
    return null;
  }

  // Create Svix instance and verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);

  try {
    const evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;

    return evt;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return null;
  }
}

/**
 * POST handler for Clerk webhooks
 */
export async function POST(req: NextRequest) {
  try {
    // Get the request body as text for verification
    const body = await req.text();

    // Verify the webhook
    const evt = verifyWebhook(req, body);

    if (!evt) {
      return NextResponse.json(
        { error: 'Webhook verification failed' },
        { status: 401 }
      );
    }

    const { type, data } = evt;

    // Handle different webhook events
    switch (type) {
      case 'user.created': {
        const email = data.email_addresses?.[0]?.email_address ?? '';
        const firstName = data.first_name ?? '';
        const lastName = data.last_name ?? '';

        await createUserProfile(data.id, email, firstName, lastName);

        console.log(`User created: ${data.id}`);
        break;
      }

      case 'user.updated': {
        const email = data.email_addresses?.[0]?.email_address ?? '';
        const firstName = data.first_name ?? '';
        const lastName = data.last_name ?? '';

        await updateUserProfile(data.id, email, firstName, lastName);

        console.log(`User updated: ${data.id}`);
        break;
      }

      case 'user.deleted': {
        if (data.id) {
          await deleteUserProfile(data.id);
          console.log(`User deleted: ${data.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${type}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
