import {
  Building2,
  CalendarDays,
  DollarSign,
  Eye,
  Pause,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import MetricCard from '../ui/MetricCard';
import StatusBadge from '../ui/StatusBadge';
import { CreateTenantDialog } from '../dialogs/CreateTenantDialog';
import { ConfirmDeleteDialog } from '../dialogs/ConfirmDeleteDialog';
import { TenantDetailDialog } from '../dialogs/TenantDetailDialog';
import type { SuperAdminTenantFormData } from '../../types/superAdminDashboard';
import type { ApiGlobalOverview, ApiTenant } from '../../lib/api';

interface SharedProps {
  metrics: ApiGlobalOverview | null;
  tenants: ApiTenant[];
  search: string;
  onSearchChange: (value: string) => void;
  onCreateTenant: (data: SuperAdminTenantFormData) => Promise<void>;
  onUpdateTenantStatus: (tenant: ApiTenant) => Promise<void>;
  onDeleteTenant: (tenantId: string, tenantName: string) => Promise<void>;
  creatingTenant: boolean;
  deletingTenant: boolean;
  selectedTenant: ApiTenant | null;
  onSelectTenant: (tenant: ApiTenant | null) => void;
  loading: boolean;
}

export interface SuperAdminOverviewTabProps {
  metrics: ApiGlobalOverview | null;
  tenants: ApiTenant[];
  loading: boolean;
}

export function SuperAdminOverviewTab({ metrics, tenants, loading }: SuperAdminOverviewTabProps) {
  if (loading || !metrics) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total clientes" value={metrics.totalTenants} icon={<Building2 size={20} />} />
        <MetricCard title="Clientes activos" value={metrics.activeTenants} icon={<Users size={20} />} />
        <MetricCard
          title="Turnos totales"
          value={metrics.totalAppointments.toLocaleString()}
          icon={<CalendarDays size={20} />}
        />
        <MetricCard title="MRR estimado" value={`$${metrics.totalRevenue.toLocaleString()}`} icon={<DollarSign size={20} />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="panel-light p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-500">Actividad reciente</p>
              <h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.05em] text-white">
                Ultimos clientes incorporados
              </h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-[#a1a1aa]">
              {tenants.length} cuentas
            </div>
          </div>

          <div className="space-y-3">
            {tenants.slice(0, 6).map((tenant) => (
              <div key={tenant.id} className="soft-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-white">{tenant.name}</p>
                  <p className="mt-1 text-sm text-[#a1a1aa]">{tenant.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={tenant.plan} />
                  <StatusBadge status={tenant.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export interface SuperAdminTenantsTabProps extends Omit<SharedProps, 'metrics' | 'loading'> {}

export function SuperAdminTenantsTab({
  tenants,
  search,
  onSearchChange,
  onCreateTenant,
  onUpdateTenantStatus,
  onDeleteTenant,
  creatingTenant,
  deletingTenant,
  selectedTenant,
  onSelectTenant,
}: SuperAdminTenantsTabProps) {
  return (
    <div className="space-y-4">
      <div className="panel-light flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#717171]" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-luxe pl-11"
          />
        </div>
        <CreateTenantDialog onSave={onCreateTenant} isLoading={creatingTenant} />
      </div>

      <div className="panel-light overflow-hidden p-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[740px] text-sm">
            <thead>
              <tr className="text-left text-accent-500">
                <th className="px-4 py-4 font-semibold uppercase tracking-[0.16em]">Negocio</th>
                <th className="px-4 py-4 font-semibold uppercase tracking-[0.16em]">Email</th>
                <th className="px-4 py-4 font-semibold uppercase tracking-[0.16em]">Plan</th>
                <th className="px-4 py-4 font-semibold uppercase tracking-[0.16em]">Estado</th>
                <th className="px-4 py-4 font-semibold uppercase tracking-[0.16em]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="border-t border-white/10">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-white">{tenant.name}</p>
                  </td>
                  <td className="px-4 py-4 text-[#a1a1aa]">{tenant.email}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={tenant.plan} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={tenant.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectTenant(tenant)}
                        className="button-ghost-luxe h-10 w-10 rounded-full p-0"
                        title="Ver detalle"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => onUpdateTenantStatus(tenant)}
                        className="button-ghost-luxe h-10 w-10 rounded-full p-0"
                        title="Suspender o activar"
                      >
                        <Pause size={15} />
                      </button>
                      <ConfirmDeleteDialog
                        description={`Estas seguro de que deseas eliminar el cliente "${tenant.name}"? Esta accion no se puede deshacer.`}
                        onConfirm={() => onDeleteTenant(tenant.id, tenant.name)}
                        isLoading={deletingTenant}
                      >
                        <button
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/10 text-rose-200 transition hover:bg-rose-400/20"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </ConfirmDeleteDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TenantDetailDialog tenant={selectedTenant} open={Boolean(selectedTenant)} onOpenChange={(open) => !open && onSelectTenant(null)} />
    </div>
  );
}

export interface SuperAdminPlansTabProps {
  metrics: ApiGlobalOverview | null;
  loading: boolean;
}

export function SuperAdminPlansTab({ metrics, loading }: SuperAdminPlansTabProps) {
  if (loading || !metrics) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {[
        {
          plan: 'BASIC',
          price: '$19.99',
          clients: metrics.activePlans.basic,
          copy: 'Entrada prolija para equipos chicos.',
        },
        {
          plan: 'PROFESSIONAL',
          price: '$49.99',
          clients: metrics.activePlans.professional,
          copy: 'Balance entre operacion, control y crecimiento.',
        },
        {
          plan: 'PREMIUM',
          price: '$99.99',
          clients: metrics.activePlans.premium,
          copy: 'Capa mas alta para marcas con multiples frentes.',
        },
      ].map((item, index) => (
        <div key={item.plan} className={index === 1 ? 'panel-dark p-6' : 'panel-light p-6'}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <StatusBadge status={item.plan} size="md" />
              <p className={`mt-4 text-sm leading-7 ${index === 1 ? 'text-stone-300' : 'text-[#a1a1aa]'}`}>{item.copy}</p>
            </div>
            <span
              className={`font-['Space_Grotesk'] text-3xl font-bold tracking-[-0.05em] ${index === 1 ? 'text-white' : 'text-white'}`}
            >
              {item.price}
            </span>
          </div>
          <div
            className={`mt-8 rounded-3xl border p-4 ${index === 1 ? 'border-white/10 bg-white/5 text-stone-200' : 'border-white/10 bg-white/5 text-white'}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">Clientes activos</p>
            <p className="mt-3 font-['Space_Grotesk'] text-3xl font-bold tracking-[-0.05em]">{item.clients}</p>
          </div>
          <button
            className={`mt-6 w-full rounded-2xl py-3 text-sm font-semibold transition ${index === 1 ? 'bg-white text-[#17171a] hover:bg-[#f4f4f5]' : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'}`}
          >
            Editar plan
          </button>
        </div>
      ))}
    </div>
  );
}
