import { api } from '../../../services/api';
import { mockData } from './mockData';
import { Contract } from '../types/contract';
import { ContractFormData } from '../types/contractForm';

export const contractService = {
  async getContracts(page = 1, limit = 10): Promise<{ 
    contracts: Contract[], 
    total: number, 
    totalPages: number 
  }> {
    try {
      // Simular chamada à API com dados mock
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const paginatedContracts = mockData.contracts.slice(startIndex, endIndex);
      const totalContracts = mockData.contracts.length;
      const totalPages = Math.ceil(totalContracts / limit);

      return {
        contracts: paginatedContracts,
        total: totalContracts,
        totalPages
      };
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      throw error;
    }
  },

  async createContract(contractData: ContractFormData): Promise<Contract> {
    try {
      // Simular criação de contrato com dados mock
      const newContract: Contract = {
        id: `contract-${Date.now()}`,
        ...contractData,
        personId: '', // Adicionar lógica para associar pessoa
        nextBillingDate: new Date().toISOString()
      };

      mockData.contracts.push(newContract);
      return newContract;
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      throw error;
    }
  },

  async updateContract(id: string, contractData: ContractFormData): Promise<Contract> {
    try {
      const contractIndex = mockData.contracts.findIndex(c => c.id === id);
      
      if (contractIndex === -1) {
        throw new Error('Contrato não encontrado');
      }

      const updatedContract: Contract = {
        ...mockData.contracts[contractIndex],
        ...contractData
      };

      mockData.contracts[contractIndex] = updatedContract;
      return updatedContract;
    } catch (error) {
      console.error('Erro ao atualizar contrato:', error);
      throw error;
    }
  },

  async deleteContract(id: string): Promise<void> {
    try {
      const contractIndex = mockData.contracts.findIndex(c => c.id === id);
      
      if (contractIndex === -1) {
        throw new Error('Contrato não encontrado');
      }

      mockData.contracts.splice(contractIndex, 1);
    } catch (error) {
      console.error('Erro ao deletar contrato:', error);
      throw error;
    }
  }
};
