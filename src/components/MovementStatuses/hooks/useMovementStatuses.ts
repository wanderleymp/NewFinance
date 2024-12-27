import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { MovementStatus } from '../../../types/movement-status';
import { MovementStatusService } from '../../../services/MovementStatusService';
import { useCRUDBase } from '../../CRUDBase/hooks/useCRUDBase';

export const useMovementStatuses = () => {
  const [activeFilter, setActiveFilter] = useState<'true' | 'false' | 'all'>('all');

  const fetchMovementStatuses = useCallback(async (page: number, limit: number, search?: string) => {
    try {
      const response = await MovementStatusService.getMovementStatuses(page, limit, activeFilter, search);
      return {
        data: response.data,
        meta: {
          total: response.pagination.total,
          pages: response.pagination.totalPages,
          current_page: response.pagination.currentPage,
          per_page: response.pagination.perPage
        }
      };
    } catch (error) {
      console.error('Error loading movement statuses:', error);
      toast.error('Erro ao carregar status de movimento');
      throw error;
    }
  }, [activeFilter]);

  const {
    data: movementStatuses,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    loadData,
  } = useCRUDBase<MovementStatus>({
    fetchData: fetchMovementStatuses,
    initialState: {
      viewMode: 'table',
      itemsPerPage: 10
    }
  });

  const handleToggleStatus = async (status: MovementStatus) => {
    try {
      await MovementStatusService.toggleMovementStatus(status.movement_status_id);
      loadData(pagination.currentPage);
    } catch (error) {
      toast.error('Erro ao alterar status');
    }
  };

  const handleActiveFilterChange = (value: 'true' | 'false' | 'all') => {
    setActiveFilter(value);
    loadData(1);
  };

  return {
    movementStatuses,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    activeFilter,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    handleToggleStatus,
    handleActiveFilterChange,
    loadData,
  };
};