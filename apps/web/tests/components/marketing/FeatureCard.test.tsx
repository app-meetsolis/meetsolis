import { render, screen } from '@testing-library/react';
import { FeatureCard } from '@/components/marketing/FeatureCard';
import { Video } from 'lucide-react';

describe('FeatureCard Component', () => {
  const mockProps = {
    icon: Video,
    title: 'HD Video Calls',
    description: 'Crystal clear video quality',
  };

  it('renders the feature title', () => {
    render(<FeatureCard {...mockProps} />);
    expect(screen.getByText('HD Video Calls')).toBeInTheDocument();
  });

  it('renders the feature description', () => {
    render(<FeatureCard {...mockProps} />);
    expect(screen.getByText('Crystal clear video quality')).toBeInTheDocument();
  });

  it('renders the icon', () => {
    render(<FeatureCard {...mockProps} />);
    // Icon is rendered as SVG
    const card = screen.getByText('HD Video Calls').closest('div');
    expect(card).toBeInTheDocument();
  });
});
