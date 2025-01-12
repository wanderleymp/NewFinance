import axios from 'axios';
import { format } from 'date-fns';
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
});

// Log da URL base para debug
console.log('API Base URL:', api.defaults.baseURL);
console.log('Variável de ambiente VITE_API_URL:', import.meta.env.VITE_API_URL);

// Função para verificar se o token está próximo de expirar (menos de 5 minutos)
const isTokenExpiringSoon = (token) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const expirationTime = decoded.exp * 1000; // Converter para milissegundos
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;
    
    return timeUntilExpiration < 5 * 60 * 1000; // 5 minutos em milissegundos
  } catch (error) {
    return true;
  }
};

// Variável para controlar renovação em andamento
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor para adicionar o token e verificar expiração
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      // Verificar se o token está próximo de expirar
      if (isTokenExpiringSoon(token) && !config.url.includes('/auth/refresh-token')) {
        try {
          const newToken = await refreshTokenIfNeeded();
          config.headers.Authorization = `Bearer ${newToken}`;
        } catch (error) {
          // Se falhar em renovar o token, redirecionar para login
          handleAuthError();
          return Promise.reject(error);
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Remove undefined e null dos parâmetros
    if (config.params) {
      Object.keys(config.params).forEach(key => {
        if (config.params[key] === undefined || config.params[key] === null) {
          delete config.params[key];
        }
      });
    }

    // Log dos parâmetros enviados
    if (config.params) {
      console.log(`[${config.method.toUpperCase()}] ${config.url}: Params:`, config.params);
      console.log(`[${config.method.toUpperCase()}] ${config.url}: Params (detailed):`, JSON.stringify(config.params, null, 2));
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Função para renovar o token
const refreshTokenIfNeeded = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    handleAuthError();
    throw new Error('No refresh token available');
  }
  
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }
  
  isRefreshing = true;
  
  try {
    const response = await api.post('/auth/refresh-token', { 
      refresh_token: refreshToken // Corrigindo o nome do campo para refresh_token
    });
    
    const { access_token, refresh_token } = response.data; // Corrigindo os nomes dos campos
    
    localStorage.setItem('accessToken', access_token);
    if (refresh_token) {
      localStorage.setItem('refreshToken', refresh_token);
    }
    
    isRefreshing = false;
    processQueue(null, access_token);
    return access_token;
  } catch (error) {
    isRefreshing = false;
    processQueue(error, null);
    handleAuthError(); // Adicionando chamada ao handleAuthError em caso de erro
    throw error;
  }
};

// Função para lidar com erros de autenticação
const handleAuthError = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // Usar replace state para evitar voltar ao estado anterior após o login
  window.history.replaceState(null, '', '/login');
  window.location.reload();
};

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => {
    // Se a resposta contém dados, retorna a resposta completa
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for de autenticação (401) e não estamos tentando renovar o token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url === '/auth/login') {
        return Promise.reject(error);
      }
      
      return handleAuthError(error, originalRequest);
    }

    return Promise.reject(error);
  }
);

export const authService = {
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      const { accessToken, refreshToken, user } = response.data;

      if (!accessToken) {
        throw new Error('Token de acesso não encontrado');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Erro no login:', error.response?.data || error.message);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  },

  getCurrentUser() {
    const userString = localStorage.getItem('user');
    
    if (userString) {
      try {
        const userData = JSON.parse(userString);
        console.log('Dados do usuário recuperados:', userData);
        return userData;
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        return null;
      }
    }
    
    return null;
  },

  isAuthenticated() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');

    console.log('Verificando autenticação:', {
      accessToken: !!accessToken,
      refreshToken: !!refreshToken,
      user: !!user
    });

    if (!accessToken || !refreshToken || !user) {
      console.log('Não autenticado: tokens ou usuário ausentes');
      return false;
    }

    try {
      const decodedToken = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000; // Converter para segundos

      console.log('Token info:', {
        expiration: decodedToken.exp,
        currentTime: currentTime
      });

      if (decodedToken.exp < currentTime) {
        console.log('Token expirado');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return false;
    }
  },
};

export const movementsService = {
  async list(params = {}) {
    try {
      console.log('[GET] /movements: Params:', params);
      const response = await api.get('/movements', { 
        params: {
          ...params,
          include: 'payments.installments.boletos' // Incluindo pagamentos, parcelas e boletos
        }
      });
      console.log('Raw API response:', response);
      
      return {
        items: response.data,
        total: response.pagination?.total || 0,
        page: response.pagination?.currentPage || 1,
        limit: response.pagination?.limit || 10,
        totalPages: response.pagination?.totalPages || 1
      };
    } catch (error) {
      console.error('[GET] /movements:', error);
      throw error;
    }
  },

  async get(id) {
    try {
      const params = {
        include: 'payments.installments.boletos,items,movement_items'
      };
      
      console.log('[GET] /movements/' + id + ': Params:', params);
      
      const response = await api.get(`/movements/${id}`, {
        params: params
      });
      
      // Filtrar boletos apenas com status 'a_receber' e o último gerado
      if (response.data.payments) {
        response.data.payments.forEach(payment => {
          if (payment.installments) {
            payment.installments.forEach(installment => {
              if (installment.boletos) {
                // Primeiro, filtrar apenas boletos 'a_receber'
                const boletosAReceber = installment.boletos.filter(boleto => 
                  boleto.status === 'a_receber'
                );
                
                // Se houver boletos a receber, manter apenas o último
                if (boletosAReceber.length > 0) {
                  const ultimoBoleto = boletosAReceber.reduce((ultimo, atual) => 
                    (new Date(atual.created_at) > new Date(ultimo.created_at)) ? atual : ultimo
                  );
                  
                  // Substituir a lista de boletos pelo último boleto
                  installment.boletos = [ultimoBoleto];
                } else {
                  // Se não houver boletos a receber, limpar a lista
                  installment.boletos = [];
                }
              }
            });
          }
        });
      }
      
      console.log('Resposta filtrada do get movement:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error) {
      console.error('[GET] /movements/' + id + ': Erro:', error);
      throw error;
    }
  },

  async addItem(movementId, itemData) {
    try {
      console.log('Enviando requisição para adicionar item:', itemData);
      
      const data = {
        item_id: itemData.item_id,
        quantity: Number(itemData.quantity),
        unit_price: Number(itemData.unit_price),
        description: itemData.description
      };
      
      const response = await api.post(`/movements/${movementId}/items`, data);
      console.log('Resposta completa da adição de item:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      console.error('Detalhes do erro:', error.response?.data);
      throw error;
    }
  },

  create(data) {
    // Log detalhado do payload de entrada
    console.log('🔍 Payload de Movimento Recebido:', JSON.stringify(data, null, 2));

    // Validações mais robustas e flexíveis
    const requiredFields = ['person_id', 'item_id', 'payment_method_id', 'amount'];
    const invalidFields = requiredFields.filter(field => !data[field] || (field === 'amount' && isNaN(parseFloat(data[field]))));
    
    if (invalidFields.length > 0) {
      const errorMessage = `Campos obrigatórios ausentes ou inválidos: ${invalidFields.join(', ')}`;
      console.error('❌ Erro de Validação:', errorMessage);
      throw new Error(errorMessage);
    }

    // Calcular total_amount e unit_price com mais segurança
    const totalAmount = parseFloat(data.amount);
    const unitPrice = parseFloat(data.amount);

    // Payload completo para log
    const fullPayload = {
      movement_type_id: 1,
      description: data.description || '',
      person_id: data.person_id,
      license_id: 1,
      payment_method_id: data.payment_method_id,
      total_amount: totalAmount,
      items: [
        {
          item_id: data.item_id,
          quantity: 1,
          unit_price: unitPrice
        }
      ],
      seller_id: null,
      technician_id: null,
      discount: 0.00,
      addition: 0.00,
      nfse: data.nfse || false,
      boleto: data.boleto || false,
      notificar: data.notificar || false
    };

    console.log('📦 Payload Completo para Envio:', JSON.stringify(fullPayload, null, 2));

    // Adicionar tratamento de erro mais detalhado
    return api.post('/movements', fullPayload)
      .catch(error => {
        console.error('🚨 Erro Detalhado na Criação de Movimento:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      });
  },

  async update(id, data) {
    try {
      const response = await api.put(`/movements/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/movements/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async removeItem(movementId, itemId) {
    try {
      const response = await api.delete(`/movements/${movementId}/items/${itemId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Método para cancelar um movimento
  async cancel(movementId) {
    return api.post(`/movements/${movementId}/cancel`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Erro ao cancelar movimento ${movementId}:`, error);
        throw error;
      });
  },

  // Novo método para emitir boleto para um movimento
  async generateBoleto(movementId) {
    try {
      console.log('Tentando gerar boleto para movementId:', movementId);
      const response = await api.post(`/movements/${movementId}/boletos`);
      console.log('Resposta da API de boletos:', response);
      return response.data;
    } catch (error) {
      console.error('Erro na API de boletos:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error; // Propaga o erro para o chamador
    }
  }
};

export const installmentsService = {
  list: async (params = {}) => {
    const defaultParams = {
      page: 1,
      limit: 10,
      include: 'boletos'
    };
    
    const mergedParams = { ...defaultParams, ...params };
    
    return api.get('/installments', { params: mergedParams })
      .then(response => response.data)
      .catch(error => {
        console.error('🚨 INSTALLMENTS SERVICE: ERRO DETALHADO', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        throw error;
      });
  },
  get: (id) => api.get(`/installments/${id}`).then(response => response.data),
  updateDueDate: (id, { due_date, amount }) => api.patch(`/installments/${id}/due-date`, { due_date, amount }),
  confirmPayment: (paymentData) => api.post('/installments/confirm-payment', paymentData),
  generateBoleto: (installmentId) => api.post(`/installments/${installmentId}/generate-boleto`),
};

export const personsService = {
  async search(query = '') {
    try {
      console.log('Buscando pessoas com query:', query);
      const response = await api.get('/persons', {
        params: {
          search: query,
          limit: 10,
          page: 1
        }
      });
      
      console.log('Resposta completa da busca de pessoas:', response.data);
      
      // Verificações robustas para diferentes estruturas de resposta
      const data = response.data || {};
      const personItems = data.data || data.items || [];
      
      console.log('Pessoas encontradas:', personItems);
      
      return {
        items: personItems,
        pagination: data.pagination || {
          total: personItems.length,
          page: 1,
          limit: 10
        }
      };
    } catch (error) {
      console.error('Erro na busca de pessoas:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
};

export const itemsService = {
  async search(query = '') {
    try {
      console.log('Buscando itens com query:', query);
      const response = await api.get('/items', {
        params: {
          ...(query ? { search: query } : {}),
          limit: 10,
          page: 1
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      console.log('Resposta da API de itens:', response.data);
      const items = (response.data.data || []).map(item => ({
        ...item,
        id: item.item_id,
        price: parseFloat(item.price)
      }));
      console.log('Items processados:', items);
      return {
        items,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Erro ao buscar itens:', error.response || error);
      // Se o erro for 500, retornar lista vazia em vez de propagar o erro
      if (error.response?.status === 500) {
        return { items: [], pagination: { total: 0, page: 1, limit: 10 } };
      }
      throw {
        message: error.response?.data?.message || 'Erro ao buscar itens',
        originalError: error
      };
    }
  },

  getById(id) {
    return api.get(`/items/${id}`).then(response => response.data);
  }
};

// Serviço de Contatos
export const contactsService = {
  list: (params) => api.get('/contacts', { params }).then(response => response.data),
  create: (data) => api.post('/contacts', data).then(response => response.data),
  get: (id) => api.get(`/contacts/${id}`).then(response => response.data),
  update: (id, data) => api.put(`/contacts/${id}`, data).then(response => response.data),
  delete: (id) => api.delete(`/contacts/${id}`).then(response => response.data),
  listByPerson: (personId, params) => api.get(`/persons/${personId}/contacts`, { params }).then(response => response.data),
  addToPerson: (personId, data) => api.post(`/persons/${personId}/contacts`, data).then(response => response.data),
  search: (params) => api.get('/contacts/search', { params }).then(response => response.data),
};

// Contacts Service
export const searchContacts = async (query) => {
  try {
    const response = await api.get('/contacts', {
      params: {
        search: query,
        limit: 10
      }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error searching contacts:', error);
    return [];
  }
};

// Serviço de Usuários
export const usersService = {
  list: (params) => api.get('/users', { params }).then(response => response.data),
  create: (data) => api.post('/users', data).then(response => response.data),
  get: (id) => api.get(`/users/${id}`).then(response => response.data),
  update: (id, data) => api.put(`/users/${id}`, data).then(response => response.data),
  delete: (id) => api.delete(`/users/${id}`).then(response => response.data),
};

// Saúde do sistema
export const healthService = {
  clearCache() {
    // Implementação existente
  },
  async check() {
    try {
      // Verificação básica de saúde do sistema
      const response = await api.get('/health');
      return response.data.status === 'ok';
    } catch (error) {
      console.error('Erro na verificação de saúde do sistema:', error);
      throw error;
    }
  }
};

// Configuração de APIs de alteração de data de vencimento
const DUE_DATE_APIS = {
  N8N: {
    url: 'https://n8n.webhook.agilefinance.com.br/webhook/instalment/due_date',
    method: 'PUT',
    headers: {
      'apikey': 'ffcaa89a3e19bd98e911475c7974309b'
    }
  },
  MAIN: {
    url: `${api.defaults.baseURL}/installments/due_date`,
    method: 'PUT',
    headers: {}
  }
};

// Função para alterar data de vencimento
export const updateInstallmentDueDate = async (
  installmentId, 
  newDueDate, 
  newAmount = null, 
  updateBoletoWithFees = false, 
  updateBoletoOnly = false, 
  apiSource = 'N8N',
  additionalData = {}
) => {
  try {
    console.log('Preparando atualização de data de vencimento via API:', {
      installmentId,
      newDueDate,
      newAmount,
      updateBoletoWithFees,
      updateBoletoOnly,
      apiSource,
      additionalData
    });

    // Seleciona a configuração da API
    const apiConfig = DUE_DATE_APIS[apiSource];

    console.log('Configuração da API selecionada:', apiConfig);

    // Prepara os dados da requisição
    const requestData = {
      installment_id: installmentId,
      new_due_date: newDueDate,
      new_amount: newAmount,
      update_boleto_with_fees: updateBoletoWithFees,
      update_boleto_only: updateBoletoOnly,
      ...additionalData
    };

    console.log('Dados da requisição:', requestData);
    console.log('Detalhes completos da requisição:', {
      method: apiConfig.method,
      url: apiConfig.url,
      headers: {
        'Content-Type': 'application/json',
        ...apiConfig.headers
      },
      data: requestData
    });

    // Realiza a requisição
    const response = await axios({
      method: apiConfig.method,
      url: apiConfig.url,
      headers: {
        'Content-Type': 'application/json',
        ...apiConfig.headers
      },
      data: requestData
    });

    console.log('Resposta da API:', {
      status: response.status,
      data: response.data
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar data de vencimento:', error);
    throw error;
  }
};

export const paymentMethodService = {
  async getAll(params = {}) {
    console.log(`[GET] /payment-method: Params:`, params);
    console.log(`[GET] /payment-method: Params (detailed):`, JSON.stringify(params, null, 2));
    
    const response = await api.get('/payment-method', { params });
    
    return response.data;
  },

  async get(id) {
    console.log(`[GET] /payment-method/${id}: Params: Detalhes`);
    
    const response = await api.get(`/payment-method/${id}`);
    
    return response.data;
  },

  async create(data) {
    console.log(`[POST] /payment-method: Dados:`, data);
    
    const response = await api.post('/payment-method', data);
    
    return response.data;
  },

  async update(id, data) {
    console.log(`[PUT] /payment-method/${id}: Dados:`, data);
    
    const response = await api.put(`/payment-method/${id}`, data);
    
    return response.data;
  },

  async delete(id) {
    console.log(`[DELETE] /payment-method/${id}`);
    
    const response = await api.delete(`/payment-method/${id}`);
    
    return response.data;
  },

  async toggleActive(id) {
    console.log(`[PATCH] /payment-method/${id}/toggle-active`);
    
    const response = await api.patch(`/payment-method/${id}/toggle-active`);
    
    return response.data;
  }
};

export default api;
