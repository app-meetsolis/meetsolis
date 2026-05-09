import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NoveraPricing from '../NoveraPricing';
import NoveraFAQ from '../NoveraFAQ';

// Mock IntersectionObserver (not available in jsdom)
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
global.IntersectionObserver = jest.fn().mockImplementation(cb => {
  cb([{ isIntersecting: true }]);
  return { observe: mockObserve, disconnect: mockDisconnect };
});

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(() => ({ isSignedIn: false })),
}));

// Mock fetch
global.fetch = jest.fn();

describe('NoveraPricing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Free and Pro tiers', () => {
    render(<NoveraPricing />);
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('does not render Teams tier', () => {
    render(<NoveraPricing />);
    expect(screen.queryByText('Teams')).not.toBeInTheDocument();
    expect(screen.queryByText('Custom')).not.toBeInTheDocument();
  });

  it('shows monthly prices by default', () => {
    render(<NoveraPricing />);
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('$99')).toBeInTheDocument();
  });

  it('switches to yearly price on toggle', () => {
    render(<NoveraPricing />);
    const toggle = screen.getByRole('button', { name: /toggle billing/i });
    fireEvent.click(toggle);
    expect(screen.getByText('$79')).toBeInTheDocument();
    expect(
      screen.getByText('$948 billed annually · Save $240')
    ).toBeInTheDocument();
  });

  it('Free CTA links to /sign-up', () => {
    render(<NoveraPricing />);
    const freeLink = screen.getByRole('link', { name: /start for free/i });
    expect(freeLink).toHaveAttribute('href', '/sign-up');
  });

  it('Pro CTA redirects to /sign-up when signed out', async () => {
    const { useAuth } = jest.requireMock('@clerk/nextjs') as {
      useAuth: jest.Mock;
    };
    useAuth.mockReturnValue({ isSignedIn: false });
    const assignSpy = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { href: '', assign: assignSpy },
      writable: true,
    });

    render(<NoveraPricing />);
    const proCTA = screen.getByRole('button', { name: /get started/i });
    fireEvent.click(proCTA);
    expect(window.location.href).toBe('/sign-up');
  });

  it('Pro CTA calls checkout API when signed in', async () => {
    const { useAuth } = jest.requireMock('@clerk/nextjs') as {
      useAuth: jest.Mock;
    };
    useAuth.mockReturnValue({ isSignedIn: true });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: 'https://checkout.dodo.com/test' }),
    });

    render(<NoveraPricing />);
    const proCTA = screen.getByRole('button', { name: /upgrade to pro/i });
    fireEvent.click(proCTA);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/billing/checkout',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ plan: 'monthly' }),
        })
      );
    });
  });

  it('passes annual plan to checkout when yearly toggle active', async () => {
    const { useAuth } = jest.requireMock('@clerk/nextjs') as {
      useAuth: jest.Mock;
    };
    useAuth.mockReturnValue({ isSignedIn: true });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: 'https://checkout.dodo.com/annual' }),
    });

    render(<NoveraPricing />);
    const toggle = screen.getByRole('button', { name: /toggle billing/i });
    fireEvent.click(toggle);

    const proCTA = screen.getByRole('button', { name: /upgrade to pro/i });
    fireEvent.click(proCTA);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/billing/checkout',
        expect.objectContaining({
          body: JSON.stringify({ plan: 'annual' }),
        })
      );
    });
  });
});

describe('NoveraFAQ', () => {
  it('renders at least 6 FAQ items covering required topics', () => {
    render(<NoveraFAQ />);
    expect(screen.getByText(/What is MeetSolis/i)).toBeInTheDocument();
    expect(screen.getByText(/private and secure/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel anytime/i)).toBeInTheDocument();
    expect(screen.getByText(/refund policy/i)).toBeInTheDocument();
    expect(screen.getByText(/downgrade from Pro/i)).toBeInTheDocument();
    expect(screen.getByText(/free plan include/i)).toBeInTheDocument();
  });

  it('refund answer contains 14-day and email address', () => {
    render(<NoveraFAQ />);
    // Open the refund FAQ item
    const refundQ = screen.getByText(/refund policy/i);
    fireEvent.click(refundQ.closest('[class*="rounded-lg"]')!);
    expect(screen.getByText(/14-day/i)).toBeInTheDocument();
    expect(screen.getByText(/hari@meetsolis\.com/i)).toBeInTheDocument();
  });

  it('does not mention free trial', () => {
    render(<NoveraFAQ />);
    expect(screen.queryByText(/free trial/i)).not.toBeInTheDocument();
  });

  it('does not contain external links in answers', () => {
    render(<NoveraFAQ />);
    const links = screen.queryAllByRole('link');
    // Only allowed link is the "Contact us" CTA — no external answer links
    links.forEach(link => {
      const href = link.getAttribute('href') ?? '';
      expect(href.startsWith('http')).toBe(false);
    });
  });
});
