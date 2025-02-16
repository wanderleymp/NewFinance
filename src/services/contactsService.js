import BaseService from './baseService';

export class ContactsService extends BaseService {
  constructor() {
    super('/contacts');
  }

  // Alias para o método get do BaseService
  list(params = {}) {
    return this.get(params);
  }

  // Métodos específicos de busca
  async searchContacts(query) {
    try {
      console.log('🔍 Buscando contatos com query:', query);
      
      const response = await this.api.get('/contacts', {
        params: {
          search: query,
          limit: 10
        }
      });
      
      console.log('👥 Contatos encontrados:', {
        status: response.status,
        data: response.data
      });
      
      // Verificações robustas para diferentes estruturas de resposta
      const data = response.data || {};
      const contactItems = data.data || data.items || [];
      
      return contactItems;
    } catch (error) {
      console.error('❌ Erro DETALHADO na busca de contatos:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method
      });
      
      throw error;
    }
  }

  // Métodos específicos de pessoa
  listByPerson(personId, params = {}) {
    return this.api.get(`/persons/${personId}/contacts`, { params }).then(response => response.data);
  }

  addToPerson(personId, data) {
    return this.api.post(`/persons/${personId}/contacts`, data).then(response => response.data);
  }

  // Método de busca adicional
  search(params = {}) {
    return this.api.get('/search', { params }).then(response => response.data);
  }
}

export const contactsService = new ContactsService();
