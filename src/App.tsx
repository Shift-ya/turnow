import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoginPage from './pages/LoginPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import TenantAdminDashboard from './pages/TenantAdminDashboard';
import PublicBooking from './pages/PublicBooking';
import { getRuntimeConfig, type AppConfig } from './lib/runtimeConfig';

type Page = 'landing' | 'login' | 'dashboard' | 'booking';

function AppRouter() {
  const [page, setPage] = useState<Page>('landing');
  const [config, setConfig] = useState<AppConfig | null>(null);
  const { user, isAuthenticated } = useAuth();
  const hasProcessedQueryParams = useRef(false);

  const navigate = (p: string) => setPage(p as Page);

  // Load runtime config from a single source to keep API and redirects aligned.
  useEffect(() => {
    getRuntimeConfig()
      .then(setConfig)
      .catch(err => console.warn('Failed to load runtime config:', err));
  }, []);

  // Process query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    const fromParam = params.get('from');

    if (pageParam || fromParam) {
      hasProcessedQueryParams.current = true;
      
      if (pageParam === 'login') {
        setPage('login');
      }
      
      // Clean up query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);

      if (fromParam === 'landing') {
        console.log('User arrived from Shiftya landing');
      }
    }
  }, []);

  // Redirect to landing when page is 'landing' (and no query params were present initially)
  useEffect(() => {
    // Only redirect if we didn't process any query params initially
    if (config && page === 'landing' && !hasProcessedQueryParams.current) {
      window.location.href = config.landingUrl;
    }
  }, [page, config]);

  // Auto-redirect on login
  useEffect(() => {
    if (isAuthenticated && page === 'login') {
      setPage('dashboard');
    }
  }, [isAuthenticated, page]);

  if (page === 'login') return <LoginPage onNavigate={navigate} />;
  if (page === 'booking') return <PublicBooking onNavigate={navigate} />;

  if (page === 'dashboard') {
    if (!isAuthenticated) return <LoginPage onNavigate={navigate} />;
    if (user?.role === 'SUPER_ADMIN') return <SuperAdminDashboard onNavigate={navigate} />;
    return <TenantAdminDashboard onNavigate={navigate} />;
  }

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AuthProvider>
  );
}
