import api from '../../../services/api';
import mockContractsData from './mockContracts.json' assert { type: 'json' };
import { Contract } from '../types/contract';
import { ContractFormData } from '../types/contractForm';

type ContractDataSource = 'api' | 'mock';

export const contractService = {
  dataSource: 'mock' as ContractDataSource,

  setDataSource(source: ContractDataSource) {
    this.dataSource = source;
  },

  async getContracts(page = 1, limit = 10): Promise<{
    contracts: Contract[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      if (this.dataSource === 'api') {
        const response = await api.get('/contracts_recurring', { 
          params: { page, limit } 
        });

        return {
          contracts: response.data.data,
          total: response.data.meta.totalItems,
          totalPages: response.data.meta.totalPages,
          currentPage: response.data.meta.currentPage
        };
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
        const response = await api.post('/contracts_recurring', contractData);
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
        const response = await api.put(`/contracts_recurring/${id}`, contractData);
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
        await api.delete(`/contracts_recurring/${id}`);
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
  }
};
