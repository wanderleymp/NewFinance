import api from '../../../services/api';
import { Contract } from '../types/contract';
import { ContractFormData } from '../types/contractForm';
import { contractsApi } from './api'; // Adicionando importação do contractsApi
import mockContractsData from './mockContracts.json' assert { type: 'json' };

type ContractDataSource = 'api' | 'mock';

interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  links: {
    first?: string;
    previous?: string;
    next?: string;
    last?: string;
  };
}

interface ContractBilling {
  id: number;
  contractNumber: string;
  clientName: string;
  billingDate: Date;
  amount: number;
  status: string;
}

export const contractService = {
  dataSource: 'api' as ContractDataSource,

  setDataSource(source: ContractDataSource) {
    this.dataSource = source;
  },

  async getContracts(
    page = 1, 
    limit = 10, 
    search?: string
  ): Promise<{
    contracts: Contract[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      console.log('🔍 ContractService - Buscando contratos:', { page, limit, search });
      
      const response = await contractsApi.listRecurring(page, limit, search);
      console.log('🔍 ContractService - Resposta da API:', response);

      return {
        contracts: response.data,
        total: response.total,
        totalPages: response.totalPages,
        currentPage: response.page
      };
    } catch (error) {
      console.error('🚨 ContractService - Erro ao buscar contratos:', error);
      throw error;
    }
  },

  async getContractById(id: number): Promise<Contract> {
    try {
      const response = await api.get(`/contracts-recurring/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar contrato:', error);
      throw error;
    }
  },

  async createOrUpdateContract(id?: number, contractData: Partial<Contract>): Promise<Contract> {
    try {
      const endpoint = id ? `/contracts-recurring/${id}` : '/contracts-recurring';
      const method = id ? 'PUT' : 'POST';

      // Calcula o valor total do contrato baseado nos serviços
      if (contractData.services) {
        contractData.contract_value = String(
          contractData.services.reduce((total, service) => total + service.total_value, 0)
        );
      }

      const response = await api.request({
        url: endpoint,
        method,
        data: contractData,
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao salvar contrato:', error);
      throw error;
    }
  },

  async addServiceToContract(contractId: number, service: Omit<ContractService, 'id' | 'contract_id'>): Promise<ContractService> {
    try {
      const response = await api.post(`/contracts-recurring/${contractId}/services`, service);
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar serviço ao contrato:', error);
      throw error;
    }
  },

  async removeServiceFromContract(contractId: number, serviceId: number): Promise<void> {
    try {
      await api.delete(`/contracts-recurring/${contractId}/services/${serviceId}`);
    } catch (error) {
      console.error('Erro ao remover serviço do contrato:', error);
      throw error;
    }
  },

  async updateContractService(contractId: number, serviceId: number, service: Partial<ContractService>): Promise<ContractService> {
    try {
      const response = await api.put(`/contracts-recurring/${contractId}/services/${serviceId}`, service);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar serviço do contrato:', error);
      throw error;
    }
  },

  async deleteContract(id: number): Promise<void> {
    try {
      if (this.dataSource === 'api') {
        await api.delete(`/contracts-recurring/${id}`);
      } else {
        // Remover contrato dos dados mock
        const contractIndex = mockContractsData.data.findIndex(
          contract => contract.contract_id === id
        );

        if (contractIndex === -1) {
          throw new Error('Contrato não encontrado');
        }

        mockContractsData.data.splice(contractIndex, 1);
      }
    } catch (error) {
      console.error('Erro ao deletar contrato:', error);
      throw error;
    }
  },

  async getPendingBillings(page = 1, limit = 10, contractId?: string | number, search?: string) {
    try {
      console.log('🔍 Buscando faturas pendentes', { page, limit, contractId, search });
      
      const endpoint = contractId 
        ? `/contracts-recurring/${contractId}/billing` 
        : '/contracts-recurring/billing';

      const response = await api.get(endpoint, {
        params: { 
          page, 
          limit,
          ...(search ? { search } : {})
        }
      });

      // Mapeia os dados do contrato
      const items = response.data.items.map(item => ({
        id: item.contract_id,
        contract_id: item.contract_id,
        client_name: item.full_name,
        next_billing_date: item.next_billing_date,
        last_billing_date: item.last_billing_date,
        contract_value: Number(item.contract_value || 0),
        status: item.status === 'active' ? 'pending' : item.status,
        billings: (item.billings || []).map(billing => ({
          id: billing.movement_id,
          date: billing.movement_date,
          amount: Number(billing.total_amount || 0)
        }))
      }));

      return {
        items,
        meta: response.data.meta || {
          currentPage: page,
          totalItems: items.length,
          totalPages: Math.ceil(items.length / limit)
        }
      };
    } catch (error) {
      console.error('❌ Erro ao buscar faturas:', error);
      throw error;
    }
  },

  async processBilling(contractId: string) {
    try {
      const response = await api.post(`/contracts-recurring/${contractId}/billing`);
      console.log('✅ Fatura processada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao processar fatura:', error);
      throw error;
    }
  },

  async processBulkBilling(contractIds: number[]) {
    try {
      console.log('🔄 Processando contratos em lote:', contractIds);
      
      // Monta o corpo da requisição com o array de IDs
      const requestBody = {
        body: contractIds
      };
      
      console.log('📦 Corpo da requisição:', requestBody);
      
      const response = await api.post('/contracts-recurring/billing', requestBody);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao processar faturas em lote:', error);
      throw error;
    }
  },

  async processBillingOld(billingId: string): Promise<void> {
    try {
      await api.post(`/contracts-recurring/billings/${billingId}/process`);
    } catch (error) {
      console.error('Erro ao processar fatura:', error);
      throw error;
    }
  },

  async generateBilling(contractId: number): Promise<any> {
    try {
      const response = await api.post(`/contracts-recurring/${contractId}/billings`);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar fatura:', error);
      throw error;
    }
  },

  async cancelBilling(billingId: string): Promise<void> {
    try {
      await api.post(`/contracts-recurring/billings/${billingId}/cancel`);
    } catch (error) {
      console.error('Erro ao cancelar fatura:', error);
      throw error;
    }
  },

  async updateContractItem(
    contractId: number, 
    movementItemId: number, 
    data: { 
      quantity: number;
      unit_price: number;
      total_price: number;
      item_id: number;
    }
  ): Promise<any> {
    try {
      console.log('ContractService - Atualizando item:', {
        url: `/contracts-recurring/${contractId}/items/${movementItemId}`,
        data
      });

      const response = await api.put(
        `/contracts-recurring/${contractId}/items/${movementItemId}`,
        data
      );

      console.log('ContractService - Resposta da atualização:', response.data);
      return response.data;
    } catch (error) {
      console.error('ContractService - Erro ao atualizar item do contrato:', error);
      throw error;
    }
  },

  async searchMovementItems(params: { query?: string; type?: string }): Promise<any> {
    try {
      console.log('Buscando itens com query:', params.query);
      const response = await api.get('/items', {
        params: {
          ...(params.query ? { search: params.query } : {}),
          limit: 10,
          page: 1,
          type: params.type || 'service'
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      console.log('Resposta da API de itens:', response.data);
      const items = (response.data.data || []).map(item => ({
        ...item,
        id: item.item_id,
        price: parseFloat(item.price)
      }));
      console.log('Items processados:', items);
      return {
        items,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Erro ao buscar itens:', error.response || error);
      // Se o erro for 500, retornar lista vazia em vez de propagar o erro
      if (error.response?.status === 500) {
        return { items: [], pagination: { total: 0, page: 1, limit: 10 } };
      }
      throw {
        message: error.response?.data?.message || 'Erro ao buscar itens',
        originalError: error
      };
    }
  },

  async createExtraService(payload: {
    contractId: number;
    serviceId: number;
    itemDescription: string;
    itemValue: number;
    serviceDate: string;
    movementId?: number | null;
  }): Promise<any> {
    try {
      console.log('Payload enviado:', JSON.stringify(payload, null, 2));
      const response = await api.post('/contract-extra-services/', payload);
      return response.data;
    } catch (error: any) {
      // Log detalhado do erro
      console.error('Erro detalhado ao adicionar serviço extra:', {
        responseData: error.response?.data ? JSON.stringify(error.response.data) : 'Sem dados de resposta',
        errorMessage: error.message,
        status: error.response?.status,
        payload: JSON.stringify(payload)
      });

      // Capturar mensagem de erro específica do servidor
      const errorMessage = 
        (error.response?.data?.details && error.response.data.details[0]) || 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Erro desconhecido ao adicionar serviço extra';
      
      // Lançar erro com mensagem específica
      throw new Error(errorMessage);
    }
  }
};
