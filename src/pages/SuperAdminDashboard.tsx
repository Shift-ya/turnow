import React from 'react';
import { useNavigate, useLocation, Outlet, useOutletContext } from 'react-router-dom';
import { BarChart3, Bell, Building2, Layers3, Settings } from 'lucide-react';
import { useSuperAdminDashboard } from '../hooks/useSuperAdminDashboard';
import { SuperAdminSidebar } from '../components/super-admin/SuperAdminSidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { useAuth } from '../context/AuthContext';
import type { SuperAdminNavItem, SuperAdminTab, SuperAdminTenantFormData } from '../types/superAdminDashboard';
import type { ApiGlobalOverview, ApiTenant } from '../lib/api';

const navItems: SuperAdminNavItem[] = [
  { id: 'overview', label: 'Dashboard', icon: <BarChart3 size={18} />, caption: 'Vista general' },
  { id: 'tenants', label: 'Clientes', icon: <Building2 size={18} />, caption: 'Base activa' },
  { id: 'plans', label: 'Planes', icon: <Layers3 size={18} />, caption: 'Monetizacion' },
];

const tabToSegment: Record<SuperAdminTab, string> = {
  overview: 'metrics',
  tenants: 'clients',
  plans: 'plans',
};

function parseActiveTab(segment: string | undefined): SuperAdminTab {
  switch (segment) {
    case 'metrics':
    case 'overview':
      return 'overview';
    case 'clients':
    case 'tenants':
      return 'tenants';
    case 'plans':
      return 'plans';
    default:
      return 'overview';
  }
}

export interface SuperAdminDashboardOutletContext {
  metrics: ApiGlobalOverview | null;
  tenants: ApiTenant[];
  search: string;
  loading: boolean;
  error: string;
  creatingTenant: boolean;
  deletingTenant: boolean;
  selectedTenant: ApiTenant | null;
  setSearch: (value: string) => void;
  setSelectedTenant: (tenant: ApiTenant | null) => void;
  createTenant: (data: SuperAdminTenantFormData) => Promise<void>;
  updateTenantStatus: (tenant: ApiTenant) => Promise<void>;
  deleteTenant: (tenantId: string, tenantName: string) => Promise<void>;
}

export function useSuperAdminDashboardOutletContext() {
  return useOutletContext<SuperAdminDashboardOutletContext>();
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const {
    search,
    setSearch,
    sidebarOpen,
    setSidebarOpen,
    loading,
    error,
    metrics,
    tenants,
    creatingTenant,
    deletingTenant,
    createTenant,
    updateTenantStatus,
    deleteTenant,
  } = useSuperAdminDashboard();

  const [selectedTenant, setSelectedTenant] = React.useState<(typeof tenants)[number] | null>(null);

  const pathSegment = location.pathname.split('/')[2];
  const activeTab = parseActiveTab(pathSegment);

  const setActiveTab = (nextTab: SuperAdminTab) => {
    navigate(`/dashboard/${tabToSegment[nextTab]}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="app-shell min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-7xl gap-6">
        <SuperAdminSidebar
          activeTab={activeTab}
          navItems={navItems}
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelectTab={setActiveTab}
          onLogout={handleLogout}
          metrics={metrics}
          user={user}
        />

        {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/55 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <div className="min-w-0 flex-1">
          <DashboardHeader<SuperAdminTab>
            activeTab={activeTab}
            navItems={navItems}
            title="Control global"
            eyebrow="Control global"
            subtitle="Gestion de toda la plataforma"
            onOpenSidebar={() => setSidebarOpen(true)}
            onSelectTab={setActiveTab}
            actions={[
              { key: 'bell', node: <Bell size={18} />, ariaLabel: 'Notificaciones' },
              { key: 'settings', node: <Settings size={18} />, ariaLabel: 'Ajustes' },
            ]}
          />

          <main className="space-y-6">
            {loading && <p className="text-[#a1a1aa]">Cargando...</p>}
            {error && (
              <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <Outlet
              context={{
                metrics,
                tenants,
                search,
                loading,
                error,
                creatingTenant,
                deletingTenant,
                selectedTenant,
                setSearch,
                setSelectedTenant,
                createTenant,
                updateTenantStatus,
                deleteTenant,
              }}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
