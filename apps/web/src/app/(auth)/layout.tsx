/**
 * Auth Layout
 * Wraps authentication pages (sign-in, sign-up) with ClerkProvider
 */

import { ClerkProvider } from '@clerk/nextjs';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
