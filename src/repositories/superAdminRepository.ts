import { api, type ApiGlobalOverview, type ApiTenant } from '../lib/api';

export const superAdminRepository = {
  loadDashboard: async (search = ''): Promise<{ overview: ApiGlobalOverview; tenants: ApiTenant[] }> => {
    const [overview, tenants] = await Promise.all([api.superOverview(), api.listTenants(search)]);
    return { overview, tenants };
  },
  createTenant: (payload: { name: string; firstName?: string; lastName?: string; email: string; phone: string; address: string; slug: string; plan: string }) =>
    api.createTenant(payload),
  updateTenantStatus: (tenantId: string, status: string) => api.updateTenantStatus(tenantId, status),
  deleteTenant: (tenantId: string) => api.deleteTenant(tenantId),
};
