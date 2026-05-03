import { ClientGridSkeleton } from '@/components/clients/ClientGridSkeleton';

export default function ClientsLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="h-14 shrink-0 flex items-center gap-3 px-[22px] border-b border-border bg-card">
        <div className="skeleton rounded-md h-[34px] w-[280px] rounded-[9px]" />
        <div className="ml-auto flex items-center gap-2.5">
          <div className="skeleton rounded-md h-4 w-40" />
          <div className="skeleton rounded-md h-[28px] w-32 rounded-full" />
          <div className="skeleton rounded-md h-[28px] w-28 rounded-full" />
          <div className="skeleton rounded-md h-[34px] w-[34px] rounded-[9px]" />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="skeleton rounded-md h-7 w-24" />
          <div className="skeleton rounded-md h-9 w-32 rounded-[9px]" />
        </div>

        {/* Search + filter bar */}
        <div className="flex items-center gap-3">
          <div className="skeleton rounded-md h-9 flex-1 max-w-xs rounded-[9px]" />
          <div className="skeleton rounded-md h-9 w-24 rounded-[9px]" />
          <div className="skeleton rounded-md h-9 w-24 rounded-[9px]" />
        </div>

        <ClientGridSkeleton />
      </div>
    </div>
  );
}
