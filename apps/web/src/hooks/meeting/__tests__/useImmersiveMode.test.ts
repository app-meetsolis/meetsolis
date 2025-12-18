/**
 * useImmersiveMode Hook Tests
 * Tests fullscreen functionality and control visibility
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useImmersiveMode } from '../useImmersiveMode';

// Mock document fullscreen API
const mockRequestFullscreen = jest.fn().mockResolvedValue(undefined);
const mockExitFullscreen = jest.fn().mockResolvedValue(undefined);

Object.defineProperty(document, 'documentElement', {
  writable: true,
  value: {
    requestFullscreen: mockRequestFullscreen,
  },
});

Object.defineProperty(document, 'exitFullscreen', {
  writable: true,
  value: mockExitFullscreen,
});

Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null,
});

// Mock event listeners
const mockAddEventListener = jest.spyOn(document, 'addEventListener');
const mockRemoveEventListener = jest.spyOn(document, 'removeEventListener');

describe('useImmersiveMode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial state', () => {
    it('should initialize with immersive mode off and controls visible', () => {
      const { result } = renderHook(() => useImmersiveMode());

      expect(result.current.isImmersive).toBe(false);
      expect(result.current.showControls).toBe(true);
    });

    it('should register fullscreen event listeners', () => {
      renderHook(() => useImmersiveMode());

      expect(mockAddEventListener).toHaveBeenCalledWith(
        'fullscreenchange',
        expect.any(Function)
      );
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'webkitfullscreenchange',
        expect.any(Function)
      );
    });
  });

  describe('Enter immersive mode', () => {
    it('should call requestFullscreen when entering immersive mode', () => {
      const { result } = renderHook(() => useImmersiveMode());

      act(() => {
        result.current.enterImmersive();
      });

      expect(mockRequestFullscreen).toHaveBeenCalled();
    });

    it('should toggle from off to on', () => {
      const { result } = renderHook(() => useImmersiveMode());

      act(() => {
        result.current.toggleImmersive();
      });

      expect(mockRequestFullscreen).toHaveBeenCalled();
    });
  });

  describe('Exit immersive mode', () => {
    it('should call exitFullscreen when exiting immersive mode', () => {
      const { result } = renderHook(() => useImmersiveMode());

      // First enter immersive mode
      act(() => {
        result.current.enterImmersive();
      });

      // Simulate fullscreen state
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        value: document.documentElement,
      });

      act(() => {
        result.current.exitImmersive();
      });

      expect(mockExitFullscreen).toHaveBeenCalled();
    });
  });

  describe('Control auto-hide', () => {
    it('should hide controls after 2 seconds of inactivity in immersive mode', async () => {
      const { result } = renderHook(() => useImmersiveMode());

      // Enter immersive mode
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        value: document.documentElement,
      });

      // Simulate entering fullscreen (update isImmersive)
      act(() => {
        result.current.enterImmersive();
      });

      // Trigger mouse movement
      act(() => {
        result.current.handleMouseMove();
      });

      // Controls should be visible
      expect(result.current.showControls).toBe(true);

      // Fast-forward time by 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Controls should now be hidden
      await waitFor(() => {
        expect(result.current.showControls).toBe(false);
      });
    });

    it('should show controls immediately on mouse movement', () => {
      const { result } = renderHook(() => useImmersiveMode());

      // Enter immersive mode and hide controls
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        value: document.documentElement,
      });

      act(() => {
        result.current.enterImmersive();
      });

      // Fast-forward to hide controls
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Mouse movement should show controls
      act(() => {
        result.current.handleMouseMove();
      });

      expect(result.current.showControls).toBe(true);
    });

    it('should reset hide timer on subsequent mouse movements', () => {
      const { result } = renderHook(() => useImmersiveMode());

      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        value: document.documentElement,
      });

      act(() => {
        result.current.enterImmersive();
      });

      // First mouse movement
      act(() => {
        result.current.handleMouseMove();
      });

      // Advance 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Second mouse movement (resets timer)
      act(() => {
        result.current.handleMouseMove();
      });

      // Advance another 1 second (total 2s from first, but only 1s from second)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Controls should still be visible
      expect(result.current.showControls).toBe(true);

      // Advance final 1 second (2s from second movement)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Now controls should be hidden
      expect(result.current.showControls).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const { unmount } = renderHook(() => useImmersiveMode());

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'fullscreenchange',
        expect.any(Function)
      );
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'webkitfullscreenchange',
        expect.any(Function)
      );
    });

    it('should clear timeout on unmount', () => {
      const { result, unmount } = renderHook(() => useImmersiveMode());

      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        value: document.documentElement,
      });

      act(() => {
        result.current.enterImmersive();
        result.current.handleMouseMove();
      });

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('Disabled state', () => {
    it('should not enter immersive mode when disabled', () => {
      const { result } = renderHook(() => useImmersiveMode(false));

      act(() => {
        result.current.toggleImmersive();
      });

      expect(mockRequestFullscreen).not.toHaveBeenCalled();
    });
  });
});
