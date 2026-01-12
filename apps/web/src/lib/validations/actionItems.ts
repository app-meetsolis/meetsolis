/**
 * Action Items Validation Schemas
 * Story 2.6: Client Detail View (Enhanced) - Task 13
 *
 * Zod schemas for action item and next steps validation
 */

import { z } from 'zod';

/**
 * Schema for creating a new action item
 */
export const actionItemCreateSchema = z.object({
  client_id: z.string().uuid('Invalid client ID format'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less')
    .trim(),
  due_date: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .optional()
    .nullable(),
  completed: z.boolean().default(false).optional(),
});

/**
 * Schema for updating an existing action item
 */
export const actionItemUpdateSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less')
    .trim()
    .optional(),
  due_date: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .optional()
    .nullable(),
  completed: z.boolean().optional(),
});

/**
 * Schema for updating next steps
 */
export const nextStepsUpdateSchema = z.object({
  next_steps: z
    .array(
      z.string().max(200, 'Each step must be 200 characters or less').trim()
    )
    .max(10, 'Maximum 10 next steps allowed'),
});

// Export types inferred from schemas
export type ActionItemCreate = z.infer<typeof actionItemCreateSchema>;
export type ActionItemUpdate = z.infer<typeof actionItemUpdateSchema>;
export type NextStepsUpdate = z.infer<typeof nextStepsUpdateSchema>;
