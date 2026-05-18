import BookingProfessionalCardSkeleton from './BookingProfessionalCardSkeleton';

export default function BookingProfessionalsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 rounded bg-white/10 animate-pulse"></div>
        <div className="h-3 w-32 rounded bg-white/10 animate-pulse"></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <BookingProfessionalCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
