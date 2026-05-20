/**
 * Unit tests — Solis prep-intent detection (Story 6.4)
 */

import { detectPrepIntent } from '../intent-detection';

const clients = [
  { id: 'c1', name: 'Sarah Chen' },
  { id: 'c2', name: 'Michael Brown' },
];

describe('detectPrepIntent — negative cases', () => {
  it('returns isPrep=false for a normal question', () => {
    expect(detectPrepIntent('What did Sarah commit to?', clients).isPrep).toBe(
      false
    );
  });

  it('returns isPrep=false for empty query', () => {
    expect(detectPrepIntent('', clients).isPrep).toBe(false);
  });

  it('does not trigger on the word "prepared" alone', () => {
    expect(
      detectPrepIntent('Is Sarah prepared for the review?', clients).isPrep
    ).toBe(false);
  });
});

describe('detectPrepIntent — positive cases', () => {
  it('matches "prep me for" + first name', () => {
    const r = detectPrepIntent('prep me for Sarah', clients);
    expect(r.isPrep).toBe(true);
    expect(r.matchedClient?.id).toBe('c1');
  });

  it('matches "prepare me for" + full name with trailing words', () => {
    const r = detectPrepIntent('prepare me for Michael Brown today', clients);
    expect(r.matchedClient?.id).toBe('c2');
  });

  it('matches "brief me on" and stops at punctuation', () => {
    const r = detectPrepIntent('brief me on Sarah.', clients);
    expect(r.matchedClient?.id).toBe('c1');
  });

  it('is case-insensitive', () => {
    const r = detectPrepIntent('PREP FOR sarah', clients);
    expect(r.matchedClient?.id).toBe('c1');
  });
});

describe('detectPrepIntent — ambiguous', () => {
  it('flags prep intent with no match when client is unknown', () => {
    const r = detectPrepIntent('prep me for Jordan', clients);
    expect(r.isPrep).toBe(true);
    expect(r.matchedClient).toBeUndefined();
    expect(r.candidates).toEqual([]);
  });

  it('returns multiple candidates on a first-name collision', () => {
    const twoSarahs = [
      { id: 'c1', name: 'Sarah Chen' },
      { id: 'c3', name: 'Sarah Lee' },
    ];
    const r = detectPrepIntent('prep for Sarah', twoSarahs);
    expect(r.matchedClient).toBeUndefined();
    expect(r.candidates).toHaveLength(2);
  });
});
