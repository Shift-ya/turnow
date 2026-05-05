import { useEffect, useMemo, useState } from 'react';
import { Building2, Users, CalendarDays, DollarSign, Activity, Search, Eye, Pause, Trash2, LogOut, BarChart3, Settings, Bell, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../components/ui/MetricCard';
import StatusBadge from '../components/ui/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { api, type ApiGlobalOverview, type ApiTenant } from '../lib/api';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'plans'>('overview');
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<ApiTenant | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [metrics, setMetrics] = useState<ApiGlobalOverview | null>(null);
  const [tenants, setTenants] = useState<ApiTenant[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overview, tenantList] = await Promise.all([api.superOverview(), api.listTenants(search)]);
      setMetrics(overview);
      setTenants(tenantList);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar datos globales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const filteredTenants = useMemo(() => tenants, [tenants]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const createTenant = async () => {
    const name = prompt('Nombre del negocio:');
    if (!name) return;
    const email = prompt('Email:') || '';
    const phone = prompt('Telefono:') || '';
    const address = prompt('Direccion:') || '';
    const slug = (prompt('Slug publico:', name.toLowerCase().replace(/\s+/g, '-')) || '').trim();
    const plan = (prompt('Plan (BASIC, PROFESSIONAL, PREMIUM):', 'BASIC') || 'BASIC').toUpperCase();

    await api.createTenant({ name, email, phone, address, slug, plan });
    await loadData();
  };

  const toggleStatus = async (tenant: ApiTenant) => {
    const next = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await api.updateTenantStatus(tenant.id, next);
    await loadData();
  };

  const removeTenant = async (tenant: ApiTenant) => {
    if (!confirm(`Eliminar ${tenant.name}?`)) return;
    await api.deleteTenant(tenant.id);
    await loadData();
  };

  const navItems = [
    { id: 'overview' as const, label: 'Dashboard', icon: <BarChart3 size={18} /> },
    { id: 'tenants' as const, label: 'Clientes', icon: <Building2 size={18} /> },
    { id: 'plans' as const, label: 'Planes', icon: <DollarSign size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"><Activity size={16} /></div>
              <div><p className="font-bold text-sm">turnow</p><p className="text-xs text-gray-400">Super Admin</p></div>
            </div>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === item.id ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-xs font-bold">{user?.name?.[0]}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{user?.name}</p><p className="text-xs text-gray-400 truncate">{user?.email}</p></div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"><LogOut size={16} /> Cerrar sesion</button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <h1 className="text-lg font-bold text-gray-900">
              {activeTab === 'overview' && 'Dashboard Global'}
              {activeTab === 'tenants' && 'Gestion de Clientes'}
              {activeTab === 'plans' && 'Planes de Suscripcion'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-50 rounded-lg relative"><Bell size={18} className="text-gray-500" /></button>
            <button className="p-2 hover:bg-gray-50 rounded-lg"><Settings size={18} className="text-gray-500" /></button>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          {loading && <p className="text-gray-500">Cargando...</p>}
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

          {!loading && metrics && activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Total Clientes" value={metrics.totalTenants} icon={<Building2 size={20} />} />
                <MetricCard title="Clientes Activos" value={metrics.activeTenants} icon={<Users size={20} />} />
                <MetricCard title="Turnos Totales" value={metrics.totalAppointments.toLocaleString()} icon={<CalendarDays size={20} />} />
                <MetricCard title="Ingresos MRR" value={`$${metrics.totalRevenue.toLocaleString()}`} icon={<DollarSign size={20} />} />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Ultimos Clientes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="pb-3 font-medium">Negocio</th>
                        <th className="pb-3 font-medium">Plan</th>
                        <th className="pb-3 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.slice(0, 6).map((t) => (
                        <tr key={t.id} className="border-b border-gray-50">
                          <td className="py-3 font-medium text-gray-900">{t.name}</td>
                          <td className="py-3"><StatusBadge status={t.plan} /></td>
                          <td className="py-3"><StatusBadge status={t.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'tenants' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <button onClick={createTenant} className="px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition">+ Nuevo Cliente</button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 bg-gray-50">
                        <th className="px-5 py-3 font-medium">Negocio</th>
                        <th className="px-5 py-3 font-medium hidden sm:table-cell">Email</th>
                        <th className="px-5 py-3 font-medium">Plan</th>
                        <th className="px-5 py-3 font-medium">Estado</th>
                        <th className="px-5 py-3 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTenants.map((t) => (
                        <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-5 py-4"><p className="font-medium text-gray-900">{t.name}</p></td>
                          <td className="px-5 py-4 text-gray-500 hidden sm:table-cell">{t.email}</td>
                          <td className="px-5 py-4"><StatusBadge status={t.plan} /></td>
                          <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">
                              <button onClick={() => setSelectedTenant(t)} className="p-1.5 hover:bg-gray-100 rounded-lg transition" title="Ver detalle"><Eye size={15} className="text-gray-500" /></button>
                              <button onClick={() => toggleStatus(t)} className="p-1.5 hover:bg-gray-100 rounded-lg transition" title="Suspender/Activar"><Pause size={15} className="text-gray-500" /></button>
                              <button onClick={() => removeTenant(t)} className="p-1.5 hover:bg-red-50 rounded-lg transition" title="Eliminar"><Trash2 size={15} className="text-red-400" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedTenant && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTenant(null)}>
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">{selectedTenant.name}</h3>
                      <button onClick={() => setSelectedTenant(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-gray-500">Email</p><p className="font-medium text-gray-900">{selectedTenant.email}</p></div>
                      <div><p className="text-gray-500">Telefono</p><p className="font-medium text-gray-900">{selectedTenant.phone}</p></div>
                      <div><p className="text-gray-500">Direccion</p><p className="font-medium text-gray-900">{selectedTenant.address}</p></div>
                      <div><p className="text-gray-500">Slug</p><p className="font-medium text-gray-900">{selectedTenant.slug}</p></div>
                      <div><p className="text-gray-500">Plan</p><StatusBadge status={selectedTenant.plan} size="md" /></div>
                      <div><p className="text-gray-500">Estado</p><StatusBadge status={selectedTenant.status} size="md" /></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && metrics && activeTab === 'plans' && (
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { plan: 'BASIC', price: '$19.99', clients: metrics.activePlans.basic },
                { plan: 'PROFESSIONAL', price: '$49.99', clients: metrics.activePlans.professional },
                { plan: 'PREMIUM', price: '$99.99', clients: metrics.activePlans.premium },
              ].map((p) => (
                <div key={p.plan} className="bg-white rounded-2xl border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <StatusBadge status={p.plan} size="md" />
                    <span className="text-xl font-bold text-gray-900">{p.price}</span>
                  </div>
                  <p className="text-sm text-gray-600">Clientes activos: <span className="font-semibold text-gray-900">{p.clients}</span></p>
                  <button className="mt-4 w-full py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition">Editar Plan</button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
