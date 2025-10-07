import { render, screen } from '@testing-library/react';
import { TestimonialCard } from '@/components/marketing/TestimonialCard';

describe('TestimonialCard Component', () => {
  const mockProps = {
    quote: 'MeetSolis has been a game-changer for my business.',
    author: 'Sarah Johnson',
    role: 'Marketing Consultant',
    rating: 5,
  };

  it('renders the testimonial quote', () => {
    render(<TestimonialCard {...mockProps} />);
    expect(
      screen.getByText(/meetsolis has been a game-changer/i)
    ).toBeInTheDocument();
  });

  it('renders the author name', () => {
    render(<TestimonialCard {...mockProps} />);
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
  });

  it('renders the author role', () => {
    render(<TestimonialCard {...mockProps} />);
    expect(screen.getByText('Marketing Consultant')).toBeInTheDocument();
  });

  it('renders the correct number of stars', () => {
    const { container } = render(<TestimonialCard {...mockProps} />);
    const stars = container.querySelectorAll('svg[class*="lucide-star"]');
    expect(stars).toHaveLength(5);
  });

  it('renders author initial in avatar', () => {
    render(<TestimonialCard {...mockProps} />);
    expect(screen.getByText('S')).toBeInTheDocument();
  });
});
