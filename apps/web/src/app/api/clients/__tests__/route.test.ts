/**
 * Unit Tests for Clients API Routes
 * Story 2.1: Client CRUD & Database Schema
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '../route';

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/config/env', () => ({
  config: {
    supabase: {
      url: 'https://test.supabase.co',
      serviceRoleKey: 'test-service-role-key',
    },
  },
}));

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe('POST /api/clients', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Supabase client
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        maybeSingle: jest.fn(),
      })),
    };

    mockCreateClient.mockReturnValue(mockSupabase as any);
  });

  it('should return 401 if user not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any);

    const request = new NextRequest('http://localhost:3000/api/clients', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Client' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 400 for invalid client data', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-user-123' } as any);

    const request = new NextRequest('http://localhost:3000/api/clients', {
      method: 'POST',
      body: JSON.stringify({ name: 'A' }), // Too short
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 404 if user not found in database', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-user-123' } as any);

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Not found' } }),
    });

    const request = new NextRequest('http://localhost:3000/api/clients', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Client' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.error.code).toBe('USER_NOT_FOUND');
  });

  it('should return 403 when tier limit exceeded (free tier)', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-user-123' } as any);

    // Mock user lookup
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'user-uuid-123' },
            error: null,
          }),
        };
      }
      if (table === 'user_preferences') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { max_clients: 3 },
            error: null,
          }),
        };
      }
      if (table === 'clients') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn(),
          maybeSingle: jest.fn(),
          count: jest.fn().mockResolvedValue({ count: 3, error: null }),
        };
      }
    });

    const request = new NextRequest('http://localhost:3000/api/clients', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Client' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(403);

    const data = await response.json();
    expect(data.error.code).toBe('TIER_LIMIT_EXCEEDED');
  });

  it('should return 409 for duplicate email', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-user-123' } as any);

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'user-uuid-123' },
            error: null,
          }),
        };
      }
      if (table === 'user_preferences') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { max_clients: 3 },
            error: null,
          }),
        };
      }
      if (table === 'clients') {
        const chainable = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: { id: 'existing-client-id', email: 'test@example.com' },
            error: null,
          }),
        };
        return {
          ...chainable,
          count: jest.fn().mockResolvedValue({ count: 1, error: null }),
        };
      }
    });

    const request = new NextRequest('http://localhost:3000/api/clients', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Client', email: 'test@example.com' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(409);

    const data = await response.json();
    expect(data.error.code).toBe('DUPLICATE_CLIENT');
  });

  it('should create client successfully', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-user-123' } as any);

    const mockNewClient = {
      id: 'client-uuid-123',
      user_id: 'user-uuid-123',
      name: 'Test Client',
      company: 'Test Corp',
      role: 'CEO',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'user-uuid-123' },
            error: null,
          }),
        };
      }
      if (table === 'user_preferences') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { max_clients: 3 },
            error: null,
          }),
        };
      }
      if (table === 'clients') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          single: jest
            .fn()
            .mockResolvedValue({ data: mockNewClient, error: null }),
          count: jest.fn().mockResolvedValue({ count: 1, error: null }),
        };
      }
    });

    const request = new NextRequest('http://localhost:3000/api/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Client',
        company: 'Test Corp',
        role: 'CEO',
        email: 'test@example.com',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.id).toBe('client-uuid-123');
    expect(data.name).toBe('Test Client');
  });
});

describe('GET /api/clients', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn(),
      })),
    };

    mockCreateClient.mockReturnValue(mockSupabase as any);
  });

  it('should return 401 if user not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any);

    const request = new NextRequest('http://localhost:3000/api/clients', {
      method: 'GET',
    });

    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it('should return list of clients for authenticated user', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-user-123' } as any);

    const mockClients = [
      {
        id: 'client-1',
        user_id: 'user-uuid-123',
        name: 'Client 1',
        created_at: '2023-01-01T00:00:00Z',
      },
      {
        id: 'client-2',
        user_id: 'user-uuid-123',
        name: 'Client 2',
        created_at: '2023-01-02T00:00:00Z',
      },
    ];

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'user-uuid-123' },
            error: null,
          }),
        };
      }
      if (table === 'clients') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: mockClients,
            error: null,
          }),
        };
      }
    });

    const request = new NextRequest('http://localhost:3000/api/clients', {
      method: 'GET',
    });

    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.clients).toHaveLength(2);
    expect(data.clients[0].name).toBe('Client 1');
  });

  it('should return empty array when user has no clients', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-user-123' } as any);

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'user-uuid-123' },
            error: null,
          }),
        };
      }
      if (table === 'clients') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        };
      }
    });

    const request = new NextRequest('http://localhost:3000/api/clients', {
      method: 'GET',
    });

    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.clients).toEqual([]);
  });
});
