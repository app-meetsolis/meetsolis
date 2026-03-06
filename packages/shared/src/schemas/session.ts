import { z } from 'zod';

export const SessionSchema = z.object({
  id: z.string().uuid(),
  client_id: z.string().uuid(),
  user_id: z.string(),
  title: z.string().nullable().optional(),
  session_date: z.string(),
  transcript_text: z.string().nullable().optional(),
  transcript_file_url: z.string().nullable().optional(),
  transcript_audio_url: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  key_topics: z.array(z.string()).default([]),
  status: z.enum(['pending', 'processing', 'complete', 'error']).default('pending'),
  created_at: z.string().datetime().or(z.date()),
  updated_at: z.string().datetime().or(z.date()),
});

export const SessionCreateSchema = z.object({
  client_id: z.string().uuid(),
  title: z.string().max(200).optional(),
  session_date: z.string(),
  transcript_text: z.string().optional(),
  transcript_file_url: z.string().optional(),
  transcript_audio_url: z.string().optional(),
}).strict();

export const SessionUpdateSchema = z.object({
  title: z.string().max(200).nullable().optional(),
  session_date: z.string().optional(),
  summary: z.string().nullable().optional(),
  key_topics: z.array(z.string()).optional(),
  status: z.enum(['pending', 'processing', 'complete', 'error']).optional(),
}).strict();

export type Session = z.infer<typeof SessionSchema>;
export type SessionCreate = z.infer<typeof SessionCreateSchema>;
export type SessionUpdate = z.infer<typeof SessionUpdateSchema>;
