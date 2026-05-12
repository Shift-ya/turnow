import React from 'react';
import { Building2, CalendarDays, DollarSign, Users } from 'lucide-react';
import MetricCard from '../ui/MetricCard';
import type { ApiGlobalOverview } from '../../lib/api';

interface Props {
  metrics: ApiGlobalOverview;
}

export default function MetricGrid({ metrics }: Props) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 max-md:grid-cols-2">
      <MetricCard title="Total clientes" value={metrics.totalTenants} icon={<Building2 className='size-5 max-md:size-4' />} />
      <MetricCard title="Clientes activos" value={metrics.activeTenants} icon={<Users className='size-5 max-md:size-4' />} />
      <MetricCard
        title="Turnos totales"
        value={metrics.totalAppointments.toLocaleString()}
        icon={<CalendarDays className='size-5 max-md:size-4' />}
      />
      <MetricCard title="MRR estimado" value={`$${metrics.totalRevenue.toLocaleString()}`} icon={<DollarSign className='size-5 max-md:size-4' />} />
    </section>
  );
}
