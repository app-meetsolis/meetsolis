import { z } from 'zod';

/**
 * Zod validation schemas for client data
 * v3: Executive coach pivot — goal, start_date, notes replace email/phone/linkedin/tags/status
 */

// Story 7.4 + 7.2 — AI-generated intelligence strip JSONB shape on clients.ai_intelligence_strip
export const AIIntelligenceStripSchema = z.object({
  recurring_theme: z.string(),
  theme_frequency: z.string(),
  recent_breakthrough: z.string(),
  current_focus: z.string(),
  generated_at: z.string(), // ISO timestamp
});
export type AIIntelligenceStrip = z.infer<typeof AIIntelligenceStripSchema>;

// Story 7.7 — per-field coach-override flags. Coach-edited fields are skipped on AI regen.
// theme_frequency intentionally excluded — it's AI-computed metadata
// ("3 of 5 sessions"), not a coach-editable narrative field. The UI does
// not expose it as inline-editable.
export const STRIP_FIELDS = [
  'recurring_theme',
  'recent_breakthrough',
  'current_focus',
] as const;
export type StripField = (typeof STRIP_FIELDS)[number];

export const AIIntelligenceStripOverridesSchema = z
  .object({
    recurring_theme: z.boolean().optional(),
    recent_breakthrough: z.boolean().optional(),
    current_focus: z.boolean().optional(),
  })
  .strict();
export type AIIntelligenceStripOverrides = z.infer<
  typeof AIIntelligenceStripOverridesSchema
>;

// Story 7.7 — closed-set company size buckets for ABOUT section
export const CLIENT_COMPANY_SIZES = [
  'solo',
  '2-10',
  '11-50',
  '51-200',
  '201-1000',
  '1000+',
] as const;
export type ClientCompanySize = (typeof CLIENT_COMPANY_SIZES)[number];

// Base client schema with all fields
export const ClientSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  name: z.string().min(2).max(100),
  company: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal('')),
  goal: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(), // DATE stored as ISO string
  website: z.string().url().nullable().optional().or(z.literal('')),
  notes: z.string().nullable().optional(),
  // Story 6.4 — private per-client coach notes, persists across sessions, never AI-touched
  coach_notes: z.string().nullable().optional(),
  // Story 7.4 — Alex Rivera demo client flag
  is_demo: z.boolean().default(false),
  // Story 7.4 (seeded) / 7.2 (regen) — AI insight summary
  ai_intelligence_strip: AIIntelligenceStripSchema.nullable().optional(),
  // Story 7.7 — per-field coach overrides on the strip
  ai_intelligence_strip_overrides: AIIntelligenceStripOverridesSchema.default(
    {}
  ),
  // Story 7.7 — ABOUT section fields
  industry: z.string().nullable().optional(),
  company_size: z.enum(CLIENT_COMPANY_SIZES).nullable().optional(),
  about_notes: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  last_session_at: z.string().datetime().or(z.date()).nullable().optional(),
  created_at: z.string().datetime().or(z.date()),
  updated_at: z.string().datetime().or(z.date()),
});

// Schema for creating a new client
export const ClientCreateSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters')
      .trim(),
    company: z.string().trim().optional(),
    role: z.string().trim().optional(),
    email: z
      .string()
      .email('Invalid email')
      .trim()
      .optional()
      .or(z.literal('')),
    goal: z.string().trim().optional(),
    start_date: z.string().optional(), // ISO date string e.g. "2026-01-15"
    website: z
      .string()
      .url('Invalid URL format')
      .trim()
      .optional()
      .or(z.literal('')),
    notes: z
      .string()
      .trim()
      .max(10000, 'Notes must be at most 10,000 characters')
      .optional(),
  })
  .strict();

// Schema for updating an existing client
export const ClientUpdateSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters')
      .trim()
      .optional(),
    company: z.string().trim().nullable().optional(),
    role: z.string().trim().nullable().optional(),
    email: z
      .string()
      .email('Invalid email')
      .trim()
      .nullable()
      .optional()
      .or(z.literal('')),
    goal: z.string().trim().nullable().optional(),
    start_date: z.string().nullable().optional(),
    website: z
      .string()
      .url('Invalid URL format')
      .trim()
      .nullable()
      .optional()
      .or(z.literal('')),
    notes: z
      .string()
      .trim()
      .max(10000, 'Notes must be at most 10,000 characters')
      .nullable()
      .optional(),
    // Story 6.4 — coach Open Questions field on the brief screen
    coach_notes: z
      .string()
      .max(10000, 'Coach notes must be at most 10,000 characters')
      .nullable()
      .optional(),
  })
  .strict();

// Story 7.7 — ABOUT section partial PATCH (allowed via /api/clients/[id]/about)
export const ClientAboutPatchSchema = z
  .object({
    industry: z.string().trim().max(200).nullable().optional(),
    company_size: z.enum(CLIENT_COMPANY_SIZES).nullable().optional(),
    about_notes: z
      .string()
      .max(10000, 'About notes must be at most 10,000 characters')
      .nullable()
      .optional(),
    start_date: z.string().nullable().optional(),
  })
  .strict()
  .refine(v => Object.keys(v).length > 0, {
    message: 'At least one field is required',
  });
export type ClientAboutPatch = z.infer<typeof ClientAboutPatchSchema>;

// Type exports
export type Client = z.infer<typeof ClientSchema>;
export type ClientCreate = z.infer<typeof ClientCreateSchema>;
export type ClientUpdate = z.infer<typeof ClientUpdateSchema>;
