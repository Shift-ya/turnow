import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoadingScreen() {
  return <div className="min-h-screen grid place-items-center text-gray-500">Cargando...</div>;
}

export default function RequireAuthLayout() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
