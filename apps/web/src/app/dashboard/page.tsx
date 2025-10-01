'use client';

import { useAuth } from '@/hooks/useAuth';

/**
 * Dashboard Page - Protected Route Test
 */
export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-navy-900">Dashboard</h1>
        <p className="mt-4 text-gray-600">
          Welcome to your protected dashboard!
        </p>

        {user && (
          <div className="mt-8 rounded-lg bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">User Info</h2>
            <div className="mt-4 space-y-2">
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
              <p>
                <strong>Verified:</strong> {user.verified_badge ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
