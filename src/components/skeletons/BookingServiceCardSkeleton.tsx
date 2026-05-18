export default function BookingServiceCardSkeleton() {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/5 p-5 animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="h-6 w-40 rounded bg-white/10 mb-2"></div>
          <div className="mt-2 space-y-2">
            <div className="h-4 w-full rounded bg-white/10"></div>
            <div className="h-4 w-3/4 rounded bg-white/10"></div>
          </div>
        </div>
        <div className="sm:text-right">
          <div className="h-8 w-24 rounded bg-white/10 mb-2"></div>
          <div className="inline-flex h-8 w-24 rounded-full border border-white/10 bg-white/5"></div>
        </div>
      </div>
    </div>
  );
}
