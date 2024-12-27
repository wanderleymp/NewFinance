import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { License, LicenseMetrics } from '../../../types/license';
import { LicenseService } from '../../../services/LicenseService';
import { useCRUDBase } from '../../CRUDBase/hooks/useCRUDBase';

export const useLicenses = () => {
  const [activeFilter, setActiveFilter] = useState<'true' | 'false' | 'all'>('all');
  const [metrics, setMetrics] = useState<LicenseMetrics>({
    total: 0,
    active: 0,
    inactive: 0,
    renewal_rate: 0,
  });

  const fetchLicenses = useCallback(async (page: number, limit: number, search?: string) => {
    try {
      const response = await LicenseService.getLicenses(page, limit, activeFilter, search);
      
      // Calculate metrics from the response data
      const active = response.data.filter(l => l.status === 'active').length;
      const total = response.meta.total;
      const inactive = total - active;
      
      setMetrics({
        total,
        active,
        inactive,
        renewal_rate: total > 0 ? (active / total) * 100 : 0,
      });

      return response;
    } catch (error) {
      console.error('Error loading licenses:', error);
      toast.error('Erro ao carregar licenças');
      throw error;
    }
  }, [activeFilter]);

  const {
    data: licenses,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    loadData,
  } = useCRUDBase<License>({
    fetchData: fetchLicenses,
    initialState: {
      viewMode: 'table',
      itemsPerPage: 10
    }
  });

  const handleToggleStatus = async (license: License) => {
    try {
      await LicenseService.toggleLicenseStatus(license.id);
      toast.success('Status da licença atualizado com sucesso');
      loadData(pagination.currentPage);
    } catch (error) {
      toast.error('Erro ao atualizar status da licença');
    }
  };

  const handleActiveFilterChange = (value: 'true' | 'false' | 'all') => {
    setActiveFilter(value);
    loadData(1);
  };

  return {
    licenses,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    metrics,
    activeFilter,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    handleToggleStatus,
    handleActiveFilterChange,
    loadData,
  };
};