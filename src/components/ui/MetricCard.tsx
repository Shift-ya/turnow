import type { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

export default function MetricCard({ title, value, icon, trend, trendUp, color }: Props) {
  return (
    <div className={`${color ?? 'panel-light'} grain-overlay relative overflow-hidden p-5 transition duration-200 hover:-translate-y-1`}>
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="max-md:text-[10px] text-sm font-semibold uppercase tracking-[0.24em] text-accent-500">{title}</p>
          <p className="mt-3 text-3xl max-md:text-xl font-bold tracking-[-0.05em] text-white">{value}</p>
          {trend && (
            <p className={`mt-3 text-xs font-semibold ${trendUp ? 'text-emerald-300' : 'text-rose-300'}`}>
              {trendUp ? 'Sube' : 'Baja'} {trend}
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-[#5e92ff] shadow-[0_10px_22px_rgba(0,0,0,0.18)]">
          {icon}
        </div>
      </div>
    </div>
  );
}
