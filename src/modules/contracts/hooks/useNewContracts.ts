import { useState, useCallback, useEffect } from 'react';
import { Contract, ContractListResponse } from '../types/contract';
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
  clearError: () => void;
  refetch: () => Promise<void>;
  createContract: (contract: Partial<Contract>) => Promise<Contract>;
  updateContract: (id: number, contract: Partial<Contract>) => Promise<Contract>;
  deleteContract: (id: number) => Promise<void>;
  search: string;
}

export function useNewContracts(
  initialPage = 1, 
  limit = 10, 
  initialSearch = ''
): UseContractsReturn {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
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
        search
      );
      
      console.group('🔍 Dados do Fetch de Contratos');
      console.log('Resultado:', result);
      console.log('Contratos:', result.data);
      console.log('Total de Contratos:', result.data.length);
      console.log('Página:', result.page);
      console.log('Total de Páginas:', result.totalPages);
      console.groupEnd();
      
      // Garantir que os contratos sejam sempre um array
      const contractsData = Array.isArray(result.data) ? result.data : [];
      
      // Validar cada contrato antes de definir o estado
      const validContracts = contractsData.filter(contract => 
        contract && typeof contract === 'object' && contract.id !== undefined
      );
      
      console.group('🔍 Contratos Validados');
      console.log('Total de Contratos Válidos:', validContracts.length);
      console.log('Contratos Válidos:', validContracts);
      console.groupEnd();
      
      setContracts(validContracts);
      
      setPagination(prev => ({
        ...prev,
        totalPages: result.totalPages || 1,
        total: result.total || validContracts.length
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar contratos';
      setError(errorMessage);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  const createContract = useCallback(async (contract: Partial<Contract>) => {
    try {
      const newContract = await contractsApi.create(contract);
      setContracts(prev => [...prev, newContract]);
      return newContract;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar contrato';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateContract = useCallback(async (id: number, contract: Partial<Contract>) => {
    try {
      const updatedContract = await contractsApi.update(id, contract);
      setContracts(prev => 
        prev.map(c => c.id === id ? { ...c, ...updatedContract } : c)
      );
      return updatedContract;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar contrato';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteContract = useCallback(async (id: number) => {
    try {
      await contractsApi.delete(id);
      setContracts(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao excluir contrato';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const changePage = useCallback((newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  }, []);

  const changeSearch = useCallback((newSearch: string) => {
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    setSearch(newSearch);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  useEffect(() => {
    console.group('🔍 Estado dos Contratos no Hook');
    console.log('Contratos atuais:', contracts);
    console.log('Loading:', loading);
    console.log('Página atual:', pagination.page);
    console.log('Total de contratos:', pagination.total);
    console.groupEnd();
  }, [contracts, loading, pagination]);

  const refetch = useCallback(async () => {
    await fetchContracts();
  }, [fetchContracts]);

  return {
    contracts,
    loading,
    error,
    pagination,
    changePage,
    changeSearch,
    clearError,
    createContract,
    updateContract,
    deleteContract,
    refetch,
    search
  };
}
