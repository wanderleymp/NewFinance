import { useState, useCallback, useEffect } from 'react';
import { BaseRecord } from '../types';
import { toast } from 'react-hot-toast';

interface UseCRUDBaseProps<T extends BaseRecord> {
  fetchData: (page: number, limit: number, search?: string) => Promise<{
    data: T[];
    meta: {
      total: number;
      pages: number;
      current_page: number;
      per_page: number;
    };
  }>;
  initialState?: {
    viewMode?: 'table' | 'grid';
    itemsPerPage?: number;
  };
}

export function useCRUDBase<T extends BaseRecord>({ 
  fetchData,
  initialState = {
    viewMode: 'table',
    itemsPerPage: 10
  }
}: UseCRUDBaseProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(initialState.viewMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: initialState.itemsPerPage
  });

  const loadData = useCallback(async (page: number = 1, search?: string) => {
    try {
      setIsLoading(true);
      const response = await fetchData(page, pagination.itemsPerPage, search);
      
      if (response && response.data && response.meta) {
        setData(response.data);
        setPagination(prev => ({
          ...prev,
          currentPage: response.meta.current_page,
          totalPages: response.meta.pages,
          totalItems: response.meta.total
        }));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
      // Set empty data and reset pagination on error
      setData([]);
      setPagination(prev => ({
        ...prev,
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
      }));
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, pagination.itemsPerPage]);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    loadData(1, term);
  }, [loadData]);

  const handlePageChange = useCallback((page: number) => {
    loadData(page, searchTerm);
  }, [loadData, searchTerm]);

  const handleViewModeChange = useCallback((mode: 'table' | 'grid') => {
    setViewMode(mode);
  }, []);

  const handleItemsPerPageChange = useCallback((items: number) => {
    setPagination(prev => ({ ...prev, itemsPerPage: items }));
    loadData(1, searchTerm);
  }, [loadData, searchTerm]);

  return {
    data,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    handleItemsPerPageChange,
    loadData,
  };
}