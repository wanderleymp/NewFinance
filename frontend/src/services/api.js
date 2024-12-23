import axios from 'axios';

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
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
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
  async list(page = 1, limit = 10) {
    try {
      const response = await api.get('/movements', {
        params: { page, limit },
      });
      
      // Log para debug
      console.log('Raw API response:', response);
      
      // Garantir que temos uma estrutura consistente
      const data = {
        items: response.data.data || response.data.items || response.data || [],
        total: response.data.total || response.data.pagination?.total || response.data.length || 0,
        page: page,
        limit: limit
      };
      
      // Log dos dados processados
      console.log('Processed data:', data);
      
      return data;
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

export default api;
