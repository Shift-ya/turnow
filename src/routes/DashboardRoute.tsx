import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SuperAdminDashboard from '../pages/SuperAdminDashboard';
import TenantAdminDashboard from '../pages/TenantAdminDashboard';
import { SuperAdminOverviewRoute } from '../pages/super-admin/SuperAdminRoutes';
import { TenantAdminOverviewRoute } from '../pages/tenant-admin/TenantAdminRoutes';

export function DashboardRoute() {
  const { user } = useAuth();

  return user?.role === 'SUPER_ADMIN' ? <SuperAdminDashboard /> : <TenantAdminDashboard />;
}

export function DashboardIndexRedirect() {
  const { user } = useAuth();

  if (user?.role === 'SUPER_ADMIN') {
    return <Navigate to="/dashboard/metrics" replace />;
  }

  return <Navigate to="/dashboard/metrics" replace />;
}

interface RoleGuardProps {
  children: ReactElement;
}

export function RequireSuperAdminDashboard({ children }: RoleGuardProps) {
  const { user } = useAuth();

  if (user?.role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard/metrics" replace />;
  }

  return children;
}

export function RequireTenantAdminDashboard({ children }: RoleGuardProps) {
  const { user } = useAuth();

  if (user?.role === 'SUPER_ADMIN') {
    return <Navigate to="/dashboard/metrics" replace />;
  }

  return children;
}

export function DashboardMetricsRoute() {
  const { user } = useAuth();

  return user?.role === 'SUPER_ADMIN' ? <SuperAdminOverviewRoute /> : <TenantAdminOverviewRoute />;
}

export default DashboardRoute;
