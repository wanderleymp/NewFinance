import { useState, useCallback, useEffect } from 'react';
import { Contract } from '../types/contract';
import { contractsApi } from '../services/api';

interface UseContractsReturn {
  contracts: Contract[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
  changePage: (newPage: number) => void;
  clearError: () => void;
  refetch: () => Promise<void>;
}

export function useNewContracts(initialPage = 1, limit = 10): UseContractsReturn {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: limit,
    totalPages: 1,
    total: 0
  });

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await contractsApi.list({
        page: pagination.page,
        limit: pagination.limit
      });
      
      setContracts(result.data || []);
      setPagination(prev => ({
        ...prev,
        totalPages: result.totalPages || 1,
        total: result.total || 0
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           'Erro ao carregar contratos';
      setError(errorMessage);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const changePage = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    contracts,
    loading,
    error,
    pagination,
    changePage,
    clearError,
    refetch: fetchContracts
  };
}
