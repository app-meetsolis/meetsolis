/**
 * Dashboard Layout
 * Wrapper layout for dashboard pages with navigation
 * Note: ClerkProvider is now in root Providers component
 */

import { Navigation } from '@/components/dashboard/Navigation';
import { UserProfile } from '@/components/dashboard/UserProfile';
import { UserTracking } from '@/components/analytics/UserTracking';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <UserTracking />
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-8">
                <h1 className="text-2xl font-bold text-[#001F3F]">MeetSolis</h1>
                <Navigation className="hidden md:flex" />
              </div>
              <div className="flex items-center gap-4">
                <Navigation className="md:hidden" />
                <UserProfile />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>

          {/* Toast Notifications */}
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </ErrorBoundary>
    </>
  );
}
