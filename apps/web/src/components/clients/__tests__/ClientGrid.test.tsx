/**
 * ClientGrid Component Tests
 * Story 2.2: Client Dashboard UI - Task 10: Component Tests
 */

import { render, screen } from '@testing-library/react';
import { Client } from '@meetsolis/shared';
import { ClientGrid } from '../ClientGrid';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockClients: Client[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Acme Corp',
    company: 'Acme Inc',
    role: 'CEO',
    email: 'ceo@acme.com',
    phone: null,
    website: null,
    linkedin_url: null,
    tags: [],
    status: 'active',
    overview: null,
    research_data: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    last_meeting_at: null,
  },
  {
    id: '223e4567-e89b-12d3-a456-426614174000',
    user_id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'TechStart Inc',
    company: 'TechStart',
    role: 'CTO',
    email: 'cto@techstart.com',
    phone: null,
    website: null,
    linkedin_url: null,
    tags: [],
    status: 'active',
    overview: null,
    research_data: null,
    created_at: '2026-01-02T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
    last_meeting_at: null,
  },
  {
    id: '323e4567-e89b-12d3-a456-426614174000',
    user_id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Global Solutions',
    company: 'Global Inc',
    role: 'VP Sales',
    email: 'vp@global.com',
    phone: null,
    website: null,
    linkedin_url: null,
    tags: [],
    status: 'active',
    overview: null,
    research_data: null,
    created_at: '2026-01-03T00:00:00Z',
    updated_at: '2026-01-03T00:00:00Z',
    last_meeting_at: null,
  },
];

describe('ClientGrid', () => {
  it('renders multiple client cards', () => {
    render(<ClientGrid clients={mockClients} />);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('TechStart Inc')).toBeInTheDocument();
    expect(screen.getByText('Global Solutions')).toBeInTheDocument();
  });

  it('renders correct number of cards', () => {
    render(<ClientGrid clients={mockClients} />);

    // Get all buttons (each card is a button)
    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(3);
  });

  it('renders empty grid when no clients', () => {
    const { container } = render(<ClientGrid clients={[]} />);

    // Grid should exist but have no cards
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid?.children).toHaveLength(0);
  });

  it('applies responsive grid classes', () => {
    const { container } = render(<ClientGrid clients={mockClients} />);

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });
});
