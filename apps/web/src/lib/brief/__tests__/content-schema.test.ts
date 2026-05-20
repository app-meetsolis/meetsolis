/**
 * Unit tests — Coach Brief content + patch Zod schemas (Story 6.4)
 */

import {
  CoachBriefContentSchema,
  CoachBriefPatchSchema,
} from '@meetsolis/shared';

const validContent = {
  client_name: 'Sarah Chen',
  minutes_until_session: 47,
  last_session: {
    session_id: '11111111-1111-1111-1111-111111111111',
    date: '2026-05-04',
    weeks_ago: 1,
    action_items: [
      {
        id: '22222222-2222-2222-2222-222222222222',
        text: 'Draft Q3 OKRs',
        status: 'open',
      },
    ],
    key_theme: 'Boundary-setting with executive team',
  },
  ai_prep_note: 'Sarah has been circling delegation for three sessions.',
  past_breakthroughs: [
    {
      session_id: '33333333-3333-3333-3333-333333333333',
      date: '2026-03-12',
      summary: 'Connected perfectionism to her father.',
    },
  ],
  coach_open_questions: '',
  is_first_session: false,
  suggested_questions: [],
  edited_fields: [],
};

describe('CoachBriefContentSchema', () => {
  it('accepts a fully valid brief', () => {
    expect(CoachBriefContentSchema.safeParse(validContent).success).toBe(true);
  });

  it('accepts a first-session brief with null last_session', () => {
    const r = CoachBriefContentSchema.safeParse({
      ...validContent,
      last_session: null,
      is_first_session: true,
      past_breakthroughs: [],
      suggested_questions: ['What does success look like in 90 days?'],
    });
    expect(r.success).toBe(true);
  });

  it('rejects a missing client_name', () => {
    const { client_name, ...rest } = validContent;
    void client_name;
    expect(CoachBriefContentSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects an invalid action item status', () => {
    const bad = {
      ...validContent,
      last_session: {
        ...validContent.last_session,
        action_items: [
          {
            id: '22222222-2222-2222-2222-222222222222',
            text: 'x',
            status: 'in_progress',
          },
        ],
      },
    };
    expect(CoachBriefContentSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects minutes_until_session as a string', () => {
    expect(
      CoachBriefContentSchema.safeParse({
        ...validContent,
        minutes_until_session: '47',
      }).success
    ).toBe(false);
  });
});

describe('CoachBriefPatchSchema', () => {
  it('accepts a single editable field', () => {
    expect(
      CoachBriefPatchSchema.safeParse({ ai_prep_note: 'rewritten' }).success
    ).toBe(true);
  });

  it('accepts a key_theme patch', () => {
    expect(
      CoachBriefPatchSchema.safeParse({ key_theme: 'New theme' }).success
    ).toBe(true);
  });

  it('rejects an empty patch', () => {
    expect(CoachBriefPatchSchema.safeParse({}).success).toBe(false);
  });

  it('rejects unknown fields silently (strips) but needs one known field', () => {
    expect(
      CoachBriefPatchSchema.safeParse({ unknown_field: 'x' }).success
    ).toBe(false);
  });
});
