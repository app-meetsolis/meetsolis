/**
 * SolisPanel Component Tests
 * Story 4.3: Solis UI
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SolisPanel } from '../SolisPanel';
import { toast } from 'sonner';

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => (
    <div data-testid="markdown">{children}</div>
  ),
}));

global.fetch = jest.fn();

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

const mockUsageFree = {
  tier: 'free',
  query_count: 5,
  query_limit: 75,
  transcript_count: 0,
  transcript_limit: 5,
  client_count: 1,
  client_limit: 3,
  resets_at: null,
};

const mockUsagePro = {
  tier: 'pro',
  query_count: 100,
  query_limit: 2000,
  transcript_count: 0,
  transcript_limit: 25,
  client_count: 5,
  client_limit: 999,
  resets_at: '2026-04-01T00:00:00Z',
};

const mockQueryResponse = {
  answer: '# Answer\nSome answer text',
  citations: [
    {
      session_id: 'sess-1',
      session_date: '2026-01-15T00:00:00Z',
      title: 'Goal Setting Session',
    },
  ],
};

describe('SolisPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders textarea and submit button', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/usage')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsageFree),
        });
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<SolisPanel />, { wrapper });

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /ask solis/i })
    ).toBeInTheDocument();
  });

  it('submit button disabled when input empty', () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/usage')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsageFree),
        });
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<SolisPanel />, { wrapper });

    expect(screen.getByRole('button', { name: /ask solis/i })).toBeDisabled();
  });

  it('submit button enabled when input has text', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/usage')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsageFree),
        });
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<SolisPanel />, { wrapper });

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Test query' },
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /ask solis/i })
      ).not.toBeDisabled();
    });
  });

  it('Enter key submits, Shift+Enter does not', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/usage')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsageFree),
        });
      if (url === '/api/intelligence/query')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockQueryResponse),
        });
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<SolisPanel />, { wrapper });

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test query' } });

    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

    expect(global.fetch).not.toHaveBeenCalledWith(
      '/api/intelligence/query',
      expect.anything()
    );

    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/intelligence/query',
        expect.anything()
      );
    });
  });

  it('renders global chips when no clientName prop', () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/usage')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsageFree),
        });
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<SolisPanel />, { wrapper });

    expect(
      screen.getByText(/What client has the most open action items/i)
    ).toBeInTheDocument();
  });

  it('renders client chips when clientName provided', () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/usage')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsageFree),
        });
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<SolisPanel clientName="Sarah" />, { wrapper });

    expect(
      screen.getByText(/What are Sarah's biggest challenges/i)
    ).toBeInTheDocument();
  });

  it('chip click populates input and submits', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/usage')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsageFree),
        });
      if (url === '/api/intelligence/query')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockQueryResponse),
        });
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<SolisPanel />, { wrapper });

    const chip = screen.getByText(
      /What client has the most open action items/i
    );
    fireEvent.click(chip);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/intelligence/query',
        expect.anything()
      );
    });
  });

  it('shows loading state while pending', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/usage')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsageFree),
        });
      if (url === '/api/intelligence/query') return new Promise(() => {}); // never resolves
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<SolisPanel />, { wrapper });

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test query' } });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /ask solis/i })
      ).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /ask solis/i }));

    await waitFor(() => {
      expect(screen.getByText(/Solis is thinking/i)).toBeInTheDocument();
    });
  });

  it('renders markdown answer on success', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/usage')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsageFree),
        });
      if (url === '/api/intelligence/query')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockQueryResponse),
        });
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<SolisPanel />, { wrapper });

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test query' } });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /ask solis/i })
      ).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /ask solis/i }));

    await waitFor(() => {
      expect(screen.getByTestId('markdown')).toBeInTheDocument();
    });
  });

  it('citations render as links in client mode', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/usage')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsageFree),
        });
      if (url === '/api/intelligence/query')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockQueryResponse),
        });
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<SolisPanel clientId="client-123" clientName="Sarah" />, {
      wrapper,
    });

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test query' } });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /ask solis/i })
      ).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /ask solis/i }));

    await waitFor(() => {
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute(
        'href',
        expect.stringContaining('/clients/client-123/sessions/sess-1')
      );
    });
  });

  it('citations render as plain text in global mode', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/usage')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsageFree),
        });
      if (url === '/api/intelligence/query')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockQueryResponse),
        });
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<SolisPanel />, { wrapper });

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test query' } });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /ask solis/i })
      ).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /ask solis/i }));

    await waitFor(() => {
      expect(screen.getByText(/Goal Setting Session/i)).toBeInTheDocument();
    });

    const links = screen.queryAllByRole('link');
    const sessionLink = links.find(l =>
      l.getAttribute('href')?.includes('/sessions/sess-1')
    );
    expect(sessionLink).toBeUndefined();
  });

  it('403 LIMIT_EXCEEDED opens UpgradeModal', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/usage')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsageFree),
        });
      if (url === '/api/intelligence/query')
        return Promise.resolve({
          ok: false,
          status: 403,
          json: () =>
            Promise.resolve({
              error: { code: 'LIMIT_EXCEEDED', type: 'query' },
            }),
        });
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<SolisPanel />, { wrapper });

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test query' } });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /ask solis/i })
      ).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /ask solis/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/You've reached your Solis query limit/i)
      ).toBeInTheDocument();
    });
  });

  it('non-403 error calls toast.error', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/usage')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsageFree),
        });
      if (url === '/api/intelligence/query')
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: { message: 'Server error' } }),
        });
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<SolisPanel />, { wrapper });

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test query' } });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /ask solis/i })
      ).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /ask solis/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Solis couldn't answer that. Please try again."
      );
    });
  });

  it('free tier usage counter shows correct text', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/usage')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsageFree),
        });
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<SolisPanel />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByText(/5 of 75 lifetime queries used/i)
      ).toBeInTheDocument();
    });
  });

  it('pro tier usage counter shows correct text', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/usage')
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUsagePro),
        });
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<SolisPanel />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByText(/100 of 2,000 monthly queries used/i)
      ).toBeInTheDocument();
    });
  });
});
