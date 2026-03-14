import { parseSessionSummary } from '../summarize';

describe('parseSessionSummary', () => {
  const validInput = JSON.stringify({
    title: 'Session 1 — Goal Setting',
    summary: 'Client explored career transition goals.',
    key_topics: ['career', 'transition', 'goals'],
    action_items: [
      { description: 'Update CV by Friday', assigned_to: 'client' },
      { description: 'Send resource list', assigned_to: 'coach' },
    ],
  });

  it('parses valid JSON correctly', () => {
    const result = parseSessionSummary(validInput);
    expect(result.title).toBe('Session 1 — Goal Setting');
    expect(result.summary).toBe('Client explored career transition goals.');
    expect(result.key_topics).toEqual(['career', 'transition', 'goals']);
    expect(result.action_items).toHaveLength(2);
    expect(result.action_items[0].assigned_to).toBe('client');
    expect(result.action_items[1].assigned_to).toBe('coach');
  });

  it('throws on invalid JSON', () => {
    expect(() => parseSessionSummary('not json')).toThrow(
      'AI returned invalid JSON'
    );
  });

  it('throws on missing title', () => {
    const input = JSON.stringify({
      summary: 'x',
      key_topics: [],
      action_items: [],
    });
    expect(() => parseSessionSummary(input)).toThrow(
      'missing required field: title'
    );
  });

  it('throws on missing summary', () => {
    const input = JSON.stringify({
      title: 'x',
      key_topics: [],
      action_items: [],
    });
    expect(() => parseSessionSummary(input)).toThrow(
      'missing required field: summary'
    );
  });

  it('throws on invalid assigned_to', () => {
    const input = JSON.stringify({
      title: 'x',
      summary: 'y',
      key_topics: [],
      action_items: [{ description: 'do something', assigned_to: 'manager' }],
    });
    expect(() => parseSessionSummary(input)).toThrow(
      "must be 'coach' or 'client'"
    );
  });

  it('converts key_topics to strings', () => {
    const input = JSON.stringify({
      title: 'x',
      summary: 'y',
      key_topics: [1, 2, 3],
      action_items: [],
    });
    const result = parseSessionSummary(input);
    expect(result.key_topics).toEqual(['1', '2', '3']);
  });
});
