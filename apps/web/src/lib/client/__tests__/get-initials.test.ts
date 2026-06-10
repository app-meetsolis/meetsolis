/**
 * Story 7.7 — getInitials unit tests.
 */

import { getInitials } from '../get-initials';

describe('getInitials', () => {
  it('extracts two initials from a two-word name', () => {
    expect(getInitials('Alex Rivera')).toBe('AR');
  });

  it('uses first + last token (skips middle)', () => {
    expect(getInitials('Mary Anne Smith')).toBe('MS');
  });

  it('handles single-word names', () => {
    expect(getInitials('Mononymous')).toBe('M');
  });

  it('uppercases lowercase input', () => {
    expect(getInitials('jane doe')).toBe('JD');
  });

  it('handles hyphens', () => {
    expect(getInitials('Mary-Jane Doe')).toBe('MD');
  });

  it('handles comma-separated last-first', () => {
    expect(getInitials('Doe, Jane')).toBe('DJ');
  });

  it('trims leading + trailing whitespace', () => {
    expect(getInitials('  Alex Rivera  ')).toBe('AR');
  });

  it('handles extra internal whitespace', () => {
    expect(getInitials('Alex   Rivera')).toBe('AR');
  });

  it('returns ? for empty input', () => {
    expect(getInitials('')).toBe('?');
    expect(getInitials('   ')).toBe('?');
  });

  it('returns ? for null/undefined', () => {
    expect(getInitials(null)).toBe('?');
    expect(getInitials(undefined)).toBe('?');
  });

  it('keeps non-Latin first chars verbatim then uppercases the rest', () => {
    // The first char of "李" uppercases to itself; "Wei" -> "W"
    expect(getInitials('李 Wei')).toBe('李W');
  });
});
