/**
 * Story 7.7 — RTL coverage for ClientHeader.
 *
 * Critical paths:
 * - Renders name, role, company, goal, stats bar
 * - Avatar shows monogram fallback when no avatar_url
 * - Avatar shows <img> when avatar_url present
 * - Demo badge shown only when is_demo
 * - Together stat computed from start_date; hidden when null
 * - Next stat shows date when nextSessionAt present, "—" when null
 * - Inline-edit on name PUTs /api/clients/[id] with new name
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClientHeader } from '../ClientHeader';
import type { Client } from '@meetsolis/shared';

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

function buildClient(overrides: Partial<Client> = {}): Client {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    user_id: 'user-uuid',
    name: 'Alex Rivera',
    company: 'Northridge Logistics',
    role: 'VP Engineering',
    email: null,
    goal: 'Build executive presence',
    start_date: null,
    website: null,
    notes: null,
    coach_notes: null,
    is_demo: false,
    ai_intelligence_strip: null,
    ai_intelligence_strip_overrides: {},
    industry: null,
    company_size: null,
    about_notes: null,
    avatar_url: null,
    last_session_at: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  } as Client;
}

function renderHeader(
  client: Client,
  opts: { sessionCount?: number; nextSessionAt?: string | null } = {}
) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ClientHeader
        client={client}
        sessionCount={opts.sessionCount ?? 0}
        nextSessionAt={opts.nextSessionAt ?? null}
      />
    </QueryClientProvider>
  );
}

describe('ClientHeader', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ id: '1', name: 'Alex Rivera' }),
      } as Response)
    ) as unknown as typeof fetch;
  });

  it('renders name, role, company, goal', () => {
    renderHeader(buildClient());
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText('VP Engineering')).toBeInTheDocument();
    expect(screen.getByText('Northridge Logistics')).toBeInTheDocument();
    expect(screen.getByText('Build executive presence')).toBeInTheDocument();
  });

  it('renders monogram (initials AR) when avatar_url is null', () => {
    renderHeader(buildClient({ avatar_url: null }));
    // Monogram is the text content of the avatar button
    const avatarBtn = screen.getByRole('button', { name: /upload avatar/i });
    expect(avatarBtn.textContent).toMatch(/AR/);
    // No img element
    expect(avatarBtn.querySelector('img')).toBeNull();
  });

  it('renders <img> when avatar_url is set', () => {
    renderHeader(
      buildClient({ avatar_url: 'https://example.com/avatar.jpg?t=1' })
    );
    const avatarBtn = screen.getByRole('button', { name: /upload avatar/i });
    const img = avatarBtn.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toMatch(/avatar\.jpg/);
  });

  it('shows Demo badge when is_demo is true', () => {
    renderHeader(buildClient({ is_demo: true }));
    expect(screen.getByText('Demo')).toBeInTheDocument();
  });

  it('hides Demo badge when is_demo is false', () => {
    renderHeader(buildClient({ is_demo: false }));
    expect(screen.queryByText('Demo')).toBeNull();
  });

  it('computes Together months from start_date', () => {
    // 90 days ago → 3 months
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400_000)
      .toISOString()
      .substring(0, 10);
    renderHeader(buildClient({ start_date: ninetyDaysAgo }));
    expect(screen.getByText(/3 months/i)).toBeInTheDocument();
    expect(screen.getByText(/together/i)).toBeInTheDocument();
  });

  it('hides Together stat when start_date is null', () => {
    renderHeader(buildClient({ start_date: null }));
    expect(screen.queryByText(/together/i)).toBeNull();
  });

  it('shows session count', () => {
    renderHeader(buildClient(), { sessionCount: 7 });
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText(/sessions/i)).toBeInTheDocument();
  });

  it('shows Next: — when nextSessionAt is null', () => {
    renderHeader(buildClient(), { nextSessionAt: null });
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows Next: date when nextSessionAt is set', () => {
    renderHeader(buildClient(), { nextSessionAt: '2026-12-15T10:00:00Z' });
    expect(screen.getByText(/dec 15/i)).toBeInTheDocument();
  });

  it('inline-editing name PUTs /api/clients/[id] with new name', async () => {
    renderHeader(buildClient());
    // Click the name to enter edit mode
    const nameBtn = screen.getByRole('button', { name: /edit client name/i });
    fireEvent.click(nameBtn);
    // Type new name + Enter
    const input = screen.getByRole('textbox', { name: /client name/i });
    fireEvent.change(input, { target: { value: 'Alex Updated' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      const putCall = (global.fetch as jest.Mock).mock.calls.find(
        c => c[1]?.method === 'PUT'
      );
      expect(putCall).toBeDefined();
      expect(putCall[1].body).toContain('Alex Updated');
    });
  });
});
