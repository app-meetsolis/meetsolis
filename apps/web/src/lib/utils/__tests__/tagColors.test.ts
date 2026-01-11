/**
 * Tag Colors Utility Tests
 * Story 2.5: Client Tags & Labels - Task 9
 */

import { getTagColor, TAG_COLORS, PREDEFINED_TAGS } from '../tagColors';

describe('tagColors', () => {
  describe('getTagColor', () => {
    it('should return a color from TAG_COLORS palette', () => {
      const color = getTagColor('VIP');
      expect(TAG_COLORS).toContain(color);
    });

    it('should return consistent color for same tag', () => {
      const tag = 'High Priority';
      const color1 = getTagColor(tag);
      const color2 = getTagColor(tag);
      const color3 = getTagColor(tag);

      expect(color1).toBe(color2);
      expect(color2).toBe(color3);
    });

    it('should return different colors for different tags', () => {
      // Due to hash collision possibility, we test multiple tags
      const tags = ['VIP', 'Active', 'On Hold', 'Inactive', 'High Priority'];
      const colors = tags.map(tag => getTagColor(tag));

      // At least some tags should have different colors
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBeGreaterThan(1);
    });

    it('should handle empty string', () => {
      const color = getTagColor('');
      expect(TAG_COLORS).toContain(color);
    });

    it('should handle special characters', () => {
      const color = getTagColor('Tag!@#$%');
      expect(TAG_COLORS).toContain(color);
    });
  });

  describe('TAG_COLORS', () => {
    it('should have 8 colors', () => {
      expect(TAG_COLORS).toHaveLength(8);
    });

    it('should contain valid hex colors', () => {
      TAG_COLORS.forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('PREDEFINED_TAGS', () => {
    it('should have 5 predefined tags', () => {
      expect(PREDEFINED_TAGS).toHaveLength(5);
    });

    it('should include expected tags', () => {
      expect(PREDEFINED_TAGS).toContain('VIP');
      expect(PREDEFINED_TAGS).toContain('High Priority');
      expect(PREDEFINED_TAGS).toContain('On Hold');
      expect(PREDEFINED_TAGS).toContain('Active');
      expect(PREDEFINED_TAGS).toContain('Inactive');
    });
  });
});
