import api from './api';

const personsService = {
  // Lista básica de pessoas
  list: async (params = {}) => {
    const response = await api.get('/persons', { params });
    return response.data;
  },

  // Lista detalhada de pessoas
  listDetails: async (params = {}) => {
    const response = await api.get('/persons/details', { params });
    return response.data;
  },

  // Busca pessoa por ID
  getById: async (id) => {
    const response = await api.get(`/persons/${id}`);
    return response.data;
  },

  // Busca detalhes de pessoa por ID
  getDetailsById: async (id) => {
    const response = await api.get(`/persons/${id}/details`);
    return response.data;
  },

  // Cria nova pessoa
  create: async (data) => {
    const response = await api.post('/persons', data);
    return response.data;
  },

  // Busca dados via CNPJ
  fetchByCnpj: async (cnpj) => {
    const response = await api.post('/persons/cnpj', { cnpj });
    return response.data;
  },

  // Atualiza pessoa
  update: async (id, data) => {
    const response = await api.put(`/persons/${id}`, data);
    return response.data;
  },

  // Remove pessoa
  remove: async (id) => {
    const response = await api.delete(`/persons/${id}`);
    return response.data;
  },

  // Lista documentos da pessoa
  listDocuments: async (personId) => {
    const response = await api.get(`/persons/${personId}/documents`);
    return response.data;
  },

  // Lista contatos da pessoa
  listContacts: async (personId) => {
    const response = await api.get(`/persons/${personId}/contacts`);
    return response.data;
  },

  // Lista endereços da pessoa
  listAddresses: async (personId) => {
    const response = await api.get(`/persons/${personId}/addresses`);
    return response.data;
  },

  // Adiciona endereço
  addAddress: async (personId, addressData) => {
    const response = await api.post(`/persons/${personId}/addresses`, addressData);
    return response.data;
  },

  // Adiciona contato
  addContact: async (personId, contactData) => {
    const response = await api.post(`/persons/${personId}/contacts`, contactData);
    return response.data;
  },

  // Remove endereço
  removeAddress: async (addressId) => {
    const response = await api.delete(`/persons/addresses/${addressId}`);
    return response.data;
  },

  // Remove contato
  removeContact: async (contactId) => {
    const response = await api.delete(`/persons/contacts/${contactId}`);
    return response.data;
  }
};

export default personsService;
