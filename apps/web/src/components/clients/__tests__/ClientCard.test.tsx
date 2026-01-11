/**
 * ClientCard Component Tests
 * Story 2.2: Client Dashboard UI - Task 10: Component Tests
 */

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Client } from '@meetsolis/shared';
import { ClientCard } from '../ClientCard';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockClient: Client = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'Acme Corp',
  company: 'Acme Inc',
  role: 'CEO',
  email: 'ceo@acme.com',
  phone: '+1234567890',
  website: 'https://acme.com',
  linkedin_url: 'https://linkedin.com/company/acme',
  tags: ['VIP'],
  status: 'active',
  overview: null,
  research_data: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  last_meeting_at: '2026-01-05T00:00:00Z',
};

describe('ClientCard', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders client card with client data', () => {
    render(<ClientCard client={mockClient} />);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('CEO at Acme Inc')).toBeInTheDocument();
  });

  it('renders role without company when company is null', () => {
    const clientWithoutCompany = { ...mockClient, company: null };
    render(<ClientCard client={clientWithoutCompany} />);

    expect(screen.getByText('CEO')).toBeInTheDocument();
  });

  it('renders "No role specified" when both role and company are null', () => {
    const clientWithoutRoleOrCompany = {
      ...mockClient,
      role: null,
      company: null,
    };
    render(<ClientCard client={clientWithoutRoleOrCompany} />);

    expect(screen.getByText('No role specified')).toBeInTheDocument();
  });

  it('formats last meeting date correctly', () => {
    render(<ClientCard client={mockClient} />);

    // Should show "Last meeting: X days ago" format
    expect(screen.getByText(/Last meeting:/)).toBeInTheDocument();
  });

  it('shows "No meetings yet" when last_meeting_at is null', () => {
    const clientWithoutMeeting = { ...mockClient, last_meeting_at: null };
    render(<ClientCard client={clientWithoutMeeting} />);

    expect(screen.getByText('No meetings yet')).toBeInTheDocument();
  });

  it('navigates to client detail page on click', async () => {
    const user = userEvent.setup();
    render(<ClientCard client={mockClient} />);

    const card = screen.getByRole('button');
    await user.click(card);

    expect(mockPush).toHaveBeenCalledWith(
      '/clients/123e4567-e89b-12d3-a456-426614174000'
    );
  });

  it('navigates on Enter key press', async () => {
    const user = userEvent.setup();
    render(<ClientCard client={mockClient} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');

    expect(mockPush).toHaveBeenCalledWith(
      '/clients/123e4567-e89b-12d3-a456-426614174000'
    );
  });

  it('navigates on Space key press', async () => {
    const user = userEvent.setup();
    render(<ClientCard client={mockClient} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard(' ');

    expect(mockPush).toHaveBeenCalledWith(
      '/clients/123e4567-e89b-12d3-a456-426614174000'
    );
  });
});
