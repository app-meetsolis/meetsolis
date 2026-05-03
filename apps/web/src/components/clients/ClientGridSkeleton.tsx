/**
 * ClientGridSkeleton Component
 * Story 2.2: Client Dashboard UI - Task 5: Loading State
 *
 * Displays shimmer skeleton cards while clients are loading.
 * Matches grid layout: 3 cols (desktop), 2 cols (tablet), 1 col (mobile)
 */

export function ClientGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[12px] bg-card p-6 shadow-sm border border-border"
        >
          <div className="skeleton rounded-md mb-3 h-6 w-3/4" />
          <div className="skeleton rounded-md mb-4 h-4 w-1/2" />
          <div className="skeleton rounded-md mb-3 h-4 w-2/3" />
          <div className="skeleton rounded-md h-5 w-24" />
        </div>
      ))}
    </div>
  );
}
