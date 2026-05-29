import {
  TenantAdminCalendarTab,
  TenantAdminOverviewTab,
  TenantAdminProfessionalsTab,
  TenantAdminServicesTab,
  TenantAdminSettingsTab,
} from '../../components/tenant-admin/TenantAdminDashboardTabs';
import { useTenantAdminDashboardOutletContext } from '../TenantAdminDashboard';
import { useNavigate } from 'react-router-dom';

export function TenantAdminOverviewRoute() {
  const context = useTenantAdminDashboardOutletContext();
  const navigate = useNavigate();

  return (
    <TenantAdminOverviewTab
      tenant={context.tenant}
      professionals={context.professionals}
      services={context.services}
      metrics={context.metrics}
      todayAppts={context.todayAppts}
      getServiceName={context.getServiceName}
      getProfName={context.getProfName}
      isLoading={context.loading}
      onOpenServices={() => navigate('/dashboard/services')}
      onOpenProfessionals={() => navigate('/dashboard/professionals')}
      onOpenBooking={() => {
        if (!context.tenant?.slug) return;
        navigate(`/booking/${context.tenant.slug}`);
      }}
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
      isLoading={context.loading}
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
      isLoading={context.loading}
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
      isLoading={context.loading}
    />
  );
}

export function TenantAdminSettingsRoute() {
  const context = useTenantAdminDashboardOutletContext();

  return <TenantAdminSettingsTab tenant={context.tenant} onEditTenant={context.editTenant} savingTenant={context.savingTenant} isLoading={context.loading} />;
}
