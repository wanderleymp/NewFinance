import api from '../../../services/api';
import { Contract, ExtraService, Adjustment, HistoryEntry, ContractModification, ContractSummary } from '../types/contract';

export const contractsApi = {
  list: async ({ page = 1, limit = 10 }: { page?: number, limit?: number } = {}) => {
    const response = await api.get<Contract[]>('/contracts', {
      params: { page, limit }
    });
    return {
      data: response.data,
      page: page,
      totalPages: response.headers['x-total-pages'] || 1,
      total: response.headers['x-total-count'] || response.data.length
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

  listRecurring: async (page = 1, limit = 10) => {
    try {
      console.log('🔍 Iniciando listagem de contratos recorrentes', { page, limit });
      
      // Método padrão de recuperação do token
      const token = localStorage.getItem('accessToken');
      
      console.group('🔐 Verificação de Token');
      console.log('Token accessToken:', token);
      console.groupEnd();
      
      if (!token) {
        console.error('🚨 Nenhum token encontrado');
        throw new Error('Token de autorização não encontrado');
      }

      // Log detalhado da requisição
      console.group('📡 Detalhes da Requisição');
      console.log('URL:', '/contracts_recurring');
      console.log('Método: GET');
      console.log('Parâmetros:', { page, limit });
      console.log('Headers:', {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      console.groupEnd();

      const response = await api.get<{
        contracts: Contract[];
        total: number;
        totalPages: number;
        currentPage: number;
      }>('/contracts_recurring', {
        params: { page, limit },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Resposta completa do servidor:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      return {
        contracts: response.data?.data || [],
        total: response.data?.meta?.totalItems || 0,
        totalPages: response.data?.meta?.totalPages || 1,
        currentPage: response.data?.meta?.currentPage || page
      };
    } catch (error) {
      console.error('🚨 Erro DETALHADO na requisição:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        requestConfig: error.config,
        fullErrorObject: JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      });
      
      // Log adicional para erros 500
      if (error.response?.status === 500) {
        console.error('🚨 ERRO INTERNO DO SERVIDOR COMPLETO:', {
          errorData: error.response?.data,
          errorMessage: error.response?.data?.message || 'Erro desconhecido',
          errorStack: error.stack,
          serverResponse: JSON.stringify(error.response, null, 2)
        });
      }
      
      throw error;
    }
  },
};