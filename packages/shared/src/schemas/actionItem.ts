import { z } from 'zod';

export const ActionItemCreateSchema = z.object({
  client_id: z.string().uuid(),
  description: z.string().min(1, 'Description is required').max(500, 'Max 500 characters'),
  assignee: z.enum(['coach', 'client']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
});

export const ActionItemUpdateSchema = z.object({
  description: z.string().min(1).max(500).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  assignee: z.enum(['coach', 'client']).nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
});

export type ActionItemCreateInput = z.infer<typeof ActionItemCreateSchema>;
export type ActionItemUpdateInput = z.infer<typeof ActionItemUpdateSchema>;
