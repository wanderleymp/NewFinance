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
      console.log(' Iniciando busca de contratos...', { page: pagination.page, limit: pagination.limit });
      
      const result: ContractListResponse = await contractsApi.listRecurring(pagination.page, pagination.limit);
      
      console.group(' Resultado da busca de contratos');
      console.log('Estrutura completa do resultado:', result);
      console.log('Dados dos contratos:', result.data);
      console.log('Total de contratos:', result.data?.length || 0);
      console.log('Página atual:', result.page);
      console.log('Total de páginas:', result.totalPages);
      console.log('Total de itens:', result.total);
      console.groupEnd();
      
      // Garantir que sempre seja um array, mesmo que vazio
      const contractsData = result.data || [];
      
      // Log detalhado dos contratos
      contractsData.forEach((contract, index) => {
        console.group(`Contrato #${index + 1}`);
        console.log('ID:', contract.id);
        console.log('Nome:', contract.name);
        console.log('Valor:', contract.value);
        console.log('Status:', contract.status);
        console.groupEnd();
      });
      
      setContracts(contractsData);
      
      setPagination(prev => ({
        ...prev,
        totalPages: result.totalPages || 1,
        total: result.total || 0
      }));
    } catch (err: any) {
      console.group(' Erro ao Buscar Contratos');
      console.error('Tipo:', err.name);
      console.error('Mensagem:', err.message);
      console.error('Status:', err.response?.status);
      
      // Formatar mensagem de erro para o usuário
      let errorMessage = 'Erro ao carregar contratos. ';
      
      if (err.response?.status === 500) {
        errorMessage += 'Erro interno no servidor. Por favor, tente novamente mais tarde.';
        console.error('Detalhes do Erro 500:', {
          data: err.response?.data,
          headers: err.response?.headers
        });
      } else if (err.response?.status === 401) {
        errorMessage += 'Sua sessão expirou. Por favor, faça login novamente.';
      } else if (err.response?.status === 403) {
        errorMessage += 'Você não tem permissão para acessar estes dados.';
      } else {
        errorMessage += err.response?.data?.message || err.message || 'Erro desconhecido';
      }
      
      console.error('Mensagem para o usuário:', errorMessage);
      console.groupEnd();
      
      setError(errorMessage);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const changePage = useCallback((newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const refetch = useCallback(async () => {
    await fetchContracts();
  }, [fetchContracts]);

  return {
    contracts,
    loading,
    error,
    pagination,
    changePage,
    clearError,
    refetch
  };
}
