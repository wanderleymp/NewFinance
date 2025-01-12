import api from './api';

const paymentMethodService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/payment-method', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar formas de pagamento:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/payment-method/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar forma de pagamento ${id}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/payment-method', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar forma de pagamento:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/payment-method/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar forma de pagamento ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/payment-method/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao deletar forma de pagamento ${id}:`, error);
      throw error;
    }
  },

  toggleActive: async (id) => {
    try {
      const response = await api.patch(`/payment-method/${id}/toggle-active`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao alternar status da forma de pagamento ${id}:`, error);
      throw error;
    }
  }
};

export default paymentMethodService;
