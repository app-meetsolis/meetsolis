/**
 * Unit tests — Coach Brief content composition (Story 6.4)
 */

import { buildBriefContent, dbStatusToBrief } from '../build-content';
import type { BriefContext } from '../fetch-context';

describe('dbStatusToBrief', () => {
  it('maps completed -> done', () => {
    expect(dbStatusToBrief('completed')).toBe('done');
  });

  it('maps pending / in_progress -> open', () => {
    expect(dbStatusToBrief('pending')).toBe('open');
    expect(dbStatusToBrief('in_progress')).toBe('open');
  });
});

const baseCtx: BriefContext = {
  client: {
    id: 'cl1',
    name: 'Sarah Chen',
    goal: 'Lead with less control',
    notes: '',
    coachNotes: 'Ask about the board meeting',
  },
  lastSession: {
    id: 's1',
    date: '2026-05-04',
    summary: 'Worked on delegation.',
    keyTopics: ['Delegation', 'Trust'],
  },
  lastSessionWeeksAgo: 2,
  lastSessionActionItems: [
    { id: 'a1', text: 'Draft OKRs', status: 'pending' },
    { id: 'a2', text: 'Email VP', status: 'completed' },
  ],
  openActionItems: [{ id: 'a1', text: 'Draft OKRs' }],
  recentSessions: [
    {
      id: 's1',
      date: '2026-05-04',
      summary: 'Worked on delegation.',
      keyTopics: ['Delegation'],
    },
  ],
  breakthroughs: [
    { session_id: 's0', date: '2026-03-12', summary: 'Big realization.' },
  ],
  isFirstSession: false,
};

describe('buildBriefContent', () => {
  it('composes a standard brief', () => {
    const content = buildBriefContent({
      ctx: baseCtx,
      aiPrepNote: 'A specific prep note.',
      suggestedQuestions: [],
      minutesUntilSession: 47,
    });

    expect(content.client_name).toBe('Sarah Chen');
    expect(content.minutes_until_session).toBe(47);
    expect(content.last_session?.key_theme).toBe('Delegation');
    expect(content.last_session?.weeks_ago).toBe(2);
    expect(content.last_session?.action_items).toEqual([
      { id: 'a1', text: 'Draft OKRs', status: 'open' },
      { id: 'a2', text: 'Email VP', status: 'done' },
    ]);
    expect(content.coach_open_questions).toBe('Ask about the board meeting');
    expect(content.is_first_session).toBe(false);
    expect(content.edited_fields).toEqual([]);
  });

  it('composes a first-session brief with null last_session', () => {
    const content = buildBriefContent({
      ctx: {
        ...baseCtx,
        lastSession: null,
        lastSessionActionItems: [],
        recentSessions: [],
        breakthroughs: [],
        isFirstSession: true,
      },
      aiPrepNote: 'First-session note.',
      suggestedQuestions: ['What does success look like?'],
      minutesUntilSession: null,
    });

    expect(content.last_session).toBeNull();
    expect(content.is_first_session).toBe(true);
    expect(content.suggested_questions).toEqual([
      'What does success look like?',
    ]);
    expect(content.minutes_until_session).toBeNull();
  });
});
