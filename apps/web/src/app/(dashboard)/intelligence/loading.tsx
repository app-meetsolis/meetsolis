export default function IntelligenceLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Chat messages area */}
      <div className="flex-1 overflow-hidden p-6 space-y-4">
        {/* Suggested prompts skeleton */}
        <div className="flex flex-col items-center justify-center h-full gap-6">
          <div className="skeleton rounded-md h-10 w-10 rounded-full" />
          <div className="skeleton rounded-md h-6 w-48" />
          <div className="skeleton rounded-md h-4 w-64" />
          <div className="grid grid-cols-2 gap-2 w-full max-w-md mt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton rounded-[12px] h-16" />
            ))}
          </div>
        </div>
      </div>

      {/* Input bar at bottom */}
      <div className="shrink-0 px-4 pb-4">
        <div className="skeleton rounded-md h-14 w-full rounded-[16px]" />
      </div>
    </div>
  );
}
