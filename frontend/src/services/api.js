import axios from 'axios';
import { format } from 'date-fns';
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

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
api.interceptors.request.use(async (config) => {
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

  console.log('Sending params to API:', config.params);
  return config;
});

// Função para renovar o token
const refreshTokenIfNeeded = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }
  
  isRefreshing = true;
  
  try {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    const { accessToken, newRefreshToken } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    
    isRefreshing = false;
    processQueue(null, accessToken);
    return accessToken;
  } catch (error) {
    isRefreshing = false;
    processQueue(error, null);
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
    console.log('Raw API response:', response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshTokenIfNeeded();
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        handleAuthError();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

export const movementsService = {
  async list(params = {}) {
    try {
      // Remover parâmetros vazios
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
      );

      // Log dos parâmetros enviados
      console.log('Sending params to API:', cleanParams);

      const response = await api.get('/movements', { 
        params: cleanParams,
        // Aumentar o timeout para requests com includes
        timeout: cleanParams.include ? 10000 : 5000
      });
      
      // Log da resposta completa
      console.log('Raw API response:', response);
      
      return {
        items: response.data.data || [],
        total: response.data.pagination?.total || 0,
        page: response.data.pagination?.currentPage || 1,
        limit: response.data.pagination?.limit || 10,
        totalPages: response.data.pagination?.totalPages || 1
      };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  create(data) {
    return api.post('/movements', {
      movement_type_id: 1,
      description: data.description,
      person_id: data.person_id,
      license_id: 1,
      payment_method_id: data.payment_method_id,
      items: [
        {
          item_id: 3, // Item default como solicitado
          quantity: 1,
          unit_price: parseFloat(data.amount)
        }
      ],
      seller_id: null,
      technician_id: null,
      discount: 0.00,
      addition: 0.00,
      nfse: false,
      boleto: false,
      notificar: false
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
};

export const installmentsService = {
  async list(params = {}) {
    try {
      // Formatar as datas se necessário
      if (params.startDate) {
        params.start_date = format(new Date(params.startDate), 'yyyy-MM-dd');
        delete params.startDate;
      }
      if (params.endDate) {
        params.end_date = format(new Date(params.endDate), 'yyyy-MM-dd');
        delete params.endDate;
      }

      // Remover parâmetros vazios
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
      );

      // Log dos parâmetros enviados
      console.log('Sending params to API:', cleanParams);

      const response = await api.get('/installments', { params: cleanParams });
      
      // Log da resposta completa
      console.log('Raw API response:', response);
      
      return {
        items: response.data.data || [],
        total: response.data.pagination?.total || 0,
        page: response.data.pagination?.currentPage || 1,
        limit: response.data.pagination?.limit || 10,
        totalPages: response.data.pagination?.totalPages || 1
      };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

export const personsService = {
  async search(query = '') {
    try {
      const response = await api.get('/persons', {
        params: {
          search: query,
          limit: 10,
          page: 1
        }
      });
      return {
        items: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
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

export default api;
