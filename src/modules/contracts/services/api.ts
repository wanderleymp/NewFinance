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
    console.log('📦 Resposta da API:', response.data);

    const contracts = response.data.data.map((item: any) => ({
      id: item.contract_id,
      name: item.contract_name,
      value: parseFloat(item.contract_value),
      startDate: new Date(item.start_date),
      endDate: item.end_date ? new Date(item.end_date) : null,
      status: item.status,
      groupName: item.group_name,
      fullName: item.full_name,
      recurrencePeriod: item.recurrence_period,
      dueDay: item.due_day,
      daysBefore: item.days_before_due,
      lastBillingDate: item.last_billing_date ? new Date(item.last_billing_date) : null,
      nextBillingDate: item.next_billing_date ? new Date(item.next_billing_date) : null,
      billingReference: item.billing_reference,
      contractGroupId: item.contract_group_id,
      modelMovementId: item.model_movement_id,
      representativePersonId: item.representative_person_id,
      commissionedValue: item.commissioned_value,
      accountEntryId: item.account_entry_id,
      lastDecimoBillingYear: item.last_decimo_billing_year
    }));

    return {
      data: contracts,
      page: response.data.meta.currentPage,
      totalPages: response.data.meta.totalPages,
      total: response.data.meta.totalItems
    };
  },
};