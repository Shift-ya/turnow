import { useAuth } from '../context/AuthContext';
import SuperAdminDashboard from '../pages/SuperAdminDashboard';
import TenantAdminDashboard from '../pages/TenantAdminDashboard';

export default function DashboardRoute() {
  const { user } = useAuth();

  return user?.role === 'SUPER_ADMIN' ? <SuperAdminDashboard /> : <TenantAdminDashboard />;
}
