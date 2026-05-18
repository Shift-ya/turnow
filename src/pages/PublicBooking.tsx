import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ApiProfessional, ApiService, PublicTenant } from '../lib/api';
import { useToast } from '../hooks/useToast';
import { TOAST_MESSAGES } from '../types/toast';
import { publicBookingRepository } from '../repositories/publicBookingRepository';
import BookingServicesSkeleton from '../components/skeletons/BookingServicesSkeleton';
import BookingProfessionalsSkeleton from '../components/skeletons/BookingProfessionalsSkeleton';
import BookingCalendarSkeleton from '../components/skeletons/BookingCalendarSkeleton';
import BookingTimeSlotsSkeleton from '../components/skeletons/BookingTimeSlotsSkeleton';
import PublicBookingPageSkeleton from '../components/skeletons/PublicBookingPageSkeleton';

type Step = 1 | 2 | 3;

function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const stepMeta: Record<Step, { label: string; title: string; description: string }> = {
  1: {
    label: 'Servicio',
    title: 'Define la experiencia',
    description: 'Selecciona el servicio y el profesional indicado para tu visita.',
  },
  2: {
    label: 'Agenda',
    title: 'Elige el mejor momento',
    description: 'Consulta la agenda disponible y confirma fecha y hora.',
  },
  3: {
    label: 'Datos',
    title: 'Finaliza tu reserva',
    description: 'Solo faltan tus datos para dejar el turno confirmado.',
  },
};

export default function PublicBooking() {
  const navigate = useNavigate();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { success, error: showError } = useToast();
  const [tenant, setTenant] = useState<PublicTenant | null>(null);
  const [services, setServices] = useState<ApiService[]>([]);
  const [professionals, setProfessionals] = useState<ApiProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
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
    if (!tenantSlug) {
      setError('URL de reserva invalida: falta el identificador del tenant.');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const [tenantData, serviceData] = await Promise.all([
          publicBookingRepository.loadTenant(tenantSlug),
          publicBookingRepository.loadServices(tenantSlug),
        ]);
        setTenant(tenantData);
        setServices(serviceData);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo cargar la pagina de reservas');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [tenantSlug]);

  useEffect(() => {
    if (!selectedService || !tenantSlug) return;

    setLoadingProfessionals(true);
    publicBookingRepository.loadProfessionals(tenantSlug, selectedService.id)
      .then(setProfessionals)
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudieron cargar profesionales'))
      .finally(() => setLoadingProfessionals(false));
  }, [selectedService, tenantSlug]);

  useEffect(() => {
    if (!selectedService || !selectedProfessional || !selectedDate || !tenantSlug) return;

    setLoadingSlots(true);
    const date = toIsoDate(selectedDate);
    publicBookingRepository.loadSlots(tenantSlug, selectedProfessional.id, selectedService.id, date)
      .then((response) => {
        setTimeSlots(
          response.slots
            .filter((slot) => slot.available)
            .map((slot) => slot.startTime.slice(0, 5)),
        );
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudieron cargar horarios'))
      .finally(() => setLoadingSlots(false));
  }, [selectedService, selectedProfessional, selectedDate, tenantSlug]);

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !selectedService || !selectedProfessional || !tenantSlug) return;
    if (!clientName || !clientEmail || !clientPhone) return;

    try {
      setBooking(true);
      await publicBookingRepository.createAppointment(tenantSlug, {
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
    const date = new Date(calYear, calMonth, day);
    date.setHours(0, 0, 0, 0);
    return date >= today;
  };

  if (loading) {
    return <PublicBookingPageSkeleton />;
  }

  if (!tenant) {
    return <div className="app-shell grid min-h-screen place-items-center text-rose-700">{error || 'Tenant no disponible'}</div>;
  }

  const accentStyle = { backgroundColor: tenant.primaryColor };
  const currentStep = stepMeta[step];

  return (
    <div className="app-shell min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="panel-light mb-6 flex flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="button-ghost-luxe rounded-full px-4 py-2.5">
              <ArrowLeft size={16} /> Volver
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] text-sm font-bold text-white shadow-[0_14px_28px_rgba(0,0,0,0.18)]" style={accentStyle}>
                {tenant.businessName[0]}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent-500">Reserva online</p>
                <h1 className="font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.05em] text-white">{tenant.businessName}</h1>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-[#a1a1aa]">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/80">
              <span className="inline-flex items-center gap-2">
                <MapPin size={14} /> {tenant.address}
              </span>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-emerald-200">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={14} /> Confirmacion inmediata
              </span>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="panel-dark grain-overlay relative overflow-hidden px-6 py-7 sm:px-8">
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_72%)]" />
            <div className="relative space-y-6">
              <div className="space-y-4">
                <div className="eyebrow border-white/10 bg-white/5 text-stone-300">{currentStep.label}</div>
                <div className="max-w-2xl">
                  <h2 className="font-['Space_Grotesk'] text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
                    {currentStep.title}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-stone-300">{currentStep.description}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {([1, 2, 3] as Step[]).map((item) => {
                  const active = step === item;
                  const done = step > item;

                  return (
                    <div
                      key={item}
                      className={`rounded-3xl border px-4 py-4 transition ${
                        active
                          ? 'border-white/30 bg-white/12'
                          : done
                            ? 'border-emerald-500/20 bg-emerald-500/10'
                            : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div
                          className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${
                            active ? 'text-white' : done ? 'bg-emerald-400 text-[#132417]' : 'bg-white/10 text-stone-300'
                          }`}
                          style={active ? accentStyle : undefined}
                        >
                          {item}
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">
                          {stepMeta[item].label}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white">{stepMeta[item].title}</p>
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className="rounded-3xl border border-rose-500/30 bg-rose-500/12 px-4 py-4 text-sm text-rose-100">
                  {error}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  {loading ? (
                    <BookingServicesSkeleton />
                  ) : (
                    <>
                      {categories.map((category) => (
                        <div key={category} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">{category}</h3>
                            <span className="text-xs text-stone-500">
                              {services.filter((service) => (service.category || 'General') === category).length} opciones
                            </span>
                          </div>
                          <div className="grid gap-3">
                            {services
                              .filter((service) => (service.category || 'General') === category)
                              .map((service) => {
                                const active = selectedService?.id === service.id;

                                return (
                                  <button
                                    key={service.id}
                                    onClick={() => {
                                      setSelectedService(service);
                                      setSelectedProfessional(null);
                                    }}
                                    className={`rounded-[26px] border p-5 text-left transition ${
                                      active ? 'border-white/35 bg-white/12' : 'border-white/10 bg-white/5 hover:bg-white/8'
                                    }`}
                                    style={active ? { boxShadow: `inset 0 0 0 1px ${tenant.primaryColor}` } : undefined}
                                  >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                      <div>
                                        <p className="text-lg font-semibold text-white">{service.name}</p>
                                        <p className="mt-2 max-w-xl text-sm leading-7 text-stone-300">{service.description}</p>
                                      </div>
                                      <div className="sm:text-right">
                                        <p className="font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.05em] text-white">
                                          ${service.price.toLocaleString()}
                                        </p>
                                        <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-stone-300">
                                          <Clock size={12} /> {service.duration} min
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      ))}

                      {selectedService && (
                        loadingProfessionals ? (
                          <BookingProfessionalsSkeleton />
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">Profesionales</h3>
                              <span className="text-xs text-stone-500">Selecciona a quien te atendera</span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                              {professionals.map((professional) => {
                                const active = selectedProfessional?.id === professional.id;

                                return (
                                  <button
                                    key={professional.id}
                                    onClick={() => setSelectedProfessional(professional)}
                                    className={`rounded-3xl border p-5 text-left transition ${
                                      active ? 'border-white/35 bg-white/12' : 'border-white/10 bg-white/5 hover:bg-white/8'
                                    }`}
                                    style={active ? { boxShadow: `inset 0 0 0 1px ${tenant.primaryColor}` } : undefined}
                                  >
                                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                                      {professional.name.charAt(0)}
                                    </div>
                                    <p className="font-semibold text-white">{professional.name}</p>
                                    <p className="mt-1 text-sm text-stone-300">{professional.speciality || 'Profesional'}</p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )
                      )}
                    </>
                  )}

                  {selectedService && selectedProfessional && (
                    <button onClick={() => setStep(2)} className="button-luxe w-full rounded-[22px]" style={accentStyle}>
                      Continuar a agenda <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-sm text-stone-300 transition hover:text-white">
                    <ArrowLeft size={14} /> Cambiar servicio o profesional
                  </button>

                  {loading ? (
                    <BookingCalendarSkeleton />
                  ) : (
                    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                      <div className="mb-5 flex items-center justify-between">
                        <button onClick={() => setCalDate(new Date(calYear, calMonth - 1, 1))} className="button-ghost-luxe h-11 w-11 rounded-full p-0">
                          <ChevronLeft size={18} />
                        </button>
                        <h3 className="font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.05em] text-white">
                          {monthNames[calMonth]} {calYear}
                        </h3>
                        <button onClick={() => setCalDate(new Date(calYear, calMonth + 1, 1))} className="button-ghost-luxe h-11 w-11 rounded-full p-0">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-2 text-center">
                        {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((day) => (
                          <div key={day} className="py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                            {day}
                          </div>
                        ))}
                        {calDays.map((day, index) => {
                          if (day === null) return <div key={`empty-${index}`} />;

                          const available = isDayAvailable(day);
                          const isSelected =
                            selectedDate &&
                            day === selectedDate.getDate() &&
                            calMonth === selectedDate.getMonth() &&
                            calYear === selectedDate.getFullYear();

                          return (
                            <button
                              key={`${day}-${index}`}
                              disabled={!available}
                              onClick={() => {
                                setSelectedDate(new Date(calYear, calMonth, day));
                                setSelectedTime(null);
                              }}
                              className={`rounded-2xl py-3 text-sm font-semibold transition ${
                                isSelected
                                  ? 'text-white'
                                  : available
                                    ? 'bg-white/5 text-stone-200 hover:bg-white/10'
                                    : 'cursor-not-allowed text-stone-600'
                              }`}
                              style={isSelected ? accentStyle : undefined}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedDate && (
                    loadingSlots ? (
                      <BookingTimeSlotsSkeleton />
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">Horarios disponibles</h3>
                          <span className="text-xs text-stone-500">{timeSlots.length} bloques libres</span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                                selectedTime === time
                                  ? 'border-transparent text-white'
                                  : 'border-white/10 bg-white/5 text-stone-200 hover:bg-white/10'
                              }`}
                              style={selectedTime === time ? accentStyle : undefined}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  )}

                  {selectedDate && selectedTime && (
                    <button onClick={() => setStep(3)} className="button-luxe w-full rounded-[22px]" style={accentStyle}>
                      Continuar con tus datos <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 text-sm text-stone-300 transition hover:text-white">
                    <ArrowLeft size={14} /> Cambiar agenda
                  </button>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { icon: User, placeholder: 'Nombre completo', value: clientName, setter: setClientName },
                      { icon: Mail, placeholder: 'Email', value: clientEmail, setter: setClientEmail },
                      { icon: Phone, placeholder: 'Telefono', value: clientPhone, setter: setClientPhone },
                    ].map((field) => (
                      <div key={field.placeholder} className="relative">
                        <field.icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
                        <input
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          className="h-13 w-full rounded-[22px] border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-white/25 focus:bg-white/8"
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleBook}
                    disabled={booking || !clientName || !clientEmail || !clientPhone}
                    className="button-luxe w-full rounded-[22px]"
                    style={accentStyle}
                  >
                    <CheckCircle2 size={18} /> {booking ? 'Reservando...' : 'Confirmar turno'}
                  </button>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="panel-light p-6">
              <p className="eyebrow mb-4">Resumen</p>
              <h3 className="font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.05em] text-white">
                Tu experiencia en una sola vista.
              </h3>
              <div className="mt-6 space-y-4">
                <div className="soft-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-500">Servicio</p>
                  <p className="mt-2 text-base font-semibold text-white">{selectedService?.name || 'Aun no seleccionado'}</p>
                </div>
                <div className="soft-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-500">Profesional</p>
                  <p className="mt-2 text-base font-semibold text-white">{selectedProfessional?.name || 'Selecciona un perfil'}</p>
                </div>
                <div className="soft-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-500">Fecha y hora</p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {selectedDate ? `${selectedDate.toLocaleDateString()}${selectedTime ? ` - ${selectedTime}` : ''}` : 'Define tu agenda'}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
