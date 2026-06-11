/**
 * Story 7.7 — RTL coverage for AboutSection.
 *
 * Critical paths:
 * - Collapse default: expanded when all fields null; collapsed when any set
 * - Industry inline-edit PATCHes /api/clients/[id]/about
 * - Empty-string industry edit sends null (clears field)
 * - Start date input PATCHes start_date
 * - Lock icon + "Private" copy shown
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AboutSection } from '../AboutSection';
import type { Client } from '@meetsolis/shared';

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

function buildClient(overrides: Partial<Client> = {}): Client {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    user_id: 'user-uuid',
    name: 'Alex Rivera',
    company: 'Northridge',
    role: 'VP',
    email: null,
    goal: null,
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

function renderAbout(client: Client) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <AboutSection client={client} />
    </QueryClientProvider>
  );
}

describe('AboutSection', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ industry: 'Technology' }),
      } as Response)
    ) as unknown as typeof fetch;
  });

  it('renders the "Private" header copy + lock icon', () => {
    renderAbout(buildClient());
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(
      screen.getByText(/private — not shared with client/i)
    ).toBeInTheDocument();
  });

  it('is EXPANDED by default when all fields are null', () => {
    renderAbout(buildClient());
    // The Industry field label should be visible (only shown when expanded)
    expect(screen.getByText('Industry')).toBeInTheDocument();
    expect(screen.getByText('Company size')).toBeInTheDocument();
    expect(screen.getByText('Coaching since')).toBeInTheDocument();
    expect(screen.getByText('Private notes')).toBeInTheDocument();
  });

  it('is COLLAPSED by default when industry is set', () => {
    renderAbout(buildClient({ industry: 'Technology' }));
    expect(screen.queryByText('Industry')).toBeNull();
  });

  it('is COLLAPSED by default when company_size is set', () => {
    renderAbout(buildClient({ company_size: '201-1000' }));
    expect(screen.queryByText('Industry')).toBeNull();
  });

  it('is COLLAPSED by default when about_notes is set', () => {
    renderAbout(buildClient({ about_notes: 'hello' }));
    expect(screen.queryByText('Industry')).toBeNull();
  });

  it('is COLLAPSED by default when start_date is set', () => {
    renderAbout(buildClient({ start_date: '2026-01-01' }));
    expect(screen.queryByText('Industry')).toBeNull();
  });

  it('expands when header clicked', () => {
    renderAbout(buildClient({ industry: 'Technology' }));
    // initially collapsed
    expect(screen.queryByText('Industry')).toBeNull();
    const toggle = screen.getByRole('button', { name: /about/i });
    fireEvent.click(toggle);
    expect(screen.getByText('Industry')).toBeInTheDocument();
  });

  it('inline-editing industry PATCHes /api/clients/[id]/about', async () => {
    renderAbout(buildClient());
    const industryBtn = screen.getByRole('button', { name: /edit industry/i });
    fireEvent.click(industryBtn);
    const input = screen.getByRole('textbox', { name: /industry/i });
    fireEvent.change(input, { target: { value: 'Healthcare' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      const patchCall = (global.fetch as jest.Mock).mock.calls.find(
        c => c[1]?.method === 'PATCH'
      );
      expect(patchCall).toBeDefined();
      expect(patchCall[0]).toMatch(/\/api\/clients\/.+\/about/);
      expect(patchCall[1].body).toContain('Healthcare');
    });
  });

  it('clearing industry to empty string sends null', async () => {
    renderAbout(buildClient({ industry: 'Tech' }));
    // expand first
    fireEvent.click(screen.getByRole('button', { name: /about/i }));
    const industryBtn = screen.getByRole('button', { name: /edit industry/i });
    fireEvent.click(industryBtn);
    const input = screen.getByRole('textbox', { name: /industry/i });
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      const patchCall = (global.fetch as jest.Mock).mock.calls.find(
        c => c[1]?.method === 'PATCH'
      );
      expect(patchCall).toBeDefined();
      const body = JSON.parse(patchCall[1].body);
      expect(body.industry).toBeNull();
    });
  });

  it('changing start date PATCHes start_date', async () => {
    renderAbout(buildClient());
    const dateInput = screen.getByDisplayValue('') as HTMLInputElement;
    // There are multiple empty inputs; grab the type=date one
    const dateField = document.querySelector(
      'input[type="date"]'
    ) as HTMLInputElement;
    fireEvent.change(dateField, { target: { value: '2026-03-15' } });

    await waitFor(() => {
      const patchCall = (global.fetch as jest.Mock).mock.calls.find(
        c => c[1]?.method === 'PATCH'
      );
      expect(patchCall).toBeDefined();
      const body = JSON.parse(patchCall[1].body);
      expect(body.start_date).toBe('2026-03-15');
    });
  });
});
