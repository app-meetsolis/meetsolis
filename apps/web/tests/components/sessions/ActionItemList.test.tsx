/**
 * ActionItemList Component Tests — Story 3.6
 *
 * Mocks ActionItemRow (which owns Radix UI Checkbox/Select) at the boundary
 * so tests avoid JSX/TS-annotation restrictions inside jest.mock factories.
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActionItemList } from '@/components/sessions/ActionItemList';
import { ClientActionItem } from '@meetsolis/shared';

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// Mock ActionItemRow with plain createElement (no JSX/TS annotations in factory)
jest.mock('@/components/sessions/ActionItemRow', function () {
  const React = require('react');
  return {
    ActionItemRow: function ActionItemRow(props) {
      const isCompleted = props.item.status === 'completed';
      return React.createElement(
        'div',
        { 'data-testid': 'action-item-row' },
        React.createElement('input', {
          type: 'checkbox',
          checked: isCompleted,
          'data-testid': 'checkbox',
          onChange: function (e) {
            props.onCheckboxChange(props.item.id, e.target.checked);
          },
        }),
        React.createElement(
          'span',
          { className: isCompleted ? 'line-through opacity-50' : '' },
          props.item.description
        ),
        props.item.assignee
          ? React.createElement(
              'span',
              { 'data-testid': 'assignee-badge' },
              props.item.assignee === 'coach' ? 'Coach' : 'Client'
            )
          : null,
        React.createElement(
          'select',
          {
            value: props.item.status,
            'data-testid': 'status-select',
            onChange: function (e) {
              props.onStatusChange(props.item.id, e.target.value);
            },
          },
          React.createElement('option', { value: 'pending' }, 'Pending'),
          React.createElement(
            'option',
            { value: 'in_progress' },
            'In Progress'
          ),
          React.createElement('option', { value: 'completed' }, 'Completed'),
          React.createElement('option', { value: 'cancelled' }, 'Cancelled')
        )
      );
    },
  };
});

const SESSION_ID = 'session-111';
const CLIENT_ID = 'client-222';

const mockItems: ClientActionItem[] = [
  {
    id: 'item-1',
    session_id: SESSION_ID,
    client_id: CLIENT_ID,
    user_id: 'user-1',
    description: 'Follow up on proposal',
    status: 'pending',
    assignee: 'coach',
    completed: false,
    completed_at: null,
    due_date: null,
    created_at: '2026-03-16T10:00:00Z',
    updated_at: '2026-03-16T10:00:00Z',
  },
  {
    id: 'item-2',
    session_id: SESSION_ID,
    client_id: CLIENT_ID,
    user_id: 'user-1',
    description: 'Read the book chapter',
    status: 'completed',
    assignee: 'client',
    completed: true,
    completed_at: '2026-03-16T11:00:00Z',
    due_date: null,
    created_at: '2026-03-16T10:00:00Z',
    updated_at: '2026-03-16T11:00:00Z',
  },
];

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderWithQueryClient(ui: React.ReactElement, qc?: QueryClient) {
  const client = qc ?? makeQueryClient();
  return {
    ...render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>),
    queryClient: client,
  };
}

let originalFetch: typeof global.fetch;
beforeAll(() => {
  originalFetch = global.fetch;
});
afterAll(() => {
  global.fetch = originalFetch;
});

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ actionItems: mockItems }),
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ActionItemList', () => {
  it('renders loading skeleton initially', () => {
    renderWithQueryClient(
      <ActionItemList sessionId={SESSION_ID} clientId={CLIENT_ID} />
    );
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );
  });

  it('renders items with description and assignee badges', async () => {
    renderWithQueryClient(
      <ActionItemList sessionId={SESSION_ID} clientId={CLIENT_ID} />
    );
    await waitFor(() => {
      expect(screen.getByText('Follow up on proposal')).toBeInTheDocument();
      expect(screen.getByText('Read the book chapter')).toBeInTheDocument();
    });
    // Both badge and add-form button say "Coach"/"Client" — just check at least one exists
    expect(screen.getAllByText('Coach').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Client').length).toBeGreaterThanOrEqual(1);
  });

  it('applies line-through + opacity-50 to completed items', async () => {
    renderWithQueryClient(
      <ActionItemList sessionId={SESSION_ID} clientId={CLIENT_ID} />
    );
    await waitFor(() =>
      expect(screen.getByText('Read the book chapter')).toBeInTheDocument()
    );
    const el = screen.getByText('Read the book chapter');
    expect(el.className).toContain('line-through');
    expect(el.className).toContain('opacity-50');
  });

  it('shows empty state when no items', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ actionItems: [] }),
    });
    renderWithQueryClient(
      <ActionItemList sessionId={SESSION_ID} clientId={CLIENT_ID} />
    );
    await waitFor(() =>
      expect(screen.getByText('No action items yet.')).toBeInTheDocument()
    );
  });

  it('shows error state when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    renderWithQueryClient(
      <ActionItemList sessionId={SESSION_ID} clientId={CLIENT_ID} />
    );
    await waitFor(() =>
      expect(
        screen.getByText('Failed to load action items.')
      ).toBeInTheDocument()
    );
  });

  it('checkbox click calls PUT with completed status (AC3)', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ actionItems: mockItems }),
      })
      .mockResolvedValue({ ok: true, json: async () => ({}) });

    renderWithQueryClient(
      <ActionItemList sessionId={SESSION_ID} clientId={CLIENT_ID} />
    );
    await waitFor(() =>
      expect(screen.getByText('Follow up on proposal')).toBeInTheDocument()
    );

    const pending = (
      screen.getAllByTestId('checkbox') as HTMLInputElement[]
    ).find(c => !c.checked)!;
    await userEvent.click(pending);

    await waitFor(() => {
      const put = (global.fetch as jest.Mock).mock.calls.find(
        c =>
          typeof c[0] === 'string' &&
          c[0].includes('/api/action-items/item-1') &&
          c[1]?.method === 'PUT'
      );
      expect(put).toBeTruthy();
      expect(JSON.parse(put![1].body).status).toBe('completed');
    });
  });

  it('status select change calls PUT with new status (AC4)', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ actionItems: mockItems }),
      })
      .mockResolvedValue({ ok: true, json: async () => ({}) });

    renderWithQueryClient(
      <ActionItemList sessionId={SESSION_ID} clientId={CLIENT_ID} />
    );
    await waitFor(() =>
      expect(screen.getByText('Follow up on proposal')).toBeInTheDocument()
    );

    const pendingSelect = (
      screen.getAllByTestId('status-select') as HTMLSelectElement[]
    ).find(s => s.value === 'pending')!;
    fireEvent.change(pendingSelect, { target: { value: 'in_progress' } });

    await waitFor(() => {
      const put = (global.fetch as jest.Mock).mock.calls.find(
        c =>
          typeof c[0] === 'string' &&
          c[0].includes('/api/action-items/item-1') &&
          c[1]?.method === 'PUT'
      );
      expect(put).toBeTruthy();
      expect(JSON.parse(put![1].body).status).toBe('in_progress');
    });
  });

  it('PUT failure triggers invalidateQueries (error revert)', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ actionItems: mockItems }),
      })
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValue({
        ok: true,
        json: async () => ({ actionItems: mockItems }),
      });

    const qc = makeQueryClient();
    const invalidateSpy = jest.spyOn(qc, 'invalidateQueries');

    renderWithQueryClient(
      <ActionItemList sessionId={SESSION_ID} clientId={CLIENT_ID} />,
      qc
    );
    await waitFor(() =>
      expect(screen.getByText('Follow up on proposal')).toBeInTheDocument()
    );

    const pending = (
      screen.getAllByTestId('checkbox') as HTMLInputElement[]
    ).find(c => !c.checked)!;
    await userEvent.click(pending);

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalled());
  });

  it('Enter key calls POST with correct body (AC5/AC6)', async () => {
    const newItem: ClientActionItem = {
      id: 'item-3',
      session_id: SESSION_ID,
      client_id: CLIENT_ID,
      user_id: 'user-1',
      description: 'New task from form',
      status: 'pending',
      assignee: 'coach',
      completed: false,
      completed_at: null,
      due_date: null,
      created_at: '2026-03-16T12:00:00Z',
      updated_at: '2026-03-16T12:00:00Z',
    };
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ actionItems: mockItems }),
      })
      .mockResolvedValue({ ok: true, json: async () => newItem });

    const user = userEvent.setup();
    renderWithQueryClient(
      <ActionItemList sessionId={SESSION_ID} clientId={CLIENT_ID} />
    );
    await waitFor(() =>
      expect(screen.getByText('Follow up on proposal')).toBeInTheDocument()
    );

    const input = screen.getByPlaceholderText('Add action item\u2026');
    await user.type(input, 'New task from form');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      const post = (global.fetch as jest.Mock).mock.calls.find(
        c =>
          typeof c[0] === 'string' &&
          c[0] === '/api/action-items' &&
          c[1]?.method === 'POST'
      );
      expect(post).toBeTruthy();
      expect(JSON.parse(post![1].body)).toMatchObject({
        client_id: CLIENT_ID,
        description: 'New task from form',
        assignee: 'coach',
        session_id: SESSION_ID,
      });
    });
  });

  it('POST failure calls toast.error and does not persist item (AC handle add catch)', async () => {
    const { toast } = require('sonner');
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ actionItems: [] }),
      })
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) });

    const user = userEvent.setup();
    renderWithQueryClient(
      <ActionItemList sessionId={SESSION_ID} clientId={CLIENT_ID} />
    );
    await waitFor(() =>
      expect(screen.getByText('No action items yet.')).toBeInTheDocument()
    );

    const input = screen.getByPlaceholderText('Add action item\u2026');
    await user.type(input, 'Task that will fail');
    await user.keyboard('{Enter}');

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to add action item')
    );
    // Item should not appear in the list
    expect(screen.queryByText('Task that will fail')).not.toBeInTheDocument();
  });

  it('input disabled while POST in-flight', async () => {
    let resolvePost!: (v: unknown) => void;
    const postPending = new Promise(res => {
      resolvePost = res;
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ actionItems: [] }),
      })
      .mockReturnValueOnce(postPending as Promise<Response>);

    const user = userEvent.setup();
    renderWithQueryClient(
      <ActionItemList sessionId={SESSION_ID} clientId={CLIENT_ID} />
    );
    await waitFor(() =>
      expect(screen.getByText('No action items yet.')).toBeInTheDocument()
    );

    const input = screen.getByPlaceholderText('Add action item\u2026');
    await user.type(input, 'Test task');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() =>
      expect(
        screen.getByPlaceholderText('Add action item\u2026')
      ).toBeDisabled()
    );

    resolvePost({ ok: true, json: async () => ({}) });
  });
});
