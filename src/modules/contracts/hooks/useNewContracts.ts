import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Contract } from '../types/contract';
import { contractService } from '../services/ContractService';

interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

interface UseContractsReturn {
  contracts: Contract[];
  isLoading: boolean;
  error: Error | null;
  pagination: Pagination;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
}

export function useNewContracts(): UseContractsReturn {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    totalPages: 0,
    total: 0
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['contracts', page, limit, search],
    queryFn: async () => {
      try {
        console.log('🚨 DEBUG - Parâmetros completos de busca:', {
          page,
          limit,
          search,
          fullQueryKey: ['contracts', page, limit, search]
        });

        const response = await contractService.getContracts(page, limit, search);

        // Validação da resposta
        if (!response) {
          console.error('🚨 Resposta da API é undefined');
          return {
            contracts: [],
            total: 0,
            totalPages: 0,
            currentPage: page
          };
        }

        // Mapeamento dos contratos com validação de campos
        const mappedContracts = response.contracts?.map(item => ({
          id: item.id || 0,
          name: item.name || '',
          value: typeof item.value === 'number' ? item.value : 0,
          status: item.status || 'inactive',
          groupName: item.groupName || '',
          fullName: item.fullName || '',
          dueDay: item.dueDay || 1,
          nextBillingDate: item.nextBillingDate || null,
          startDate: item.startDate || null,
          endDate: item.endDate || null,
          recurrencePeriod: item.recurrencePeriod || 'monthly',
          daysBefore: item.daysBefore || 0,
          lastBillingDate: item.lastBillingDate || null,
          billingReference: item.billingReference || '',
          contractGroupId: item.contractGroupId || 0,
          modelMovementId: item.modelMovementId || 0
        })) || [];

        // Atualização do estado
        setContracts(mappedContracts);
        setPagination({
          page: response.currentPage || page,
          limit,
          totalPages: response.totalPages || 0,
          total: response.total || 0
        });

        return {
          contracts: mappedContracts,
          total: response.total || 0,
          totalPages: response.totalPages || 0,
          currentPage: response.currentPage || page
        };
      } catch (error) {
        console.error('🚨 DEBUG - Erro completo na busca:', error);
        throw error;
      }
    },
    keepPreviousData: true // Mantém os dados anteriores enquanto carrega novos
  });

  return {
    contracts: data?.contracts || [],
    isLoading,
    error: error as Error | null,
    pagination,
    setPage,
    setLimit,
    setSearch
  };
}
