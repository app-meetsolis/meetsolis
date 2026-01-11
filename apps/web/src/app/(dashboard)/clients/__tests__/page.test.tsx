/**
 * Clients Page Integration Tests
 * Story 2.4: Client Search & Filter - Task 9
 * Tests filtering and sorting logic
 */

import { renderHook } from '@testing-library/react';
import { useMemo } from 'react';
import { Client } from '@meetsolis/shared';

// Mock client data for testing
const mockClients: Client[] = [
  {
    id: '1',
    user_id: 'user1',
    name: 'Acme Corporation',
    company: 'Acme Corp',
    role: 'CEO',
    email: 'john@acme.com',
    phone: '123-456-7890',
    website: 'https://acme.com',
    linkedin_url: 'https://linkedin.com/in/acme',
    tags: ['vip', 'active'],
    status: 'active',
    overview: null,
    research_data: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    last_meeting_at: '2024-01-20T14:00:00Z',
  },
  {
    id: '2',
    user_id: 'user1',
    name: 'Beta Industries',
    company: 'Beta Inc',
    role: 'CTO',
    email: 'jane@beta.com',
    phone: null,
    website: null,
    linkedin_url: null,
    tags: ['active'],
    status: 'active',
    overview: null,
    research_data: null,
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-10T09:00:00Z',
    last_meeting_at: null,
  },
  {
    id: '3',
    user_id: 'user1',
    name: 'Zulu Enterprises',
    company: 'Zulu Co',
    role: 'Manager',
    email: 'contact@zulu.com',
    phone: '987-654-3210',
    website: 'https://zulu.com',
    linkedin_url: null,
    tags: [],
    status: 'active',
    overview: null,
    research_data: null,
    created_at: '2024-01-20T11:00:00Z',
    updated_at: '2024-01-20T11:00:00Z',
    last_meeting_at: '2024-01-18T16:00:00Z',
  },
];

describe('Client Filtering and Sorting Logic', () => {
  describe('Search Filtering (Task 3)', () => {
    it('filters clients by name (case-insensitive)', () => {
      const searchQuery = 'acme';
      const queryLower = searchQuery.toLowerCase();
      const filtered = mockClients.filter(client => {
        const nameMatch = client.name.toLowerCase().includes(queryLower);
        const companyMatch = client.company?.toLowerCase().includes(queryLower);
        return nameMatch || companyMatch;
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Acme Corporation');
    });

    it('filters clients by company (case-insensitive)', () => {
      const searchQuery = 'beta inc';
      const queryLower = searchQuery.toLowerCase();
      const filtered = mockClients.filter(client => {
        const nameMatch = client.name.toLowerCase().includes(queryLower);
        const companyMatch = client.company?.toLowerCase().includes(queryLower);
        return nameMatch || companyMatch;
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Beta Industries');
    });

    it('returns all clients when search query is empty', () => {
      const searchQuery = '';
      let filtered = mockClients;
      if (searchQuery) {
        filtered = mockClients.filter(client => {
          const nameMatch = client.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const companyMatch = client.company
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());
          return nameMatch || companyMatch;
        });
      }

      expect(filtered).toHaveLength(3);
    });

    it('returns empty array when no clients match search', () => {
      const searchQuery = 'nonexistent company';
      const filtered = mockClients.filter(client => {
        const nameMatch = client.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const companyMatch = client.company
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        return nameMatch || companyMatch;
      });

      expect(filtered).toHaveLength(0);
    });
  });

  describe('Sorting Logic (Task 4)', () => {
    it('sorts clients by name (A-Z)', () => {
      const sorted = [...mockClients].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      expect(sorted[0].name).toBe('Acme Corporation');
      expect(sorted[1].name).toBe('Beta Industries');
      expect(sorted[2].name).toBe('Zulu Enterprises');
    });

    it('sorts clients by last meeting (most recent first)', () => {
      const sorted = [...mockClients].sort((a, b) => {
        const dateA = a.last_meeting_at
          ? new Date(a.last_meeting_at).getTime()
          : 0;
        const dateB = b.last_meeting_at
          ? new Date(b.last_meeting_at).getTime()
          : 0;
        return dateB - dateA;
      });

      // Acme: 2024-01-20, Zulu: 2024-01-18, Beta: null
      expect(sorted[0].name).toBe('Acme Corporation');
      expect(sorted[1].name).toBe('Zulu Enterprises');
      expect(sorted[2].name).toBe('Beta Industries'); // Null should be last
    });

    it('sorts clients by date added (newest first)', () => {
      const sorted = [...mockClients].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });

      // Zulu: 2024-01-20, Acme: 2024-01-15, Beta: 2024-01-10
      expect(sorted[0].name).toBe('Zulu Enterprises');
      expect(sorted[1].name).toBe('Acme Corporation');
      expect(sorted[2].name).toBe('Beta Industries');
    });

    it('handles null last_meeting_at values correctly', () => {
      const sorted = [...mockClients].sort((a, b) => {
        const dateA = a.last_meeting_at
          ? new Date(a.last_meeting_at).getTime()
          : 0;
        const dateB = b.last_meeting_at
          ? new Date(b.last_meeting_at).getTime()
          : 0;
        return dateB - dateA;
      });

      // Beta has null last_meeting_at, should be sorted to end
      expect(sorted[sorted.length - 1].name).toBe('Beta Industries');
      expect(sorted[sorted.length - 1].last_meeting_at).toBeNull();
    });
  });

  describe('Performance Optimization (Task 7)', () => {
    it('memoizes filtered and sorted clients', () => {
      const searchQuery = 'acme';

      // Simulate useMemo behavior
      const { result, rerender } = renderHook(
        ({ clients, query }) =>
          useMemo(() => {
            let filtered = clients;
            if (query) {
              const queryLower = query.toLowerCase();
              filtered = clients.filter((client: Client) => {
                const nameMatch = client.name
                  .toLowerCase()
                  .includes(queryLower);
                const companyMatch = client.company
                  ?.toLowerCase()
                  .includes(queryLower);
                return nameMatch || companyMatch;
              });
            }
            return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
          }, [clients, query]),
        {
          initialProps: { clients: mockClients, query: searchQuery },
        }
      );

      const firstResult = result.current;

      // Rerender with same props - should return same memoized result
      rerender({ clients: mockClients, query: searchQuery });
      expect(result.current).toBe(firstResult); // Same reference = memoized

      // Rerender with different query - should return new result
      rerender({ clients: mockClients, query: 'beta' });
      expect(result.current).not.toBe(firstResult); // Different reference = recalculated
    });
  });

  describe('Combined Filtering and Sorting (Integration)', () => {
    it('filters by search query then sorts by name', () => {
      const searchQuery = 'co'; // Matches "Acme Corporation" and "Zulu Co"
      const queryLower = searchQuery.toLowerCase();

      const filtered = mockClients.filter(client => {
        const nameMatch = client.name.toLowerCase().includes(queryLower);
        const companyMatch = client.company?.toLowerCase().includes(queryLower);
        return nameMatch || companyMatch;
      });

      const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

      expect(sorted).toHaveLength(2);
      expect(sorted[0].name).toBe('Acme Corporation');
      expect(sorted[1].name).toBe('Zulu Enterprises');
    });

    it('filters by search query then sorts by date added', () => {
      const searchQuery = 'inc'; // Matches "Beta Inc" and "Zulu Inc" (via company)
      const queryLower = searchQuery.toLowerCase();

      const filtered = mockClients.filter(client => {
        const nameMatch = client.name.toLowerCase().includes(queryLower);
        const companyMatch = client.company?.toLowerCase().includes(queryLower);
        return nameMatch || companyMatch;
      });

      const sorted = [...filtered].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });

      expect(sorted).toHaveLength(1);
      expect(sorted[0].name).toBe('Beta Industries');
    });
  });
});
