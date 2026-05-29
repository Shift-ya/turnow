import type { TenantAdminDashboardData } from '../../types/tenantAdminDashboard';

interface Props {
  metrics: TenantAdminDashboardData['metrics'];
}

export default function PerformancePanel({ metrics }: Props) {
  if (!metrics) {
    return (
      <div className="panel-dark p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Rendimiento</p>
        <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold tracking-[-0.05em] text-white">
          No hay datos disponibles.
        </h2>
      </div>
    );
  }

  return (
    <div className="panel-dark p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Rendimiento</p>
      <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold tracking-[-0.05em] text-white">La operación se entiende de un vistazo.</h2>
      <div className="mt-6 grid gap-3">
        {[
          ['Completados', `${metrics.completedRate}%`],
          ['Cancelados', `${metrics.cancelledRate}%`],
          ['No show', `${metrics.noShowRate}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</p>
            <p className="mt-2 font-['Space_Grotesk'] text-3xl font-bold tracking-[-0.05em] text-white">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
