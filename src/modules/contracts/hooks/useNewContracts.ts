import { useState, useCallback, useEffect } from 'react';
import { Contract, ContractListResponse, ContractFilters } from '../types/contract';
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
  changeSearch: (newSearch: string) => void;
  setFilters: (filters: ContractFilters) => void;
  clearError: () => void;
  refetch: () => Promise<void>;
  createContract: (contract: Partial<Contract>) => Promise<Contract>;
  updateContract: (id: number, contract: Partial<Contract>) => Promise<Contract>;
  deleteContract: (id: number) => Promise<void>;
  search: string;
  filters: ContractFilters;
}

export function useNewContracts(
  initialPage = 1, 
  limit = 10, 
  initialSearch = '',
  initialFilters: ContractFilters = {}
): UseContractsReturn {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState<ContractFilters>(initialFilters);
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
      const result: ContractListResponse = await contractsApi.listRecurring(
        pagination.page, 
        pagination.limit, 
        search,
        filters
      );
      
      console.group('🔍 Dados do Fetch de Contratos');
      console.log('Resultado:', result);
      console.log('Contratos:', result.data);
      console.log('Total de Contratos:', result.total);
      console.log('Página:', result.page);
      console.log('Total de Páginas:', result.totalPages);
      console.groupEnd();

      const validContracts = result.data.filter(contract => {
        // Filtros adicionais podem ser aplicados aqui, se necessário
        return true;
      });

      console.group('🔍 Contratos Validados');
      console.log('Total de Contratos Válidos:', validContracts.length);
      console.log('Contratos Válidos:', validContracts);
      console.groupEnd();

      setContracts(validContracts);
      setPagination(prev => ({
        ...prev,
        totalPages: result.totalPages,
        total: result.total
      }));
      
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar contratos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filters]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const changePage = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const changeSearch = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refetch = useCallback(async () => {
    await fetchContracts();
  }, [fetchContracts]);

  const createContract = useCallback(async (contract: Partial<Contract>) => {
    try {
      const newContract = await contractsApi.create(contract);
      await refetch();
      return newContract;
    } catch (err) {
      console.error('Erro ao criar contrato:', err);
      throw err;
    }
  }, [refetch]);

  const updateContract = useCallback(async (id: number, contract: Partial<Contract>) => {
    try {
      const updatedContract = await contractsApi.update(id.toString(), contract);
      await refetch();
      return updatedContract;
    } catch (err) {
      console.error('Erro ao atualizar contrato:', err);
      throw err;
    }
  }, [refetch]);

  const deleteContract = useCallback(async (id: number) => {
    try {
      await contractsApi.delete(id.toString());
      await refetch();
    } catch (err) {
      console.error('Erro ao deletar contrato:', err);
      throw err;
    }
  }, [refetch]);

  return {
    contracts,
    loading,
    error,
    pagination,
    changePage,
    changeSearch,
    setFilters,
    clearError,
    refetch,
    createContract,
    updateContract,
    deleteContract,
    search,
    filters
  };
}
