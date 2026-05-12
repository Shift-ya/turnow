import { Search } from 'lucide-react';
import { CreateTenantDialog } from '../dialogs/CreateTenantDialog';
import { TenantDetailDialog } from '../dialogs/TenantDetailDialog';
import { ConfirmDeleteDialog } from '../dialogs/ConfirmDeleteDialog';
import type { SuperAdminTenantFormData } from '../../types/superAdminDashboard';
import type { ApiGlobalOverview, ApiTenant } from '../../lib/api';
import MetricGrid from './MetricGrid';
import RecentTenantsList from './RecentTenantsList';
import TenantsTable from './TenantsTable';
import PlansGrid from './PlansGrid';
import StatusBadge from '../ui/StatusBadge';

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
      <MetricGrid metrics={metrics} />
      <RecentTenantsList tenants={tenants} />
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
      <TenantsTable
        tenants={tenants}
        onSelectTenant={onSelectTenant}
        onUpdateTenantStatus={onUpdateTenantStatus}
        onDeleteTenant={onDeleteTenant}
        deletingTenant={deletingTenant}
      />

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
  return <PlansGrid metrics={metrics} />;
}
