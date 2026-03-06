import { z } from 'zod';

// Base client schema
export const ClientSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  company: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  website: z.string().url('Invalid URL format').nullable().optional().or(z.literal('')),
  goal: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  overview: z.string().nullable().optional(),
  research_data: z.record(z.any()).nullable().optional(),
  created_at: z.string().datetime().or(z.date()),
  updated_at: z.string().datetime().or(z.date()),
  last_meeting_at: z.string().datetime().or(z.date()).nullable().optional(),
});

export const ClientCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters').trim(),
  company: z.string().trim().optional(),
  role: z.string().trim().optional(),
  website: z.string().url('Invalid URL format').trim().optional().or(z.literal('')),
  goal: z.string().trim().optional(),
  start_date: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional().default('active'),
}).strict();

export const ClientUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters').trim().optional(),
  company: z.string().trim().nullable().optional(),
  role: z.string().trim().nullable().optional(),
  website: z.string().url('Invalid URL format').trim().nullable().optional().or(z.literal('')),
  goal: z.string().trim().nullable().optional(),
  start_date: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  overview: z.string().nullable().optional(),
  research_data: z.record(z.any()).nullable().optional(),
}).strict();

export type Client = z.infer<typeof ClientSchema>;
export type ClientCreate = z.infer<typeof ClientCreateSchema>;
export type ClientUpdate = z.infer<typeof ClientUpdateSchema>;
