import { parseSummary, parseActionItems } from '../summarize';

describe('parseSummary', () => {
  const validInput = JSON.stringify({
    summary: 'Client explored career transition goals.',
    key_topics: ['career', 'transition', 'goals'],
  });

  it('parses valid JSON correctly', () => {
    const result = parseSummary(validInput);
    expect(result.summary).toBe('Client explored career transition goals.');
    expect(result.key_topics).toEqual(['career', 'transition', 'goals']);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseSummary('not json')).toThrow('AI returned invalid JSON');
  });

  it('throws on missing summary', () => {
    const input = JSON.stringify({ key_topics: [] });
    expect(() => parseSummary(input)).toThrow(
      'missing required field: summary'
    );
  });

  it('throws on missing key_topics', () => {
    const input = JSON.stringify({ summary: 'x' });
    expect(() => parseSummary(input)).toThrow(
      'missing required field: key_topics'
    );
  });

  it('converts key_topics to strings', () => {
    const input = JSON.stringify({ summary: 'y', key_topics: [1, 2, 3] });
    const result = parseSummary(input);
    expect(result.key_topics).toEqual(['1', '2', '3']);
  });
});

describe('parseActionItems', () => {
  it('parses valid JSON correctly', () => {
    const input = JSON.stringify({
      action_items: [
        { description: 'Update CV by Friday', assigned_to: 'client' },
        { description: 'Send resource list', assigned_to: 'coach' },
      ],
    });
    const result = parseActionItems(input);
    expect(result.action_items).toHaveLength(2);
    expect(result.action_items[0].assigned_to).toBe('client');
    expect(result.action_items[1].assigned_to).toBe('coach');
  });

  it('accepts an empty action_items array', () => {
    const result = parseActionItems(JSON.stringify({ action_items: [] }));
    expect(result.action_items).toEqual([]);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseActionItems('not json')).toThrow(
      'AI returned invalid JSON'
    );
  });

  it('throws on missing action_items', () => {
    expect(() => parseActionItems(JSON.stringify({}))).toThrow(
      'missing required field: action_items'
    );
  });

  it('throws on invalid assigned_to', () => {
    const input = JSON.stringify({
      action_items: [{ description: 'do something', assigned_to: 'manager' }],
    });
    expect(() => parseActionItems(input)).toThrow(
      "must be 'coach' or 'client'"
    );
  });

  it('throws on missing description', () => {
    const input = JSON.stringify({
      action_items: [{ assigned_to: 'client' }],
    });
    expect(() => parseActionItems(input)).toThrow('description missing');
  });
});
