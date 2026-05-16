import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActionItemsAutoToggle } from '../ActionItemsAutoToggle';

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

function renderToggle() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <ActionItemsAutoToggle />
    </QueryClientProvider>
  );
}

describe('ActionItemsAutoToggle', () => {
  beforeEach(() => {
    global.fetch = jest.fn((_url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ auto_action_items_enabled: false }),
      });
    }) as unknown as typeof fetch;
  });

  it('renders the switch off by default', async () => {
    renderToggle();
    const sw = await screen.findByRole('switch', {
      name: /auto-generate action items/i,
    });
    expect(sw).toHaveAttribute('aria-checked', 'false');
  });

  it('PATCHes the preference when toggled on', async () => {
    renderToggle();
    const sw = await screen.findByRole('switch', {
      name: /auto-generate action items/i,
    });

    fireEvent.click(sw);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/user/preferences',
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    const patchCall = (global.fetch as jest.Mock).mock.calls.find(
      c => c[1]?.method === 'PATCH'
    );
    expect(patchCall?.[1]?.body).toContain('auto_action_items_enabled');
  });
});
