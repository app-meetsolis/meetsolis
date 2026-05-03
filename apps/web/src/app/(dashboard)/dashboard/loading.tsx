export default function DashboardLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="h-14 shrink-0 flex items-center gap-3 px-[22px] border-b border-border bg-card">
        <div className="skeleton rounded-md h-[34px] w-[280px] rounded-[9px]" />
        <div className="ml-auto flex items-center gap-2.5">
          <div className="skeleton rounded-md h-4 w-40" />
          <div className="skeleton rounded-md h-[28px] w-32 rounded-full" />
          <div className="skeleton rounded-md h-[28px] w-32 rounded-full" />
          <div className="skeleton rounded-md h-[34px] w-[34px] rounded-[9px]" />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Greeting */}
        <div className="space-y-1.5">
          <div className="skeleton rounded-md h-7 w-56" />
          <div className="skeleton rounded-md h-4 w-80" />
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-[12px] border border-border bg-card p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="skeleton rounded-md h-3.5 w-3.5 rounded" />
                <div className="skeleton rounded-md h-3 w-24" />
              </div>
              <div className="skeleton rounded-md h-6 w-32 mb-2" />
              <div className="skeleton rounded-md h-3.5 w-28 mb-3" />
              <div className="flex items-end gap-[3px] h-5">
                {[30, 50, 65, 82, 100].map((h, j) => (
                  <div
                    key={j}
                    className="skeleton rounded-sm w-[5px]"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Chips bar */}
        <div className="skeleton rounded-md h-[46px] w-full rounded-[12px]" />

        {/* Two-column */}
        <div className="grid grid-cols-[1fr_320px] gap-5">
          {/* Sessions */}
          <div className="space-y-3">
            <div className="skeleton rounded-md h-4 w-28" />
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-[12px] border border-border bg-card p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="skeleton rounded-md h-2 w-2 rounded-full" />
                  <div className="skeleton rounded-md h-3.5 w-20" />
                  <div className="skeleton rounded-md h-3 w-16" />
                </div>
                <div className="skeleton rounded-md h-5 w-3/4 mb-2" />
                <div className="skeleton rounded-md h-3.5 w-full mb-1" />
                <div className="skeleton rounded-md h-3.5 w-4/5" />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="rounded-[16px] border border-border bg-card p-5">
            <div className="skeleton rounded-md h-4 w-24 mb-4" />
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 py-2.5 border-b border-border last:border-0"
              >
                <div className="skeleton rounded-md h-4 w-4 rounded mt-0.5 shrink-0" />
                <div className="skeleton rounded-md h-3.5 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
