import api from './api';

const personsService = {
  // Lista todas as pessoas
  getAll: async () => {
    const response = await api.get('/persons');
    return response;
  },

  // Lista básica de pessoas
  list: async (params = {}) => {
    const response = await api.get('/persons', { params });
    return response;
  },

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
  getDetailsById: async (id) => {
    const response = await api.get(`/persons/${id}/details`);
    return response.data;
  },

  // Cria nova pessoa
  create: async (data) => {
    const response = await api.post('/persons', data);
    return response;
  },

  // Importa CNPJ
  importCNPJ: async (cnpj) => {
    const response = await api.post(`/persons/cnpj`, { cnpj });
    return response.data;
  },

  // Busca CNPJ
  searchCNPJ: async (cnpj) => {
    const response = await api.get(`/persons/search-cnpj/${cnpj}`);
    return response.data;
  },

  // Atualiza pessoa
  update: async (id, data) => {
    const response = await api.put(`/persons/${id}`, data);
    return response;
  },

  // Remove pessoa
  remove: async (id) => {
    const response = await api.delete(`/persons/${id}`);
    return response;
  },

  // Lista contatos da pessoa
  listContacts: async (personId, params = {}) => {
    const { search, type, page = 1, limit = 10 } = params;
    const queryParams = {
      page,
      limit,
      ...(search && { search }),
      ...(type && { type: type.toUpperCase() })
    };
    
    const response = await api.get(`/persons/${personId}/contacts`, { params: queryParams });
    return response.data;
  },

  getContact: async (personId, contactId) => {
    const response = await api.get(`/persons/${personId}/contacts/${contactId}`);
    return response.data;
  },

  addContact: async (personId, data) => {
    const contact = {
      ...data,
      contact_type: data.type.toUpperCase(),
      contact_value: data.contact
    };
    delete contact.type;
    delete contact.contact;

    const response = await api.post(`/persons/${personId}/contacts`, contact);
    return response.data;
  },

  updateContact: async (personId, contactId, data) => {
    const contact = {
      ...data,
      contact_type: data.type.toUpperCase(),
      contact_value: data.contact
    };
    delete contact.type;
    delete contact.contact;

    const response = await api.put(`/persons/${personId}/contacts/${contactId}`, contact);
    return response.data;
  },

  deleteContact: async (personId, contactId) => {
    const response = await api.delete(`/persons/${personId}/contacts/${contactId}`);
    return response.data;
  },

  // Lista endereços da pessoa
  listAddresses: async (personId) => {
    const response = await api.get(`/persons/${personId}/addresses`);
    return response.data;
  },

  getAddress: async (personId, addressId) => {
    const response = await api.get(`/persons/${personId}/addresses/${addressId}`);
    return response.data;
  },

  addAddress: async (personId, data) => {
    const response = await api.post(`/persons/${personId}/addresses`, data);
    return response;
  },

  updateAddress: async (personId, addressId, data) => {
    const response = await api.put(`/persons/${personId}/addresses/${addressId}`, data);
    return response;
  },

  deleteAddress: async (addressId) => {
    const response = await api.delete(`/addresses/${addressId}`);
    return response;
  },
};

export default personsService;
