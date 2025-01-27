import api from './api';

const bankAccountService = {
  async getBankAccounts() {
    try {
      const response = await api.get('/bank-accounts');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar contas bancárias:', error);
      throw error;
    }
  },

  async getBankAccountById(id) {
    try {
      const response = await api.get(`/bank-accounts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar conta bancária ${id}:`, error);
      throw error;
    }
  },

  async createBankAccount(bankAccount) {
    try {
      const response = await api.post('/bank-accounts', bankAccount);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar conta bancária:', error);
      throw error;
    }
  },

  async updateBankAccount(id, bankAccount) {
    try {
      const response = await api.put(`/bank-accounts/${id}`, bankAccount);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar conta bancária ${id}:`, error);
      throw error;
    }
  },

  async deleteBankAccount(id) {
    try {
      const response = await api.delete(`/bank-accounts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao excluir conta bancária ${id}:`, error);
      throw error;
    }
  }
};

export default bankAccountService;
