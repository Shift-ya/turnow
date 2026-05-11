import { getApiBaseUrl } from './runtimeConfig';

const TOKEN_KEY = 'turnow_token';
let isRefreshing = false;

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // no-op
  }
}

async function refreshToken(): Promise<string | null> {
  const apiBase = await getApiBaseUrl();
  const token = getStoredToken();

  if (!token) {
    return null;
  }

  try {
    const res = await fetch(`${apiBase}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      setStoredToken(null);
      window.location.href = '/login';
      return null;
    }

    const data = (await res.json()) as { accessToken: string };
    setStoredToken(data.accessToken);
    return data.accessToken;
  } catch (error) {
    setStoredToken(null);
    window.location.href = '/login';
    return null;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const apiBase = await getApiBaseUrl();
  const token = getStoredToken();
  const { headers: initHeaders, ...restInit } = init || {};

  const headers = new Headers(initHeaders || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res = await fetch(`${apiBase}${path}`, {
    headers,
    ...restInit,
  });

  // Si es 401 (token expirado), intentar refresh
  if (res.status === 401 && !isRefreshing) {
    isRefreshing = true;
    const newToken = await refreshToken();
    isRefreshing = false;

    if (newToken) {
      // Reintentar con nuevo token
      const newHeaders = new Headers(initHeaders || {});
      newHeaders.set('Content-Type', 'application/json');
      newHeaders.set('Authorization', `Bearer ${newToken}`);

      res = await fetch(`${apiBase}${path}`, {
        headers: newHeaders,
        ...restInit,
      });
    } else {
      // Refresh falló, redirigir a login
      throw new Error('Sesión expirada');
    }
  }

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

export interface ApiLoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  tenantId: string | null;
  tenantName?: string | null;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
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
  tenantName?: string;
  name: string;
  email: string;
  phone: string;
  speciality: string;
  active: boolean;
}

export interface ApiService {
  id: string;
  tenantId: string;
  tenantName?: string;
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
  tenantName?: string;
  serviceId: string;
  professionalId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'BOOKED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  createdAt?: string | null;
}

export interface TenantAppointmentFilters {
  professionalId?: string;
  date?: string;
  serviceId?: string;
  clientName?: string;
  status?: ApiAppointment['status'];
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
    request<ApiLoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  superOverview: () => request<ApiGlobalOverview>('/admin/super/overview'),
  listTenants: (search = '') => request<ApiTenant[]>(`/admin/super/tenants${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createTenant: (payload: { name: string; firstName?: string; lastName?: string; slug: string; email: string; phone: string; address: string; plan: string }) =>
    request<ApiTenant>('/admin/super/tenants', { method: 'POST', body: JSON.stringify(payload) }),
  updateTenantStatus: (tenantId: string, status: string) =>
    request<ApiTenant>(`/admin/super/tenants/${tenantId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteTenant: (tenantId: string) => request<void>(`/admin/super/tenants/${tenantId}`, { method: 'DELETE' }),

  tenantOverview: (tenantId: string) => request<ApiTenantOverview>(`/admin/tenant/${tenantId}/overview`),
  listTenantAppointments: (tenantId: string, filters: TenantAppointmentFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.professionalId) params.set('professionalId', filters.professionalId);
    if (filters.date) params.set('date', filters.date);
    if (filters.serviceId) params.set('serviceId', filters.serviceId);
    if (filters.clientName) params.set('clientName', filters.clientName);
    if (filters.status) params.set('status', filters.status);

    const query = params.toString();
    return request<ApiAppointment[]>(`/admin/tenant/${tenantId}/appointments${query ? `?${query}` : ''}`);
  },
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
