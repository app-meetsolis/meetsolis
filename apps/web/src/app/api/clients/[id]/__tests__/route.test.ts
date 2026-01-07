/**
 * Unit Tests for Client Detail API Routes
 * Story 2.1: Client CRUD & Database Schema
 */

import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '../route';

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

describe('GET /api/clients/[id]', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        maybeSingle: jest.fn(),
      })),
    };

    mockCreateClient.mockReturnValue(mockSupabase as any);
  });

  it('should return 400 for invalid UUID format', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-user-123' } as any);

    const request = new NextRequest(
      'http://localhost:3000/api/clients/invalid-uuid',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { params: { id: 'invalid-uuid' } });
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error.code).toBe('INVALID_ID');
  });

  it('should return 401 if user not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any);

    const validUUID = '123e4567-e89b-12d3-a456-426614174000';
    const request = new NextRequest(
      `http://localhost:3000/api/clients/${validUUID}`,
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { params: { id: validUUID } });
    expect(response.status).toBe(401);
  });

  it('should return 404 if client not found', async () => {
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
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
    });

    const validUUID = '123e4567-e89b-12d3-a456-426614174000';
    const request = new NextRequest(
      `http://localhost:3000/api/clients/${validUUID}`,
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { params: { id: validUUID } });
    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.error.code).toBe('CLIENT_NOT_FOUND');
  });

  it('should return client details successfully', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-user-123' } as any);

    const mockClient = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: 'user-uuid-123',
      name: 'Test Client',
      company: 'Test Corp',
      role: 'CEO',
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
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
      if (table === 'clients') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest
            .fn()
            .mockResolvedValue({ data: mockClient, error: null }),
        };
      }
    });

    const validUUID = '123e4567-e89b-12d3-a456-426614174000';
    const request = new NextRequest(
      `http://localhost:3000/api/clients/${validUUID}`,
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { params: { id: validUUID } });
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.id).toBe(validUUID);
    expect(data.name).toBe('Test Client');
  });
});

describe('PUT /api/clients/[id]', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        maybeSingle: jest.fn(),
      })),
    };

    mockCreateClient.mockReturnValue(mockSupabase as any);
  });

  it('should return 400 for invalid UUID format', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-user-123' } as any);

    const request = new NextRequest(
      'http://localhost:3000/api/clients/invalid-uuid',
      {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' }),
      }
    );

    const response = await PUT(request, { params: { id: 'invalid-uuid' } });
    expect(response.status).toBe(400);
  });

  it('should return 400 for invalid update data', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-user-123' } as any);

    const validUUID = '123e4567-e89b-12d3-a456-426614174000';
    const request = new NextRequest(
      `http://localhost:3000/api/clients/${validUUID}`,
      {
        method: 'PUT',
        body: JSON.stringify({ email: 'invalid-email' }),
      }
    );

    const response = await PUT(request, { params: { id: validUUID } });
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 404 if client not found', async () => {
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
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
    });

    const validUUID = '123e4567-e89b-12d3-a456-426614174000';
    const request = new NextRequest(
      `http://localhost:3000/api/clients/${validUUID}`,
      {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' }),
      }
    );

    const response = await PUT(request, { params: { id: validUUID } });
    expect(response.status).toBe(404);
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
      if (table === 'clients') {
        let callCount = 0;
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          neq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn(() => {
            callCount++;
            if (callCount === 1) {
              // First call: check if client exists
              return Promise.resolve({
                data: { id: 'client-123' },
                error: null,
              });
            }
            // Second call: check for duplicate email
            return Promise.resolve({
              data: { id: 'other-client-id', email: 'test@example.com' },
              error: null,
            });
          }),
        };
      }
    });

    const validUUID = '123e4567-e89b-12d3-a456-426614174000';
    const request = new NextRequest(
      `http://localhost:3000/api/clients/${validUUID}`,
      {
        method: 'PUT',
        body: JSON.stringify({ email: 'test@example.com' }),
      }
    );

    const response = await PUT(request, { params: { id: validUUID } });
    expect(response.status).toBe(409);
  });

  it('should update client successfully', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-user-123' } as any);

    const mockUpdatedClient = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: 'user-uuid-123',
      name: 'Updated Name',
      company: 'Updated Corp',
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
      if (table === 'clients') {
        return {
          select: jest.fn().mockReturnThis(),
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          neq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: { id: 'client-123' },
            error: null,
          }),
          single: jest.fn().mockResolvedValue({
            data: mockUpdatedClient,
            error: null,
          }),
        };
      }
    });

    const validUUID = '123e4567-e89b-12d3-a456-426614174000';
    const request = new NextRequest(
      `http://localhost:3000/api/clients/${validUUID}`,
      {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name', company: 'Updated Corp' }),
      }
    );

    const response = await PUT(request, { params: { id: validUUID } });
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.name).toBe('Updated Name');
  });
});

describe('DELETE /api/clients/[id]', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        maybeSingle: jest.fn(),
      })),
    };

    mockCreateClient.mockReturnValue(mockSupabase as any);
  });

  it('should return 400 for invalid UUID format', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-user-123' } as any);

    const request = new NextRequest(
      'http://localhost:3000/api/clients/invalid-uuid',
      {
        method: 'DELETE',
      }
    );

    const response = await DELETE(request, { params: { id: 'invalid-uuid' } });
    expect(response.status).toBe(400);
  });

  it('should return 401 if user not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any);

    const validUUID = '123e4567-e89b-12d3-a456-426614174000';
    const request = new NextRequest(
      `http://localhost:3000/api/clients/${validUUID}`,
      {
        method: 'DELETE',
      }
    );

    const response = await DELETE(request, { params: { id: validUUID } });
    expect(response.status).toBe(401);
  });

  it('should return 404 if client not found', async () => {
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
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
    });

    const validUUID = '123e4567-e89b-12d3-a456-426614174000';
    const request = new NextRequest(
      `http://localhost:3000/api/clients/${validUUID}`,
      {
        method: 'DELETE',
      }
    );

    const response = await DELETE(request, { params: { id: validUUID } });
    expect(response.status).toBe(404);
  });

  it('should delete client successfully and return 204', async () => {
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
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: { id: 'client-123' },
            error: null,
          }),
        };
      }
    });

    // Mock the delete operation to return no error
    mockSupabase.from().delete().eq = jest
      .fn()
      .mockResolvedValue({ error: null });

    const validUUID = '123e4567-e89b-12d3-a456-426614174000';
    const request = new NextRequest(
      `http://localhost:3000/api/clients/${validUUID}`,
      {
        method: 'DELETE',
      }
    );

    const response = await DELETE(request, { params: { id: validUUID } });
    expect(response.status).toBe(204);
  });
});
