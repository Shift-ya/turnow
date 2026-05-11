import type { ApiGlobalOverview, ApiTenant } from '../lib/api';
import type { DashboardNavItem } from './dashboard';

export type SuperAdminTab = 'overview' | 'tenants' | 'plans';

export type SuperAdminNavItem = DashboardNavItem<SuperAdminTab>;

export interface SuperAdminTenantFormData {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  address: string;
  slug: string;
  plan: string;
}

export interface SuperAdminDashboardData {
  metrics: ApiGlobalOverview | null;
  tenants: ApiTenant[];
}
