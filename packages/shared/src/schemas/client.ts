import { z } from 'zod';

/**
 * Zod validation schemas for client data
 * v3: Executive coach pivot — goal, start_date, notes replace email/phone/linkedin/tags/status
 */

// Base client schema with all fields
export const ClientSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  name: z.string().min(2).max(100),
  company: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  goal: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(), // DATE stored as ISO string
  website: z.string().url().nullable().optional().or(z.literal('')),
  notes: z.string().nullable().optional(),
  last_session_at: z.string().datetime().or(z.date()).nullable().optional(),
  created_at: z.string().datetime().or(z.date()),
  updated_at: z.string().datetime().or(z.date()),
});

// Schema for creating a new client
export const ClientCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters').trim(),
  company: z.string().trim().optional(),
  role: z.string().trim().optional(),
  goal: z.string().trim().optional(),
  start_date: z.string().optional(), // ISO date string e.g. "2026-01-15"
  website: z.string().url('Invalid URL format').trim().optional().or(z.literal('')),
  notes: z.string().trim().optional(),
}).strict();

// Schema for updating an existing client
export const ClientUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters').trim().optional(),
  company: z.string().trim().nullable().optional(),
  role: z.string().trim().nullable().optional(),
  goal: z.string().trim().nullable().optional(),
  start_date: z.string().nullable().optional(),
  website: z.string().url('Invalid URL format').trim().nullable().optional().or(z.literal('')),
  notes: z.string().trim().nullable().optional(),
}).strict();

// Type exports
export type Client = z.infer<typeof ClientSchema>;
export type ClientCreate = z.infer<typeof ClientCreateSchema>;
export type ClientUpdate = z.infer<typeof ClientUpdateSchema>;
