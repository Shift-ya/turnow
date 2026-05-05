import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Users, Briefcase, BarChart3, Settings, LogOut, Menu, X, Bell, Plus, Clock, DollarSign, UserCheck, TrendingUp, Edit2, Trash2, Power } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../components/ui/MetricCard';
import StatusBadge from '../components/ui/StatusBadge';
import { EditProfessionalDialog } from '../components/dialogs/EditProfessionalDialog';
import { EditServiceDialog } from '../components/dialogs/EditServiceDialog';
import { CreateServiceDialog } from '../components/dialogs/CreateServiceDialog';
import { EditTenantDialog } from '../components/dialogs/EditTenantDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { TOAST_MESSAGES } from '../types/toast';
import { api, type ApiAppointment, type ApiProfessional, type ApiService, type ApiTenant } from '../lib/api';

type Tab = 'dashboard' | 'calendar' | 'professionals' | 'services' | 'settings';

export default function TenantAdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingProfessional, setSavingProfessional] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [savingTenant, setSavingTenant] = useState(false);

  const [tenant, setTenant] = useState<ApiTenant | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [professionals, setProfessionals] = useState<ApiProfessional[]>([]);
  const [services, setServices] = useState<ApiService[]>([]);

  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessSlug, setBusinessSlug] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');

  const tenantId = user?.tenantId;

  const loadData = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      setError('');
      const overview = await api.tenantOverview(tenantId);
      setTenant(overview.tenant);
      setMetrics(overview.metrics);
      setAppointments(overview.appointments);
      setProfessionals(overview.professionals);
      setServices(overview.services);

      setBusinessName(overview.tenant.name);
      setBusinessEmail(overview.tenant.email);
      setBusinessPhone(overview.tenant.phone || '');
      setBusinessAddress(overview.tenant.address || '');
      setBusinessSlug(overview.tenant.slug);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los datos del tenant');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const getServiceName = (id: string) => services.find((s) => s.id === id)?.name || 'Servicio';
  const getProfName = (id: string) => professionals.find((p) => p.id === id)?.name || 'Profesional';

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = useMemo(() => appointments.filter((a) => a.date === todayStr), [appointments, todayStr]);

  const addProfessional = async () => {
    if (!tenantId) return;
    const fullName = prompt('Nombre y apellido del profesional:');
    if (!fullName) return;
    const email = prompt('Email:') || '';
    const phone = prompt('Telefono:') || '';
    const speciality = prompt('Especialidad:') || 'General';
    const [firstName, ...rest] = fullName.trim().split(' ');
    const lastName = rest.join(' ') || '-';

    await api.createTenantProfessional(tenantId, { firstName, lastName, email, phone, speciality, active: true });
    await loadData();
  };

  const editProfessional = async (data: { firstName: string; lastName: string; email: string; phone: string; speciality: string; active: boolean }, professionalId: string) => {
    if (!tenantId) return;
    setSavingProfessional(true);
    try {
      await api.updateTenantProfessional(tenantId, professionalId, data);
      await loadData();
      success(TOAST_MESSAGES.professional.updateSuccess);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al actualizar profesional';
      setError(message);
      showError({
        title: TOAST_MESSAGES.professional.updateError.title,
        message: TOAST_MESSAGES.professional.updateError.message,
      });
    } finally {
      setSavingProfessional(false);
    }
  };

  const editProfessionalLegacy = async (p: ApiProfessional) => {
    if (!tenantId) return;
    const fullName = prompt('Nombre y apellido:', p.name);
    if (!fullName) return;
    const email = prompt('Email:', p.email || '') || '';
    const phone = prompt('Telefono:', p.phone || '') || '';
    const speciality = prompt('Especialidad:', p.speciality || '') || '';
    const [firstName, ...rest] = fullName.trim().split(' ');
    const lastName = rest.join(' ') || '-';

    setSavingProfessional(true);
    try {
      await api.updateTenantProfessional(tenantId, p.id, { firstName, lastName, email, phone, speciality, active: p.active });
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al actualizar profesional');
    } finally {
      setSavingProfessional(false);
    }
  };

  const toggleProfessional = async (p: ApiProfessional) => {
    if (!tenantId) return;
    const [firstName, ...rest] = p.name.split(' ');
    await api.updateTenantProfessional(tenantId, p.id, {
      firstName,
      lastName: rest.join(' ') || '-',
      email: p.email || '',
      phone: p.phone || '',
      speciality: p.speciality || '',
      active: !p.active,
    });
    await loadData();
  };

  const addService = async (data: { name: string; description: string; duration: number; price: number; category: string }) => {
    if (!tenantId) return;
    setSavingService(true);
    try {
      await api.createTenantService(tenantId, { 
        name: data.name, 
        description: data.description, 
        duration: data.duration, 
        price: data.price,
        category: data.category,
        active: true 
      });
      await loadData();
      success(TOAST_MESSAGES.service.createSuccess);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al crear servicio';
      setError(message);
      showError({
        title: TOAST_MESSAGES.service.createError.title,
        message: TOAST_MESSAGES.service.createError.message,
      });
    } finally {
      setSavingService(false);
    }
  };

  const editService = async (data: { name: string; description: string; duration: number; price: number; active: boolean; category: string }, serviceId: string) => {
    if (!tenantId) return;
    setSavingService(true);
    try {
      await api.updateTenantService(tenantId, serviceId, data);
      await loadData();
      success(TOAST_MESSAGES.service.updateSuccess);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al actualizar servicio';
      setError(message);
      showError({
        title: TOAST_MESSAGES.service.updateError.title,
        message: TOAST_MESSAGES.service.updateError.message,
      });
    } finally {
      setSavingService(false);
    }
  };

  const editServiceLegacy = async (s: ApiService) => {
    if (!tenantId) return;
    const name = prompt('Nombre del servicio:', s.name);
    if (!name) return;
    const description = prompt('Descripcion:', s.description || '') || '';
    const duration = Number(prompt('Duracion en minutos:', String(s.duration)) || String(s.duration));
    const price = Number(prompt('Precio:', String(s.price)) || String(s.price));
    setSavingService(true);
    try {
      await api.updateTenantService(tenantId, s.id, { name, description, duration, price, active: s.active, category: s.category });
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al actualizar servicio');
    } finally {
      setSavingService(false);
    }
  };

  const removeService = async (s: ApiService) => {
    if (!tenantId) return;
    if (!confirm(`Eliminar servicio ${s.name}?`)) return;
    try {
      await api.deleteTenantService(tenantId, s.id);
      await loadData();
      success(TOAST_MESSAGES.service.deleteSuccess);
    } catch (e) {
      showError({
        title: TOAST_MESSAGES.service.deleteError.title,
        message: TOAST_MESSAGES.service.deleteError.message,
      });
    }
  };

  const editTenant = async (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    slug: string;
    primaryColor: string;
  }) => {
    if (!tenantId) return;
    setSavingTenant(true);
    try {
      await api.updateTenantSettings(tenantId, {
        businessName: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        slug: data.slug,
        primaryColor: data.primaryColor,
      });
      await loadData();
      success({
        title: '✅ Información actualizada',
        message: 'Los cambios se guardaron correctamente',
      });
    } catch (e) {
      showError({
        title: '❌ Error al actualizar',
        message: 'No se pudo guardar los cambios',
      });
    } finally {
      setSavingTenant(false);
    }
  };

  const saveSettings = async () => {
    if (!tenantId) return;
    await api.updateTenantSettings(tenantId, {
      businessName,
      email: businessEmail,
      phone: businessPhone,
      address: businessAddress,
      slug: businessSlug,
      primaryColor,
    });
    await loadData();
    alert('Configuracion guardada');
  };

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
    { id: 'calendar', label: 'Calendario', icon: <CalendarDays size={18} /> },
    { id: 'professionals', label: 'Profesionales', icon: <Users size={18} /> },
    { id: 'services', label: 'Servicios', icon: <Briefcase size={18} /> },
    { id: 'settings', label: 'Configuracion', icon: <Settings size={18} /> },
  ];

  if (!tenantId) {
    return <div className="min-h-screen grid place-items-center">Usuario sin tenant asignado</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-gray-900">{tenant?.name || 'Tenant'}</p>
              <p className="text-xs text-gray-400">Panel admin</p>
            </div>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X size={20} className="text-gray-500" /></button>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === item.id ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <button onClick={() => navigate('/booking')} className="w-full mb-2 py-2 text-sm font-medium text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-50 transition">
            Ver pagina publica
          </button>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 hover:text-gray-700 transition">
            <LogOut size={16} /> Cerrar sesion
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <h1 className="text-lg font-bold text-gray-900">{navItems.find((n) => n.id === activeTab)?.label}</h1>
          </div>
          <button className="p-2 hover:bg-gray-50 rounded-lg relative"><Bell size={18} className="text-gray-500" /></button>
        </header>

        <main className="p-4 sm:p-6">
          {(loading || !metrics) && <p className="text-gray-500">Cargando...</p>}
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

          {!loading && metrics && activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Turnos Hoy" value={metrics.todayAppointments} icon={<CalendarDays size={20} />} />
                <MetricCard title="Esta Semana" value={metrics.weekAppointments} icon={<Clock size={20} />} />
                <MetricCard title="Ingresos" value={`$${Math.round(metrics.revenue).toLocaleString()}`} icon={<DollarSign size={20} />} />
                <MetricCard title="Total Turnos" value={metrics.totalAppointments} icon={<UserCheck size={20} />} />
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Turnos de hoy</h3>
                  {todayAppts.length === 0 ? <p className="text-sm text-gray-400">No hay turnos hoy</p> : (
                    <div className="space-y-3">
                      {todayAppts.map((a) => (
                        <div key={a.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition">
                          <div className="text-center w-14">
                            <p className="text-sm font-bold text-gray-900">{a.startTime.slice(0, 5)}</p>
                            <p className="text-xs text-gray-400">{a.endTime.slice(0, 5)}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{a.clientName}</p>
                            <p className="text-xs text-gray-500">{getServiceName(a.serviceId)} � {getProfName(a.professionalId)}</p>
                          </div>
                          <StatusBadge status={a.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Rendimiento</h3>
                  <div className="space-y-3 text-sm">
                    <p>Completados: <span className="font-semibold">{metrics.completedRate}%</span></p>
                    <p>Cancelados: <span className="font-semibold">{metrics.cancelledRate}%</span></p>
                    <p>No show: <span className="font-semibold">{metrics.noShowRate}%</span></p>
                  </div>
                  <div className="mt-6 p-3 bg-primary-50 rounded-xl flex items-center gap-2">
                    <TrendingUp size={16} className="text-primary-600" />
                    <span className="text-sm font-medium text-primary-700">Datos reales desde API</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'calendar' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <h3 className="font-semibold text-gray-900">Agenda completa</h3>
              {appointments.length === 0 ? <p className="text-sm text-gray-400">Sin turnos cargados</p> : (
                appointments
                  .slice()
                  .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
                  .map((a) => (
                    <div key={a.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100">
                      <div className="w-28 text-sm text-gray-500">{a.date} {a.startTime.slice(0, 5)}</div>
                      <div className="flex-1 text-sm font-medium text-gray-900">{a.clientName}</div>
                      <div className="text-xs text-gray-500">{getServiceName(a.serviceId)} � {getProfName(a.professionalId)}</div>
                      <StatusBadge status={a.status} />
                    </div>
                  ))
              )}
            </div>
          )}

          {!loading && activeTab === 'professionals' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={addProfessional} className="px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition flex items-center gap-2"><Plus size={16} /> Agregar Profesional</button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {professionals.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.speciality || 'General'}</p>
                    <p className="text-xs text-gray-500 mt-2">{p.email}</p>
                    <p className="text-xs text-gray-500">{p.phone}</p>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                      <EditProfessionalDialog
                        professional={p}
                        onSave={(data) => editProfessional(data, p.id)}
                        isLoading={savingProfessional}
                      />
                      <button onClick={() => toggleProfessional(p)} className="py-1.5 px-3 text-sm text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50 transition"><Power size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <CreateServiceDialog
                  onSave={addService}
                  isLoading={savingService}
                />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h4 className="text-base font-semibold text-gray-900">{s.name}</h4>
                    <p className="text-sm text-gray-500 mt-2">{s.description}</p>
                    <div className="mt-4 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-500"><Clock size={14} /> {s.duration} min</div>
                      <div className="flex items-center gap-1 font-semibold text-gray-900"><DollarSign size={14} /> ${s.price.toLocaleString()}</div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                      <EditServiceDialog
                        service={s}
                        onSave={(data) => editService(data, s.id)}
                        isLoading={savingService}
                      />
                      <button onClick={() => removeService(s)} className="py-1.5 px-3 text-sm text-red-400 border border-gray-200 rounded-lg hover:bg-red-50 transition"><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuración del negocio</h3>

              {/* Info Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Nombre</p>
                  <p className="text-base text-gray-900 font-medium">{tenant?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                  <p className="text-base text-gray-900 font-medium">{tenant?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Teléfono</p>
                  <p className="text-base text-gray-900 font-medium">{tenant?.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Dirección</p>
                  <p className="text-base text-gray-900 font-medium">{tenant?.address || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">URL pública (slug)</p>
                  <p className="text-base text-gray-900 font-medium">{tenant?.slug}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Color primario</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: tenant?.primaryColor || '#6366f1' }}
                    />
                    <p className="text-base text-gray-900 font-medium">{tenant?.primaryColor || '#6366f1'}</p>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              {tenant && (
                <EditTenantDialog
                  tenant={tenant}
                  onSave={editTenant}
                  isLoading={savingTenant}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
