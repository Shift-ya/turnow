import React from 'react';
import StatusBadge from '../ui/StatusBadge';
import type { ApiGlobalOverview } from '../../lib/api';

interface Props {
  metrics: ApiGlobalOverview;
}

export default function PlansGrid({ metrics }: Props) {
  const plans = [
    {
      plan: 'BASIC',
      price: '$19.99',
      clients: metrics.activePlans.basic,
      copy: 'Entrada prolija para equipos chicos.',
    },
    {
      plan: 'PROFESSIONAL',
      price: '$49.99',
      clients: metrics.activePlans.professional,
      copy: 'Balance entre operacion, control y crecimiento.',
    },
    {
      plan: 'PREMIUM',
      price: '$99.99',
      clients: metrics.activePlans.premium,
      copy: 'Capa mas alta para marcas con multiples frentes.',
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {plans.map((item, index) => (
        <div key={item.plan} className={index === 1 ? 'panel-dark p-6' : 'panel-light p-6'}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <StatusBadge status={item.plan} size="md" />
              <p className={`mt-4 text-sm leading-7 ${index === 1 ? 'text-stone-300' : 'text-[#a1a1aa]'}`}>{item.copy}</p>
            </div>
            <span
              className={`font-['Space_Grotesk'] text-3xl font-bold tracking-[-0.05em] ${index === 1 ? 'text-white' : 'text-white'}`}
            >
              {item.price}
            </span>
          </div>
          <div
            className={`mt-8 rounded-3xl border p-4 ${index === 1 ? 'border-white/10 bg-white/5 text-stone-200' : 'border-white/10 bg-white/5 text-white'}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">Clientes activos</p>
            <p className="mt-3 font-['Space_Grotesk'] text-3xl font-bold tracking-[-0.05em]">{item.clients}</p>
          </div>
          <button
            className={`mt-6 w-full rounded-2xl py-3 text-sm font-semibold transition ${index === 1 ? 'bg-white text-[#17171a] hover:bg-[#f4f4f5]' : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'}`}
          >
            Editar plan
          </button>
        </div>
      ))}
    </div>
  );
}
