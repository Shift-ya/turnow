import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRuntimeConfig } from '../lib/runtimeConfig';

export default function LandingRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    const tenantParam = params.get('tenant') || params.get('slug');
    const hostname = window.location.hostname;

    if (pageParam === 'booking' && tenantParam) {
      navigate(`/booking/${tenantParam}`, { replace: true });
      return;
    }

    if (pageParam === 'login' || pageParam === 'dashboard') {
      navigate(`/${pageParam}`, { replace: true });
      return;
    }

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      navigate('/login', { replace: true });
      return;
    }

    getRuntimeConfig()
      .then(cfg => {
        window.location.replace(cfg.landingUrl);
      })
      .catch(() => {
        window.location.replace('https://www.shiftya.online');
      });
  }, [navigate]);

  return <div className="min-h-screen grid place-items-center text-gray-500">Cargando...</div>;
}
