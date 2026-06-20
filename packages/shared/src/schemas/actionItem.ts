import { z } from 'zod';

// 'unknown' (Story 7.6) — AI ambiguous attribution; coach can reassign later.
const AssigneeEnum = z.enum(['coach', 'client', 'unknown']);

export const ActionItemCreateSchema = z.object({
  client_id: z.string().uuid(),
  description: z.string().min(1, 'Description is required').max(500, 'Max 500 characters'),
  assignee: AssigneeEnum.optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  session_id: z.string().uuid().optional().nullable(),
});

export const ActionItemUpdateSchema = z.object({
  description: z.string().min(1).max(500).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  assignee: AssigneeEnum.nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
});

// Story 7.6 — PATCH /api/action-items/[id]/complete
export const ActionItemCompleteSchema = z.object({
  completed: z.boolean(),
});

// Story 7.6 — PATCH /api/action-items/[id]/assignee (coach reassigns 'unknown')
export const ActionItemAssigneeSchema = z.object({
  assignee: AssigneeEnum.nullable(),
});

export type ActionItemCreateInput = z.infer<typeof ActionItemCreateSchema>;
export type ActionItemUpdateInput = z.infer<typeof ActionItemUpdateSchema>;
export type ActionItemCompleteInput = z.infer<typeof ActionItemCompleteSchema>;
export type ActionItemAssigneeInput = z.infer<typeof ActionItemAssigneeSchema>;
