export default function BookingCalendarSkeleton() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 animate-pulse">
      <div className="mb-5 flex items-center justify-between">
        <div className="h-11 w-11 rounded-full bg-white/10"></div>
        <div className="h-8 w-40 rounded bg-white/10"></div>
        <div className="h-11 w-11 rounded-full bg-white/10"></div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-white/10"></div>
        ))}
      </div>
    </div>
  );
}
