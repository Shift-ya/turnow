import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoginPage from './pages/LoginPage';
import PublicBooking from './pages/PublicBooking';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingRoute from './routes/LandingRoute';
import RequireAuthLayout from './routes/RequireAuthLayout';
import RequireGuestLayout from './routes/RequireGuestLayout';
import DashboardRoute from './routes/DashboardRoute';

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
              <Route path="/dashboard" element={<DashboardRoute />} />
              <Route path="/booking" element={<PublicBooking />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
