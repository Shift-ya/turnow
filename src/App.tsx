import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoginPage from './pages/LoginPage';
import PublicBooking from './pages/PublicBooking';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingRoute from './routes/LandingRoute';
import RequireAuthLayout from './routes/RequireAuthLayout';
import RequireGuestLayout from './routes/RequireGuestLayout';
import {
  DashboardMetricsRoute,
  DashboardIndexRedirect,
  DashboardRoute,
  RequireSuperAdminDashboard,
  RequireTenantAdminDashboard,
} from './routes/DashboardRoute';
import { SuperAdminTenantsRoute, SuperAdminPlansRoute } from './pages/super-admin/SuperAdminRoutes';
import {
  TenantAdminCalendarRoute,
  TenantAdminProfessionalsRoute,
  TenantAdminServicesRoute,
  TenantAdminSettingsRoute,
} from './pages/tenant-admin/TenantAdminRoutes';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingRoute />} />
            <Route element={<RequireGuestLayout />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
            <Route element={<RequireAuthLayout />}>
              <Route path="/dashboard" element={<DashboardRoute />}>
                <Route index element={<DashboardIndexRedirect />} />
                <Route path="metrics" element={<DashboardMetricsRoute />} />

                <Route path="clients" element={<RequireSuperAdminDashboard><SuperAdminTenantsRoute /></RequireSuperAdminDashboard>} />
                <Route path="plans" element={<RequireSuperAdminDashboard><SuperAdminPlansRoute /></RequireSuperAdminDashboard>} />
                <Route path="overview" element={<RequireSuperAdminDashboard><Navigate to="../metrics" replace /></RequireSuperAdminDashboard>} />
                <Route path="tenants" element={<RequireSuperAdminDashboard><Navigate to="../clients" replace /></RequireSuperAdminDashboard>} />

                <Route path="calendar" element={<RequireTenantAdminDashboard><TenantAdminCalendarRoute /></RequireTenantAdminDashboard>} />
                <Route path="professionals" element={<RequireTenantAdminDashboard><TenantAdminProfessionalsRoute /></RequireTenantAdminDashboard>} />
                <Route path="services" element={<RequireTenantAdminDashboard><TenantAdminServicesRoute /></RequireTenantAdminDashboard>} />
                <Route path="settings" element={<RequireTenantAdminDashboard><TenantAdminSettingsRoute /></RequireTenantAdminDashboard>} />
                <Route path="dashboard" element={<RequireTenantAdminDashboard><Navigate to="../metrics" replace /></RequireTenantAdminDashboard>} />

                <Route path="*" element={<DashboardIndexRedirect />} />
              </Route>
              <Route path="/booking" element={<PublicBooking />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
