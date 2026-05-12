import React from 'react';
import { Eye, Pause, Trash2 } from 'lucide-react';
import { ConfirmDeleteDialog } from '../dialogs/ConfirmDeleteDialog';
import StatusBadge from '../ui/StatusBadge';
import type { ApiTenant } from '../../lib/api';

interface Props {
  tenants: ApiTenant[];
  onSelectTenant: (tenant: ApiTenant) => void;
  onUpdateTenantStatus: (tenant: ApiTenant) => void;
  onDeleteTenant: (tenantId: string, tenantName: string) => void;
  deletingTenant: boolean;
}

export default function TenantsTableDesktop({ tenants, onSelectTenant, onUpdateTenantStatus, onDeleteTenant, deletingTenant }: Props) {
  return (
    <div className="panel-light overflow-hidden p-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
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
  );
}
