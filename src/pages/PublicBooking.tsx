import { useEffect, useMemo, useState } from 'react';
import { Clock, ArrowLeft, ArrowRight, CheckCircle2, User, Mail, Phone, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, type ApiProfessional, type ApiService, type PublicTenant } from '../lib/api';
import { useToast } from '../hooks/useToast';
import { TOAST_MESSAGES } from '../types/toast';

type Step = 1 | 2 | 3;

const DEMO_SLUG = 'bella-vida-spa';

function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function PublicBooking() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [tenant, setTenant] = useState<PublicTenant | null>(null);
  const [services, setServices] = useState<ApiService[]>([]);
  const [professionals, setProfessionals] = useState<ApiProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [step, setStep] = useState<Step>(1);
  const [selectedService, setSelectedService] = useState<ApiService | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<ApiProfessional | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [booking, setBooking] = useState(false);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const [calDate, setCalDate] = useState(new Date());

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [tenantData, serviceData] = await Promise.all([
          api.getPublicTenant(DEMO_SLUG),
          api.getPublicServices(DEMO_SLUG),
        ]);
        setTenant(tenantData);
        setServices(serviceData);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo cargar la pagina de reservas');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedService) return;
    api.getPublicProfessionals(DEMO_SLUG, selectedService.id)
      .then(setProfessionals)
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudieron cargar profesionales'));
  }, [selectedService]);

  useEffect(() => {
    if (!selectedService || !selectedProfessional || !selectedDate) return;
    const date = toIsoDate(selectedDate);
    api.getPublicSlots(DEMO_SLUG, selectedProfessional.id, selectedService.id, date)
      .then((r) => {
        setTimeSlots(
          r.slots
            .filter((s) => s.available)
            .map((s) => s.startTime.slice(0, 5))
        );
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudieron cargar horarios'));
  }, [selectedService, selectedProfessional, selectedDate]);

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !selectedService || !selectedProfessional) return;
    if (!clientName || !clientEmail || !clientPhone) return;

    try {
      setBooking(true);
      await api.createPublicAppointment(DEMO_SLUG, {
        professionalId: selectedProfessional.id,
        serviceId: selectedService.id,
        appointmentDate: toIsoDate(selectedDate),
        startTime: `${selectedTime}:00`,
        clientName,
        clientEmail,
        clientPhone,
        clientNotes: '',
      });

      success(TOAST_MESSAGES.appointment.createSuccess);

      setStep(1);
      setSelectedService(null);
      setSelectedProfessional(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setTimeSlots([]);
      setClientName('');
      setClientEmail('');
      setClientPhone('');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo reservar el turno';
      setError(message);
      showError(TOAST_MESSAGES.appointment.createError);
    } finally {
      setBooking(false);
    }
  };

  const categories = useMemo(() => [...new Set(services.map((s) => s.category || 'General'))], [services]);

  const calYear = calDate.getFullYear();
  const calMonth = calDate.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const calDays: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const isDayAvailable = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    d.setHours(0, 0, 0, 0);
    return d >= today;
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-gray-500">Cargando reserva...</div>;
  }

  if (!tenant) {
    return <div className="min-h-screen grid place-items-center text-red-500">{error || 'Tenant no disponible'}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
            <ArrowLeft size={16} /> Volver
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: tenant.primaryColor }}>
              {tenant.businessName[0]}
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">{tenant.businessName}</p>
              <p className="text-xs text-gray-400">Reserva Online</p>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-xl font-bold text-gray-900">{tenant.businessName}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1"><MapPin size={13} /> {tenant.address}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

        <div className="flex items-center justify-center gap-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-8 h-8 rounded-full grid place-items-center text-sm font-bold ${step >= s ? 'text-white' : 'bg-gray-100 text-gray-400'}`} style={step >= s ? { backgroundColor: tenant.primaryColor } : {}}>{s}</div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Elegi un servicio y profesional</h2>
            {categories.map((cat) => (
              <div key={cat}>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">{cat}</h3>
                <div className="space-y-2">
                  {services.filter((s) => (s.category || 'General') === cat).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedService(s);
                        setSelectedProfessional(null);
                      }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition ${selectedService?.id === s.id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{s.name}</p>
                          <p className="text-sm text-gray-500">{s.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">${s.price.toLocaleString()}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 justify-end"><Clock size={11} /> {s.duration} min</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {selectedService && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Profesionales</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {professionals.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProfessional(p)}
                      className={`p-4 rounded-xl border-2 text-center transition ${selectedProfessional?.id === p.id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                    >
                      <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.speciality || 'Profesional'}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedService && selectedProfessional && (
              <button onClick={() => setStep(2)} className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: tenant.primaryColor }}>
                Continuar <ArrowRight size={18} />
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"><ArrowLeft size={14} /> Cambiar seleccion</button>
            <h2 className="text-lg font-bold text-gray-900">Elegi fecha y hora</h2>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCalDate(new Date(calYear, calMonth - 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronLeft size={18} /></button>
                <h3 className="font-semibold text-gray-900">{monthNames[calMonth]} {calYear}</h3>
                <button onClick={() => setCalDate(new Date(calYear, calMonth + 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronRight size={18} /></button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((d) => <div key={d} className="text-xs text-gray-400 py-2">{d}</div>)}
                {calDays.map((day, i) => {
                  if (day === null) return <div key={`e${i}`} />;
                  const available = isDayAvailable(day);
                  const isSelected = selectedDate && day === selectedDate.getDate() && calMonth === selectedDate.getMonth() && calYear === selectedDate.getFullYear();
                  return (
                    <button
                      key={i}
                      disabled={!available}
                      onClick={() => {
                        setSelectedDate(new Date(calYear, calMonth, day));
                        setSelectedTime(null);
                      }}
                      className={`py-2.5 rounded-lg text-sm ${isSelected ? 'text-white' : available ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
                      style={isSelected ? { backgroundColor: tenant.primaryColor } : {}}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Horarios disponibles</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((t) => (
                    <button key={t} onClick={() => setSelectedTime(t)} className={`py-2.5 rounded-xl text-sm border-2 ${selectedTime === t ? 'text-white border-transparent' : 'border-gray-100 bg-white hover:border-gray-300'}`} style={selectedTime === t ? { backgroundColor: tenant.primaryColor } : {}}>{t}</button>
                  ))}
                </div>
              </div>
            )}

            {selectedDate && selectedTime && (
              <button onClick={() => setStep(3)} className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: tenant.primaryColor }}>
                Continuar <ArrowRight size={18} />
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"><ArrowLeft size={14} /> Cambiar horario</button>
            <h2 className="text-lg font-bold text-gray-900">Tus datos</h2>
            <div className="space-y-4">
              <div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="Nombre" /></div>
              <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="Email" /></div>
              <div className="relative"><Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="Telefono" /></div>
            </div>
            <button
              onClick={handleBook}
              disabled={booking || !clientName || !clientEmail || !clientPhone}
              className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: tenant.primaryColor }}
            >
              <CheckCircle2 size={18} /> {booking ? 'Reservando...' : 'Confirmar turno'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
