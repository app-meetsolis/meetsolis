/**
 * Unit tests — Coach Brief countdown formatting (Story 6.4)
 */

import { formatCountdown, isBriefRecoverable } from '../format-countdown';

const NOW = new Date('2026-05-19T12:00:00Z');
const at = (mins: number) => new Date(NOW.getTime() + mins * 60_000);

describe('formatCountdown', () => {
  it('shows minutes when under an hour away', () => {
    expect(formatCountdown(at(47), NOW)).toBe('in 47 minutes');
  });

  it('shows "in 1 hour" between 61 and 119 minutes', () => {
    expect(formatCountdown(at(90), NOW)).toBe('in 1 hour');
  });

  it('pluralises hours at 120+ minutes', () => {
    expect(formatCountdown(at(150), NOW)).toBe('in 2 hours');
  });

  it('says "starts now" within ±1 minute', () => {
    expect(formatCountdown(at(0), NOW)).toBe('starts now');
    expect(formatCountdown(at(1), NOW)).toBe('starts now');
    expect(formatCountdown(at(-1), NOW)).toBe('starts now');
  });

  it('says "started N min ago" up to 30 minutes past', () => {
    expect(formatCountdown(at(-5), NOW)).toBe('started 5 min ago');
    expect(formatCountdown(at(-30), NOW)).toBe('started 30 min ago');
  });

  it('says "session ended" beyond 30 minutes past', () => {
    expect(formatCountdown(at(-45), NOW)).toBe('session ended');
  });
});

describe('isBriefRecoverable', () => {
  it('is recoverable for upcoming sessions', () => {
    expect(isBriefRecoverable(at(60), NOW)).toBe(true);
  });

  it('is recoverable up to 2 hours after start', () => {
    expect(isBriefRecoverable(at(-119), NOW)).toBe(true);
  });

  it('is not recoverable beyond 2 hours past', () => {
    expect(isBriefRecoverable(at(-121), NOW)).toBe(false);
  });
});
