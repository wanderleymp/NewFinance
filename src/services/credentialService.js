import api from './api';

const credentialService = {
  async getCredentials() {
    try {
      const response = await api.get('/credentials');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar credenciais:', error);
      throw error;
    }
  },

  async getCredentialById(id) {
    try {
      const response = await api.get(`/credentials/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar credencial ${id}:`, error);
      throw error;
    }
  }
};

export default credentialService;
