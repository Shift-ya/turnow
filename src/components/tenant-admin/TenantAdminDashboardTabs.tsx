import type { ApiAppointment, ApiProfessional, ApiService, ApiTenant } from '../../lib/api';
import type {
  TenantAdminDashboardData,
  TenantAdminProfessionalFormData,
  TenantAdminServiceFormData,
  TenantAdminTenantFormData,
} from '../../types/tenantAdminDashboard';
import { TenantOnboardingPanel } from './TenantOnboardingPanel';
import CalendarAppointmentsPanel from './CalendarAppointmentsPanel';
import PerformancePanel from './PerformancePanel';
import ProfessionalsGrid from './ProfessionalsGrid';
import ServicesGrid from './ServicesGrid';
import TenantOverviewMetrics from './TenantOverviewMetrics';
import TenantSettingsPanel from './TenantSettingsPanel';
import TodayAppointmentsPanel from './TodayAppointmentsPanel';
import TenantAdminOverviewSkeleton from '../skeletons/TenantAdminOverviewSkeleton';
import CalendarAppointmentsSkeleton from '../skeletons/CalendarAppointmentsSkeleton';
import ProfessionalsSkeleton from '../skeletons/ProfessionalsSkeleton';
import ServicesSkeleton from '../skeletons/ServicesSkeleton';
import SettingsFormSkeleton from '../skeletons/SettingsFormSkeleton';

interface TenantAdminOverviewTabProps {
  tenant: ApiTenant | null;
  professionals: ApiProfessional[];
  services: ApiService[];
  metrics: TenantAdminDashboardData['metrics'];
  todayAppts: ApiAppointment[];
  getServiceName: (id: string) => string;
  getProfName: (id: string) => string;
  isLoading?: boolean;
  onOpenServices: () => void;
  onOpenProfessionals: () => void;
  onOpenBooking: () => void;
}

export function TenantAdminOverviewTab({
  tenant,
  professionals,
  services,
  metrics,
  todayAppts,
  getServiceName,
  getProfName,
  isLoading,
  onOpenServices,
  onOpenProfessionals,
  onOpenBooking,
}: TenantAdminOverviewTabProps) {
  if (isLoading) {
    return <TenantAdminOverviewSkeleton />;
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="space-y-6">
      <TenantOnboardingPanel
        tenant={tenant}
        services={services}
        professionals={professionals}
        todayAppointmentsCount={todayAppts.length}
        onOpenServices={onOpenServices}
        onOpenProfessionals={onOpenProfessionals}
        onOpenBooking={onOpenBooking}
      />

      <TenantOverviewMetrics metrics={metrics} />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <TodayAppointmentsPanel todayAppts={todayAppts} getServiceName={getServiceName} getProfName={getProfName} />
        <PerformancePanel metrics={metrics} />
      </section>
    </div>
  );
}

interface TenantAdminCalendarTabProps {
  appointments: ApiAppointment[];
  getServiceName: (id: string) => string;
  getProfName: (id: string) => string;
  isLoading?: boolean;
}

export function TenantAdminCalendarTab({ appointments, getServiceName, getProfName, isLoading }: TenantAdminCalendarTabProps) {
  if (isLoading) {
    return <CalendarAppointmentsSkeleton />;
  }

  return <CalendarAppointmentsPanel appointments={appointments} getServiceName={getServiceName} getProfName={getProfName} />;
}

interface TenantAdminProfessionalsTabProps {
  professionals: ApiProfessional[];
  savingProfessional: boolean;
  onAddProfessional: (data: TenantAdminProfessionalFormData) => Promise<void>;
  onEditProfessional: (data: TenantAdminProfessionalFormData, professionalId: string) => Promise<void>;
  onToggleProfessional: (professional: ApiProfessional) => Promise<void>;
  isLoading?: boolean;
}

export function TenantAdminProfessionalsTab({
  professionals,
  savingProfessional,
  onAddProfessional,
  onEditProfessional,
  onToggleProfessional,
  isLoading,
}: TenantAdminProfessionalsTabProps) {
  if (isLoading) {
    return <ProfessionalsSkeleton />;
  }

  return (
    <ProfessionalsGrid
      professionals={professionals}
      savingProfessional={savingProfessional}
      onAddProfessional={onAddProfessional}
      onEditProfessional={onEditProfessional}
      onToggleProfessional={onToggleProfessional}
    />
  );
}

interface TenantAdminServicesTabProps {
  services: ApiService[];
  savingService: boolean;
  onAddService: (data: TenantAdminServiceFormData) => Promise<void>;
  onEditService: (data: TenantAdminServiceFormData, serviceId: string) => Promise<void>;
  onRemoveService: (service: ApiService) => Promise<void>;
  isLoading?: boolean;
}

export function TenantAdminServicesTab({ services, savingService, onAddService, onEditService, onRemoveService, isLoading }: TenantAdminServicesTabProps) {
  if (isLoading) {
    return <ServicesSkeleton />;
  }

  return (
    <ServicesGrid
      services={services}
      savingService={savingService}
      onAddService={onAddService}
      onEditService={onEditService}
      onRemoveService={onRemoveService}
    />
  );
}

interface TenantAdminSettingsTabProps {
  tenant: ApiTenant | null;
  onEditTenant: (data: TenantAdminTenantFormData) => Promise<void>;
  savingTenant: boolean;
  isLoading?: boolean;
}

export function TenantAdminSettingsTab({ tenant, onEditTenant, savingTenant, isLoading }: TenantAdminSettingsTabProps) {
  if (isLoading) {
    return <SettingsFormSkeleton />;
  }

  return <TenantSettingsPanel tenant={tenant} onEditTenant={onEditTenant} savingTenant={savingTenant} />;
}
