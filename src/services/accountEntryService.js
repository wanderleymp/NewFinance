import api from './api';

const accountEntryService = {
  async getAccountEntries() {
    try {
      const response = await api.get('/account-entries');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar lançamentos contábeis:', error);
      throw error;
    }
  },

  async getAccountEntryById(id) {
    try {
      const response = await api.get(`/account-entries/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar lançamento contábil ${id}:`, error);
      throw error;
    }
  },

  async createAccountEntry(accountEntry) {
    try {
      const response = await api.post('/account-entries', accountEntry);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar lançamento contábil:', error);
      throw error;
    }
  },

  async updateAccountEntry(id, accountEntry) {
    try {
      const response = await api.put(`/account-entries/${id}`, accountEntry);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar lançamento contábil ${id}:`, error);
      throw error;
    }
  },

  async deleteAccountEntry(id) {
    try {
      const response = await api.delete(`/account-entries/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao excluir lançamento contábil ${id}:`, error);
      throw error;
    }
  }
};

export default accountEntryService;
