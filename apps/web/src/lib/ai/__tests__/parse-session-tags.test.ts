/**
 * Story 7.7 — parseSessionTags unit tests.
 *
 * Validates that the AI response parser:
 * - Filters out tags outside the SESSION_TAGS enum
 * - Lowercases + trims
 * - Dedupes
 * - Caps at 2
 * - Falls back to ['goal-setting'] on empty/invalid input (never throws on bad tags)
 * - Throws on missing `tags` field (genuine schema violation)
 */

import { parseSessionTags } from '../summarize';

describe('parseSessionTags', () => {
  it('returns valid tags verbatim', () => {
    const raw = JSON.stringify({ tags: ['breakthrough'] });
    expect(parseSessionTags(raw)).toEqual({ tags: ['breakthrough'] });
  });

  it('accepts 2 valid tags', () => {
    const raw = JSON.stringify({ tags: ['milestone', 'breakthrough'] });
    expect(parseSessionTags(raw)).toEqual({
      tags: ['milestone', 'breakthrough'],
    });
  });

  it('caps at 2 tags', () => {
    const raw = JSON.stringify({
      tags: ['breakthrough', 'stuck', 'milestone'],
    });
    const result = parseSessionTags(raw);
    expect(result.tags.length).toBe(2);
    expect(result.tags).toEqual(['breakthrough', 'stuck']);
  });

  it('filters out tags outside the enum', () => {
    const raw = JSON.stringify({
      tags: ['nonsense', 'breakthrough', 'invalid'],
    });
    expect(parseSessionTags(raw)).toEqual({ tags: ['breakthrough'] });
  });

  it('lowercases + trims tag strings', () => {
    const raw = JSON.stringify({ tags: ['  Breakthrough  ', 'STUCK'] });
    expect(parseSessionTags(raw)).toEqual({
      tags: ['breakthrough', 'stuck'],
    });
  });

  it('dedupes tags', () => {
    const raw = JSON.stringify({
      tags: ['breakthrough', 'breakthrough', 'stuck'],
    });
    expect(parseSessionTags(raw)).toEqual({
      tags: ['breakthrough', 'stuck'],
    });
  });

  it('falls back to goal-setting when all tags are invalid', () => {
    const raw = JSON.stringify({ tags: ['random', 'broken'] });
    expect(parseSessionTags(raw)).toEqual({ tags: ['goal-setting'] });
  });

  it('falls back to goal-setting on empty tags array', () => {
    const raw = JSON.stringify({ tags: [] });
    expect(parseSessionTags(raw)).toEqual({ tags: ['goal-setting'] });
  });

  it('throws on missing tags field', () => {
    expect(() => parseSessionTags(JSON.stringify({}))).toThrow(
      /missing required field: tags/i
    );
  });

  it('throws on invalid JSON', () => {
    expect(() => parseSessionTags('not json')).toThrow(/invalid JSON/i);
  });

  it('ignores non-string entries in tags', () => {
    const raw = JSON.stringify({ tags: [123, 'breakthrough', null] });
    expect(parseSessionTags(raw)).toEqual({ tags: ['breakthrough'] });
  });
});
