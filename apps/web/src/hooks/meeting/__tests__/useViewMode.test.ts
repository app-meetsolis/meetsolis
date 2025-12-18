/**
 * useViewMode Hook Tests
 * Tests auto-detection logic for view modes based on participant count
 */

import { renderHook, act } from '@testing-library/react';
import { useViewMode } from '../useViewMode';

describe('useViewMode', () => {
  describe('Auto-detection logic', () => {
    it('should return gallery view for 1 participant', () => {
      const { result } = renderHook(() =>
        useViewMode({ participantCount: 1, allowManualOverride: true })
      );

      expect(result.current.viewMode).toBe('gallery');
      expect(result.current.autoDetectedMode).toBe('gallery');
      expect(result.current.isManualOverride).toBe(false);
    });

    it('should return speaker view for 2 participants', () => {
      const { result } = renderHook(() =>
        useViewMode({ participantCount: 2, allowManualOverride: true })
      );

      expect(result.current.viewMode).toBe('speaker');
      expect(result.current.autoDetectedMode).toBe('speaker');
      expect(result.current.isManualOverride).toBe(false);
    });

    it('should return gallery view for 3+ participants', () => {
      const { result } = renderHook(() =>
        useViewMode({ participantCount: 5, allowManualOverride: true })
      );

      expect(result.current.viewMode).toBe('gallery');
      expect(result.current.autoDetectedMode).toBe('gallery');
      expect(result.current.isManualOverride).toBe(false);
    });
  });

  describe('Manual override', () => {
    it('should allow manual override when enabled', () => {
      const { result } = renderHook(() =>
        useViewMode({ participantCount: 2, allowManualOverride: true })
      );

      // Auto-detected: speaker (2 participants)
      expect(result.current.viewMode).toBe('speaker');

      // Manual override to gallery
      act(() => {
        result.current.setViewMode('gallery');
      });

      expect(result.current.viewMode).toBe('gallery');
      expect(result.current.isManualOverride).toBe(true);
    });

    it('should not allow manual override when disabled', () => {
      const { result } = renderHook(() =>
        useViewMode({ participantCount: 2, allowManualOverride: false })
      );

      // Auto-detected: speaker (2 participants)
      expect(result.current.viewMode).toBe('speaker');

      // Try to override (should be ignored)
      act(() => {
        result.current.setViewMode('gallery');
      });

      // Should still be speaker (auto-detected)
      expect(result.current.viewMode).toBe('speaker');
      expect(result.current.isManualOverride).toBe(false);
    });

    it('should revert to auto-detect when participant count changes', () => {
      const { result, rerender } = renderHook(
        ({ count }) =>
          useViewMode({ participantCount: count, allowManualOverride: true }),
        { initialProps: { count: 2 } }
      );

      // Initial: 2 participants = speaker
      expect(result.current.viewMode).toBe('speaker');

      // Manual override to gallery
      act(() => {
        result.current.setViewMode('gallery');
      });
      expect(result.current.viewMode).toBe('gallery');

      // Participant count changes to 3
      rerender({ count: 3 });

      // Should revert to auto-detected gallery
      expect(result.current.viewMode).toBe('gallery');
      expect(result.current.isManualOverride).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle 0 participants as gallery', () => {
      const { result } = renderHook(() =>
        useViewMode({ participantCount: 0, allowManualOverride: true })
      );

      expect(result.current.viewMode).toBe('gallery');
    });

    it('should handle large participant counts', () => {
      const { result } = renderHook(() =>
        useViewMode({ participantCount: 100, allowManualOverride: true })
      );

      expect(result.current.viewMode).toBe('gallery');
    });
  });

  describe('Toggle view mode', () => {
    it('should toggle between speaker and gallery', () => {
      const { result } = renderHook(() =>
        useViewMode({ participantCount: 2, allowManualOverride: true })
      );

      // Initial: speaker (auto-detected)
      expect(result.current.viewMode).toBe('speaker');

      // Toggle to gallery
      act(() => {
        result.current.setViewMode('gallery');
      });
      expect(result.current.viewMode).toBe('gallery');

      // Toggle back to speaker
      act(() => {
        result.current.setViewMode('speaker');
      });
      expect(result.current.viewMode).toBe('speaker');
    });
  });
});
