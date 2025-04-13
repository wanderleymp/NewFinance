import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Contract } from '../types/contract';
import { contractService } from '../services/contractService';

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

        console.log('🚨 DEBUG - Resposta do getContracts:', response);

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

        // Mapeamento dos contratos com validação de campos e preenchimento das propriedades necessárias
        const mappedContracts = response.contracts?.map(item => {
          // Função auxiliar para converter datas
          const formatDate = (date: Date | string | null) => {
            if (!date) return null;
            if (typeof date === 'string') return date;
            return date.toISOString();
          };

          // Criando um objeto Contract completo com todas as propriedades necessárias
          const contract: Contract = {
            // Propriedades originais do tipo Contract
            contract_id: typeof item.id === 'string' ? parseInt(item.id, 10) : (item.id || 0),
            contract_name: item.name || '',
            contract_value: typeof item.value === 'string' ? item.value : String(item.value || 0),
            status: item.status || 'inactive',
            group_name: item.groupName || '',
            full_name: item.fullName || '',
            due_day: item.dueDay || 1,
            next_billing_date: formatDate(item.nextBillingDate),
            start_date: formatDate(item.startDate),
            end_date: formatDate(item.endDate),
            recurrence_period: (item.recurrencePeriod || 'monthly') as 'monthly' | 'yearly',
            days_before_due: item.daysBefore || 0,
            last_billing_date: formatDate(item.lastBillingDate),
            billing_reference: item.billingReference || '',
            contract_group_id: item.contractGroupId || 0,
            model_movement_id: item.modelMovementId || 0,
            representative_person_id: null,
            commissioned_value: null,
            account_entry_id: null,
            last_decimo_billing_year: null,
            last_adjustment: null,
            billings: [],
            
            // Aliases para compatibilidade
            id: item.id || 0,
            name: item.name || '',
            value: item.value || 0,
            groupName: item.groupName || '',
            fullName: item.fullName || '',
            dueDay: item.dueDay || 1,
            nextBillingDate: formatDate(item.nextBillingDate),
            startDate: formatDate(item.startDate),
            endDate: formatDate(item.endDate),
            recurrencePeriod: item.recurrencePeriod || 'monthly',
            daysBefore: item.daysBefore || 0,
            lastBillingDate: formatDate(item.lastBillingDate),
            billingReference: item.billingReference || '',
            contractGroupId: item.contractGroupId || 0,
            modelMovementId: item.modelMovementId || 0
          };
          
          return contract;
        }) || [];

        console.log('🚨 DEBUG - Contratos mapeados:', mappedContracts);

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
    // A propriedade keepPreviousData foi removida pois não existe mais no React Query v4+
    // Use staleTime ou placeholderData para comportamento similar
  });

  return {
    contracts: data?.contracts || [],
    isLoading,
    error,
    pagination: {
      page: data?.currentPage || pagination.page,
      limit: pagination.limit,
      totalPages: data?.totalPages || pagination.totalPages,
      total: data?.total || pagination.total
    },
    setPage,
    setLimit,
    setSearch
  };
}
