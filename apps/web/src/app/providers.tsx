/**
 * Providers Component
 * Client-side providers for React Query
 *
 * Note: For accessibility testing, use axe DevTools browser extension
 * instead of @axe-core/react due to Next.js 14 App Router compatibility issues
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
