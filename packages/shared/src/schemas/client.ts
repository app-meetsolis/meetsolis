import { z } from 'zod';

/**
 * Zod validation schemas for client data
 * Story 2.1: Client CRUD & Database Schema
 */

// Base client schema with all fields
export const ClientSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  company: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  email: z.string().email('Invalid email format').nullable().optional().or(z.literal('')),
  phone: z.string().nullable().optional(),
  website: z.string().url('Invalid URL format').nullable().optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid URL format').nullable().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
  overview: z.string().nullable().optional(),
  research_data: z.record(z.any()).nullable().optional(),
  created_at: z.string().datetime().or(z.date()),
  updated_at: z.string().datetime().or(z.date()),
  last_meeting_at: z.string().datetime().or(z.date()).nullable().optional(),
});

// Schema for creating a new client
// Required: name
// Optional: company, role, email, phone, website, linkedin_url
export const ClientCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters').trim(),
  company: z.string().trim().optional(),
  role: z.string().trim().optional(),
  email: z.string().email('Invalid email format').trim().optional().or(z.literal('')),
  phone: z.string().trim().optional(),
  website: z.string().url('Invalid URL format').trim().optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid URL format').trim().optional().or(z.literal('')),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['active', 'inactive', 'archived']).optional().default('active'),
}).strict(); // Reject unknown fields

// Schema for updating an existing client
// All fields optional except id is not included (comes from URL params)
export const ClientUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters').trim().optional(),
  company: z.string().trim().nullable().optional(),
  role: z.string().trim().nullable().optional(),
  email: z.string().email('Invalid email format').trim().nullable().optional().or(z.literal('')),
  phone: z.string().trim().nullable().optional(),
  website: z.string().url('Invalid URL format').trim().nullable().optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid URL format').trim().nullable().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  overview: z.string().nullable().optional(),
  research_data: z.record(z.any()).nullable().optional(),
}).strict(); // Reject unknown fields

// Type exports for TypeScript
export type Client = z.infer<typeof ClientSchema>;
export type ClientCreate = z.infer<typeof ClientCreateSchema>;
export type ClientUpdate = z.infer<typeof ClientUpdateSchema>;
