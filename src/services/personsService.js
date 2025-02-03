import api from './api';

const personsService = {
  // Lista todas as pessoas
  getAll: async () => {
    const response = await api.get('/persons');
    return response;
  },

  // Lista básica de pessoas
  list: (params) => api.get('/persons/details', { params }),

  // Lista detalhada de pessoas
  listDetails: async (params = {}) => {
    const response = await api.get('/persons/details', { params });
    return response;
  },

  // Busca pessoa por ID
  getById: async (id) => {
    const response = await api.get(`/persons/${id}`);
    return response;
  },

  // Busca detalhes de pessoa por ID
  get: (id) => api.get(`/persons/${id}/details`).then(response => response.data),

  // Busca detalhes de pessoa por ID
  getDetailsById: async (id) => {
    const response = await api.get(`/persons/${id}/details`);
    return response.data;
  },

  // Cria nova pessoa
  create: (data) => api.post('/persons', data).then(response => response.data),

  // Importa CNPJ
  importCNPJ: async (cnpj) => {
    console.log('🔍 Iniciando importação de CNPJ:', {
      cnpj,
      cnpjLength: cnpj.length,
      endpoint: '/persons/cnpj'
    });

    try {
      const response = await api.post(`/persons/cnpj`, { cnpj });
      console.log('✅ Resposta da importação:', {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erro na importação:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });
      throw error;
    }
  },

  // Busca CNPJ
  searchCNPJ: async (cnpj) => {
    const response = await api.get(`/persons/search-cnpj/${cnpj}`);
    return response.data;
  },

  // Atualiza pessoa
  update: (id, data) => api.put(`/persons/${id}`, data).then(response => response.data),

  // Remove pessoa
  delete: (id) => api.delete(`/persons/${id}`).then(response => response.data),

  // Contatos
  listContacts: async (params) => {
    console.log('🔍 Listando contatos:', {
      params,
      url: `/persons/${params.person_id}/contacts`
    });
    try {
      const response = await api.get(`/persons/${params.person_id}/contacts`);
      console.log('✅ Contatos carregados:', {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao listar contatos:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },
  searchContacts: (params) => api.get('/contacts', { params }).then(response => response.data),
  createContact: (personId, data) => api.post(`/persons/${personId}/contacts`, data).then(response => response.data),
  updateContact: (personId, contactId, data) => api.put(`/persons/${personId}/contacts/${contactId}`, data).then(response => response.data),
  deleteContact: (personId, contactId) => {
    console.log('Attempting to delete contact:', {
      personId,
      contactId,
      url: `/persons/${personId}/contacts/${contactId}`
    });
    return api.delete(`/persons/${personId}/contacts/${contactId}`)
      .then(response => {
        console.log('Delete contact response:', response);
        return response.data;
      })
      .catch(error => {
        console.error('Delete contact error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
        throw error;
      });
  },

  getContact: async (personId, contactId) => {
    const response = await api.get(`/persons/${personId}/contacts/${contactId}`);
    return response.data;
  },

  // Adiciona contato à pessoa
  addContact: async (personId, data) => {
    let contact;
    
    if (data.contact_id) {
      // Se tem ID, é um contato existente
      contact = {
        contact_id: data.contact_id,
        is_main: data.is_main
      };
    } else {
      // Se não tem ID, é um novo contato
      contact = {
        contact_type: data.contact_type,
        contact_value: data.contact_value,
        description: data.description,
        is_main: data.is_main
      };
    }

    const response = await api.post(`/persons/${personId}/contacts`, contact);
    return response.data;
  },

  // Lista endereços da pessoa
  listAddresses: (personId) => api.get(`/persons/${personId}/addresses`).then(response => response.data),

  getAddress: async (personId, addressId) => {
    const response = await api.get(`/persons/${personId}/addresses/${addressId}`);
    return response.data;
  },

  createAddress: (personId, data) => api.post(`/persons/${personId}/addresses`, data).then(response => response.data),

  updateAddress: (personId, addressId, data) => api.put(`/persons/${personId}/addresses/${addressId}`, data).then(response => response.data),

  deleteAddress: (personId, addressId) => api.delete(`/persons/${personId}/addresses/${addressId}`).then(response => response.data),
};

export default personsService;
