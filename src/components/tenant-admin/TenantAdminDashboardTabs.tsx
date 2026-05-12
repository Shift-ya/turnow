import { Clock, DollarSign, Power, Trash2, TrendingUp, UserCheck, CalendarDays } from 'lucide-react';
import MetricCard from '../ui/MetricCard';
import StatusBadge from '../ui/StatusBadge';
import { EditProfessionalDialog } from '../dialogs/EditProfessionalDialog';
import { EditServiceDialog } from '../dialogs/EditServiceDialog';
import { CreateServiceDialog } from '../dialogs/CreateServiceDialog';
import { CreateProfessionalDialog } from '../dialogs/CreateProfessionalDialog';
import { EditTenantDialog } from '../dialogs/EditTenantDialog';
import { ConfirmDeleteDialog } from '../dialogs/ConfirmDeleteDialog';
import type { ApiAppointment, ApiProfessional, ApiService, ApiTenant } from '../../lib/api';
import type {
  TenantAdminDashboardData,
  TenantAdminProfessionalFormData,
  TenantAdminServiceFormData,
  TenantAdminTenantFormData,
} from '../../types/tenantAdminDashboard';

interface TenantAdminOverviewTabProps {
  metrics: TenantAdminDashboardData['metrics'];
  todayAppts: ApiAppointment[];
  getServiceName: (id: string) => string;
  getProfName: (id: string) => string;
}

export function TenantAdminOverviewTab({ metrics, todayAppts, getServiceName, getProfName }: TenantAdminOverviewTabProps) {
  if (!metrics) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 max-md:grid-cols-2">
        <MetricCard title="Turnos hoy" value={metrics.todayAppointments} icon={<CalendarDays className='size-5 max-md:size-4' />} />
        <MetricCard title="Esta semana" value={metrics.weekAppointments} icon={<Clock className='size-5 max-md:size-4' />} />
        <MetricCard title="Ingresos" value={`$${Math.round(metrics.revenue).toLocaleString()}`} icon={<DollarSign className='size-5 max-md:size-4' />} />
        <MetricCard title="Total turnos" value={metrics.totalAppointments} icon={<UserCheck className='size-5 max-md:size-4' />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="panel-light p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-500">Agenda del dia</p>
              <h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.05em] text-white">Turnos de hoy</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-[#a1a1aa]">{todayAppts.length} reservas</div>
          </div>

          {todayAppts.length === 0 ? (
            <div className="soft-card p-5 text-sm text-[#a1a1aa]">No hay turnos para hoy.</div>
          ) : (
            <div className="space-y-3">
              {todayAppts.map((appointment) => (
                <div key={appointment.id} className="soft-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="w-24 shrink-0">
                    <p className="font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.05em] text-white">{appointment.startTime.slice(0, 5)}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-accent-500">{appointment.endTime.slice(0, 5)}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-white">{appointment.clientName}</p>
                    <p className="mt-1 text-sm text-[#a1a1aa]">
                      {getServiceName(appointment.serviceId)} - {getProfName(appointment.professionalId)}
                    </p>
                  </div>
                  <StatusBadge status={appointment.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel-dark p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Rendimiento</p>
          <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold tracking-[-0.05em] text-white">La operacion se entiende de un vistazo.</h2>
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
          <div className="mt-6 flex items-center gap-3 rounded-[22px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100">
            <TrendingUp size={16} />
            Datos reales cargados desde API
          </div>
        </div>
      </section>
    </div>
  );
}

interface TenantAdminCalendarTabProps {
  appointments: ApiAppointment[];
  getServiceName: (id: string) => string;
  getProfName: (id: string) => string;
}

export function TenantAdminCalendarTab({ appointments, getServiceName, getProfName }: TenantAdminCalendarTabProps) {
  return (
    <div className="panel-light p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-500">Agenda completa</p>
        <h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.05em] text-white">Todas las reservas</h2>
      </div>
      {appointments.length === 0 ? (
        <div className="soft-card p-5 text-sm text-[#a1a1aa]">Sin turnos cargados.</div>
      ) : (
        <div className="space-y-3">
          {appointments
            .slice()
            .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
            .map((appointment) => (
              <div key={appointment.id} className="soft-card flex flex-col gap-3 p-4 xl:flex-row xl:items-center">
                <div className="w-40 shrink-0 text-sm font-semibold text-[#bfd0ff]">
                  {appointment.date} {appointment.startTime.slice(0, 5)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{appointment.clientName}</p>
                  <p className="mt-1 text-sm text-[#a1a1aa]">
                    {getServiceName(appointment.serviceId)} - {getProfName(appointment.professionalId)}
                  </p>
                </div>
                <StatusBadge status={appointment.status} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

interface TenantAdminProfessionalsTabProps {
  professionals: ApiProfessional[];
  savingProfessional: boolean;
  onAddProfessional: (data: TenantAdminProfessionalFormData) => Promise<void>;
  onEditProfessional: (data: TenantAdminProfessionalFormData, professionalId: string) => Promise<void>;
  onToggleProfessional: (professional: ApiProfessional) => Promise<void>;
}

export function TenantAdminProfessionalsTab({ professionals, savingProfessional, onAddProfessional, onEditProfessional, onToggleProfessional }: TenantAdminProfessionalsTabProps) {
  return (
    <div className="space-y-4">
      <div className="panel-light flex justify-end px-5 py-5">
        <CreateProfessionalDialog onSave={onAddProfessional} isLoading={savingProfessional} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {professionals.map((professional) => (
          <div key={professional.id} className="panel-light p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.05em] text-white">{professional.name}</p>
                <p className="mt-1 text-sm text-[#a1a1aa]">{professional.speciality || 'General'}</p>
              </div>
              <StatusBadge status={professional.active ? 'ACTIVE' : 'SUSPENDED'} />
            </div>
            <div className="space-y-2 text-sm text-[#a1a1aa]">
              <p>{professional.email || 'Sin email'}</p>
              <p>{professional.phone || 'Sin telefono'}</p>
            </div>
            <div className="mt-5 flex gap-2 border-t border-white/10 pt-4">
              <EditProfessionalDialog professional={professional} onSave={(data) => onEditProfessional(data, professional.id)} isLoading={savingProfessional} />
              <button onClick={() => onToggleProfessional(professional)} className="button-ghost-luxe h-11 w-11 rounded-full p-0">
                <Power size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TenantAdminServicesTabProps {
  services: ApiService[];
  savingService: boolean;
  onAddService: (data: TenantAdminServiceFormData) => Promise<void>;
  onEditService: (data: TenantAdminServiceFormData, serviceId: string) => Promise<void>;
  onRemoveService: (service: ApiService) => Promise<void>;
}

export function TenantAdminServicesTab({ services, savingService, onAddService, onEditService, onRemoveService }: TenantAdminServicesTabProps) {
  return (
    <div className="space-y-4">
      <div className="panel-light flex justify-end px-5 py-5">
        <CreateServiceDialog onSave={onAddService} isLoading={savingService} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <div key={service.id} className="panel-light p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.05em] text-white">{service.name}</h3>
                <p className="mt-2 text-sm leading-7 text-[#a1a1aa]">{service.description}</p>
              </div>
              <StatusBadge status={service.active ? 'ACTIVE' : 'SUSPENDED'} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/85">
                <span className="inline-flex items-center gap-2">
                  <Clock size={14} /> {service.duration} min
                </span>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/85">
                <span className="inline-flex items-center gap-2">
                  <DollarSign size={14} /> ${service.price.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-5 flex gap-2 border-t border-white/10 pt-4">
              <EditServiceDialog service={service} onSave={(data) => onEditService(data, service.id)} isLoading={savingService} />
              <ConfirmDeleteDialog
                description={`Estas seguro de que deseas eliminar el servicio "${service.name}"? Esta accion no se puede deshacer.`}
                onConfirm={() => onRemoveService(service)}
              >
                <button className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/10 text-rose-200 transition hover:bg-rose-400/20">
                  <Trash2 size={14} />
                </button>
              </ConfirmDeleteDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TenantAdminSettingsTabProps {
  tenant: ApiTenant | null;
  onEditTenant: (data: TenantAdminTenantFormData) => Promise<void>;
  savingTenant: boolean;
}

export function TenantAdminSettingsTab({ tenant, onEditTenant, savingTenant }: TenantAdminSettingsTabProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <div className="panel-light p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-500">Identidad del negocio</p>
        <h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.05em] text-white">Configuracion general</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ['Nombre', tenant?.name],
            ['Email', tenant?.email],
            ['Telefono', tenant?.phone || '-'],
            ['Direccion', tenant?.address || '-'],
            ['Slug publico', tenant?.slug],
          ].map(([label, value]) => (
            <div key={label} className="soft-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">{label}</p>
              <p className="mt-2 text-sm font-semibold text-white">{value}</p>
            </div>
          ))}
          <div className="soft-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">Color primario</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full border border-white/10" style={{ backgroundColor: tenant?.primaryColor || '#5e92ff' }} />
              <p className="text-sm font-semibold text-white">{tenant?.primaryColor || '#5e92ff'}</p>
            </div>
          </div>
        </div>
        <div className="mt-6">{tenant && <EditTenantDialog tenant={tenant} onSave={onEditTenant} isLoading={savingTenant} />}</div>
      </div>
    </div>
  );
}
