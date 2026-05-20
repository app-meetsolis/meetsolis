import { z } from 'zod';

/**
 * Zod schemas for Coach Brief content (Story 6.4).
 * Validates the coach_briefs.content JSONB structure on read + write.
 */

export const BriefActionItemSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  status: z.enum(['open', 'done']),
});

export const BriefLastSessionSchema = z.object({
  session_id: z.string().uuid(),
  date: z.string(),
  weeks_ago: z.number().int().min(0),
  action_items: z.array(BriefActionItemSchema),
  key_theme: z.string(),
});

export const BriefBreakthroughSchema = z.object({
  session_id: z.string().uuid(),
  date: z.string(),
  summary: z.string(),
});

export const CoachBriefContentSchema = z.object({
  client_name: z.string().min(1),
  minutes_until_session: z.number().nullable(),
  last_session: BriefLastSessionSchema.nullable(),
  ai_prep_note: z.string(),
  past_breakthroughs: z.array(BriefBreakthroughSchema),
  coach_open_questions: z.string(),
  is_first_session: z.boolean(),
  suggested_questions: z.array(z.string()),
  edited_fields: z.array(z.string()),
});

/** Editable subset accepted by PATCH /api/brief/[id]. */
export const CoachBriefPatchSchema = z
  .object({
    ai_prep_note: z.string().max(8000).optional(),
    key_theme: z.string().max(500).optional(),
    suggested_questions: z.array(z.string().max(500)).max(10).optional(),
    breakthroughs: z.array(BriefBreakthroughSchema).max(10).optional(),
  })
  .refine(d => Object.keys(d).length > 0, {
    message: 'At least one field required',
  });

export type CoachBriefPatch = z.infer<typeof CoachBriefPatchSchema>;
