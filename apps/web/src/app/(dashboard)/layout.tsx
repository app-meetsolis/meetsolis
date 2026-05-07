/**
 * Dashboard Layout
 * Story 2.9: Left sidebar layout — replaces old top navigation header
 */

'use client';

import { useState } from 'react';
import { LeftSidebar } from '@/components/dashboard/LeftSidebar';
import { UserTracking } from '@/components/analytics/UserTracking';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <UserTracking />
      <ErrorBoundary>
        <div className="flex h-screen bg-background">
          <LeftSidebar
            isMobileOpen={isMobileOpen}
            onClose={() => setIsMobileOpen(false)}
          />

          {/* Content area */}
          <div className="flex flex-1 flex-col min-w-0">
            {/* Mobile top bar */}
            <div className="flex h-12 shrink-0 items-center border-b border-sidebar-border bg-sidebar px-4 md:hidden">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="text-[#4e5b6d] hover:text-[#000000]"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="ml-3 text-lg font-bold text-foreground">
                MeetSolis
              </span>
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      </ErrorBoundary>
    </>
  );
}
