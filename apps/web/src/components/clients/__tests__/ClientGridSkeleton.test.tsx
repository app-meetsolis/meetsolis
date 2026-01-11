/**
 * ClientGridSkeleton Component Tests
 * Story 2.2: Client Dashboard UI - Task 10: Component Tests
 */

import { render, screen } from '@testing-library/react';
import { ClientGridSkeleton } from '../ClientGridSkeleton';

describe('ClientGridSkeleton', () => {
  it('renders 6 skeleton cards', () => {
    const { container } = render(<ClientGridSkeleton />);

    // Count skeleton cards (each has specific className structure)
    const skeletonCards = container.querySelectorAll('.rounded-lg.bg-white');
    expect(skeletonCards).toHaveLength(6);
  });

  it('applies responsive grid classes', () => {
    const { container } = render(<ClientGridSkeleton />);

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });

  it('contains skeleton elements', () => {
    const { container } = render(<ClientGridSkeleton />);

    // Check that skeleton components are rendered
    // Skeleton components should have specific classes from Shadcn
    const skeletons = container.querySelectorAll('[class*="animate"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
