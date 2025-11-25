import { renderHook, act } from '@testing-library/react';
import { usePushToTalk } from '../usePushToTalk';

// Mock react-hotkeys-hook
const mockUseHotkeys = jest.fn();
jest.mock('react-hotkeys-hook', () => ({
  useHotkeys: (
    keys: string,
    callback: (e: any) => void,
    options?: any,
    deps?: any[]
  ) => {
    mockUseHotkeys(keys, callback, options, deps);
    return null;
  },
}));

describe('usePushToTalk', () => {
  const mockOnPushStart = jest.fn();
  const mockOnPushEnd = jest.fn();
  const mockOnToggleMode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with enabled state from props', () => {
      const { result } = renderHook(() =>
        usePushToTalk({
          enabled: true,
          onPushStart: mockOnPushStart,
          onPushEnd: mockOnPushEnd,
        })
      );

      expect(result.current.isPushToTalkMode).toBe(true);
      expect(result.current.isPushToTalkActive).toBe(false);
    });

    it('should initialize with disabled state', () => {
      const { result } = renderHook(() =>
        usePushToTalk({
          enabled: false,
          onPushStart: mockOnPushStart,
          onPushEnd: mockOnPushEnd,
        })
      );

      expect(result.current.isPushToTalkMode).toBe(false);
      expect(result.current.isPushToTalkActive).toBe(false);
    });

    it('should update mode when enabled prop changes', () => {
      const { result, rerender } = renderHook(
        ({ enabled }) =>
          usePushToTalk({
            enabled,
            onPushStart: mockOnPushStart,
            onPushEnd: mockOnPushEnd,
          }),
        { initialProps: { enabled: false } }
      );

      expect(result.current.isPushToTalkMode).toBe(false);

      rerender({ enabled: true });

      expect(result.current.isPushToTalkMode).toBe(true);
    });
  });

  describe('Mode Toggle', () => {
    it('should toggle push-to-talk mode', () => {
      const { result } = renderHook(() =>
        usePushToTalk({
          enabled: false,
          onToggleMode: mockOnToggleMode,
        })
      );

      expect(result.current.isPushToTalkMode).toBe(false);

      act(() => {
        result.current.togglePushToTalkMode();
      });

      expect(result.current.isPushToTalkMode).toBe(true);
      expect(mockOnToggleMode).toHaveBeenCalledWith(true);

      act(() => {
        result.current.togglePushToTalkMode();
      });

      expect(result.current.isPushToTalkMode).toBe(false);
      expect(mockOnToggleMode).toHaveBeenCalledWith(false);
    });

    it('should set push-to-talk mode directly', () => {
      const { result } = renderHook(() =>
        usePushToTalk({
          enabled: false,
          onToggleMode: mockOnToggleMode,
        })
      );

      act(() => {
        result.current.setPushToTalkMode(true);
      });

      expect(result.current.isPushToTalkMode).toBe(true);
      expect(mockOnToggleMode).toHaveBeenCalledWith(true);

      act(() => {
        result.current.setPushToTalkMode(false);
      });

      expect(result.current.isPushToTalkMode).toBe(false);
      expect(mockOnToggleMode).toHaveBeenCalledWith(false);
    });
  });

  describe('Space Key Handling', () => {
    it('should register Space key for keydown and keyup', () => {
      renderHook(() =>
        usePushToTalk({
          enabled: true,
          onPushStart: mockOnPushStart,
          onPushEnd: mockOnPushEnd,
        })
      );

      // Should register two hotkeys: keydown and keyup
      const spaceKeydownRegistration = mockUseHotkeys.mock.calls.find(
        call => call[0] === 'space' && call[2]?.keydown === true
      );
      const spaceKeyupRegistration = mockUseHotkeys.mock.calls.find(
        call => call[0] === 'space' && call[2]?.keyup === true
      );

      expect(spaceKeydownRegistration).toBeDefined();
      expect(spaceKeyupRegistration).toBeDefined();
    });

    it('should have enableOnFormTags disabled for Space key', () => {
      renderHook(() =>
        usePushToTalk({
          enabled: true,
          onPushStart: mockOnPushStart,
          onPushEnd: mockOnPushEnd,
        })
      );

      const spaceKeyRegistrations = mockUseHotkeys.mock.calls.filter(
        call => call[0] === 'space'
      );

      spaceKeyRegistrations.forEach(registration => {
        expect(registration[2]).toEqual(
          expect.objectContaining({ enableOnFormTags: false })
        );
      });
    });

    it('should activate push-to-talk on Space keydown when mode enabled', () => {
      const { result } = renderHook(() =>
        usePushToTalk({
          enabled: true,
          onPushStart: mockOnPushStart,
          onPushEnd: mockOnPushEnd,
        })
      );

      // Get the keydown callback
      const keydownCallback = mockUseHotkeys.mock.calls.find(
        call => call[0] === 'space' && call[2]?.keydown === true
      )?.[1];

      expect(keydownCallback).toBeDefined();

      // Simulate Space keydown
      const mockEvent = {
        preventDefault: jest.fn(),
        target: document.createElement('div'),
      };

      act(() => {
        keydownCallback?.(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(result.current.isPushToTalkActive).toBe(true);
      expect(mockOnPushStart).toHaveBeenCalled();
    });

    it('should deactivate push-to-talk on Space keyup when mode enabled', () => {
      const { result } = renderHook(() =>
        usePushToTalk({
          enabled: true,
          onPushStart: mockOnPushStart,
          onPushEnd: mockOnPushEnd,
        })
      );

      // Activate first
      const keydownCallback = mockUseHotkeys.mock.calls.find(
        call => call[0] === 'space' && call[2]?.keydown === true
      )?.[1];

      const mockEventDown = {
        preventDefault: jest.fn(),
        target: document.createElement('div'),
      };

      act(() => {
        keydownCallback?.(mockEventDown);
      });

      expect(result.current.isPushToTalkActive).toBe(true);

      // Now release
      const keyupCallback = mockUseHotkeys.mock.calls.find(
        call => call[0] === 'space' && call[2]?.keyup === true
      )?.[1];

      const mockEventUp = {
        preventDefault: jest.fn(),
        target: document.createElement('div'),
      };

      act(() => {
        keyupCallback?.(mockEventUp);
      });

      expect(mockEventUp.preventDefault).toHaveBeenCalled();
      expect(result.current.isPushToTalkActive).toBe(false);
      expect(mockOnPushEnd).toHaveBeenCalled();
    });

    it('should not activate when push-to-talk mode is disabled', () => {
      const { result } = renderHook(() =>
        usePushToTalk({
          enabled: false,
          onPushStart: mockOnPushStart,
          onPushEnd: mockOnPushEnd,
        })
      );

      const keydownCallback = mockUseHotkeys.mock.calls.find(
        call => call[0] === 'space' && call[2]?.keydown === true
      )?.[1];

      const mockEvent = {
        preventDefault: jest.fn(),
        target: document.createElement('div'),
      };

      act(() => {
        keydownCallback?.(mockEvent);
      });

      expect(result.current.isPushToTalkActive).toBe(false);
      expect(mockOnPushStart).not.toHaveBeenCalled();
    });
  });

  describe('Form Element Protection', () => {
    it('should not activate when Space pressed in INPUT element', () => {
      const { result } = renderHook(() =>
        usePushToTalk({
          enabled: true,
          onPushStart: mockOnPushStart,
          onPushEnd: mockOnPushEnd,
        })
      );

      const keydownCallback = mockUseHotkeys.mock.calls.find(
        call => call[0] === 'space' && call[2]?.keydown === true
      )?.[1];

      const inputElement = document.createElement('input');
      const mockEvent = {
        preventDefault: jest.fn(),
        target: inputElement,
      };

      act(() => {
        keydownCallback?.(mockEvent);
      });

      expect(result.current.isPushToTalkActive).toBe(false);
      expect(mockOnPushStart).not.toHaveBeenCalled();
    });

    it('should not activate when Space pressed in TEXTAREA element', () => {
      const { result } = renderHook(() =>
        usePushToTalk({
          enabled: true,
          onPushStart: mockOnPushStart,
          onPushEnd: mockOnPushEnd,
        })
      );

      const keydownCallback = mockUseHotkeys.mock.calls.find(
        call => call[0] === 'space' && call[2]?.keydown === true
      )?.[1];

      const textareaElement = document.createElement('textarea');
      const mockEvent = {
        preventDefault: jest.fn(),
        target: textareaElement,
      };

      act(() => {
        keydownCallback?.(mockEvent);
      });

      expect(result.current.isPushToTalkActive).toBe(false);
      expect(mockOnPushStart).not.toHaveBeenCalled();
    });

    it('should not activate when Space pressed in contentEditable element', () => {
      const { result } = renderHook(() =>
        usePushToTalk({
          enabled: true,
          onPushStart: mockOnPushStart,
          onPushEnd: mockOnPushEnd,
        })
      );

      const keydownCallback = mockUseHotkeys.mock.calls.find(
        call => call[0] === 'space' && call[2]?.keydown === true
      )?.[1];

      const divElement = document.createElement('div');
      divElement.contentEditable = 'true';
      const mockEvent = {
        preventDefault: jest.fn(),
        target: divElement,
      };

      act(() => {
        keydownCallback?.(mockEvent);
      });

      expect(result.current.isPushToTalkActive).toBe(false);
      expect(mockOnPushStart).not.toHaveBeenCalled();
    });

    it('should activate when Space pressed in non-form elements', () => {
      const { result } = renderHook(() =>
        usePushToTalk({
          enabled: true,
          onPushStart: mockOnPushStart,
          onPushEnd: mockOnPushEnd,
        })
      );

      const keydownCallback = mockUseHotkeys.mock.calls.find(
        call => call[0] === 'space' && call[2]?.keydown === true
      )?.[1];

      const divElement = document.createElement('div');
      const mockEvent = {
        preventDefault: jest.fn(),
        target: divElement,
      };

      act(() => {
        keydownCallback?.(mockEvent);
      });

      expect(result.current.isPushToTalkActive).toBe(true);
      expect(mockOnPushStart).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should deactivate push-to-talk on unmount if active', () => {
      const { result, unmount } = renderHook(() =>
        usePushToTalk({
          enabled: true,
          onPushStart: mockOnPushStart,
          onPushEnd: mockOnPushEnd,
        })
      );

      // Activate push-to-talk
      const keydownCallback = mockUseHotkeys.mock.calls.find(
        call => call[0] === 'space' && call[2]?.keydown === true
      )?.[1];

      const mockEvent = {
        preventDefault: jest.fn(),
        target: document.createElement('div'),
      };

      act(() => {
        keydownCallback?.(mockEvent);
      });

      expect(result.current.isPushToTalkActive).toBe(true);

      // Unmount
      unmount();

      expect(mockOnPushEnd).toHaveBeenCalled();
    });

    it('should not call onPushEnd on unmount if not active', () => {
      const { unmount } = renderHook(() =>
        usePushToTalk({
          enabled: true,
          onPushStart: mockOnPushStart,
          onPushEnd: mockOnPushEnd,
        })
      );

      unmount();

      // onPushEnd should not be called if push-to-talk was never activated
      expect(mockOnPushEnd).not.toHaveBeenCalled();
    });
  });

  describe('Callbacks', () => {
    it('should work without optional callbacks', () => {
      const { result } = renderHook(() =>
        usePushToTalk({
          enabled: true,
        })
      );

      expect(() => {
        act(() => {
          result.current.togglePushToTalkMode();
        });
      }).not.toThrow();

      const keydownCallback = mockUseHotkeys.mock.calls.find(
        call => call[0] === 'space' && call[2]?.keydown === true
      )?.[1];

      const mockEvent = {
        preventDefault: jest.fn(),
        target: document.createElement('div'),
      };

      expect(() => {
        act(() => {
          keydownCallback?.(mockEvent);
        });
      }).not.toThrow();
    });

    it('should call onToggleMode when mode changes', () => {
      const { result } = renderHook(() =>
        usePushToTalk({
          enabled: false,
          onToggleMode: mockOnToggleMode,
        })
      );

      act(() => {
        result.current.togglePushToTalkMode();
      });

      expect(mockOnToggleMode).toHaveBeenCalledWith(true);
      expect(mockOnToggleMode).toHaveBeenCalledTimes(1);
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent state during rapid key presses', () => {
      const { result } = renderHook(() =>
        usePushToTalk({
          enabled: true,
          onPushStart: mockOnPushStart,
          onPushEnd: mockOnPushEnd,
        })
      );

      const keydownCallback = mockUseHotkeys.mock.calls.find(
        call => call[0] === 'space' && call[2]?.keydown === true
      )?.[1];
      const keyupCallback = mockUseHotkeys.mock.calls.find(
        call => call[0] === 'space' && call[2]?.keyup === true
      )?.[1];

      const mockEvent = {
        preventDefault: jest.fn(),
        target: document.createElement('div'),
      };

      // Rapid press/release
      act(() => {
        keydownCallback?.(mockEvent); // Press
        keyupCallback?.(mockEvent); // Release
        keydownCallback?.(mockEvent); // Press
        keyupCallback?.(mockEvent); // Release
      });

      expect(result.current.isPushToTalkActive).toBe(false);
      expect(mockOnPushStart).toHaveBeenCalledTimes(2);
      expect(mockOnPushEnd).toHaveBeenCalledTimes(2);
    });
  });
});
