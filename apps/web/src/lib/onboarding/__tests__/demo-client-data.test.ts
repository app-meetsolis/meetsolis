/**
 * Story 7.4 — demo-client-data shape sanity checks.
 *
 * Keeps the quarterly content review honest by catching structural drift —
 * wrong session count, wrong assignee enum, dates that are no longer in the
 * expected ranges relative to the seed time.
 */

import {
  DEMO_CLIENT_PROFILE,
  DEMO_ACTION_ITEMS,
  buildDemoSessions,
  buildDemoAIStrip,
  buildDemoBriefContent,
  demoDates,
} from '../demo-client-data';
import { AIIntelligenceStripSchema } from '@meetsolis/shared';

describe('DEMO_CLIENT_PROFILE', () => {
  it('has the locked persona fields', () => {
    expect(DEMO_CLIENT_PROFILE.name).toBe('Alex Rivera');
    expect(DEMO_CLIENT_PROFILE.role).toBe('VP Engineering');
    expect(DEMO_CLIENT_PROFILE.company).toBeTruthy();
    expect(DEMO_CLIENT_PROFILE.goal.length).toBeGreaterThan(20);
  });
});

describe('buildDemoSessions', () => {
  const seedAt = new Date('2026-06-01T12:00:00Z');
  const sessions = buildDemoSessions(seedAt);

  it('produces exactly 4 sessions per BRAINSTORM §5', () => {
    expect(sessions).toHaveLength(4);
  });

  it('sessions span ~3 months with the latest ~2 weeks before seedAt', () => {
    const dates = sessions.map(s => new Date(s.session_date).getTime());
    const oldest = new Date(dates[0]).getTime();
    const newest = new Date(dates[3]).getTime();
    const monthsBetween = (newest - oldest) / (30 * 24 * 60 * 60 * 1000);
    expect(monthsBetween).toBeGreaterThan(2.5);
    expect(monthsBetween).toBeLessThan(3.5);

    const weeksBeforeSeed =
      (seedAt.getTime() - newest) / (7 * 24 * 60 * 60 * 1000);
    expect(weeksBeforeSeed).toBeGreaterThan(1.5);
    expect(weeksBeforeSeed).toBeLessThan(2.5);
  });

  it('every session has a title, summary, transcript and key_topics', () => {
    sessions.forEach(s => {
      expect(s.title.length).toBeGreaterThan(10);
      expect(s.summary.length).toBeGreaterThan(50);
      expect(s.transcript_text.length).toBeGreaterThan(300);
      expect(s.key_topics.length).toBeGreaterThan(0);
    });
  });

  it('avoids dated cultural / public-figure references', () => {
    const blocklist = [
      'COVID',
      'pandemic',
      'OpenAI',
      'Elon',
      'ChatGPT',
      'TikTok',
    ];
    sessions.forEach(s => {
      const haystack = `${s.title} ${s.summary} ${s.transcript_text}`;
      blocklist.forEach(banned => {
        expect(haystack.toLowerCase()).not.toContain(banned.toLowerCase());
      });
    });
  });
});

describe('DEMO_ACTION_ITEMS', () => {
  it('has at least one completed and one open item — coach feels both states', () => {
    const completed = DEMO_ACTION_ITEMS.filter(i => i.completed).length;
    const open = DEMO_ACTION_ITEMS.filter(i => !i.completed).length;
    expect(completed).toBeGreaterThan(0);
    expect(open).toBeGreaterThan(0);
  });

  it('mixes coach and client assignees', () => {
    const coach = DEMO_ACTION_ITEMS.filter(i => i.assignee === 'coach').length;
    const client = DEMO_ACTION_ITEMS.filter(
      i => i.assignee === 'client'
    ).length;
    expect(coach).toBeGreaterThan(0);
    expect(client).toBeGreaterThan(0);
  });

  it('all sessionIndex values are 0..3', () => {
    DEMO_ACTION_ITEMS.forEach(i => {
      expect([0, 1, 2, 3]).toContain(i.sessionIndex);
    });
  });
});

describe('buildDemoAIStrip', () => {
  it('returns a strip that conforms to AIIntelligenceStripSchema', () => {
    const strip = buildDemoAIStrip();
    const parsed = AIIntelligenceStripSchema.safeParse(strip);
    expect(parsed.success).toBe(true);
  });

  it('all strip fields are non-empty and specific', () => {
    const strip = buildDemoAIStrip();
    expect(strip.recurring_theme.length).toBeGreaterThan(10);
    expect(strip.theme_frequency).toMatch(/\d/); // contains a number
    expect(strip.recent_breakthrough.length).toBeGreaterThan(10);
    expect(strip.current_focus.length).toBeGreaterThan(10);
  });
});

describe('buildDemoBriefContent', () => {
  it('shapes match CoachBriefContent (Story 6.4)', () => {
    const c = buildDemoBriefContent();
    expect(c.client_name).toBe('Alex Rivera');
    expect(c.minutes_until_session).toBeNull(); // manual brief
    expect(c.is_first_session).toBe(false);
    expect(c.last_session).not.toBeNull();
    expect(c.past_breakthroughs.length).toBeGreaterThanOrEqual(1);
  });

  it('action_items in last_session use ids passed in', () => {
    const fakeItems = [
      { id: 'item-a', text: 'open thing', completed: false },
      { id: 'item-b', text: 'done thing', completed: true },
    ];
    const c = buildDemoBriefContent(
      new Date(),
      'session-3-uuid',
      'session-4-uuid',
      fakeItems
    );
    expect(c.last_session!.session_id).toBe('session-4-uuid');
    expect(c.last_session!.action_items.map(a => a.id)).toEqual([
      'item-a',
      'item-b',
    ]);
    expect(c.last_session!.action_items.map(a => a.status)).toEqual([
      'open',
      'done',
    ]);
  });
});

describe('demoDates', () => {
  it('returns YYYY-MM-DD strings for all 5 dates', () => {
    const d = demoDates(new Date('2026-06-01T00:00:00Z'));
    Object.values(d).forEach(date => {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
