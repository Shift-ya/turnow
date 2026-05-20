import AppointmentCardSkeleton from './AppointmentCardSkeleton';

export default function TodayAppointmentsSkeleton() {
  return (
    <div className="panel-light animate-pulse p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="mb-2 h-3 w-24 rounded bg-white/10"></div>
          <div className="mt-2 h-6 w-32 rounded bg-white/10"></div>
        </div>
        <div className="h-6 w-20 rounded bg-white/10"></div>
      </div>

      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <AppointmentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
