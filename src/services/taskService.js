import axios from 'axios';
import { getToken, logout } from '../utils/auth';  // Importe a função de autenticação

const BASE_URL = import.meta.env.VITE_API_URL || 'https://dev.agilefinance.com.br';

// Crie uma instância do axios com configurações padrão
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000  // Timeout de 10 segundos
});

// Adicione um interceptor para incluir o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('Nenhum token de autenticação encontrado');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Adicione um interceptor de resposta para lidar com erros de autenticação e rede
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // O servidor respondeu com um status de erro
      switch (error.response.status) {
        case 401:
          console.error('Token inválido ou expirado');
          logout();
          window.location.href = '/login';
          break;
        case 403:
          console.error('Acesso negado');
          break;
        case 404:
          console.error('Recurso não encontrado');
          break;
        case 500:
          console.error('Erro interno do servidor');
          break;
        default:
          console.error('Erro desconhecido:', error.response.status);
      }
    } else if (error.request) {
      // A requisição foi feita, mas não houve resposta
      console.error('Sem resposta do servidor');
    } else {
      // Algo aconteceu ao configurar a requisição
      console.error('Erro ao configurar requisição:', error.message);
    }

    return Promise.reject(error);
  }
);

export const taskService = {
  async getTasks(filters = {}) {
    const { 
      status, 
      type, 
      priority, 
      page = 1, 
      limit = 10 
    } = filters;

    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    if (priority) params.append('priority', priority);
    params.append('page', page);
    params.append('limit', limit);

    try {
      const response = await api.get(`/api/tasks`, { params });
      return {
        data: response.data.tasks || [],
        total: response.data.total || 0
      };
    } catch (error) {
      console.error('Erro ao buscar tasks:', error);
      
      // Tratamento específico para erros de rede
      if (error.code === 'ERR_NETWORK') {
        // Pode adicionar lógica para mostrar mensagem de erro ao usuário
        return {
          data: [],
          total: 0,
          error: 'Erro de conexão. Verifique sua internet ou tente novamente mais tarde.'
        };
      }
      
      return {
        data: [],
        total: 0
      };
    }
  },

  async getTaskById(taskId) {
    try {
      console.log(`Buscando detalhes da task ${taskId}`);
      const response = await api.get(`/api/tasks/${taskId}`);
      console.log('Detalhes da task recebidos:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar detalhes da task ${taskId}:`, error);
      
      // Dispara evento de erro global
      window.dispatchEvent(new CustomEvent('show-snackbar', {
        detail: {
          message: `Erro ao buscar detalhes da task ${taskId}: ${error.message}`,
          severity: 'error'
        }
      }));
      
      throw error;
    }
  },

  async getPendingTasks() {
    try {
      const response = await api.get(`/api/tasks/pending`);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar tasks pendentes:', error);
      
      if (error.code === 'ERR_NETWORK') {
        // Pode adicionar lógica para mostrar mensagem de erro ao usuário
        return [];
      }
      
      return [];
    }
  },

  async getTaskLogs(taskId, filters = {}) {
    const { 
      startDate, 
      endDate, 
      level, 
      limit = 50, 
      offset = 0 
    } = filters;

    const params = new URLSearchParams();
    params.append('task_id', taskId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (level) params.append('level', level);
    params.append('limit', limit);
    params.append('offset', offset);

    try {
      console.log(`Buscando logs da task ${taskId}`);
      const response = await api.get(`/api/tasks/logs`, { params });
      console.log('Logs da task recebidos:', response.data);
      return response.data || [];
    } catch (error) {
      console.error(`Erro ao buscar logs da task ${taskId}:`, error);
      
      // Dispara evento de erro global
      window.dispatchEvent(new CustomEvent('show-snackbar', {
        detail: {
          message: `Erro ao buscar logs da task ${taskId}: ${error.message}`,
          severity: 'error'
        }
      }));
      
      throw error;
    }
  },

  async getDashboardStats() {
    try {
      const response = await api.get(`/api/tasks/stats`);
      console.log('Dashboard Stats:', response.data);  // Log para debug
      return response.data || {
        statusCounts: { pending: 0, running: 0, completed: 0, failed: 0 },
        successRate: 0,
        avgProcessingTime: 0,
        totalTasks: 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de tasks:', error);
      
      if (error.code === 'ERR_NETWORK') {
        // Pode adicionar lógica para mostrar mensagem de erro ao usuário
        return {
          statusCounts: { pending: 0, running: 0, completed: 0, failed: 0 },
          successRate: 0,
          avgProcessingTime: 0,
          totalTasks: 0,
          error: 'Erro de conexão. Verifique sua internet ou tente novamente mais tarde.'
        };
      }
      
      return {
        statusCounts: { pending: 0, running: 0, completed: 0, failed: 0 },
        successRate: 0,
        avgProcessingTime: 0,
        totalTasks: 0
      };
    }
  }
};
