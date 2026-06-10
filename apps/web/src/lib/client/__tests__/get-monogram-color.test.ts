/**
 * Story 7.7 — getMonogramColor unit tests.
 */

import { MONOGRAM_COLORS, getMonogramColor } from '../get-monogram-color';

describe('getMonogramColor', () => {
  it('returns a color from the palette', () => {
    const color = getMonogramColor('Alex Rivera');
    expect(MONOGRAM_COLORS).toContain(color);
  });

  it('is deterministic for the same name', () => {
    expect(getMonogramColor('Alex Rivera')).toBe(
      getMonogramColor('Alex Rivera')
    );
  });

  it('is case-insensitive', () => {
    expect(getMonogramColor('Alex Rivera')).toBe(
      getMonogramColor('alex rivera')
    );
    expect(getMonogramColor('ALEX RIVERA')).toBe(
      getMonogramColor('Alex Rivera')
    );
  });

  it('trims whitespace before hashing', () => {
    expect(getMonogramColor('  Alex Rivera  ')).toBe(
      getMonogramColor('Alex Rivera')
    );
  });

  it('returns first palette color for empty/null/undefined', () => {
    expect(getMonogramColor('')).toBe(MONOGRAM_COLORS[0]);
    expect(getMonogramColor(null)).toBe(MONOGRAM_COLORS[0]);
    expect(getMonogramColor(undefined)).toBe(MONOGRAM_COLORS[0]);
  });

  it('distributes different names across multiple colors', () => {
    const names = [
      'Alex Rivera',
      'Jane Doe',
      'John Smith',
      'Maya Patel',
      'Carlos Lopez',
      'Wei Chen',
      'Olivia Brown',
      'Sam Lee',
    ];
    const colors = new Set(names.map(getMonogramColor));
    // Not strictly required to hit all 8, but should distribute to >1 color
    expect(colors.size).toBeGreaterThan(1);
  });
});
