import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/marketing/Hero';

describe('Hero Component', () => {
  it('renders the main heading', () => {
    render(<Hero />);
    expect(
      screen.getByRole('heading', {
        name: /professional video meetings for freelancers & agencies/i,
      })
    ).toBeInTheDocument();
  });

  it('renders the value propositions', () => {
    render(<Hero />);
    const valueProp1 = screen.getAllByText(/unlimited meetings/i);
    const valueProp2 = screen.getAllByText(/no time limits/i);
    const valueProp3 = screen.getAllByText(/no downloads required/i);
    expect(valueProp1.length).toBeGreaterThan(0);
    expect(valueProp2.length).toBeGreaterThan(0);
    expect(valueProp3.length).toBeGreaterThan(0);
  });

  it('renders CTA buttons', () => {
    render(<Hero />);
    expect(
      screen.getByRole('link', { name: /start free trial/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /watch demo/i })
    ).toBeInTheDocument();
  });

  it('CTA button links to sign-up page', () => {
    render(<Hero />);
    const ctaLink = screen.getByRole('link', { name: /start free trial/i });
    expect(ctaLink).toHaveAttribute('href', '/sign-up');
  });
});
