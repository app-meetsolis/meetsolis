/**
 * TagInput Component Tests
 * Story 2.5: Client Tags & Labels - Task 9
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TagInput } from '../TagInput';
import { Client } from '@meetsolis/shared';

// Mock dependencies
jest.mock('use-debounce', () => ({
  useDebounce: (value: any) => [value, () => {}],
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockClients: Client[] = [
  {
    id: '1',
    user_id: 'user1',
    name: 'Client A',
    company: 'Company A',
    role: null,
    email: null,
    phone: null,
    website: null,
    linkedin_url: null,
    tags: ['VIP', 'Active'],
    status: 'active',
    overview: null,
    research_data: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_meeting_at: null,
  },
  {
    id: '2',
    user_id: 'user1',
    name: 'Client B',
    company: 'Company B',
    role: null,
    email: null,
    phone: null,
    website: null,
    linkedin_url: null,
    tags: ['High Priority'],
    status: 'active',
    overview: null,
    research_data: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_meeting_at: null,
  },
];

describe('TagInput', () => {
  const defaultProps = {
    tags: [],
    onTagsChange: jest.fn(),
    clients: mockClients,
    maxTags: 3,
    tier: 'free' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Display', () => {
    it('should render tag input field', () => {
      render(<TagInput {...defaultProps} />);
      expect(screen.getByPlaceholderText('Add tag...')).toBeInTheDocument();
    });

    it('should show tag counter for free tier', () => {
      render(<TagInput {...defaultProps} tags={['VIP', 'Active']} />);
      expect(screen.getByText('2/3 tags')).toBeInTheDocument();
    });

    it('should show tag counter for pro tier', () => {
      render(
        <TagInput {...defaultProps} tags={['VIP']} tier="pro" maxTags={50} />
      );
      expect(screen.getByText('1 tags')).toBeInTheDocument();
    });

    it('should display current tags as TagPill components', () => {
      render(<TagInput {...defaultProps} tags={['VIP', 'Active']} />);
      expect(screen.getByText('VIP')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Adding tags', () => {
    it('should call onTagsChange when Enter pressed with valid tag', () => {
      const onTagsChange = jest.fn();
      render(<TagInput {...defaultProps} onTagsChange={onTagsChange} />);

      const input = screen.getByPlaceholderText('Add tag...');
      fireEvent.change(input, { target: { value: 'New Tag' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onTagsChange).toHaveBeenCalledWith(['New Tag']);
    });

    it('should sanitize and trim tag input', () => {
      const onTagsChange = jest.fn();
      render(<TagInput {...defaultProps} onTagsChange={onTagsChange} />);

      const input = screen.getByPlaceholderText('Add tag...');
      fireEvent.change(input, { target: { value: '  Trimmed Tag  ' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onTagsChange).toHaveBeenCalledWith(['Trimmed Tag']);
    });

    it('should prevent adding duplicate tags', async () => {
      const { toast } = require('sonner');
      render(<TagInput {...defaultProps} tags={['VIP']} />);

      const input = screen.getByPlaceholderText('Add tag...');
      fireEvent.change(input, { target: { value: 'VIP' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Tag already added');
      });
    });
  });

  describe('Removing tags', () => {
    it('should remove tag when TagPill onRemove called', () => {
      const onTagsChange = jest.fn();
      render(
        <TagInput
          {...defaultProps}
          tags={['VIP', 'Active']}
          onTagsChange={onTagsChange}
        />
      );

      // Find remove button for VIP tag
      const removeButton = screen.getByLabelText('Remove VIP');
      fireEvent.click(removeButton);

      expect(onTagsChange).toHaveBeenCalledWith(['Active']);
    });

    it('should remove last tag when Backspace pressed on empty input', () => {
      const onTagsChange = jest.fn();
      render(
        <TagInput
          {...defaultProps}
          tags={['VIP', 'Active']}
          onTagsChange={onTagsChange}
        />
      );

      const input = screen.getByPlaceholderText('Add tag...');
      fireEvent.keyDown(input, { key: 'Backspace' });

      expect(onTagsChange).toHaveBeenCalledWith(['VIP']);
    });

    it('should not remove tag when Backspace pressed with text in input', () => {
      const onTagsChange = jest.fn();
      render(
        <TagInput
          {...defaultProps}
          tags={['VIP']}
          onTagsChange={onTagsChange}
        />
      );

      const input = screen.getByPlaceholderText('Add tag...');
      fireEvent.change(input, { target: { value: 'text' } });
      fireEvent.keyDown(input, { key: 'Backspace' });

      expect(onTagsChange).not.toHaveBeenCalled();
    });
  });

  describe('Tier limit enforcement', () => {
    it('should prevent adding tags beyond free tier limit', async () => {
      const { toast } = require('sonner');
      render(
        <TagInput {...defaultProps} tags={['VIP', 'Active', 'High Priority']} />
      );

      const input = screen.getByPlaceholderText(/Maximum tags reached/);
      expect(input).toBeDisabled();
    });

    it('should show error when trying to add 4th tag on free tier', async () => {
      const { toast } = require('sonner');
      render(
        <TagInput
          {...defaultProps}
          tags={['VIP', 'Active', 'High Priority']}
          maxTags={3}
        />
      );

      const input = screen.getByPlaceholderText(/Maximum tags reached/);
      expect(input).toBeDisabled();

      // Should show upgrade message
      expect(
        screen.getByText(/Upgrade to Pro for 50 tags per client/i)
      ).toBeInTheDocument();
    });

    it('should allow more tags on pro tier', () => {
      render(
        <TagInput
          {...defaultProps}
          tags={['Tag1', 'Tag2', 'Tag3']}
          tier="pro"
          maxTags={50}
        />
      );

      const input = screen.getByPlaceholderText('Add tag...');
      expect(input).not.toBeDisabled();
    });
  });

  describe('Tag validation', () => {
    it('should reject tags longer than 20 characters', async () => {
      const { toast } = require('sonner');
      render(<TagInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Add tag...');
      fireEvent.change(input, {
        target: { value: 'ThisTagIsWayTooLongToBeValid' },
      });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Invalid tag format')
        );
      });
    });

    it('should reject tags with special characters', async () => {
      const { toast } = require('sonner');
      render(<TagInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Add tag...');
      fireEvent.change(input, { target: { value: 'Tag@#$%' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Invalid tag format')
        );
      });
    });

    it('should accept valid tags with spaces and hyphens', () => {
      const onTagsChange = jest.fn();
      render(<TagInput {...defaultProps} onTagsChange={onTagsChange} />);

      const input = screen.getByPlaceholderText('Add tag...');
      fireEvent.change(input, { target: { value: 'High-Priority Client' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onTagsChange).toHaveBeenCalledWith(['High-Priority Client']);
    });
  });

  describe('XSS Prevention', () => {
    it('should sanitize malicious script tags', async () => {
      const onTagsChange = jest.fn();
      render(<TagInput {...defaultProps} onTagsChange={onTagsChange} />);

      const input = screen.getByPlaceholderText('Add tag...');
      fireEvent.change(input, {
        target: { value: '<script>alert("xss")</script>' },
      });
      fireEvent.keyDown(input, { key: 'Enter' });

      // Should not call onTagsChange with script tag
      expect(onTagsChange).not.toHaveBeenCalled();
    });

    it('should sanitize HTML entities', () => {
      const onTagsChange = jest.fn();
      render(<TagInput {...defaultProps} onTagsChange={onTagsChange} />);

      const input = screen.getByPlaceholderText('Add tag...');
      fireEvent.change(input, { target: { value: '<div>test</div>' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      // After sanitization, should be empty or "test"
      expect(onTagsChange).not.toHaveBeenCalledWith(['<div>test</div>']);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on input', () => {
      render(<TagInput {...defaultProps} />);
      const input = screen.getByPlaceholderText('Add tag...');
      expect(input).toHaveAttribute('aria-label', 'Add tags');
    });

    it('should have aria-autocomplete on input', () => {
      render(<TagInput {...defaultProps} />);
      const input = screen.getByPlaceholderText('Add tag...');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('should show upgrade message for free tier when limit reached', () => {
      render(
        <TagInput {...defaultProps} tags={['VIP', 'Active', 'High Priority']} />
      );
      expect(
        screen.getByText(/Upgrade to Pro for 50 tags per client/i)
      ).toBeInTheDocument();
    });
  });
});
