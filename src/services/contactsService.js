import BaseService from './baseService';

export class ContactsService extends BaseService {
  constructor() {
    super('/contacts');
  }

  // Métodos específicos de busca
  async searchContacts(query) {
    try {
      const response = await this.api.get('', {
        params: {
          search: query,
          limit: 10
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      return [];
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
