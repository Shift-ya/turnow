import { useEffect, useMemo, useState, type ChangeEvent, type MouseEvent } from 'react';
import { X } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import type { ApiAppointment } from '../../lib/api';

interface Props {
  appointments: ApiAppointment[];
  getServiceName: (id: string) => string;
  getProfName: (id: string) => string;
}

export default function CalendarAppointmentsPanel({ appointments, getServiceName, getProfName }: Props) {
  type FilterField = 'clientName' | 'date' | 'professionalId' | 'serviceId' | 'status';

  type CalendarAppointmentFilters = {
    professionalId: string;
    date: string;
    serviceId: string;
    clientName: string;
    status: '' | ApiAppointment['status'];
  };

  const [filters, setFilters] = useState<CalendarAppointmentFilters>({
    professionalId: '',
    date: '',
    serviceId: '',
    clientName: '',
    status: '' as '' | ApiAppointment['status'],
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileFilterField, setMobileFilterField] = useState<FilterField | null>(null);
  const [mobileFilterDraft, setMobileFilterDraft] = useState('');

  const filterOptions = useMemo(() => {
    return {
      professionals: Array.from(new Set(appointments.map((appointment) => appointment.professionalId))),
      services: Array.from(new Set(appointments.map((appointment) => appointment.serviceId))),
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const dateFilter = filters.date.trim();
    const professionalFilter = filters.professionalId.trim();
    const serviceFilter = filters.serviceId.trim();
    const clientFilter = filters.clientName.trim().toLowerCase();

    return appointments
      .slice()
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
      .filter((appointment) => {
        if (professionalFilter && appointment.professionalId !== professionalFilter) return false;
        if (serviceFilter && appointment.serviceId !== serviceFilter) return false;
        if (filters.status && appointment.status !== filters.status) return false;
        if (clientFilter && !appointment.clientName.toLowerCase().includes(clientFilter)) return false;
        if (dateFilter && !formatAppointmentDate(appointment.date).includes(dateFilter)) return false;
        return true;
      });
  }, [appointments, filters]);

  const resetFilters = () => {
    setFilters({
      professionalId: '',
      date: '',
      serviceId: '',
      clientName: '',
      status: '',
    });
  };

  const activeFilterPills = [
    filters.clientName.trim() ? { key: 'clientName', label: 'Cliente', value: filters.clientName.trim() } : null,
    filters.date.trim() ? { key: 'date', label: 'Fecha', value: filters.date.trim() } : null,
    filters.professionalId ? { key: 'professionalId', label: 'Profesional', value: getProfName(filters.professionalId) } : null,
    filters.serviceId ? { key: 'serviceId', label: 'Servicio', value: getServiceName(filters.serviceId) } : null,
    filters.status ? { key: 'status', label: 'Estado', value: filters.status } : null,
  ].filter(Boolean) as Array<{ key: FilterField; label: string; value: string }>;

  const mobileFilterOptions: Array<{ key: FilterField; label: string }> = [
    { key: 'clientName', label: 'Cliente' },
    { key: 'date', label: 'Fecha' },
    { key: 'professionalId', label: 'Profesional' },
    { key: 'serviceId', label: 'Servicio' },
    { key: 'status', label: 'Estado' },
  ];

  const openMobileFilter = (field: FilterField) => {
    setMobileFilterField(field);
    if (field === 'clientName') {
      setMobileFilterDraft(filters.clientName);
    } else if (field === 'date') {
      setMobileFilterDraft(filters.date);
    } else if (field === 'professionalId') {
      setMobileFilterDraft(filters.professionalId);
    } else if (field === 'serviceId') {
      setMobileFilterDraft(filters.serviceId);
    } else if (field === 'status') {
      setMobileFilterDraft(filters.status);
    }
    setMobileFilterOpen(true);
  };

  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileFilterOpen]);

  const applyMobileFilter = () => {
    if (!mobileFilterField) return;

    if (mobileFilterField === 'clientName') {
      setFilters({ ...filters, clientName: mobileFilterDraft });
    }

    if (mobileFilterField === 'date') {
      setFilters({ ...filters, date: formatDateInput(mobileFilterDraft) });
    }

    if (mobileFilterField === 'professionalId') {
      setFilters({ ...filters, professionalId: mobileFilterDraft });
    }

    if (mobileFilterField === 'serviceId') {
      setFilters({ ...filters, serviceId: mobileFilterDraft });
    }

    if (mobileFilterField === 'status') {
      setFilters({ ...filters, status: mobileFilterDraft as '' | ApiAppointment['status'] });
    }

    setMobileFilterOpen(false);
    setMobileFilterField(null);
    setMobileFilterDraft('');
  };

  const removeMobileFilter = (field: FilterField) => {
    setFilters({
      ...filters,
      [field]: '',
    });
  };

  return (
    <div className="panel-light p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-500">Agenda completa</p>
        <h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.05em] text-white">Todas las reservas</h2>
      </div>

      <div className="mb-5 md:hidden">
        {activeFilterPills.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {activeFilterPills.map((pill) => (
              <button
                key={pill.key}
                onClick={() => openMobileFilter(pill.key)}
                className="inline-flex items-center gap-2 rounded-[14px] border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/12"
              >
                <span className="text-stone-400">{pill.label}:</span>
                <span>{pill.value}</span>
                <span
                  onClick={(event: MouseEvent<HTMLSpanElement>) => {
                    event.stopPropagation();
                    removeMobileFilter(pill.key);
                  }}
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/15 text-[10px] text-stone-300"
                >
                  ×
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button className="button-ghost-luxe rounded-2xl px-4 py-2.5 text-sm" onClick={() => setMobileFilterOpen(true)}>
            Filtros
          </button>

          <button onClick={resetFilters} className="button-ghost-luxe rounded-2xl px-4 py-2.5 text-sm">
            Limpiar
          </button>
        </div>

        {/* Slide-up filter panel for mobile */}
        {mobileFilterOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/50 transition-opacity"
              onClick={() => setMobileFilterOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-up panel - fixed to bottom, full width */}
            <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] w-full transform transition-transform duration-300 ease-out">
              <div className="flex h-full flex-col rounded-t-3xl border-t border-white/10 bg-[#090d18]/95 backdrop-blur-xl w-full z-20">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                  <h3 className="text-sm font-semibold text-white">
                    {mobileFilterField ? mobileFilterOptions.find((option) => option.key === mobileFilterField)?.label : 'Agregar filtro'}
                  </h3>
                  <button
                    onClick={() => {
                      setMobileFilterOpen(false);
                      setMobileFilterField(null);
                      setMobileFilterDraft('');
                    }}
                    className="p-2 text-stone-400 transition hover:text-white"
                    aria-label="Cerrar filtros"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto px-6 py-4">
                  {!mobileFilterField ? (
                    <div className="space-y-2">
                      {mobileFilterOptions.map((option) => (
                        <button
                          key={option.key}
                          onClick={() => openMobileFilter(option.key)}
                          className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-left text-sm text-white transition hover:bg-white/12"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setMobileFilterField(null);
                          setMobileFilterDraft('');
                        }}
                        className="mb-3 text-xs text-stone-400 transition hover:text-white"
                      >
                        ← Volver
                      </button>

                      {mobileFilterField === 'clientName' || mobileFilterField === 'date' ? (
                        <div className="space-y-3">
                          <input
                            value={mobileFilterDraft}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => setMobileFilterDraft(event.target.value)}
                            placeholder={mobileFilterField === 'clientName' ? 'Buscar por cliente' : 'dd.mm.aa'}
                            className="flex h-11 w-full rounded-2xl border border-white/15 bg-[#0a0f1a] px-4 py-2 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-[#5e92ff] focus:bg-[#0f111a] focus:ring-4 focus:ring-[#5e92ff]/15"
                            autoFocus
                          />
                          <button onClick={applyMobileFilter} className="button-luxe w-full rounded-2xl py-3">
                            Aplicar
                          </button>
                        </div>
                      ) : mobileFilterField === 'professionalId' ? (
                        <div className="space-y-2">
                          {filterOptions.professionals.map((professionalId) => (
                            <button
                              key={professionalId}
                              onClick={() => {
                                setFilters({ ...filters, professionalId });
                                setMobileFilterOpen(false);
                                setMobileFilterField(null);
                                setMobileFilterDraft('');
                              }}
                              className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-left text-sm text-white transition hover:bg-white/12"
                            >
                              {getProfName(professionalId)}
                            </button>
                          ))}
                        </div>
                      ) : mobileFilterField === 'serviceId' ? (
                        <div className="space-y-2">
                          {filterOptions.services.map((serviceId) => (
                            <button
                              key={serviceId}
                              onClick={() => {
                                setFilters({ ...filters, serviceId });
                                setMobileFilterOpen(false);
                                setMobileFilterField(null);
                                setMobileFilterDraft('');
                              }}
                              className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-left text-sm text-white transition hover:bg-white/12"
                            >
                              {getServiceName(serviceId)}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setFilters({ ...filters, status: '' });
                              setMobileFilterOpen(false);
                              setMobileFilterField(null);
                              setMobileFilterDraft('');
                            }}
                            className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-left text-sm text-white transition hover:bg-white/12"
                          >
                            Todos los estados
                          </button>
                          {['BOOKED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'].map((status) => (
                            <button
                              key={status}
                              onClick={() => {
                                setFilters({ ...filters, status: status as ApiAppointment['status'] });
                                setMobileFilterOpen(false);
                                setMobileFilterField(null);
                                setMobileFilterDraft('');
                              }}
                              className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-left text-sm text-white transition hover:bg-white/12"
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Spacer for safe area */}
                <div className="h-6" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mb-6 hidden gap-3 md:grid lg:grid-cols-2 2xl:grid-cols-5">
        <input
          value={filters.clientName}
          onChange={(event) => setFilters({ ...filters, clientName: event.target.value })}
          placeholder="Cliente que reserva"
          className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-4 py-2 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-[#5e92ff] focus:bg-[#0f111a] focus:ring-4 focus:ring-[#5e92ff]/15"
        />

        <input
          value={filters.date}
          onChange={(event) => setFilters({ ...filters, date: formatDateInput(event.target.value) })}
          placeholder="Fecha dd.mm.aa"
          className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-4 py-2 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-[#5e92ff] focus:bg-[#0f111a] focus:ring-4 focus:ring-[#5e92ff]/15"
        />

        <select
          value={filters.professionalId}
          onChange={(event) => setFilters({ ...filters, professionalId: event.target.value })}
          className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-4 py-2 text-sm text-white outline-none transition focus:border-[#5e92ff] focus:bg-[#0f111a] focus:ring-4 focus:ring-[#5e92ff]/15"
        >
          <option value="">Todos los profesionales</option>
          {filterOptions.professionals.map((professionalId) => (
            <option key={professionalId} value={professionalId}>
              {getProfName(professionalId)}
            </option>
          ))}
        </select>

        <select
          value={filters.serviceId}
          onChange={(event) => setFilters({ ...filters, serviceId: event.target.value })}
          className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-4 py-2 text-sm text-white outline-none transition focus:border-[#5e92ff] focus:bg-[#0f111a] focus:ring-4 focus:ring-[#5e92ff]/15"
        >
          <option value="">Todos los servicios</option>
          {filterOptions.services.map((serviceId) => (
            <option key={serviceId} value={serviceId}>
              {getServiceName(serviceId)}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(event) => setFilters({ ...filters, status: event.target.value as '' | ApiAppointment['status'] })}
          className="flex h-11 w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-4 py-2 text-sm text-white outline-none transition focus:border-[#5e92ff] focus:bg-[#0f111a] focus:ring-4 focus:ring-[#5e92ff]/15"
        >
          <option value="">Todos los estados</option>
          <option value="BOOKED">Reservado</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="CANCELLED">Cancelado</option>
          <option value="COMPLETED">Completado</option>
          <option value="NO_SHOW">No show</option>
        </select>
      </div>

      <div className="mb-6 hidden flex-wrap gap-3 md:flex">
        <button onClick={resetFilters} className="button-ghost-luxe rounded-2xl">
          Limpiar filtros
        </button>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="soft-card p-5 text-sm text-[#a1a1aa]">Sin turnos cargados.</div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="soft-card flex flex-col gap-3 p-4 xl:flex-row xl:items-center">
              <div className="w-40 shrink-0 text-sm font-semibold text-[#bfd0ff]">
                {formatAppointmentDate(appointment.date)} {appointment.startTime.slice(0, 5)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{appointment.clientName}</p>
                <p className="mt-1 text-sm text-[#a1a1aa]">
                  {getServiceName(appointment.serviceId)} - {getProfName(appointment.professionalId)}
                </p>
              </div>
              <StatusBadge status={appointment.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

function formatAppointmentDate(value: string): string {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year.slice(-2)}`;
}
