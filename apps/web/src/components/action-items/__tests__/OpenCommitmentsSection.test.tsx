/**
 * Story 7.6 — RTL coverage for OpenCommitmentsSection (carry-forward).
 *
 * - Hidden entirely when there are no open commitments
 * - Renders items + count + "Open X sessions" indicator when present
 */

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OpenCommitmentsSection } from '@/components/sessions/OpenCommitmentsSection';
import type { OpenActionItem } from '@meetsolis/shared';

jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));

function renderSection() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <OpenCommitmentsSection
        clientId="11111111-1111-1111-1111-111111111111"
        currentSessionId="22222222-2222-2222-2222-222222222222"
      />
    </QueryClientProvider>
  );
}

const ITEM: OpenActionItem = {
  id: 'a1',
  description: 'Delegate budget review to Marcus',
  assignee: 'client',
  source_session_id: 's4',
  source_session_date: '2026-04-12',
  source_session_title: 'Session 4',
  open_session_count: 3,
  client_id: 'c1',
  client_name: 'Marcus',
};

afterEach(() => jest.restoreAllMocks());

it('renders nothing when there are no open commitments', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ items: [] }),
  }) as any;

  const { container } = renderSection();
  await waitFor(() =>
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'exclude_session=22222222-2222-2222-2222-222222222222'
      )
    )
  );
  expect(container).toBeEmptyDOMElement();
});

it('renders open commitments with count and carry-forward indicator', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ items: [ITEM] }),
  }) as any;

  renderSection();

  expect(
    await screen.findByText('Delegate budget review to Marcus')
  ).toBeInTheDocument();
  expect(
    screen.getByText('Open Commitments from Past Sessions')
  ).toBeInTheDocument();
  expect(screen.getByText('Open 3 sessions')).toBeInTheDocument();
});
