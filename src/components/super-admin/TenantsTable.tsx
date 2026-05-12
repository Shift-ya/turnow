import React from 'react';
import type { ApiTenant } from '../../lib/api';
import TenantsTableDesktop from './TenantsTableDesktop';
import TenantCard from './TenantCard';

interface Props {
  tenants: ApiTenant[];
  onSelectTenant: (tenant: ApiTenant) => void;
  onUpdateTenantStatus: (tenant: ApiTenant) => void;
  onDeleteTenant: (tenantId: string, tenantName: string) => void;
  deletingTenant: boolean;
}

export default function TenantsTable({ tenants, onSelectTenant, onUpdateTenantStatus, onDeleteTenant, deletingTenant }: Props) {
  return (
    <>
      {/* Desktop view */}
      <div className="hidden md:block">
        <TenantsTableDesktop
          tenants={tenants}
          onSelectTenant={onSelectTenant}
          onUpdateTenantStatus={onUpdateTenantStatus}
          onDeleteTenant={onDeleteTenant}
          deletingTenant={deletingTenant}
        />
      </div>

      {/* Mobile/Tablet view */}
      <div className="block md:hidden space-y-3">
        {tenants.map((tenant) => (
          <TenantCard
            key={tenant.id}
            tenant={tenant}
            onSelectTenant={onSelectTenant}
            onUpdateTenantStatus={onUpdateTenantStatus}
            onDeleteTenant={onDeleteTenant}
            deletingTenant={deletingTenant}
          />
        ))}
      </div>
    </>
  );
}
