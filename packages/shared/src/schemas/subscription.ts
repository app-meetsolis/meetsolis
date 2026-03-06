import { z } from 'zod';

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  plan: z.enum(['free', 'pro']).default('free'),
  stripe_customer_id: z.string().nullable().optional(),
  stripe_subscription_id: z.string().nullable().optional(),
  status: z.enum(['active', 'canceled', 'past_due']).default('active'),
  current_period_end: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime().or(z.date()),
  updated_at: z.string().datetime().or(z.date()),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;

export const FREE_LIMITS = {
  clients: 1,
  transcripts_lifetime: 3,
  queries_lifetime: 50,
} as const;

export const PRO_LIMITS = {
  clients: Infinity,
  transcripts_per_month: Infinity,
  queries_per_month: 2000,
} as const;
