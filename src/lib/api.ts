import { getApiBaseUrl } from './runtimeConfig';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const apiBase = await getApiBaseUrl();

  const res = await fetch(`${apiBase}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      // no-op
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return null as T;
  }

  return (await res.json()) as T;
}

export interface ApiUser {
  id: string;
  tenantId: string | null;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'STAFF' | 'CLIENT';
}

export interface ApiTenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  plan: string;
  primaryColor?: string;
  createdAt?: string | null;
}

export interface ApiProfessional {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  speciality: string;
  active: boolean;
}

export interface ApiService {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  currency: string;
  active: boolean;
  category: string;
}

export interface ApiAppointment {
  id: string;
  tenantId: string;
  serviceId: string;
  professionalId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  createdAt?: string | null;
}

export interface ApiTenantOverview {
  tenant: ApiTenant;
  metrics: {
    totalAppointments: number;
    todayAppointments: number;
    weekAppointments: number;
    completedRate: number;
    cancelledRate: number;
    noShowRate: number;
    revenue: number;
    newClients: number;
  };
  appointments: ApiAppointment[];
  professionals: ApiProfessional[];
  services: ApiService[];
}

export interface ApiGlobalOverview {
  totalTenants: number;
  activeTenants: number;
  totalAppointments: number;
  totalRevenue: number;
  monthlyGrowth: number;
  activePlans: { basic: number; professional: number; premium: number };
}

export interface PublicTenant {
  id: string;
  slug: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  plan: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface PublicSlots {
  slots: Array<{ startTime: string; endTime: string; available: boolean }>;
}

export const api = {
  login: (email: string, password: string) =>
    request<ApiUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  superOverview: () => request<ApiGlobalOverview>('/admin/super/overview'),
  listTenants: (search = '') => request<ApiTenant[]>(`/admin/super/tenants${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createTenant: (payload: { name: string; slug: string; email: string; phone: string; address: string; plan: string }) =>
    request<ApiTenant>('/admin/super/tenants', { method: 'POST', body: JSON.stringify(payload) }),
  updateTenantStatus: (tenantId: string, status: string) =>
    request<ApiTenant>(`/admin/super/tenants/${tenantId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteTenant: (tenantId: string) => request<void>(`/admin/super/tenants/${tenantId}`, { method: 'DELETE' }),

  tenantOverview: (tenantId: string) => request<ApiTenantOverview>(`/admin/tenant/${tenantId}/overview`),
  listTenantAppointments: (tenantId: string, date?: string) =>
    request<ApiAppointment[]>(`/admin/tenant/${tenantId}/appointments${date ? `?date=${date}` : ''}`),
  listTenantProfessionals: (tenantId: string) => request<ApiProfessional[]>(`/admin/tenant/${tenantId}/professionals`),
  createTenantProfessional: (tenantId: string, payload: any) =>
    request<ApiProfessional>(`/admin/tenant/${tenantId}/professionals`, { method: 'POST', body: JSON.stringify(payload) }),
  updateTenantProfessional: (tenantId: string, professionalId: string, payload: any) =>
    request<ApiProfessional>(`/admin/tenant/${tenantId}/professionals/${professionalId}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteTenantProfessional: (tenantId: string, professionalId: string) =>
    request<void>(`/admin/tenant/${tenantId}/professionals/${professionalId}`, { method: 'DELETE' }),
  listTenantServices: (tenantId: string) => request<ApiService[]>(`/admin/tenant/${tenantId}/services`),
  createTenantService: (tenantId: string, payload: any) =>
    request<ApiService>(`/admin/tenant/${tenantId}/services`, { method: 'POST', body: JSON.stringify(payload) }),
  updateTenantService: (tenantId: string, serviceId: string, payload: any) =>
    request<ApiService>(`/admin/tenant/${tenantId}/services/${serviceId}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteTenantService: (tenantId: string, serviceId: string) =>
    request<void>(`/admin/tenant/${tenantId}/services/${serviceId}`, { method: 'DELETE' }),
  updateTenantSettings: (tenantId: string, payload: any) =>
    request<ApiTenant>(`/admin/tenant/${tenantId}/settings`, { method: 'PUT', body: JSON.stringify(payload) }),

  getPublicTenant: (slug: string) => request<PublicTenant>(`/public/tenant/${slug}`),
  getPublicServices: (slug: string) => request<ApiService[]>(`/public/tenant/${slug}/services`),
  getPublicProfessionals: (slug: string, serviceId?: string) =>
    request<ApiProfessional[]>(`/public/tenant/${slug}/professionals${serviceId ? `?serviceId=${serviceId}` : ''}`),
  getPublicSlots: (slug: string, professionalId: string, serviceId: string, date: string) =>
    request<PublicSlots>(`/public/tenant/${slug}/slots?professionalId=${professionalId}&serviceId=${serviceId}&date=${date}`),
  createPublicAppointment: (slug: string, payload: any) =>
    request<any>(`/public/tenant/${slug}/appointments`, { method: 'POST', body: JSON.stringify(payload) }),
};
