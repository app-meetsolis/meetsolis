export default function SettingsLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="h-14 shrink-0 flex items-center gap-3 px-[22px] border-b border-border bg-card">
        <div className="skeleton rounded-md h-[34px] w-[280px] rounded-[9px]" />
        <div className="ml-auto">
          <div className="skeleton rounded-md h-[34px] w-[34px] rounded-[9px]" />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 max-w-2xl">
        <div className="skeleton rounded-md h-7 w-28 mb-1" />
        <div className="skeleton rounded-md h-4 w-64 mb-8" />

        {/* Profile section */}
        <div className="rounded-[12px] border border-border bg-card p-5 mb-4 space-y-4">
          <div className="skeleton rounded-md h-5 w-24 mb-2" />
          <div className="flex items-center gap-4">
            <div className="skeleton rounded-md h-16 w-16 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton rounded-md h-9 w-full rounded-md" />
              <div className="skeleton rounded-md h-9 w-full rounded-md" />
            </div>
          </div>
        </div>

        {/* Subscription section */}
        <div className="rounded-[12px] border border-border bg-card p-5 mb-4 space-y-3">
          <div className="skeleton rounded-md h-5 w-28 mb-2" />
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="skeleton rounded-md h-5 w-20" />
              <div className="skeleton rounded-md h-4 w-48" />
            </div>
            <div className="skeleton rounded-md h-9 w-28 rounded-md" />
          </div>
        </div>

        {/* Usage section */}
        <div className="rounded-[12px] border border-border bg-card p-5 space-y-3">
          <div className="skeleton rounded-md h-5 w-20 mb-2" />
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <div className="skeleton rounded-md h-3.5 w-24" />
                <div className="skeleton rounded-md h-3.5 w-16" />
              </div>
              <div className="skeleton rounded-md h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
