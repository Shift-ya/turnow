import BookingServiceCardSkeleton from './BookingServiceCardSkeleton';

export default function BookingServicesSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(2)].map((_, catIdx) => (
        <div key={catIdx} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 rounded bg-white/10 animate-pulse"></div>
            <div className="h-3 w-16 rounded bg-white/10 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <BookingServiceCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
