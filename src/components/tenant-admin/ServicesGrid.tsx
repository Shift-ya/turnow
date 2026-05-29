import { Clock, DollarSign, Trash2 } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { ConfirmDeleteDialog } from '../dialogs/ConfirmDeleteDialog';
import { CreateServiceDialog } from '../dialogs/CreateServiceDialog';
import { EditServiceDialog } from '../dialogs/EditServiceDialog';
import type { ApiService } from '../../lib/api';
import type { TenantAdminServiceFormData } from '../../types/tenantAdminDashboard';

interface Props {
  services: ApiService[];
  savingService: boolean;
  onAddService: (data: TenantAdminServiceFormData) => Promise<void>;
  onEditService: (data: TenantAdminServiceFormData, serviceId: string) => Promise<void>;
  onRemoveService: (service: ApiService) => Promise<void>;
}

export default function ServicesGrid({ services, savingService, onAddService, onEditService, onRemoveService }: Props) {
  return (
    <div className="space-y-4">
      <div className="panel-light flex justify-end px-5 py-5">
        <CreateServiceDialog onSave={onAddService} isLoading={savingService} />
      </div>
      {services.length === 0 ? (
        <div className="panel-light p-6">
          <p className="text-lg font-semibold text-white">No hay servicios aún</p>
          <p className="mt-2 text-sm text-[#a1a1aa]">Agrega tus servicios para que los clientes puedan reservar. Ej: Corte de pelo, Consulta, Manicura.</p>
          <div className="mt-4 flex gap-3">
            <CreateServiceDialog onSave={onAddService} isLoading={savingService} />
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="button-ghost-luxe rounded-full px-4 py-2">Ver consejos</button>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}
