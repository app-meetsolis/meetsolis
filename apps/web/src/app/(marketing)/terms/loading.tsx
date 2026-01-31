
export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50 animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-white border-b border-slate-200">
                <div className="container px-4 md:px-6 pt-32 md:pt-40 pb-12 max-w-5xl mx-auto">
                    <div className="max-w-3xl space-y-6">
                        <div className="h-10 md:h-12 bg-slate-200 rounded-lg w-3/4"></div>
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                        <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                    </div>
                </div>
            </div>

            <div className="container px-4 md:px-6 py-12 max-w-5xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Skeleton */}
                    <div className="lg:w-64 shrink-0">
                        <div className="space-y-8">
                            <div className="p-6 bg-white rounded-2xl border border-slate-200">
                                <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
                                <div className="h-4 bg-slate-100 rounded w-32"></div>
                            </div>
                        </div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="flex-1 bg-white p-8 md:p-12 rounded-[32px] border border-slate-200 space-y-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-4">
                                <div className="h-6 bg-slate-200 rounded w-48"></div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                                    <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                                </div>
                                {i < 4 && <div className="h-px bg-slate-100 w-full my-8"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
