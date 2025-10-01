/**
 * useAuth Hook Tests
 * Tests for authentication hook wrapper
 */

import { renderHook } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import * as clerkNextjs from '@clerk/nextjs';

// Mock @clerk/nextjs
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
  useUser: jest.fn(),
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return loading state when not loaded', () => {
    (clerkNextjs.useAuth as jest.Mock).mockReturnValue({
      isSignedIn: false,
      isLoaded: false,
    });
    (clerkNextjs.useUser as jest.Mock).mockReturnValue({
      user: null,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.user).toBe(null);
  });

  it('should return unauthenticated state when not signed in', () => {
    (clerkNextjs.useAuth as jest.Mock).mockReturnValue({
      isSignedIn: false,
      isLoaded: true,
    });
    (clerkNextjs.useUser as jest.Mock).mockReturnValue({
      user: null,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.user).toBe(null);
  });

  it('should return authenticated state with user data', () => {
    const mockClerkUser = {
      id: 'user_123',
      emailAddresses: [
        {
          emailAddress: 'test@example.com',
          verification: { status: 'verified' },
        },
      ],
      firstName: 'John',
      lastName: 'Doe',
      publicMetadata: { role: 'host' },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    (clerkNextjs.useAuth as jest.Mock).mockReturnValue({
      isSignedIn: true,
      isLoaded: true,
    });
    (clerkNextjs.useUser as jest.Mock).mockReturnValue({
      user: mockClerkUser,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSignedIn).toBe(true);
    expect(result.current.user).toMatchObject({
      id: 'user_123',
      email: 'test@example.com',
      name: 'John Doe',
      role: 'host',
      verified_badge: true,
    });
  });

  it('should handle user without name', () => {
    const mockClerkUser = {
      id: 'user_456',
      emailAddresses: [{ emailAddress: 'noname@example.com' }],
      firstName: null,
      lastName: null,
      publicMetadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (clerkNextjs.useAuth as jest.Mock).mockReturnValue({
      isSignedIn: true,
      isLoaded: true,
    });
    (clerkNextjs.useUser as jest.Mock).mockReturnValue({
      user: mockClerkUser,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user?.name).toBe('User');
    expect(result.current.user?.role).toBe('participant');
  });
});
