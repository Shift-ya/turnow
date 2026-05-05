import { useState } from 'react';
import { Calendar, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { TOAST_MESSAGES } from '../types/toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const quickLogins = [
    { label: 'Super Admin', email: 'admin@turnow.com' },
    { label: 'Admin Negocio', email: 'maria@bellavida.com' },
    { label: 'Staff', email: 'pedro@bellavida.com' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Ingresa tu email');
      return;
    }

    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);

    if (ok) {
      success(TOAST_MESSAGES.auth.loginSuccess);
      navigate('/dashboard', { replace: true });
    } else {
      setError('Credenciales invalidas');
      showError(TOAST_MESSAGES.auth.loginError);
    }
  };

  const quickLogin = async (em: string) => {
    setLoading(true);
    const ok = await login(em, 'demo123');
    setLoading(false);

    if (ok) {
      success(TOAST_MESSAGES.auth.loginSuccess);
      navigate('/dashboard', { replace: true });
    } else {
      setError('No se pudo iniciar sesion rapida');
      showError(TOAST_MESSAGES.auth.loginError);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
          <ArrowLeft size={16} /> Volver al sitio
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Bienvenido a turnow</h1>
            <p className="text-gray-500 mt-2 text-sm">Ingresa a tu cuenta para gestionar tu negocio</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contrasena</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition pr-10"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                disabled={loading}
                type="submit"
                className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition text-sm disabled:opacity-60"
              >
                {loading ? 'Ingresando...' : 'Iniciar sesion'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-3">Acceso rapido para pruebas</p>
              <div className="grid grid-cols-3 gap-2">
                {quickLogins.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => quickLogin(q.email)}
                    className="py-2 px-2 text-xs font-medium bg-gray-50 hover:bg-primary-50 hover:text-primary-700 text-gray-600 rounded-lg transition border border-gray-100"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">Contrasena demo para todos los usuarios: <span className="font-semibold">demo123</span></p>
        </div>
      </div>
    </div>
  );
}
