/**
 * ClientDetailLayout Component
 * Story 2.6: Client Detail View (Enhanced) - Task 1
 *
 * Responsive 2-column layout for client detail page:
 * - Desktop (≥1024px): Main content (2/3) + Sidebar (1/3)
 * - Mobile (<1024px): Stacked layout (Main → Sidebar)
 */

import { cn } from '@/lib/utils';

interface ClientDetailLayoutProps {
  children: React.ReactNode; // Main content (tabs, overview, etc.)
  sidebar: React.ReactNode; // Action items + next steps sidebar
  className?: string;
}

export function ClientDetailLayout({
  children,
  sidebar,
  className,
}: ClientDetailLayoutProps) {
  return (
    <div
      className={cn(
        // Grid layout: 1 column on mobile, 3 columns on desktop
        'grid grid-cols-1 lg:grid-cols-3',
        // Responsive gap: 16px mobile, 24px desktop
        'gap-4 lg:gap-6',
        // Additional user classes
        className
      )}
    >
      {/* Main content - 2/3 width on desktop, full width on mobile */}
      <div className="lg:col-span-2 space-y-6">{children}</div>

      {/* Sidebar - 1/3 width on desktop, full width on mobile */}
      <div className="lg:col-span-1 space-y-6">
        {/* Optional: Make sidebar sticky on desktop */}
        <div className="lg:sticky lg:top-6">{sidebar}</div>
      </div>
    </div>
  );
}
