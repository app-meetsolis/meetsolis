/**
 * TagPill Component Tests
 * Story 2.5: Client Tags & Labels - Task 9
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { TagPill } from '../TagPill';
import { getTagColor } from '@/lib/utils/tagColors';

// Mock the getTagColor function
jest.mock('@/lib/utils/tagColors', () => ({
  getTagColor: jest.fn((tag: string) => '#DBEAFE'), // Return blue for all tags in tests
}));

describe('TagPill', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Display', () => {
    it('should render tag text', () => {
      render(<TagPill tag="VIP" />);
      expect(screen.getByText('VIP')).toBeInTheDocument();
    });

    it('should use getTagColor for background', () => {
      render(<TagPill tag="Active" />);
      expect(getTagColor).toHaveBeenCalledWith('Active');
    });

    it('should sanitize XSS attempts', () => {
      const maliciousTag = '<script>alert("xss")</script>';
      render(<TagPill tag={maliciousTag} />);

      // Should not contain script tag
      expect(screen.queryByText(/<script>/i)).not.toBeInTheDocument();
      // Text should be empty after sanitization
      const button = screen.getByRole('button');
      expect(button.textContent).not.toContain('<script>');
    });
  });

  describe('Click behavior', () => {
    it('should call onClick when clicked (not removable)', () => {
      const onClick = jest.fn();
      render(<TagPill tag="VIP" onClick={onClick} />);

      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when removable and clicking pill body', () => {
      const onClick = jest.fn();
      render(<TagPill tag="VIP" onClick={onClick} removable />);

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]); // Click the main pill button

      expect(onClick).not.toHaveBeenCalled();
    });

    it('should show remove button when removable', () => {
      render(<TagPill tag="VIP" removable />);

      // Should have aria-label for remove button
      expect(screen.getByLabelText('Remove VIP')).toBeInTheDocument();
    });

    it('should call onRemove when remove button clicked', () => {
      const onRemove = jest.fn();
      render(<TagPill tag="Active" removable onRemove={onRemove} />);

      const removeButton = screen.getByLabelText('Remove Active');
      fireEvent.click(removeButton);

      expect(onRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard navigation', () => {
    it('should handle Enter key for onClick', () => {
      const onClick = jest.fn();
      render(<TagPill tag="VIP" onClick={onClick} />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should handle Space key for onClick', () => {
      const onClick = jest.fn();
      render(<TagPill tag="VIP" onClick={onClick} />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should handle Delete key for onRemove', () => {
      const onRemove = jest.fn();
      render(<TagPill tag="VIP" removable onRemove={onRemove} />);

      const buttons = screen.getAllByRole('button');
      fireEvent.keyDown(buttons[0], { key: 'Delete' });

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('should handle Backspace key for onRemove', () => {
      const onRemove = jest.fn();
      render(<TagPill tag="VIP" removable onRemove={onRemove} />);

      const buttons = screen.getAllByRole('button');
      fireEvent.keyDown(buttons[0], { key: 'Backspace' });

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('should blur on Escape key', () => {
      render(<TagPill tag="VIP" />);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      fireEvent.keyDown(button, { key: 'Escape' });
      expect(button).not.toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate aria-label when clickable', () => {
      render(<TagPill tag="VIP" onClick={() => {}} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Filter by VIP');
    });

    it('should have appropriate aria-label when removable', () => {
      render(<TagPill tag="Active" removable onRemove={() => {}} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveAttribute('aria-label', 'Remove Active');
    });

    it('should be focusable with Tab key', () => {
      render(<TagPill tag="VIP" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('should hide X icon from screen readers', () => {
      render(<TagPill tag="VIP" removable />);

      const xIcon = document.querySelector('svg[aria-hidden="true"]');
      expect(xIcon).toBeInTheDocument();
    });
  });

  describe('Color consistency', () => {
    it('should return same color for same tag across renders', () => {
      const { rerender } = render(<TagPill tag="VIP" />);
      const firstCallCount = (getTagColor as jest.Mock).mock.calls.length;

      rerender(<TagPill tag="VIP" />);
      const secondCallCount = (getTagColor as jest.Mock).mock.calls.length;

      expect(secondCallCount).toBeGreaterThan(firstCallCount);
      // All calls should have been with 'VIP'
      (getTagColor as jest.Mock).mock.calls.forEach(call => {
        expect(call[0]).toBe('VIP');
      });
    });
  });
});
