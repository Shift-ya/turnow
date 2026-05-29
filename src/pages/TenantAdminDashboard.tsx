import { BarChart3, Bell, Briefcase, CalendarDays, Settings, Users } from 'lucide-react';
import { useNavigate, useLocation, Outlet, useOutletContext } from 'react-router-dom';
import { TenantAdminSidebar } from '../components/tenant-admin/TenantAdminSidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { useAuth } from '../context/AuthContext';
import { useTenantAdminDashboard } from '../hooks/useTenantAdminDashboard';
import type {
  TenantAdminNavItem,
  TenantAdminProfessionalFormData,
  TenantAdminServiceFormData,
  TenantAdminTab,
  TenantAdminTenantFormData,
} from '../types/tenantAdminDashboard';
import type { ApiAppointment, ApiProfessional, ApiService, ApiTenant, ApiTenantOverview } from '../lib/api';
import { InteractiveMenu, type InteractiveMenuItem } from '../components/ui/modern-mobile-menu';

const navItems: TenantAdminNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} />, caption: 'KPIs y foco diario' },
  { id: 'calendar', label: 'Calendario', icon: <CalendarDays size={18} />, caption: 'Agenda completa' },
  { id: 'professionals', label: 'Profesionales', icon: <Users size={18} />, caption: 'Equipo activo' },
  { id: 'services', label: 'Servicios', icon: <Briefcase size={18} />, caption: 'Oferta comercial' },
  { id: 'settings', label: 'Configuracion', icon: <Settings size={18} />, caption: 'Identidad y datos' },
];

const tabToSegment: Record<TenantAdminTab, string> = {
  dashboard: 'metrics',
  calendar: 'calendar',
  professionals: 'professionals',
  services: 'services',
  settings: 'settings',
};

const mobileMenuItems: InteractiveMenuItem[] = [
  { label: 'Metricas', icon: BarChart3 },
  { label: 'Calendario', icon: CalendarDays },
  { label: 'Profesionales', icon: Users },
  { label: 'Servicios', icon: Briefcase },
];

function parseActiveTab(segment: string | undefined): TenantAdminTab {
  switch (segment) {
    case 'metrics':
    case 'dashboard':
      return 'dashboard';
    case 'calendar':
    case 'professionals':
    case 'services':
    case 'settings':
      return segment;
    default:
      return 'dashboard';
  }
}

export interface TenantAdminDashboardOutletContext {
  loading: boolean;
  error: string;
  tenant: ApiTenant | null;
  metrics: ApiTenantOverview['metrics'] | null;
  appointments: ApiAppointment[];
  todayAppts: ApiAppointment[];
  professionals: ApiProfessional[];
  services: ApiService[];
  savingProfessional: boolean;
  savingService: boolean;
  savingTenant: boolean;
  addProfessional: (data: TenantAdminProfessionalFormData) => Promise<void>;
  editProfessional: (data: TenantAdminProfessionalFormData, professionalId: string) => Promise<void>;
  toggleProfessional: (professional: ApiProfessional) => Promise<void>;
  addService: (data: TenantAdminServiceFormData) => Promise<void>;
  editService: (data: TenantAdminServiceFormData, serviceId: string) => Promise<void>;
  removeService: (service: ApiService) => Promise<void>;
  editTenant: (data: TenantAdminTenantFormData) => Promise<void>;
  getServiceName: (id: string) => string;
  getProfName: (id: string) => string;
}

export function useTenantAdminDashboardOutletContext() {
  return useOutletContext<TenantAdminDashboardOutletContext>();
}

export default function TenantAdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const tenantId = user?.tenantId;
  const dashboard = useTenantAdminDashboard(tenantId);
  const pathSegment = location.pathname.split('/')[2];
  const activeTab = parseActiveTab(pathSegment);
  const activeIndex = navItems.findIndex((item) => item.id === activeTab);

  const setActiveTab = (nextTab: TenantAdminTab) => {
    navigate(`/dashboard/${tabToSegment[nextTab]}`);
  };

  const openPublicBooking = () => {
    if (!dashboard.tenant?.slug) return;
    navigate(`/booking/${dashboard.tenant.slug}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (!tenantId) {
    return <div className="app-shell grid min-h-screen place-items-center">Usuario sin tenant asignado</div>;
  }

  return (
    <>
      <div className="app-shell min-h-screen py-5 pb-32">
        <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-7xl gap-6">
          <div className="hidden lg:block">
            <TenantAdminSidebar
              tenantName={dashboard.tenant?.name || 'Tenant'}
              navItems={navItems}
              activeTab={activeTab}
              sidebarOpen={dashboard.sidebarOpen}
              onClose={() => dashboard.setSidebarOpen(false)}
              onSelectTab={setActiveTab}
              onOpenPublicBooking={openPublicBooking}
              onLogout={handleLogout}
            />
          </div>

          <div className="min-w-0 flex-1">
            <DashboardHeader<TenantAdminTab>
              activeTab={activeTab}
              navItems={navItems}
              title="Panel operativo"
              eyebrow="Panel operativo"
              onOpenSidebar={() => dashboard.setSidebarOpen(true)}
              onSelectTab={setActiveTab}
              showSidebarToggle={false}
              actions={[{ key: 'bell', node: <Bell size={18} />, ariaLabel: 'Notificaciones' }]}
            />

            <main className="space-y-6">
              {dashboard.error && (
                <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                  {dashboard.error}
                </div>
              )}

              <Outlet
                context={{
                  loading: dashboard.loading,
                  error: dashboard.error,
                  tenant: dashboard.tenant,
                  metrics: dashboard.metrics,
                  appointments: dashboard.appointments,
                  todayAppts: dashboard.todayAppts,
                  professionals: dashboard.professionals,
                  services: dashboard.services,
                  savingProfessional: dashboard.savingProfessional,
                  savingService: dashboard.savingService,
                  savingTenant: dashboard.savingTenant,
                  addProfessional: dashboard.addProfessional,
                  editProfessional: dashboard.editProfessional,
                  toggleProfessional: dashboard.toggleProfessional,
                  addService: dashboard.addService,
                  editService: dashboard.editService,
                  removeService: dashboard.removeService,
                  editTenant: dashboard.editTenant,
                  getServiceName: dashboard.getServiceName,
                  getProfName: dashboard.getProfName,
                }}
              />
            </main>
          </div>
        </div>
      </div>
      <InteractiveMenu
        className="lg:hidden"
        items={mobileMenuItems}
        activeIndex={activeIndex < 0 ? 0 : activeIndex}
        profile={{
          name: user?.name || 'Usuario',
          email: user?.email || '',
          onLogout: handleLogout,
          actions: [
            {
              label: 'Editar datos del negocio',
              icon: Settings,
              onClick: () => setActiveTab('settings'),
            },
          ],
        }}
        onItemSelect={(index) => {
          const nextTab = navItems[index]?.id;
          if (!nextTab) return;
          setActiveTab(nextTab);
        }}
        ariaLabel="Navegación del panel"
      />
    </>
  );
}
