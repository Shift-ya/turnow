import React from 'react';
import { Eye, Pause, Trash2 } from 'lucide-react';
import { ConfirmDeleteDialog } from '../dialogs/ConfirmDeleteDialog';
import StatusBadge from '../ui/StatusBadge';
import type { ApiTenant } from '../../lib/api';

interface Props {
  tenant: ApiTenant;
  onSelectTenant: (tenant: ApiTenant) => void;
  onUpdateTenantStatus: (tenant: ApiTenant) => void;
  onDeleteTenant: (tenantId: string, tenantName: string) => void;
  deletingTenant: boolean;
}

export default function TenantCard({ tenant, onSelectTenant, onUpdateTenantStatus, onDeleteTenant, deletingTenant }: Props) {
  return (
    <div className="soft-card p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">{tenant.name}</p>
          <p className="mt-1 truncate text-sm text-[#a1a1aa]">{tenant.email}</p>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <StatusBadge status={tenant.plan} />
          <StatusBadge status={tenant.status} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-3">
        <button
          onClick={() => onSelectTenant(tenant)}
          className="button-ghost-luxe h-9 w-9 rounded-full p-0"
          title="Ver detalle"
        >
          <Eye size={15} />
        </button>
        <button
          onClick={() => onUpdateTenantStatus(tenant)}
          className="button-ghost-luxe h-9 w-9 rounded-full p-0"
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
            className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/10 text-rose-200 transition hover:bg-rose-400/20"
            title="Eliminar"
          >
            <Trash2 size={15} />
          </button>
        </ConfirmDeleteDialog>
      </div>
    </div>
  );
}
