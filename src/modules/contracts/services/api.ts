import api from '../../../services/api';
import { Contract, ExtraService, Adjustment, HistoryEntry, ContractModification, ContractSummary, ContractFilters } from '../types/contract';

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

  listRecurring: async (
    page = 1, 
    limit = 10, 
    search = '', 
    filters: ContractFilters = {}
  ) => {
    console.log('🔍 Iniciando listagem de contratos recorrentes', { 
      page, 
      limit,
      search,
      filters 
    });
    
    const params: Record<string, any> = { 
      page, 
      limit, 
      search 
    };

    // Adicionar filtros de grupo
    if (filters && 'group' in filters && filters.group) {
      params.group_name = filters.group;
    }

    // Adicionar filtros de data de faturamento - simplificando para evitar erros de tipagem
    if (filters && 'billingStartDate' in filters && filters.billingStartDate) {
      // Converter para string de forma segura
      params.billing_start_date = String(filters.billingStartDate);
    }
    
    if (filters && 'billingEndDate' in filters && filters.billingEndDate) {
      // Converter para string de forma segura
      params.billing_end_date = String(filters.billingEndDate);
    }

    // Adicionar filtros de último reajuste - simplificando para evitar erros de tipagem
    if (filters && 'lastAdjustmentStartDate' in filters && filters.lastAdjustmentStartDate) {
      // Converter para string de forma segura
      params.last_adjustment_start_date = String(filters.lastAdjustmentStartDate);
    }
    
    if (filters && 'lastAdjustmentEndDate' in filters && filters.lastAdjustmentEndDate) {
      // Converter para string de forma segura
      params.last_adjustment_end_date = String(filters.lastAdjustmentEndDate);
    }

    const response = await api.get(`/contracts-recurring`, {
      params
    });

    console.group('🕵️ Dados Brutos da API');
    console.log('Resposta completa:', response.data);
    console.log('Items:', response.data.items);
    console.log('Metadados:', response.data.meta);
    console.groupEnd();

    // Importar a interface ContractResponse do arquivo contractFilters.ts
    // Usando tipagem any para evitar erros de compilação temporariamente
    const contracts: Contract[] = response.data.items.map((item: any) => {
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

      // Tratamento de datas - convertendo para string para compatibilidade com a interface Contract
      const parseDate = (dateString: string | null) => {
        if (!dateString) return null;
        try {
          const date = new Date(dateString);
          // Verificar se a data é válida e retornar como string ISO
          return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        } catch (error) {
          console.warn(`⚠️ Erro ao converter data: ${dateString}`, error);
          return null;
        }
      };

      // Criando o objeto Contract seguindo exatamente a interface definida
      const contract: Contract = {
        // Propriedades originais conforme definidas na interface
        contract_id: item.contract_id,
        contract_name: item.contract_name,
        contract_value: String(contractValue), // Garantindo que seja string
        start_date: parseDate(item.start_date) || new Date().toISOString().split('T')[0],
        end_date: parseDate(item.end_date),
        status: item.status,
        group_name: item.group_name,
        full_name: item.full_name,
        recurrence_period: item.recurrence_period === 'yearly' ? 'yearly' : 'monthly',
        due_day: item.due_day,
        days_before_due: item.days_before_due,
        last_billing_date: parseDate(item.last_billing_date),
        next_billing_date: parseDate(item.next_billing_date),
        billing_reference: item.billing_reference,
        contract_group_id: item.contract_group_id,
        model_movement_id: item.model_movement_id,
        representative_person_id: item.representative_person_id,
        commissioned_value: item.commissioned_value,
        account_entry_id: item.account_entry_id,
        last_decimo_billing_year: item.last_decimo_billing_year || 0,
        last_adjustment: item.last_adjustment || null,
        
        // Aliases para compatibilidade
        id: item.contract_id,
        name: item.contract_name,
        value: contractValue,
        startDate: parseDate(item.start_date),
        endDate: parseDate(item.end_date),
        groupName: item.group_name,
        fullName: item.full_name,
        dueDay: item.due_day,
        daysBefore: item.days_before_due,
        lastBillingDate: parseDate(item.last_billing_date),
        nextBillingDate: parseDate(item.next_billing_date),
        billingReference: item.billing_reference,
        contractGroupId: item.contract_group_id,
        modelMovementId: item.model_movement_id,
        
        // Propriedades adicionais
        billings: item.billings || []
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

  /**
   * Busca um contrato recorrente pelo ID
   * @param id ID do contrato recorrente
   * @returns Contrato recorrente
   */
  getRecurringContract: async (id: string) => {
    console.log(`🔍 Buscando contrato recorrente com ID: ${id}`);
    const response = await api.get(`/contracts-recurring/${id}`);
    return response;
  },

  /**
   * Busca um contrato pelo ID
   * @param id ID do contrato
   * @returns Contrato
   */
  getContract: async (id: number | string) => {
    const contractId = typeof id === 'number' ? id.toString() : id;
    console.log(`🔍 Buscando contrato com ID: ${contractId}`);
    // Alterado para usar o endpoint correto conforme backend
  const response = await api.get(`/contracts-recurring/${contractId}`);
    return response;
  }
};