import { LeftSidebar } from '@/components/dashboard/LeftSidebar';
import { UserTracking } from '@/components/analytics/UserTracking';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <UserTracking />
      <ErrorBoundary>
        <div className="flex min-h-screen bg-[#E8E4DD]">
          <LeftSidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </ErrorBoundary>
    </>
  );
}
