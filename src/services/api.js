import axios from 'axios';
import { format } from 'date-fns';
import { jwtDecode } from "jwt-decode";

// Configuração base do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000, // 15 segundos
  timeoutErrorMessage: 'Tempo de conexão excedido. Verifique sua conexão de rede.',
  withCredentials: true
});

// Adicionar interceptor de requisição para incluir token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Remover interceptores e verificações automáticas
// Manter apenas o interceptor de resposta para tratamento de erros
api.interceptors.response.use(
  response => response,
  error => {
    console.error('Erro na requisição:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

// Função de verificação de conectividade opcional
export const networkService = {
  async checkHealth() {
    console.warn('Verificação de saúde desabilitada temporariamente');
    return true;
  }
};

export const authService = {
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      const { accessToken, refreshToken, user } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },
  
  isAuthenticated() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return false;

      const decoded = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  },

  getCurrentUser() {
    try {
      const userString = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');

      console.log('🕵️ DEBUG getCurrentUser:', {
        userString,
        tokenExists: !!token
      });

      if (!userString) {
        console.error('❌ Usuário não encontrado no localStorage');
        return null;
      }

      const user = JSON.parse(userString);
      
      // Tentar extrair user_id do token se não estiver no usuário
      if (!user.id && token) {
        try {
          const decodedToken = jwtDecode(token);
          user.id = decodedToken.user_id || decodedToken.sub;
        } catch (tokenError) {
          console.error('Erro ao decodificar token:', tokenError);
        }
      }

      // Mapear usuário para estrutura padrão
      const mappedUser = {
        id: user.user_id || user.id || user.sub,
        username: user.username,
        profile_id: user.profile_id || null,
        enable_2fa: user.enable_2fa || false
      };

      console.log('🔍 Usuário mapeado:', mappedUser);

      return mappedUser;
    } catch (error) {
      console.error('Erro ao recuperar usuário atual:', error);
      return null;
    }
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Método para verificar autenticação
  getTokenInfo() {
    try {
      const token = localStorage.getItem('accessToken');
      return token ? jwtDecode(token) : null;
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }
};

export const movementsService = {
  async list(params = {}) {
    try {
      console.log('[GET] /movements: Params completos:', {
        ...params,
        include: 'payments.installments.boletos'
      });
      
      const response = await api.get('/movements', { 
        params: {
          ...params,
          include: 'payments.installments.boletos',
          ...(params.orderBySecondary && {
            orderBySecondary: params.orderBySecondary,
            orderDirectionSecondary: params.orderDirectionSecondary || 'desc'
          })
        }
      });
      
      // Parse da resposta JSON
      const parsedData = typeof response.data === 'string' 
        ? JSON.parse(response.data) 
        : response.data;
      
      console.log('🔍 Estrutura COMPLETA da resposta:', {
        responseType: typeof response,
        responseKeys: Object.keys(response),
        parsedData,
        status: response.status,
        headers: response.headers
      });
      
      return {
        items: parsedData?.items || parsedData?.data || [], 
        total: parsedData?.total || parsedData?.pagination?.total || parsedData?.length || 0,
        page: parsedData?.current_page || parsedData?.pagination?.currentPage || 1,
        limit: parsedData?.per_page || parsedData?.pagination?.limit || 10,
        totalPages: parsedData?.last_page || parsedData?.pagination?.totalPages || 1
      };
    } catch (error) {
      console.error('[GET] /movements: Erro detalhado', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
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
    // Obter o usuário atual de forma mais robusta
    const currentUser = authService.getCurrentUser();
    const userId = currentUser?.id;

    console.log('🔍 Payload de Movimento Recebido:', JSON.stringify(data, null, 2));

    console.log('🕵️ Usuário atual:', currentUser);
    console.log('🆔 User ID:', userId);

    // Validações mais robustas e flexíveis
    const requiredFields = ['person_id', 'item_id', 'payment_method_id', 'amount'];
    const invalidFields = requiredFields.filter(field => !data[field] || (field === 'amount' && isNaN(parseFloat(data[field]))));
    
    if (invalidFields.length > 0) {
      const errorMessage = `Campos obrigatórios ausentes ou inválidos: ${invalidFields.join(', ')}`;
      console.error('❌ Erro de Validação:', errorMessage);
      throw new Error(errorMessage);
    }

    // Validação adicional para garantir user_id
    if (!userId) {
      console.error('❌ Erro: user_id não encontrado');
      console.error('🚨 Detalhes do localStorage:', {
        user: localStorage.getItem('user'),
        token: localStorage.getItem('accessToken')
      });
      throw new Error('Usuário não autenticado ou ID não encontrado');
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
      user_id: userId, // Adicionando user_id de forma explícita
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
  },

  // Novo método para emitir NFSE para um movimento
  async generateNfse(movementId) {
    try {
      console.log('Tentando gerar NFSE para movementId:', movementId);
      const response = await api.post(`/movements/${movementId}/nfse`);
      console.log('Resposta da API de NFSE:', response);
      return response.data;
    } catch (error) {
      console.error('Erro na API de NFSE:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      // Lança o erro com a mensagem do servidor, se disponível
      throw new Error(error.response?.data?.message || error.message);
    }
  }
};

export const installmentsService = {
  async list(params = {}) {
    try {
      // Parâmetros padrão para a listagem de parcelas
      const defaultParams = {
        page: 1,
        limit: 10,
        sort: 'due_date',
        order: 'desc'
      };

      // Combina parâmetros padrão com os fornecidos, garantindo 'desc'
      const finalParams = { 
        ...defaultParams, 
        ...params,
        order: 'desc'  // Força ordem descendente
      };

      console.log('[DEBUG] Parâmetros finais da requisição:', {
        url: '/installments/details',
        params: finalParams
      });
      
      const response = await api.get('/installments/details', { 
        params: finalParams
      });
      
      // Log detalhado da resposta completa
      console.log('[DEBUG] Resposta completa do servidor:', {
        status: response.status,
        headers: response.headers,
        data: JSON.stringify(response.data, null, 2)
      });

      // Log específico para meta e items
      console.log('[DEBUG] Detalhes de Paginação:', {
        total: response.data?.meta?.total,
        page: response.data?.meta?.page,
        limit: response.data?.meta?.limit,
        totalPages: response.data?.meta?.totalPages,
        itemsCount: response.data?.items?.length
      });

      return {
        items: response.data?.items || [],
        total: response.data?.meta?.total || 0,
        page: response.data?.meta?.page || finalParams.page,
        limit: response.data?.meta?.limit || finalParams.limit,
        totalPages: response.data?.meta?.totalPages || 1,
        meta: response.data?.meta || {}  // Adiciona meta completo para debug
      };
    } catch (error) {
      console.error('Erro detalhado ao buscar detalhes das parcelas:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },
  
  async search(query = '') {
    return this.list({ search: query });
  },
};

export const personsService = {
  async search(query = '') {
    try {
      console.log('🔍 Buscando pessoas com query:', query);
      
      // Verificar configuração base do Axios
      console.log('🚨 Configuração Axios:', {
        baseURL: api.defaults.baseURL,
        headers: api.defaults.headers
      });

      const response = await api.get('/persons', {
        params: {
          search: query,
          limit: 10
        }
      });
      
      console.log('🔍 Resposta completa da busca de pessoas:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });
      
      // Verificações robustas para diferentes estruturas de resposta
      const data = response.data || {};
      const personItems = data.data || data.items || [];
      
      console.log('👥 Pessoas encontradas:', personItems);
      
      return {
        items: personItems,
        pagination: data.pagination || {
          total: personItems.length,
          page: 1,
          limit: 10
        }
      };
    } catch (error) {
      console.error('❌ Erro DETALHADO na busca de pessoas:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });

      // Verificar se é erro de rede
      if (error.message === 'Network Error') {
        console.error('🌐 Possível problema de conexão de rede');
        // Você pode adicionar lógica adicional aqui, como verificar conexão
      }

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
      'apikey': 'ffcaa89a3e19bd98e911475c7974309b',
      'Content-Type': 'application/json'
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
  payloadOrInstallmentId, 
  newDueDate = null, 
  newAmount = null, 
  updateBoletoWithFees = true, 
  updateBoletoOnly = false,
  source = 'DEFAULT',
  additionalConfig = {}
) => {
    try {
      // Normalização do payload
      let requestPayload;

      // Se for um objeto, usa diretamente
      if (payloadOrInstallmentId && typeof payloadOrInstallmentId === 'object') {
        requestPayload = {
          installment_id: payloadOrInstallmentId.installmentId || payloadOrInstallmentId.id,
          new_due_date: payloadOrInstallmentId.newDueDate || payloadOrInstallmentId.dueDate,
          new_amount: payloadOrInstallmentId.newAmount || payloadOrInstallmentId.amount,
          update_boleto_with_fees: payloadOrInstallmentId.updateBoletoWithFees ?? true,
          update_boleto_only: payloadOrInstallmentId.updateBoletoOnly ?? false,
          ...additionalConfig
        };
      } 
      // Se for número/string, constrói payload com parâmetros
      else if (typeof payloadOrInstallmentId === 'number' || typeof payloadOrInstallmentId === 'string') {
        requestPayload = {
          installment_id: payloadOrInstallmentId,
          new_due_date: newDueDate,
          new_amount: newAmount,
          update_boleto_with_fees: updateBoletoWithFees,
          update_boleto_only: updateBoletoOnly,
          ...additionalConfig
        };
      } else {
        throw new Error('Payload inválido. Deve ser um ID ou um objeto com detalhes da parcela.');
      }

      // Log detalhado do payload
      console.log(`🚨 PREPARANDO ATUALIZAÇÃO DE DATA DE VENCIMENTO (${source})`, requestPayload);

      // Validação final do payload
      if (!requestPayload.installment_id) {
        console.error('🚨 ID DA PARCELA NÃO ENCONTRADO');
        throw new Error('ID da parcela é obrigatório');
      }

      const response = await axios.put(
        'https://n8n.webhook.agilefinance.com.br/webhook/instalment/due_date', 
        requestPayload,
        {
          headers: {
            'apikey': 'ffcaa89a3e19bd98e911475c7974309b',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('🚨 RESPOSTA DA ATUALIZAÇÃO:', response.data);
      return response.data;
    } catch (error) {
      console.error('🚨 ERRO DETALHADO NA ATUALIZAÇÃO:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config
      });

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
