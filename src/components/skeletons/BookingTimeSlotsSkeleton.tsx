export default function BookingTimeSlotsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 rounded bg-white/10"></div>
        <div className="h-3 w-24 rounded bg-white/10"></div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-11 rounded-xl border border-white/10 bg-white/5"></div>
        ))}
      </div>
    </div>
  );
}
