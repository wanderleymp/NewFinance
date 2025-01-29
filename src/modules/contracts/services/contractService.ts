import api from '../../../services/api';
import mockContractsData from './mockContracts.json' assert { type: 'json' };
import { Contract } from '../types/contract';
import { ContractFormData } from '../types/contractForm';

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
      
      // Constrói os parâmetros da query
      const queryParams: Record<string, any> = {
        page,
        limit
      };

      // Adiciona parâmetro de busca apenas se não estiver vazio
      if (search && search.trim() !== '') {
        queryParams.search = search.trim();
      }

      console.log('🔍 ContractService - Parâmetros da requisição:', queryParams);

      const response = await api.get('/contracts-recurring', { 
        params: queryParams
      });

      console.log('🔍 ContractService - Resposta bruta:', response.data);

      // Validação da resposta
      if (!response.data) {
        return {
          contracts: [],
          total: 0,
          totalPages: 0,
          currentPage: page
        };
      }

      // Mapeia cada item da resposta para o formato Contract
      const mappedContracts = (response.data.items || []).map((item: any) => ({
        id: item.contract_id,
        name: item.contract_name || '',
        value: Number(item.contract_value || 0),
        status: item.status?.toLowerCase() || 'inactive',
        groupName: item.group_name || '',
        fullName: item.full_name || item.contract_name || '',
        recurrencePeriod: item.recurrence_period?.toLowerCase() === 'monthly' ? 'monthly' : 'yearly',
        dueDay: parseInt(item.due_day || '0', 10),
        daysBefore: parseInt(item.days_before_due || '0', 10),
        lastBillingDate: item.last_billing_date ? new Date(item.last_billing_date) : null,
        nextBillingDate: item.next_billing_date ? new Date(item.next_billing_date) : null,
        billingReference: item.billing_reference || '',
        contractGroupId: item.contract_group_id || 0,
        modelMovementId: item.model_movement_id || 0,
        startDate: item.start_date ? new Date(item.start_date) : null,
        endDate: item.end_date ? new Date(item.end_date) : null
      }));

      return {
        contracts: mappedContracts,
        total: response.data.meta?.totalItems || 0,
        totalPages: response.data.meta?.totalPages || 0,
        currentPage: response.data.meta?.currentPage || page
      };
    } catch (error) {
      console.error('❌ Erro ao buscar contratos:', error);
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

  async searchMovementItems(params: { query: string; type: string }): Promise<any> {
    try {
      const response = await api.get('/movement-items/search', {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar itens de movimento:', error);
      throw error;
    }
  }
};
