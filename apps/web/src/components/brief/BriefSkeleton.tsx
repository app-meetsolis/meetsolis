/**
 * BriefSkeleton — loading placeholder matching the Coach Brief layout (Story 6.4).
 * Reused by route loading.tsx and the in-screen "generating" state.
 */

export function BriefSkeleton({ label }: { label?: string }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-7">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border pb-4">
        <div className="space-y-2">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-6 w-44 rounded" />
          <div className="skeleton h-3.5 w-28 rounded" />
        </div>
        <div className="skeleton h-8 w-24 rounded-md" />
      </div>

      {label && (
        <p className="mt-4 text-center text-[12.5px] text-foreground/45">
          {label}
        </p>
      )}

      {/* Section cards */}
      <div className="mt-5 space-y-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="rounded-[12px] bg-card px-6 py-5 shadow-card">
            <div className="skeleton mb-3 h-3 w-32 rounded" />
            <div className="space-y-2">
              <div className="skeleton h-3.5 w-full rounded" />
              <div className="skeleton h-3.5 w-5/6 rounded" />
              {i === 1 && <div className="skeleton h-3.5 w-4/6 rounded" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
