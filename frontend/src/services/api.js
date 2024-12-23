import axios from 'axios';
import { format } from 'date-fns';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'Ocorreu um erro inesperado';

    if (!error.response) {
      errorMessage = 'Erro de conexão com o servidor. Verifique sua conexão ou tente novamente mais tarde.';
    } else {
      switch (error.response.status) {
        case 400:
          errorMessage = error.response.data.message || 'Dados inválidos';
          break;
        case 401:
          errorMessage = 'Sessão expirada. Por favor, faça login novamente';
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          errorMessage = 'Acesso negado';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        default:
          errorMessage = error.response.data.message || 'Ocorreu um erro inesperado';
      }
    }

    return Promise.reject({ message: errorMessage, originalError: error });
  }
);

export const authService = {
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    localStorage.removeItem('accessToken');
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

  async create(data) {
    try {
      const response = await api.post('/movements', data);
      return response.data;
    } catch (error) {
      throw error;
    }
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

export default api;
