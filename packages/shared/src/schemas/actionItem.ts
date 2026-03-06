import { z } from 'zod';

export const ActionItemSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  client_id: z.string().uuid(),
  user_id: z.string(),
  text: z.string(),
  completed: z.boolean().default(false),
  due_date: z.string().nullable().optional(),
  created_at: z.string().datetime().or(z.date()),
  updated_at: z.string().datetime().or(z.date()),
});

export const ActionItemCreateSchema = z.object({
  session_id: z.string().uuid(),
  client_id: z.string().uuid(),
  text: z.string().min(1).max(500),
  due_date: z.string().nullable().optional(),
}).strict();

export const ActionItemUpdateSchema = z.object({
  text: z.string().min(1).max(500).optional(),
  completed: z.boolean().optional(),
  due_date: z.string().nullable().optional(),
}).strict();

export type ActionItem = z.infer<typeof ActionItemSchema>;
export type ActionItemCreate = z.infer<typeof ActionItemCreateSchema>;
export type ActionItemUpdate = z.infer<typeof ActionItemUpdateSchema>;
