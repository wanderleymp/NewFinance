import api from './api';

const systemService = {
  getHealth: async () => {
    try {
      const response = await api.get('/health');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao obter status do sistema:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erro ao conectar com o servidor',
        status: error.response?.status,
        offline: !error.response
      };
    }
  },
};

export default systemService;
