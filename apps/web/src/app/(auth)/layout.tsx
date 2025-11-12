/**
 * Auth Layout
 * Wraps authentication pages (sign-in, sign-up)
 * Note: ClerkProvider is now in root Providers component
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
