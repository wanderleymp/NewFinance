import { useCallback, useState } from 'react';
import { Service } from '../../../types/service';
import { ServiceService } from '../../../services/ServiceService';
import { useCRUDBase } from '../../CRUDBase/hooks/useCRUDBase';

export const useServices = () => {
  const [activeFilter, setActiveFilter] = useState<'true' | 'false' | 'all'>('all');

  const fetchServices = useCallback(async (page: number, limit: number, search?: string) => {
    try {
      const active = activeFilter === 'all' ? undefined : activeFilter === 'true';
      const response = await ServiceService.getServices(page, limit, active, search);
      
      return {
        data: response.data,
        meta: {
          total: response.pagination.total,
          pages: response.pagination.totalPages,
          current_page: response.pagination.currentPage,
          per_page: limit
        }
      };
    } catch (error) {
      throw error;
    }
  }, [activeFilter]);

  const {
    data: services,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    loadData,
  } = useCRUDBase<Service>({
    fetchData: fetchServices,
    initialState: {
      viewMode: 'table',
      itemsPerPage: 10
    }
  });

  const handleToggleStatus = async (service: Service) => {
    try {
      await ServiceService.toggleServiceStatus(service.item_id);
      loadData(pagination.currentPage);
    } catch (error) {
      // Error is handled by the service
    }
  };

  const handleDelete = async (service: Service) => {
    try {
      await ServiceService.deleteService(service.item_id);
      loadData(pagination.currentPage);
    } catch (error) {
      // Error is handled by the service
    }
  };

  const handleActiveFilterChange = (value: 'true' | 'false' | 'all') => {
    setActiveFilter(value);
    loadData(1);
  };

  const metrics = [
    {
      title: 'Total de Serviços',
      value: pagination.totalItems,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-white',
    },
    {
      title: 'Serviços Ativos',
      value: services.filter(s => s.active).length,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      textColor: 'text-white',
    }
  ];

  return {
    services,
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
    handleDelete,
    handleActiveFilterChange,
    loadData,
  };
};