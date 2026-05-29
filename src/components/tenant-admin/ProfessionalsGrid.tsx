import { Power } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { CreateProfessionalDialog } from '../dialogs/CreateProfessionalDialog';
import { EditProfessionalDialog } from '../dialogs/EditProfessionalDialog';
import type { ApiProfessional } from '../../lib/api';
import type { TenantAdminProfessionalFormData } from '../../types/tenantAdminDashboard';

interface Props {
  professionals: ApiProfessional[];
  savingProfessional: boolean;
  onAddProfessional: (data: TenantAdminProfessionalFormData) => Promise<void>;
  onEditProfessional: (data: TenantAdminProfessionalFormData, professionalId: string) => Promise<void>;
  onToggleProfessional: (professional: ApiProfessional) => Promise<void>;
}

export default function ProfessionalsGrid({ professionals, savingProfessional, onAddProfessional, onEditProfessional, onToggleProfessional }: Props) {
  return (
    <div className="space-y-4">
      <div className="panel-light flex justify-end px-5 py-5">
        <CreateProfessionalDialog onSave={onAddProfessional} isLoading={savingProfessional} />
      </div>
      {professionals.length === 0 ? (
        <div className="panel-light p-6">
          <p className="text-lg font-semibold text-white">No hay profesionales aún</p>
          <p className="mt-2 text-sm text-[#a1a1aa]">Agrega a tu equipo para que los clientes puedan elegir quién les atiende en la página de reservas.</p>
          <div className="mt-4 flex gap-3">
            <CreateProfessionalDialog onSave={onAddProfessional} isLoading={savingProfessional} />
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="button-ghost-luxe rounded-full px-4 py-2">Ver instrucciones</button>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}
