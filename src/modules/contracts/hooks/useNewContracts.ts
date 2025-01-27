import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { contractService } from '../services/ContractService';
import { Contract } from '../types/Contract';

interface PaginationState {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

export const useNewContracts = () => {
  // Estado inicial com valores padrão
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10, // Valor padrão definido
    totalPages: 0,
    total: 0
  });

  const [search, setSearch] = useState('');
  const [contracts, setContracts] = useState<Contract[]>([]);

  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['contracts', pagination.page, pagination.limit, search],
    queryFn: async () => {
      try {
        console.log('🚨 DEBUG - Parâmetros completos de busca:', {
          page: pagination.page, 
          limit: pagination.limit,
          search,
          fullQueryKey: ['contracts', pagination.page, pagination.limit, search]
        });

        const response = await contractService.getContracts(
          pagination.page, 
          pagination.limit,
          search // Passando o termo de busca para o serviço
        );
        
        console.log('🚨 DEBUG - Resposta completa do serviço:', response);

        // Atualiza o estado imediatamente após receber os dados
        if (response) {
          setContracts(response.contracts || []);
          setPagination(prev => ({
            ...prev,
            totalPages: response.totalPages || 0,
            total: response.total || 0
          }));
        }
        
        return response;
      } catch (error) {
        console.error('🚨 DEBUG - Erro completo na busca:', error);
        throw error;
      }
    },
    keepPreviousData: true,
    onSuccess: (responseData) => {
      if (!responseData) {
        console.warn('⚠️ useNewContracts - Dados da resposta indefinidos');
        setContracts([]);
        setPagination(prev => ({
          ...prev,
          totalPages: 0,
          total: 0
        }));
        return;
      }

      console.log('🔍 useNewContracts - Dados recebidos:', responseData);
      
      // Garantir que contractsList seja sempre um array
      const contractsList = Array.isArray(responseData.contracts) ? responseData.contracts : [];
      const { total = 0, totalPages = 0 } = responseData;

      console.log('🔍 useNewContracts - Estado atualizado:', {
        contractsLength: contractsList.length,
        totalPages,
        total
      });

      setContracts(contractsList);
      setPagination(prev => ({
        ...prev,
        totalPages,
        total
      }));
    },
    onError: (err: any) => {
      console.error('❌ useNewContracts - Erro detalhado:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status
      });
      
      setContracts([]);
      setPagination(prev => ({
        ...prev,
        totalPages: 0,
        total: 0
      }));
    }
  });

  // Efeito para sincronizar os dados quando mudar
  useEffect(() => {
    if (data) {
      console.log('🔍 useNewContracts - Sincronizando dados:', data);
      setContracts(data.contracts || []);
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages || 0,
        total: data.total || 0
      }));
    }
  }, [data]);

  // Função para alterar o termo de busca
  const changeSearch = useCallback((newSearch: string) => {
    console.log('🔍 useNewContracts - Alterando termo de busca:', {
      atual: search,
      novo: newSearch
    });
    
    setSearch(newSearch);
    // Resetar a página ao fazer uma nova busca
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  }, [search]);

  const changePage = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: newLimit,
      page: 1 // Resetar para primeira página ao mudar limite
    }));
  }, []);

  return {
    contracts,
    loading: isLoading,
    error: error as Error | null,
    pagination,
    search,
    changeSearch,
    changePage,
    changeLimit,
    refetch,
    clearError: () => {}, // Função vazia por enquanto
    createContract: async () => {}, // Função vazia por enquanto
    updateContract: async () => {}, // Função vazia por enquanto
    deleteContract: async () => {}, // Função vazia por enquanto
    setFilters: () => {}, // Função vazia por enquanto
    filters: {} // Objeto vazio por enquanto
  };
};
