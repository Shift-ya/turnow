import { SuperAdminOverviewTab, SuperAdminPlansTab, SuperAdminTenantsTab } from '../../components/super-admin/SuperAdminTabs';
import { useSuperAdminDashboardOutletContext } from '../SuperAdminDashboard';

export function SuperAdminOverviewRoute() {
  const context = useSuperAdminDashboardOutletContext();

  return <SuperAdminOverviewTab metrics={context.metrics} tenants={context.tenants} loading={context.loading} />;
}

export function SuperAdminTenantsRoute() {
  const context = useSuperAdminDashboardOutletContext();

  return (
    <SuperAdminTenantsTab
      tenants={context.tenants}
      search={context.search}
      onSearchChange={context.setSearch}
      onCreateTenant={context.createTenant}
      onUpdateTenantStatus={context.updateTenantStatus}
      onDeleteTenant={context.deleteTenant}
      creatingTenant={context.creatingTenant}
      deletingTenant={context.deletingTenant}
      selectedTenant={context.selectedTenant}
      onSelectTenant={context.setSelectedTenant}
    />
  );
}

export function SuperAdminPlansRoute() {
  const context = useSuperAdminDashboardOutletContext();

  return <SuperAdminPlansTab metrics={context.metrics} loading={context.loading} />;
}
