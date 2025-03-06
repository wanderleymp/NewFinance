import axios from 'axios';
import { format } from 'date-fns';
import { jwtDecode } from "jwt-decode";

// Configuração base do Axios
console.log('🔍 DEBUG - import.meta.env:', import.meta.env);
console.log('🔍 DEBUG - VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🔍 DEBUG - Todas variáveis Vite:', 
  Object.keys(import.meta.env)
    .filter(key => key.startsWith('VITE_'))
    .map(key => `${key}: ${import.meta.env[key]}`)
);

// Verificar se estamos em ambiente de desenvolvimento
const isDevelopment = import.meta.env.DEV;

// Determinar a URL base da API
// Em ambiente de desenvolvimento, SEMPRE usar o proxy do Vite para evitar erros de certificado SSL
let baseURL = '/api';

// Em produção, usar a URL real da API
if (!isDevelopment) {
  baseURL = import.meta.env.VITE_API_URL || 'https://dev.agilefinance.com.br';
}

console.log('🔒 Ambiente:', isDevelopment ? 'desenvolvimento' : 'produção');
console.log('🔍 DEBUG - URL base definida para:', baseURL);

const api = axios.create({
  baseURL,
  timeout: 15000,
  timeoutErrorMessage: 'Tempo de conexão excedido. Verifique sua conexão de rede.'
});

// Verificação detalhada da URL da API
if (!api.defaults.baseURL) {
  console.error('\n🚨 ERRO CRÍTICO: URL base da API não está definida\n');
  throw new Error('URL base da API não configurada');
}

console.log('\n🌐 Configurando URL base da API:', api.defaults.baseURL);
console.log('Variáveis de ambiente:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));

// No navegador, não podemos modificar diretamente as configurações SSL,
// mas podemos adicionar um interceptor para ignorar erros específicos de certificado
if (isDevelopment) {
  api.interceptors.request.use(config => {
    // Removido o parâmetro ignoreSSL que estava causando erro 400 Bad Request
    // O proxy já está configurado para ignorar erros de certificado no vite.config.js
    // config.params = { ...config.params, ignoreSSL: true };
    
    // Adicionar header para identificar requisições de desenvolvimento
    config.headers = {
      ...config.headers,
      'X-Development-Mode': 'true'
    };
    return config;
  });
}

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

export const movementsService = {
  async list(params = {}) {
    try {
      // Mapear orderBy para valores aceitos
      const mappedParams = {
        ...params,
        orderBy: params.orderBy === 'date' ? 'movement_date' : params.orderBy,
        orderDirection: params.orderDirection === 'desc' ? 'DESC' : params.orderDirection,
        include: 'payments.installments.boletos,invoices'
      };

      // Remover orderBySecondary e orderDirectionSecondary
      delete mappedParams.orderBySecondary;
      delete mappedParams.orderDirectionSecondary;

      console.log('🚀 [GET] /movements: Iniciando requisição com params:', mappedParams);
      
      const response = await api.get('/movements', { 
        params: mappedParams
      });
      
      // Parse da resposta JSON
      const parsedData = typeof response.data === 'string' 
        ? JSON.parse(response.data) 
        : response.data;
      
      console.log('🔍 Resposta da API:', {
        data: parsedData,
        dataType: typeof parsedData,
        hasItems: !!parsedData?.items,
        itemsCount: parsedData?.items?.length,
        hasInvoices: !!parsedData?.invoices,
        invoicesCount: parsedData?.invoices?.length,
      });

      // Adicionar campos relacionados a cada item
      const itemsWithDetails = (parsedData?.items || parsedData?.data || []).map(item => {
        // Usar os campos já existentes no movimento
        const installments = item.installments || [];
        const boletos = item.boletos || [];
        const invoices = item.invoices || [];
        const payments = item.payments || [];

        console.log(`📄 Detalhes para movimento ${item.movement_id}:`, {
          movementId: item.movement_id,
          installmentsCount: installments.length,
          boletosCount: boletos.length,
          invoicesCount: invoices.length,
          paymentsCount: payments.length
        });
        
        return {
          ...item,
          installments,
          boletos,
          invoices,
          payments
        };
      });
      
      const result = {
        items: itemsWithDetails,
        total: parsedData?.total || parsedData?.pagination?.total || parsedData?.length || 0,
        page: parsedData?.current_page || parsedData?.pagination?.currentPage || 1,
        limit: parsedData?.per_page || parsedData?.pagination?.limit || 10,
        totalPages: parsedData?.last_page || parsedData?.pagination?.totalPages || 1,
        invoices: parsedData?.invoices || []
      };

      console.log('✅ Resultado final:', {
        totalItems: result.items.length,
        itemsWithInvoices: result.items.filter(item => item.invoices?.length > 0).length,
        totalInvoices: result.invoices.length
      });

      return result;
    } catch (error) {
      console.error('❌ [GET] /movements: Erro na requisição:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
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
    // Obter o usuário atual do localStorage
    const userString = localStorage.getItem('user');
    const currentUser = userString ? JSON.parse(userString) : null;
    const userId = currentUser?.user_id;

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
  async cancel(movementId, status) {
    try {
      console.log(`🚨 Iniciando cancelamento do movimento ${movementId} com status ${status}`);
      const response = await api.post(`/movements/${movementId}/cancel`, { status });
      console.log(`✅ Resposta do cancelamento:`, {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Erro detalhado ao cancelar movimento ${movementId}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      throw error;
    }
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
  },

  // Método para notificar faturamento de movimento
  async notifyBilling(movementId) {
    try {
      console.log('Tentando enviar notificação de faturamento para movementId:', movementId);
      const response = await api.post(`/movements/${movementId}/notify-billing`);
      console.log('Resposta da API de notificação de faturamento:', response);
      return response.data;
    } catch (error) {
      console.error('Erro na API de notificação de faturamento:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw new Error(error.response?.data?.message || error.message);
    }
  },
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

      // Combina parâmetros padrão com os fornecidos
      const finalParams = { 
        ...defaultParams, 
        ...params,
        order: 'desc'  // Força ordem descendente
      };

      console.log('🚨 Parâmetros da requisição:', {
        url: '/installments/details',
        params: finalParams
      });
      
      // Configuração da requisição com timeout aumentado
      const response = await api.get('/installments/details', { 
        params: finalParams,
        timeout: 30000, // 30 segundos
        transformResponse: [(data) => {
          if (typeof data !== 'string') return data;
          
          try {
            const parsedData = JSON.parse(data);
            console.log('🚨 Dados parseados:', {
              items: parsedData.items?.length,
              meta: parsedData.meta
            });
            return parsedData;
          } catch (error) {
            console.error('🚨 Erro no parse:', error);
            throw new Error('Falha ao processar resposta da API');
          }
        }]
      });
      
      // Validação da resposta
      if (!response?.data) {
        throw new Error('Resposta da API inválida ou vazia');
      }

      // Extração segura dos dados
      const { items = [], meta = {} } = response.data;
      
      // Validação dos dados
      if (!Array.isArray(items)) {
        throw new Error('Formato inválido: items não é um array');
      }

      console.log('🚨 Resposta processada:', {
        status: response.status,
        items: items.length,
        meta
      });

      // Retorno estruturado com valores padrão seguros
      return {
        items,
        meta,
        total: meta.total || 0,
        page: meta.current_page || finalParams.page,
        limit: meta.per_page || finalParams.limit,
        totalPages: meta.last_page || 1
      };
    } catch (error) {
      console.error('🚨 Erro ao buscar parcelas:', {
        name: error.name,
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });

      // Personalização do erro
      if (error.code === 'ECONNABORTED') {
        throw new Error('Tempo de conexão excedido. Verifique sua conexão.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Nenhuma parcela encontrada.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }
      
      throw error;
    }
  },
  
  async search(query = '') {
    return this.list({ search: query });
  },

  async generateBoleto(installmentId) {
    try {
      // Validação do ID da parcela
      if (!installmentId) {
        throw new Error('ID da parcela é obrigatório');
      }

      console.log('🚨 Iniciando geração de boleto:', { installmentId });
      
      // Configuração da requisição com timeout aumentado
      const response = await api.post(
        `/installments/${installmentId}/boletos`,
        {},
        {
          timeout: 30000, // 30 segundos
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Validação da resposta
      if (!response?.data) {
        throw new Error('Resposta inválida do servidor');
      }

      console.log('🚨 Boleto gerado com sucesso:', {
        status: response.status,
        data: response.data
      });

      return response.data;
    } catch (error) {
      console.error('🚨 Erro detalhado na geração do boleto:', {
        name: error.name,
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });

      // Tratamento específico de erros
      if (error.code === 'ECONNABORTED') {
        throw new Error('Tempo limite excedido ao gerar boleto. Tente novamente.');
      }

      if (error.response?.status === 404) {
        throw new Error('Parcela não encontrada.');
      }

      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Dados inválidos para geração do boleto.');
      }

      if (error.response?.status === 500) {
        throw new Error('Erro interno do servidor ao gerar boleto. Tente novamente mais tarde.');
      }

      // Erro genérico
      throw new Error(error.response?.data?.message || 'Falha ao gerar boleto. Tente novamente.');
    }
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

export const usersService = {
  list: (params) => api.get('/users', { params }).then(response => response.data),
  create: (data) => api.post('/users', data).then(response => response.data),
  get: (id) => api.get(`/users/${id}`).then(response => response.data),
  update: (id, data) => api.put(`/users/${id}`, data).then(response => response.data),
  delete: (id) => api.delete(`/users/${id}`).then(response => response.data),
};

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
    
    try {
      const response = await api.get('/payment-method', { params });
      console.log(`[GET] /payment-method: Resposta:`, response.data);
      
      // Padroniza o formato de resposta para lidar com diferentes formatos
      let items = [];
      
      if (Array.isArray(response.data)) {
        // Se a resposta for um array direto
        items = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Se a resposta for no formato { data: [...], meta: {...} }
        items = response.data.data;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        // Se a resposta for no formato { items: [...], meta: {...} }
        items = response.data.items;
      } else {
        console.warn('Formato de resposta desconhecido:', response.data);
        items = [];
      }
      
      // Mapeia os itens para o formato esperado pelo frontend
      const formattedMethods = items.map(method => ({
        id: method.payment_method_id || method.id,
        name: method.method_name || method.name || 'Sem nome'
      }));
      
      return { data: formattedMethods };
    } catch (error) {
      console.error('Erro ao buscar formas de pagamento:', error);
      return { data: [] };
    }
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

export const nfseService = {
  async list(params = {}) {
    try {
      console.log('🔍 Iniciando busca de NFSes com parâmetros:', params);
      const response = await api.get('/nfse', { 
        params: {
          ...params,
          page: params.page || 1,
          limit: params.limit || 10
        }
      });
      console.log('🎉 NFSes encontradas:', response.data);
      return {
        items: response.data.items || [],
        meta: {
          totalItems: response.data.meta?.totalItems || 0,
          currentPage: response.data.meta?.currentPage || 1,
          totalPages: response.data.meta?.totalPages || 1,
          itemsPerPage: response.data.meta?.itemsPerPage || 10
        }
      };
    } catch (error) {
      console.error('❌ Erro ao listar NFSes:', error);
      throw error;
    }
  },

  async get(id) {
    try {
      const response = await api.get(`/nfse/${id}`);
      console.log('🔍 NFSe recuperada:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao recuperar NFSe ${id}:`, error);
      throw error;
    }
  }
};

export default api;
