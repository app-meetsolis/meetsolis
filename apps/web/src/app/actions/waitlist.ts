'use server';

// Force HMR update

import { getSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendWelcomeEmail } from '@/lib/mail';

export async function joinWaitlist(formData: FormData) {
    const supabase = getSupabaseServerClient();
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    let role = formData.get('role') as string;

    if (role === 'other') {
        const otherRole = formData.get('other_role') as string;
        if (otherRole) {
            role = `Other: ${otherRole}`;
        }
    }

    if (!email) {
        return { error: 'Email is required' };
    }

    try {
        const { error } = await supabase
            .from('waitlist')
            .insert({ email, name, role });

        if (error) {
            if (error.code === '23505') { // Unique violation
                return { success: true, message: "You're already on the list! You're all set to go 🚀" };
            }
            console.error('Waitlist error:', error);
            return { error: 'Something went wrong. Please try again.' };
        }

        // Send notification to Slack
        try {
            const webhookUrl = process.env.SLACK_WEBHOOK_URL;
            if (webhookUrl) {
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: `🚀 *New Waitlist Signup*\n\n*Email:* ${email}\n*Name:* ${name || 'N/A'}\n*Role:* ${role || 'N/A'}`,
                    }),
                });
            }
        } catch (error) {
            console.error('Failed to send Slack notification:', error);
            // Don't block the user response
        }

        // Send Welcome Email
        // We don't await this to keep the UI snappy, or we catch errors so it doesn't fail the request
        try {
            await sendWelcomeEmail(email, name);
        } catch (error) {
            console.error('Failed to send welcome email:', error);
        }

        revalidatePath('/');
        return { success: true, message: "You're in! We'll be in touch soon." };
    } catch (err) {
        console.error('Unexpected error:', err);
        return { error: 'Failed to join waitlist' };
    }
}
