export type Role = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'STAFF' | 'CLIENT';
export type AppointmentStatus = 'BOOKED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export type SubscriptionPlan = 'BASIC' | 'PROFESSIONAL' | 'PREMIUM';
export type SubscriptionStatus = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId?: string;
  avatar?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  logo?: string;
  primaryColor: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  subscription: Subscription;
}

export interface TenantSettings {
  tenantId: string;
  businessName: string;
  description: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  timezone: string;
  currency: string;
  bookingAdvanceDays: number;
  cancellationHours: number;
}

export interface Professional {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  speciality: string;
  avatar?: string;
  active: boolean;
}

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  currency: string;
  active: boolean;
  category: string;
}

export interface Appointment {
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
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface Availability {
  id: string;
  professionalId: string;
  tenantId: string;
  dayOfWeek: number; // 0-6
  startTime: string;
  endTime: string;
  isBlocked: boolean;
}

export interface Subscription {
  id: string;
  tenantId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  maxProfessionals: number;
  maxServices: number;
  startDate: string;
  endDate: string;
  price: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface DashboardMetrics {
  totalAppointments: number;
  todayAppointments: number;
  weekAppointments: number;
  completedRate: number;
  cancelledRate: number;
  noShowRate: number;
  revenue: number;
  newClients: number;
}

export interface GlobalMetrics {
  totalTenants: number;
  activeTenants: number;
  totalAppointments: number;
  totalRevenue: number;
  monthlyGrowth: number;
  activePlans: { basic: number; professional: number; premium: number };
}
