export default function SessionDetailLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="h-14 shrink-0 flex items-center gap-3 px-[22px] border-b border-border bg-card">
        <div className="skeleton rounded-md h-[34px] w-[280px] rounded-[9px]" />
      </div>

      <div className="flex-1 overflow-auto p-6 max-w-3xl mx-auto w-full">
        <div className="skeleton rounded-md h-8 w-24 rounded-md mb-6" />

        {/* Session title + meta */}
        <div className="skeleton rounded-md h-8 w-3/4 mb-2" />
        <div className="flex gap-3 mb-8">
          <div className="skeleton rounded-md h-4 w-24" />
          <div className="skeleton rounded-md h-4 w-20" />
        </div>

        {/* Summary */}
        <div className="rounded-[12px] border border-border bg-card p-5 mb-4">
          <div className="skeleton rounded-md h-4 w-24 mb-3" />
          <div className="skeleton rounded-md h-3.5 w-full mb-1.5" />
          <div className="skeleton rounded-md h-3.5 w-full mb-1.5" />
          <div className="skeleton rounded-md h-3.5 w-4/5 mb-1.5" />
          <div className="skeleton rounded-md h-3.5 w-3/4" />
        </div>

        {/* Action items */}
        <div className="rounded-[12px] border border-border bg-card p-5 mb-4">
          <div className="skeleton rounded-md h-4 w-28 mb-3" />
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex gap-2.5 py-2 border-b border-border last:border-0"
            >
              <div className="skeleton rounded-md h-4 w-4 rounded shrink-0 mt-0.5" />
              <div className="skeleton rounded-md h-3.5 flex-1" />
            </div>
          ))}
        </div>

        {/* Key topics */}
        <div className="rounded-[12px] border border-border bg-card p-5">
          <div className="skeleton rounded-md h-4 w-24 mb-3" />
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton rounded-full h-6 w-20" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
