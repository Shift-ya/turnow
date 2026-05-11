import { useCallback, useEffect, useState } from 'react';
import { useToast } from './useToast';
import type { SuperAdminDashboardData, SuperAdminTenantFormData } from '../types/superAdminDashboard';
import type { ApiTenant } from '../lib/api';
import { superAdminRepository } from '../repositories/superAdminRepository';

export function useSuperAdminDashboard() {
  const { success, error: showError } = useToast();
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingTenant, setCreatingTenant] = useState(false);
  const [deletingTenant, setDeletingTenant] = useState(false);

  const [metrics, setMetrics] = useState<SuperAdminDashboardData['metrics']>(null);
  const [tenants, setTenants] = useState<SuperAdminDashboardData['tenants']>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const { overview, tenants: tenantList } = await superAdminRepository.loadDashboard(search);
        setMetrics(overview);
        setTenants(tenantList);
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'No se pudieron cargar datos globales';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [search]);

  // Helper to reload data after mutations (without showing error toast to avoid infinite loops)
  const reloadData = useCallback(async () => {
    try {
      const { overview, tenants: tenantList } = await superAdminRepository.loadDashboard(search);
      setMetrics(overview);
      setTenants(tenantList);
      setError('');
    } catch {
      // Silent fail for reload
    }
  }, [search]);

  const createTenant = useCallback(
    async (data: SuperAdminTenantFormData) => {
      setCreatingTenant(true);
      try {
        await superAdminRepository.createTenant({
          name: data.name,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          slug: data.slug,
          plan: data.plan,
        });
        await reloadData();
        success({
          title: 'Cliente creado',
          message: `${data.name} fue agregado correctamente`,
        });
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'Error al crear el cliente';
        setError(message);
        showError({
          title: 'Error al crear cliente',
          message,
        });
      } finally {
        setCreatingTenant(false);
      }
    },
    [reloadData, success, showError],
  );

  const updateTenantStatus = useCallback(
    async (tenant: ApiTenant) => {
      const nextStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      try {
        await superAdminRepository.updateTenantStatus(tenant.id, nextStatus);
        await reloadData();
        success({
          title: 'Estado actualizado',
          message: `${tenant.name} ahora está ${nextStatus === 'ACTIVE' ? 'activo' : 'suspendido'}`,
        });
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'Error al actualizar estado';
        setError(message);
        showError({
          title: 'Error al actualizar estado',
          message,
        });
      }
    },
    [reloadData, success, showError],
  );

  const deleteTenant = useCallback(
    async (tenantId: string, tenantName: string) => {
      setDeletingTenant(true);
      try {
        await superAdminRepository.deleteTenant(tenantId);
        await reloadData();
        success({
          title: 'Cliente eliminado',
          message: `${tenantName} fue eliminado correctamente`,
        });
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'Error al eliminar el cliente';
        setError(message);
        showError({
          title: 'Error al eliminar cliente',
          message,
        });
      } finally {
        setDeletingTenant(false);
      }
    },
    [reloadData, success, showError],
  );

  return {
    search,
    setSearch,
    sidebarOpen,
    setSidebarOpen,
    loading,
    error,
    metrics,
    tenants,
    creatingTenant,
    deletingTenant,
    createTenant,
    updateTenantStatus,
    deleteTenant,
  };
}
