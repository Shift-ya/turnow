import { api, type ApiAppointment, type ApiProfessional, type ApiService, type ApiTenant, type ApiTenantOverview } from '../lib/api';

export const tenantAdminRepository = {
  loadOverview: (tenantId: string): Promise<ApiTenantOverview> => api.tenantOverview(tenantId),
  listAppointments: (tenantId: string, date?: string): Promise<ApiAppointment[]> =>
    api.listTenantAppointments(tenantId, date ? { date } : {}),
  listProfessionals: (tenantId: string): Promise<ApiProfessional[]> => api.listTenantProfessionals(tenantId),
  createProfessional: (tenantId: string, payload: any): Promise<ApiProfessional> => api.createTenantProfessional(tenantId, payload),
  updateProfessional: (tenantId: string, professionalId: string, payload: any): Promise<ApiProfessional> =>
    api.updateTenantProfessional(tenantId, professionalId, payload),
  deleteProfessional: (tenantId: string, professionalId: string): Promise<void> => api.deleteTenantProfessional(tenantId, professionalId),
  listServices: (tenantId: string): Promise<ApiService[]> => api.listTenantServices(tenantId),
  createService: (tenantId: string, payload: any): Promise<ApiService> => api.createTenantService(tenantId, payload),
  updateService: (tenantId: string, serviceId: string, payload: any): Promise<ApiService> => api.updateTenantService(tenantId, serviceId, payload),
  deleteService: (tenantId: string, serviceId: string): Promise<void> => api.deleteTenantService(tenantId, serviceId),
  updateSettings: (tenantId: string, payload: any): Promise<ApiTenant> => api.updateTenantSettings(tenantId, payload),
};
