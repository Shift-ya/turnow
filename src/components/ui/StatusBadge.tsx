interface Props {
  status: string;
  size?: 'sm' | 'md';
}

const colors: Record<string, string> = {
  ACTIVE: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  BOOKED: 'border-sky-400/20 bg-sky-400/10 text-sky-200',
  CONFIRMED: 'border-violet-400/20 bg-violet-400/10 text-violet-200',
  COMPLETED: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  CANCELLED: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
  NO_SHOW: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  SUSPENDED: 'border-white/[0.12] bg-white/[0.06] text-zinc-300',
  PENDING: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  BASIC: 'border-white/[0.12] bg-white/[0.06] text-zinc-300',
  PROFESSIONAL: 'border-[#5e92ff]/25 bg-[#5e92ff]/12 text-[#bfd0ff]',
  PREMIUM: 'border-[#f52ccf]/20 bg-[#f52ccf]/10 text-[#ffb8f0]',
};

const labels: Record<string, string> = {
  ACTIVE: 'Activo',
  BOOKED: 'Reservado',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'No show',
  SUSPENDED: 'Suspendido',
  PENDING: 'Pendiente',
  BASIC: 'Basico',
  PROFESSIONAL: 'Profesional',
  PREMIUM: 'Premium',
};

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold uppercase tracking-[0.16em] ${sizeClass} ${
        colors[status] || 'border-white/[0.12] bg-white/[0.06] text-zinc-300'
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
