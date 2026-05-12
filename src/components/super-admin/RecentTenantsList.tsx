import React from 'react';
import StatusBadge from '../ui/StatusBadge';
import type { ApiTenant } from '../../lib/api';

interface Props {
  tenants: ApiTenant[];
}

export default function RecentTenantsList({ tenants }: Props) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <div className="panel-light p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-500">Actividad reciente</p>
            <h2 className="mt-2 font-['Space_Grotesk'] text-2xl max-md:text-[16px] font-bold tracking-[-0.05em] text-white">
              Ultimos clientes incorporados
            </h2>
          </div>
          <div className="rounded-full text-nowrap border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-[#a1a1aa]">
            {tenants.length} cuentas
          </div>
        </div>

        <div className="space-y-3">
          {tenants.slice(0, 6).map((tenant) => (
            <div key={tenant.id} className="soft-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-semibold text-white">{tenant.name}</p>
                <p className="mt-1 text-sm text-[#a1a1aa]">{tenant.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={tenant.plan} />
                <StatusBadge status={tenant.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
