export default function ClientDetailLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="h-14 shrink-0 flex items-center gap-3 px-[22px] border-b border-border bg-card">
        <div className="skeleton rounded-md h-[34px] w-[280px] rounded-[9px]" />
        <div className="ml-auto flex items-center gap-2.5">
          <div className="skeleton rounded-md h-[34px] w-[34px] rounded-[9px]" />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Back + actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="skeleton rounded-md h-8 w-24 rounded-md" />
          <div className="flex gap-2">
            <div className="skeleton rounded-md h-9 w-28 rounded-md" />
            <div className="skeleton rounded-md h-9 w-28 rounded-md" />
          </div>
        </div>

        {/* Client header */}
        <div className="flex items-start gap-5 mb-8">
          <div className="skeleton rounded-md h-16 w-16 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="skeleton rounded-md h-7 w-48" />
            <div className="skeleton rounded-md h-4 w-64" />
            <div className="flex gap-3 mt-2">
              <div className="skeleton rounded-md h-5 w-28 rounded-full" />
              <div className="skeleton rounded-md h-5 w-24 rounded-full" />
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-[12px] border border-border bg-card p-4"
            >
              <div className="skeleton rounded-md h-3.5 w-20 mb-2" />
              <div className="skeleton rounded-md h-6 w-16" />
            </div>
          ))}
        </div>

        {/* Goal */}
        <div className="rounded-[12px] border border-border bg-card p-5 mb-4">
          <div className="skeleton rounded-md h-4 w-32 mb-3" />
          <div className="skeleton rounded-md h-3.5 w-full mb-1.5" />
          <div className="skeleton rounded-md h-3.5 w-3/4" />
        </div>

        {/* Sessions list */}
        <div className="space-y-3">
          <div className="skeleton rounded-md h-4 w-28 mb-1" />
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-[12px] border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="skeleton rounded-md h-4 w-40" />
                <div className="skeleton rounded-md h-4 w-16" />
              </div>
              <div className="skeleton rounded-md h-3.5 w-full mb-1" />
              <div className="skeleton rounded-md h-3.5 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
