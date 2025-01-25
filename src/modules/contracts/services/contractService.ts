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
      if (this.dataSource === 'api') {
        console.log('🔍 ContractService - Buscando contratos:', { page, limit, search });
        
        // Constrói os parâmetros da query
        const queryParams = {
          page,
          limit,
          ...(search?.trim() ? { search: search.trim() } : {}) // Só inclui search se tiver valor
        };

        console.log('🔍 ContractService - Parâmetros da requisição:', queryParams);

        const response = await api.get('/contracts-recurring', { 
          params: queryParams
        });

        console.log('🔍 ContractService - Resposta bruta:', response.data);
        
        // Mapeia cada item da resposta para o formato Contract
        const mappedContracts = (response.data.items || []).map((item: any) => ({
          id: item.contract_id,
          name: item.contract_name,
          value: parseFloat(item.contract_value || '0'),
          total_amount: item.contract_value, // Valor original
          startDate: item.start_date ? new Date(item.start_date) : null,
          endDate: item.end_date ? new Date(item.end_date) : null,
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
          representativePersonId: item.representative_person_id || null,
          commissionedValue: item.commissioned_value ? parseFloat(item.commissioned_value) : null,
          accountEntryId: item.account_entry_id || null,
          lastDecimoBillingYear: item.last_decimo_billing_year || null
        }));

        const mappedResponse = {
          contracts: mappedContracts,
          total: response.data.meta?.totalItems || 0,
          totalPages: response.data.meta?.totalPages || 0,
          currentPage: response.data.meta?.currentPage || page
        };

        console.log('🔍 ContractService - Resposta mapeada:', mappedResponse);
        
        return mappedResponse;
      } else {
        // Dados mock
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        const paginatedContracts = mockContractsData.data.slice(startIndex, endIndex);
        const totalContracts = mockContractsData.data.length;
        const totalPages = mockContractsData.meta.totalPages;

        return {
          contracts: paginatedContracts,
          total: totalContracts,
          totalPages,
          currentPage: page
        };
      }
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      throw error;
    }
  },

  async createContract(contractData: Partial<Contract>): Promise<Contract> {
    try {
      if (this.dataSource === 'api') {
        const response = await api.post('/contracts-recurring', contractData);
        return response.data;
      } else {
        // Simular criação de contrato com dados mock
        const newContract: Contract = {
          ...contractData,
          contract_id: mockContractsData.data.length + 1,
          contract_name: contractData.contract_name || 'Novo Contrato',
          contract_value: contractData.contract_value || '0.00',
          start_date: contractData.start_date || new Date().toISOString(),
          status: contractData.status || 'active'
        } as Contract;

        mockContractsData.data.push(newContract);
        return newContract;
      }
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      throw error;
    }
  },

  async updateContract(id: number, contractData: Partial<Contract>): Promise<Contract> {
    try {
      if (this.dataSource === 'api') {
        const response = await api.put(`/contracts-recurring/${id}`, contractData);
        return response.data;
      } else {
        // Atualizar contrato nos dados mock
        const contractIndex = mockContractsData.data.findIndex(
          contract => contract.contract_id === id
        );

        if (contractIndex === -1) {
          throw new Error('Contrato não encontrado');
        }

        mockContractsData.data[contractIndex] = {
          ...mockContractsData.data[contractIndex],
          ...contractData
        };

        return mockContractsData.data[contractIndex];
      }
    } catch (error) {
      console.error('Erro ao atualizar contrato:', error);
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

  async getPendingBillings(page = 1, limit = 10): Promise<PaginatedResponse<ContractBilling>> {
    try {
      const response = await api.get('/contracts-recurring/pending-billings', {
        params: { page, limit }
      });
      console.log('🔍 Resposta completa da API:', response);

      const mappedBillings = response.data.items.map((billing: any) => ({
        id: billing.account_entry_id || billing.contract_id,
        contractNumber: billing.contract_id?.toString(),
        clientName: billing.full_name,
        billingDate: billing.next_billing_date || billing.last_billing_date,
        amount: parseFloat(billing.contract_value),
        status: billing.status
      }));

      return {
        items: mappedBillings,
        meta: response.data.meta,
        links: response.data.links
      };
    } catch (error) {
      console.error('Erro ao buscar faturas pendentes:', error);
      throw error;
    }
  },

  async processBilling(contractId: string | number): Promise<void> {
    try {
      const response = await api.post(`/contracts-recurring/${contractId}/billing`);
      console.log('✅ Fatura processada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao processar fatura:', error);
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
  }
};
