import {
  TenantAdminCalendarTab,
  TenantAdminOverviewTab,
  TenantAdminProfessionalsTab,
  TenantAdminServicesTab,
  TenantAdminSettingsTab,
} from '../../components/tenant-admin/TenantAdminDashboardTabs';
import { useTenantAdminDashboardOutletContext } from '../TenantAdminDashboard';

export function TenantAdminOverviewRoute() {
  const context = useTenantAdminDashboardOutletContext();

  return (
    <TenantAdminOverviewTab
      metrics={context.metrics}
      todayAppts={context.todayAppts}
      getServiceName={context.getServiceName}
      getProfName={context.getProfName}
    />
  );
}

export function TenantAdminCalendarRoute() {
  const context = useTenantAdminDashboardOutletContext();

  return (
    <TenantAdminCalendarTab
      appointments={context.appointments}
      getServiceName={context.getServiceName}
      getProfName={context.getProfName}
    />
  );
}

export function TenantAdminProfessionalsRoute() {
  const context = useTenantAdminDashboardOutletContext();

  return (
    <TenantAdminProfessionalsTab
      professionals={context.professionals}
      savingProfessional={context.savingProfessional}
      onAddProfessional={context.addProfessional}
      onEditProfessional={context.editProfessional}
      onToggleProfessional={context.toggleProfessional}
    />
  );
}

export function TenantAdminServicesRoute() {
  const context = useTenantAdminDashboardOutletContext();

  return (
    <TenantAdminServicesTab
      services={context.services}
      savingService={context.savingService}
      onAddService={context.addService}
      onEditService={context.editService}
      onRemoveService={context.removeService}
    />
  );
}

export function TenantAdminSettingsRoute() {
  const context = useTenantAdminDashboardOutletContext();

  return <TenantAdminSettingsTab tenant={context.tenant} onEditTenant={context.editTenant} savingTenant={context.savingTenant} />;
}
