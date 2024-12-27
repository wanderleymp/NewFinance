import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { MovementType } from '../../../types/movement-type';
import { MovementTypeService } from '../../../services/MovementTypeService';
import { useCRUDBase } from '../../CRUDBase/hooks/useCRUDBase';

export const useMovementTypes = () => {
  const fetchMovementTypes = useCallback(async (page: number, limit: number, search?: string) => {
    try {
      const response = await MovementTypeService.getMovementTypes(page, limit, search);
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
      console.error('Error loading movement types:', error);
      toast.error('Erro ao carregar tipos de movimento');
      throw error;
    }
  }, []);

  const {
    data: movementTypes,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    loadData,
  } = useCRUDBase<MovementType>({
    fetchData: fetchMovementTypes,
    initialState: {
      viewMode: 'table',
      itemsPerPage: 10
    }
  });

  const handleDelete = async (movementType: MovementType) => {
    try {
      await MovementTypeService.deleteMovementType(movementType.movement_type_id);
      loadData(pagination.currentPage);
    } catch (error) {
      // Error is handled by the service
    }
  };

  return {
    movementTypes,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    handleDelete,
    loadData,
  };
};