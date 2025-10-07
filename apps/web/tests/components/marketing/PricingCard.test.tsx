import { render, screen } from '@testing-library/react';
import { PricingCard } from '@/components/marketing/PricingCard';

describe('PricingCard Component', () => {
  const mockProps = {
    name: 'Professional',
    price: '$15',
    period: '/month',
    features: ['Unlimited meetings', 'AI summaries', 'Screen sharing'],
    cta: 'Get Started',
    popular: true,
  };

  it('renders the pricing tier name', () => {
    render(<PricingCard {...mockProps} />);
    expect(screen.getByText('Professional')).toBeInTheDocument();
  });

  it('renders the price', () => {
    render(<PricingCard {...mockProps} />);
    expect(screen.getByText('$15')).toBeInTheDocument();
    expect(screen.getByText('/month')).toBeInTheDocument();
  });

  it('renders all features', () => {
    render(<PricingCard {...mockProps} />);
    expect(screen.getAllByText(/unlimited meetings/i).length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByText(/ai summaries/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/screen sharing/i).length).toBeGreaterThan(0);
  });

  it('renders the CTA button', () => {
    render(<PricingCard {...mockProps} />);
    expect(
      screen.getByRole('link', { name: /get started/i })
    ).toBeInTheDocument();
  });

  it('shows popular badge when popular is true', () => {
    render(<PricingCard {...mockProps} />);
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('does not show popular badge when popular is false', () => {
    render(<PricingCard {...mockProps} popular={false} />);
    expect(screen.queryByText('Most Popular')).not.toBeInTheDocument();
  });

  it('CTA links to sign-up page', () => {
    render(<PricingCard {...mockProps} />);
    const ctaLink = screen.getByRole('link', { name: /get started/i });
    expect(ctaLink).toHaveAttribute('href', '/sign-up');
  });
});
