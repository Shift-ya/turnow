import BookingServicesSkeleton from './BookingServicesSkeleton';

export default function PublicBookingPageSkeleton() {
  return (
    <div className="app-shell min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="panel-light mb-6 flex flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 animate-pulse">
            <div className="h-10 w-24 rounded-full bg-white/10"></div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-[18px] bg-white/10"></div>
              <div>
                <div className="h-3 w-32 rounded bg-white/10 mb-2"></div>
                <div className="h-6 w-40 rounded bg-white/10"></div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="panel-dark grain-overlay relative overflow-hidden px-6 py-7 sm:px-8">
            <div className="space-y-6">
              <div className="space-y-4 animate-pulse">
                <div className="h-4 w-20 rounded bg-white/10"></div>
                <div className="h-8 w-64 rounded bg-white/10 mb-2"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-white/10"></div>
                  <div className="h-4 w-3/4 rounded bg-white/10"></div>
                </div>
              </div>

              <BookingServicesSkeleton />
            </div>
          </section>

          <aside className="panel-dark px-6 py-7 sm:px-8 animate-pulse">
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-9 w-9 rounded-full bg-white/10"></div>
                    <div className="h-3 w-20 rounded bg-white/10"></div>
                  </div>
                  <div className="h-5 w-24 rounded bg-white/10 mb-1"></div>
                  <div className="h-4 w-32 rounded bg-white/10"></div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
