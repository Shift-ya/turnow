import { Check, Copy, ExternalLink, MessageCircleMore, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ApiProfessional, ApiService, ApiTenant } from '../../lib/api';

interface TenantOnboardingPanelProps {
  tenant: ApiTenant | null;
  services: ApiService[];
  professionals: ApiProfessional[];
  todayAppointmentsCount: number;
  onOpenServices: () => void;
  onOpenProfessionals: () => void;
  onOpenBooking: () => void;
}

export function TenantOnboardingPanel({
  tenant,
  services,
  professionals,
  todayAppointmentsCount,
  onOpenServices,
  onOpenProfessionals,
  onOpenBooking,
}: TenantOnboardingPanelProps) {
  const [copied, setCopied] = useState(false);

  const publicBookingUrl = useMemo(() => {
    if (!tenant?.slug) return '';
    return `${window.location.origin}/booking/${tenant.slug}`;
  }, [tenant?.slug]);

  const shareText = useMemo(() => {
    if (!tenant || !publicBookingUrl) return '';
    return `Reserva tu turno en ${tenant.name}: ${publicBookingUrl}`;
  }, [tenant, publicBookingUrl]);

  useEffect(() => {
    if (!copied) return;

    const timer = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    if (!publicBookingUrl) return;

    await navigator.clipboard.writeText(publicBookingUrl);
    setCopied(true);
  };

  const checklist = [
    {
      label: 'Cargar servicios',
      done: services.length > 0,
      hint: services.length > 0 ? `${services.length} servicios listos` : 'Define tu oferta para vender turnos',
      actionLabel: 'Ir a servicios',
      onAction: onOpenServices,
    },
    {
      label: 'Cargar profesionales',
      done: professionals.length > 0,
      hint: professionals.length > 0 ? `${professionals.length} profesionales activos` : 'Tu booking funciona mejor con equipo visible',
      actionLabel: 'Ir a profesionales',
      onAction: onOpenProfessionals,
    },
    {
      label: 'Compartir link publico',
      done: !!publicBookingUrl,
      hint: 'Usalo en WhatsApp, Instagram y carteleria',
      actionLabel: copied ? 'Copiado' : 'Copiar link',
      onAction: handleCopy,
    },
    {
      label: 'Probar la pagina publica',
      done: todayAppointmentsCount > 0,
      hint: todayAppointmentsCount > 0 ? `${todayAppointmentsCount} turnos hoy` : 'Abrela como cliente para revisar la experiencia',
      actionLabel: 'Abrir booking',
      onAction: onOpenBooking,
    },
  ];

  const whatsappHref = shareText ? `https://wa.me/?text=${encodeURIComponent(shareText)}` : '#';

  return (
    <section className="panel-light grain-overlay relative overflow-hidden px-6 py-6 sm:px-8 sm:py-7">
      <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_72%)]" />

      <div className="relative space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="eyebrow w-fit border-white/10 bg-white/5 text-stone-300">
              <Sparkles size={12} /> Arranque rapido
            </div>
            <div>
              <h2 className="font-['Space_Grotesk'] text-3xl font-bold tracking-[-0.05em] text-white">Pon tu negocio a trabajar hoy</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-300">
                Este bloque convierte el panel en una herramienta de captacion: completa lo basico, comparte el link y deja que los clientes reserven solos.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={handleCopy} className="button-ghost-luxe rounded-full px-4 py-2.5 text-sm">
              <Copy size={16} /> {copied ? 'Link copiado' : 'Copiar link'}
            </button>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="button-luxe flex w-min text-nowrap rounded-full px-4 py-2.5 text-sm">
              <MessageCircleMore size={16} /> Compartir por WhatsApp
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3 rounded-[26px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-500">Link publico</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#090909] px-4 py-3 text-sm text-white/85">
                <span className="block truncate">{publicBookingUrl || 'El tenant aun no tiene slug publico'}</span>
              </div>
              <button onClick={onOpenBooking} className="button-ghost-luxe rounded-2xl px-4 py-3 text-sm">
                <ExternalLink size={16} /> Ver booking
              </button>
            </div>
            <p className="text-sm leading-6 text-[#a1a1aa]">
              Pegalo en Instagram, Facebook, Google Business, WhatsApp y en cualquier cartel fisico.
            </p>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-500">Checklist inicial</p>
            <div className="mt-4 space-y-3">
              {checklist.map((item) => (
                <div key={item.label} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#090909] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <span className={`grid h-5 w-5 place-items-center rounded-full ${item.done ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/60'}`}>
                        <Check size={12} />
                      </span>
                      {item.label}
                    </div>
                    <p className="mt-1 text-sm text-[#a1a1aa]">{item.hint}</p>
                  </div>
                  <button onClick={item.onAction} className="button-ghost-luxe rounded-full px-4 py-2.5 text-sm">
                    {item.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}