import { z } from 'zod';

export const SessionCreateSchema = z.object({
  client_id: z.string().uuid(),
  title: z.string().min(1, 'Title required').max(500).trim(),
  session_date: z.string(),
  transcript_text: z.string().max(50000).optional().nullable(),
  transcript_file_url: z.string().url().optional().nullable(),
  transcript_audio_url: z.string().url().optional().nullable(),
  summary: z.string().max(10000).optional().nullable(),
  key_topics: z.array(z.string()).optional(),
}).strict();

export const SessionUpdateSchema = z.object({
  title: z.string().min(1).max(500).trim().optional(),
  session_date: z.string().optional(),
  transcript_text: z.string().max(50000).nullable().optional(),
  transcript_file_url: z.string().url().nullable().optional(),
  transcript_audio_url: z.string().url().nullable().optional(),
  summary: z.string().max(10000).nullable().optional(),
  key_topics: z.array(z.string()).optional(),
  status: z.enum(['pending', 'processing', 'complete', 'error']).optional(),
}).strict();

export type SessionCreateInput = z.infer<typeof SessionCreateSchema>;
export type SessionUpdateInput = z.infer<typeof SessionUpdateSchema>;
