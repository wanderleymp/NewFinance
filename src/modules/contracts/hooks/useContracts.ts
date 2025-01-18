import { useState, useCallback, useEffect } from 'react';
import { Contract } from '../types/contract';
import { contractService } from '../services/contractService';

interface UseContractsReturn {
  contracts: Contract[];
  loading: boolean;
  error: Error | null;
  page: number;
  totalPages: number;
  fetchContracts: (page?: number) => Promise<void>;
  createContract: (contract: Omit<Contract, 'id'>) => Promise<Contract>;
  updateContract: (id: string, contract: Partial<Contract>) => Promise<Contract>;
  deleteContract: (id: string) => Promise<void>;
}

export function useContracts(initialPage = 1, limit = 10): UseContractsReturn {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);

  const fetchContracts = useCallback(async (requestedPage = page) => {
    try {
      setLoading(true);
      setError(null);

      const { 
        contracts: fetchedContracts, 
        total, 
        page: currentPage, 
        totalPages: totalPagesCount 
      } = await contractService.getContracts(requestedPage, limit);

      setContracts(fetchedContracts);
      setPage(currentPage);
      setTotalPages(totalPagesCount);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const createContract = useCallback(async (contract: Omit<Contract, 'id'>) => {
    try {
      const newContract = await contractService.createContract(contract);
      await fetchContracts(); // Recarregar lista
      return newContract;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao criar contrato'));
      throw err;
    }
  }, [fetchContracts]);

  const updateContract = useCallback(async (id: string, contract: Partial<Contract>) => {
    try {
      const updatedContract = await contractService.updateContract(id, contract);
      await fetchContracts(); // Recarregar lista
      return updatedContract;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao atualizar contrato'));
      throw err;
    }
  }, [fetchContracts]);

  const deleteContract = useCallback(async (id: string) => {
    try {
      await contractService.deleteContract(id);
      await fetchContracts(); // Recarregar lista
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao excluir contrato'));
      throw err;
    }
  }, [fetchContracts]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  return {
    contracts,
    loading,
    error,
    page,
    totalPages,
    fetchContracts,
    createContract,
    updateContract,
    deleteContract
  };
}
