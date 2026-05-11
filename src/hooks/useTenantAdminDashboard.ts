import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from './useToast';
import { TOAST_MESSAGES } from '../types/toast';
import type {
  TenantAdminDashboardData,
  TenantAdminProfessionalFormData,
  TenantAdminServiceFormData,
  TenantAdminTenantFormData,
  TenantAdminTab,
} from '../types/tenantAdminDashboard';
import { tenantAdminRepository } from '../repositories/tenantAdminRepository';
import type { ApiAppointment, ApiProfessional, ApiService, ApiTenantOverview } from '../lib/api';

export function useTenantAdminDashboard(tenantId: string | undefined | null) {
  const { success, error: showError, warning } = useToast();
  const [activeTab, setActiveTab] = useState<TenantAdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingProfessional, setSavingProfessional] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [savingTenant, setSavingTenant] = useState(false);
  const [tenant, setTenant] = useState<TenantAdminDashboardData['tenant']>(null);
  const [metrics, setMetrics] = useState<ApiTenantOverview['metrics'] | null>(null);
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [professionals, setProfessionals] = useState<ApiProfessional[]>([]);
  const [services, setServices] = useState<ApiService[]>([]);

  const loadData = useCallback(async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      setError('');
      const overview = await tenantAdminRepository.loadOverview(tenantId);
      setTenant(overview.tenant);
      setMetrics(overview.metrics);
      setAppointments(overview.appointments);
      setProfessionals(overview.professionals);
      setServices(overview.services);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar los datos del tenant');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = useMemo(() => appointments.filter((item) => item.date === todayStr), [appointments, todayStr]);

  const getServiceName = useCallback(
    (serviceId: string) => services.find((service) => service.id === serviceId)?.name || 'Servicio',
    [services],
  );

  const getProfName = useCallback(
    (professionalId: string) => professionals.find((professional) => professional.id === professionalId)?.name || 'Profesional',
    [professionals],
  );

  const addProfessional = useCallback(
    async (data: TenantAdminProfessionalFormData) => {
      if (!tenantId) return;

      setSavingProfessional(true);
      try {
        await tenantAdminRepository.createProfessional(tenantId, data);
        try {
          await loadData();
          success(TOAST_MESSAGES.professional.createSuccess);
        } catch (refreshError) {
          const message = refreshError instanceof Error ? refreshError.message : 'Se creo el profesional, pero no se pudo refrescar la vista';
          setError(message);
          warning({
            title: 'Profesional creado',
            message: 'Se creo correctamente, pero no se pudo refrescar la lista. Recarga la pantalla.',
          });
        }
      } catch (requestError) {
        // Mitiga falsos negativos: algunos backends pueden persistir y luego fallar al serializar la respuesta.
        try {
          await loadData();
          const firstName = (data.firstName || '').trim().toLowerCase();
          const lastName = (data.lastName || '').trim().toLowerCase();
          const email = (data.email || '').trim().toLowerCase();
          const created = professionals.some((professional) => {
            const fullName = (professional.name || '').trim().toLowerCase();
            const expectedName = `${firstName} ${lastName}`.trim();
            const professionalEmail = (professional.email || '').trim().toLowerCase();
            return (email && professionalEmail === email) || (expectedName && fullName === expectedName);
          });

          if (created) {
            warning({
              title: 'Profesional creado',
              message: 'Se creo correctamente, aunque el backend devolvio un error al responder.',
            });
            return;
          }
        } catch {
          // Si también falla el refresh, cae al error estándar.
        }

        const message = requestError instanceof Error ? requestError.message : 'Error al crear profesional';
        setError(message);
        showError({
          title: TOAST_MESSAGES.professional.createError.title,
          message: TOAST_MESSAGES.professional.createError.message,
        });
      } finally {
        setSavingProfessional(false);
      }
    },
    [loadData, professionals, showError, success, tenantId, warning],
  );

  const editProfessional = useCallback(
    async (data: TenantAdminProfessionalFormData, professionalId: string) => {
      if (!tenantId) return;

      setSavingProfessional(true);
      try {
        await tenantAdminRepository.updateProfessional(tenantId, professionalId, data);
        await loadData();
        success(TOAST_MESSAGES.professional.updateSuccess);
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'Error al actualizar profesional';
        setError(message);
        showError({
          title: TOAST_MESSAGES.professional.updateError.title,
          message: TOAST_MESSAGES.professional.updateError.message,
        });
      } finally {
        setSavingProfessional(false);
      }
    },
    [loadData, showError, success, tenantId],
  );

  const toggleProfessional = useCallback(
    async (professional: ApiProfessional) => {
      if (!tenantId) return;

      const [firstName, ...rest] = professional.name.split(' ');

      try {
        await tenantAdminRepository.updateProfessional(tenantId, professional.id, {
          firstName,
          lastName: rest.join(' ') || '-',
          email: professional.email || '',
          phone: professional.phone || '',
          speciality: professional.speciality || '',
          active: !professional.active,
        });
        await loadData();
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Error al actualizar profesional');
        showError({
          title: 'Error al actualizar profesional',
          message: 'No se pudo cambiar el estado del profesional',
        });
      }
    },
    [loadData, showError, tenantId],
  );

  const addService = useCallback(
    async (data: TenantAdminServiceFormData) => {
      if (!tenantId) return;

      setSavingService(true);
      try {
        await tenantAdminRepository.createService(tenantId, {
          name: data.name,
          description: data.description,
          duration: data.duration,
          price: data.price,
          category: data.category,
          active: data.active ?? true,
        });
        try {
          await loadData();
          success(TOAST_MESSAGES.service.createSuccess);
        } catch (refreshError) {
          const message = refreshError instanceof Error ? refreshError.message : 'Se creo el servicio, pero no se pudo refrescar la vista';
          setError(message);
          warning({
            title: 'Servicio creado',
            message: 'Se creo correctamente, pero no se pudo refrescar la lista. Recarga la pantalla.',
          });
        }
      } catch (requestError) {
        // Mitiga falsos negativos por fallo posterior a la persistencia.
        try {
          await loadData();
          const serviceName = (data.name || '').trim().toLowerCase();
          const created = services.some((service) => (service.name || '').trim().toLowerCase() === serviceName);

          if (created) {
            warning({
              title: 'Servicio creado',
              message: 'Se creo correctamente, aunque el backend devolvio un error al responder.',
            });
            return;
          }
        } catch {
          // Si también falla el refresh, cae al error estándar.
        }

        const message = requestError instanceof Error ? requestError.message : 'Error al crear servicio';
        setError(message);
        showError({
          title: TOAST_MESSAGES.service.createError.title,
          message: TOAST_MESSAGES.service.createError.message,
        });
      } finally {
        setSavingService(false);
      }
    },
    [loadData, services, showError, success, tenantId, warning],
  );

  const editService = useCallback(
    async (data: TenantAdminServiceFormData, serviceId: string) => {
      if (!tenantId) return;

      setSavingService(true);
      try {
        await tenantAdminRepository.updateService(tenantId, serviceId, {
          name: data.name,
          description: data.description,
          duration: data.duration,
          price: data.price,
          category: data.category,
          active: data.active ?? true,
        });
        await loadData();
        success(TOAST_MESSAGES.service.updateSuccess);
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'Error al actualizar servicio';
        setError(message);
        showError({
          title: TOAST_MESSAGES.service.updateError.title,
          message: TOAST_MESSAGES.service.updateError.message,
        });
      } finally {
        setSavingService(false);
      }
    },
    [loadData, showError, success, tenantId],
  );

  const removeService = useCallback(
    async (service: ApiService) => {
      if (!tenantId) return;

      try {
        await tenantAdminRepository.deleteService(tenantId, service.id);
        await loadData();
        success(TOAST_MESSAGES.service.deleteSuccess);
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'Error al eliminar servicio';
        setError(message);
        showError({
          title: TOAST_MESSAGES.service.deleteError.title,
          message: TOAST_MESSAGES.service.deleteError.message,
        });
      }
    },
    [loadData, showError, success, tenantId],
  );

  const editTenant = useCallback(
    async (data: TenantAdminTenantFormData) => {
      if (!tenantId) return;

      setSavingTenant(true);
      try {
        await tenantAdminRepository.updateSettings(tenantId, {
          businessName: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          slug: data.slug,
          primaryColor: data.primaryColor,
        });
        await loadData();
        success({
          title: 'Informacion actualizada',
          message: 'Los cambios se guardaron correctamente',
        });
      } catch {
        showError({
          title: 'Error al actualizar',
          message: 'No se pudieron guardar los cambios',
        });
      } finally {
        setSavingTenant(false);
      }
    },
    [loadData, showError, success, tenantId],
  );

  return {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    loading,
    error,
    tenant,
    metrics,
    appointments,
    professionals,
    services,
    todayAppts,
    getServiceName,
    getProfName,
    addProfessional,
    editProfessional,
    toggleProfessional,
    addService,
    editService,
    removeService,
    editTenant,
    savingProfessional,
    savingService,
    savingTenant,
  };
}
