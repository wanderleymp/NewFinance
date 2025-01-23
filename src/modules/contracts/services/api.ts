import api from '../../../services/api';
import { Contract, ExtraService, Adjustment, HistoryEntry, ContractModification, ContractSummary } from '../types/contract';

export const contractsApi = {
  list: async ({ page = 1, limit = 10 }: { page?: number, limit?: number } = {}) => {
    const response = await api.get<{ data: Contract[] }>('/contracts-recurring', {
      params: { page, limit }
    });
    
    // Garantir que data seja sempre um array
    const contracts = Array.isArray(response.data.data) ? response.data.data : [];
    
    return {
      data: contracts,
      page: page,
      totalPages: response.headers['x-total-pages'] || 1,
      total: response.headers['x-total-count'] || contracts.length
    };
  },

  get: async (id: string) => {
    const response = await api.get<Contract>(`/contracts/${id}`);
    return response.data;
  },

  create: async (data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post<Contract>('/contracts', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Contract>) => {
    const response = await api.put<Contract>(`/contracts/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/contracts/${id}`);
  },

  getHistory: async (id: string) => {
    const response = await api.get<HistoryEntry[]>(`/contracts/${id}/history`);
    return response.data;
  },

  getExtraServices: async (id: string) => {
    const response = await api.get<ExtraService[]>(`/contracts/${id}/services`);
    return response.data;
  },

  getAdjustments: async (id: string) => {
    const response = await api.get<Adjustment[]>(`/contracts/${id}/adjustments`);
    return response.data;
  },

  getModifications: async (id: string) => {
    const response = await api.get<ContractModification[]>(`/contracts/${id}/modifications`);
    return response.data;
  },

  addModification: async (id: string, data: Omit<ContractModification, 'id' | 'contractId' | 'createdAt'>) => {
    const response = await api.post<ContractModification>(`/contracts/${id}/modifications`, data);
    return response.data;
  },

  removeModification: async (id: string) => {
    await api.delete(`/modifications/${id}`);
  },

  getSummary: async (id: string) => {
    const response = await api.get<ContractSummary>(`/contracts/${id}/summary`);
    return response.data;
  },

  getBilling: async (id: string) => {
    const response = await api.get(`/contracts/${id}/billing`);
    return response.data;
  },

  listRecurring: async (page = 1, limit = 10): Promise<ContractListResponse> => {
    console.log('🔍 Iniciando listagem de contratos recorrentes', { page, limit });
    
    const response = await api.get(`/contracts-recurring?page=${page}&limit=${limit}`);

    console.group('🕵️ Dados Brutos da API');
    console.log('Resposta completa:', response.data);
    console.log('Items:', response.data.items);
    console.log('Metadados:', response.data.meta);
    console.groupEnd();

    const contracts: Contract[] = response.data.items.map((item: ContractResponse['items'][0]) => {
      // Tratamento de valor do contrato
      let contractValue = 0;
      try {
        const cleanValue = String(item.contract_value)
          .replace(/[^\d.,]/g, '')  // Remove caracteres não numéricos
          .replace(',', '.');  // Substitui vírgula por ponto
        contractValue = parseFloat(cleanValue) || 0;
      } catch (error) {
        console.warn(`⚠️ Erro ao converter valor do contrato: ${item.contract_name}`, error);
      }

      // Tratamento de datas
      const parseDate = (dateString: string | null) => {
        return dateString ? new Date(dateString) : null;
      };

      const contract: Contract = {
        id: item.contract_id,
        name: item.contract_name,
        value: contractValue,
        total_amount: item.contract_value,
        startDate: parseDate(item.start_date) || new Date(),
        endDate: parseDate(item.end_date),
        status: item.status,
        groupName: item.group_name,
        fullName: item.full_name,
        recurrencePeriod: item.recurrence_period === 'yearly' ? 'yearly' : 'monthly',
        dueDay: item.due_day,
        daysBefore: item.days_before_due,
        lastBillingDate: parseDate(item.last_billing_date),
        nextBillingDate: parseDate(item.next_billing_date),
        billingReference: item.billing_reference,
        contractGroupId: item.contract_group_id,
        modelMovementId: item.model_movement_id,
        representativePersonId: item.representative_person_id,
        commissionedValue: item.commissioned_value,
        accountEntryId: item.account_entry_id,
        lastDecimoBillingYear: item.last_decimo_billing_year
      };

      console.log('🔍 Contrato Mapeado:', contract);

      return contract;
    });

    return {
      data: contracts,
      page: response.data.meta.currentPage,
      totalPages: response.data.meta.totalPages,
      total: response.data.meta.totalItems
    };
  },
};