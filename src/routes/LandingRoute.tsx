import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarClock, LogIn, Sparkles, Users, WandSparkles } from 'lucide-react';

export default function LandingRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    const tenantParam = params.get('tenant') || params.get('slug');

    if (pageParam === 'booking' && tenantParam) {
      navigate(`/booking/${tenantParam}`, { replace: true });
      return;
    }

    if (pageParam === 'login' || pageParam === 'dashboard') {
      navigate(`/${pageParam}`, { replace: true });
      return;
    }
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020202] text-[#f5f5f5]">
      <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_18%,rgba(91,109,255,0.30)_0%,rgba(127,77,255,0.14)_42%,transparent_64%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,18,0.12)_0%,rgba(8,9,18,0.48)_52%,rgba(8,9,18,0.86)_100%)]" />
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[56px_56px]" />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 shadow-[0_16px_34px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(135deg,#5e92ff_0%,#2ed7ff_100%)] text-sm font-bold text-[#020202]">
              T
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-500">Turnow</p>
              <p className="text-xs text-white/65">Reservas publicas y panel para el equipo</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            <LogIn size={16} /> Entrar
          </button>
        </header>

        <section className="grid flex-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-500">
              <Sparkles size={12} /> Convierte visitas en turnos
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl bg-[linear-gradient(135deg,#f5f5f5_0%,#5e92ff_50%,#f52ccf_100%)] bg-clip-text text-5xl font-bold tracking-[-0.06em] text-transparent sm:text-6xl lg:text-7xl">
                Una agenda pública que vende por vos.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[#a1a1aa] sm:text-lg">
                Tus clientes reservan en segundos y tu equipo gestiona todo desde el panel. Menos ida y vuelta, menos fricción y más turnos confirmados.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate('/booking/bella-vida-spa')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5e92ff] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(94,146,255,0.28)] transition hover:-translate-y-0.5 hover:bg-[#4f82ef]"
              >
                Ver demo pública <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Entrar al panel <Users size={16} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <CalendarClock className="mb-4 text-accent-500" size={20} />
                <p className="text-sm font-semibold text-white">Reserva simple</p>
                <p className="mt-2 text-sm leading-6 text-[#a1a1aa]">Tres pasos, confirmacion inmediata y menos abandono.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <Users className="mb-4 text-accent-500" size={20} />
                <p className="text-sm font-semibold text-white">Equipo visible</p>
                <p className="mt-2 text-sm leading-6 text-[#a1a1aa]">Profesionales, servicios y agenda en una sola vista.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <WandSparkles className="mb-4 text-accent-500" size={20} />
                <p className="text-sm font-semibold text-white">Menos friccion</p>
                <p className="mt-2 text-sm leading-6 text-[#a1a1aa]">Acceso publico para clientes y panel privado para el staff.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
