import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import { AuthService } from './AuthService';

class ApiService {
  private api: AxiosInstance;
  private static instance: ApiService;

  private constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config) => {
        const token = AuthService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Ensure we're returning a plain object without Symbols
        return JSON.parse(JSON.stringify(response.data));
      },
      (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data as any;

          switch (status) {
            case 401:
              AuthService.logout();
              toast.error('Sessão expirada. Por favor, faça login novamente.');
              break;
            case 403:
              toast.error('Você não tem permissão para realizar esta ação.');
              break;
            case 404:
              toast.error('Recurso não encontrado.');
              break;
            case 422:
              const message = data?.message || 'Dados inválidos. Verifique as informações fornecidas.';
              toast.error(message);
              break;
            case 500:
              toast.error('Erro interno do servidor. Tente novamente mais tarde.');
              break;
            default:
              toast.error('Ocorreu um erro. Tente novamente.');
          }
        } else if (error.request) {
          toast.error('Não foi possível conectar ao servidor. Verifique sua conexão.');
        } else {
          toast.error('Ocorreu um erro na requisição.');
        }
        return Promise.reject(error);
      }
    );
  }

  public async get<T>(url: string, config?: object): Promise<T> {
    try {
      const response = await this.api.get<T, T>(url, config);
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async post<T>(url: string, data?: object): Promise<T> {
    try {
      const response = await this.api.post<T, T>(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async put<T>(url: string, data?: object): Promise<T> {
    try {
      const response = await this.api.put<T, T>(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async delete<T>(url: string): Promise<T> {
    try {
      const response = await this.api.delete<T, T>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export const apiService = ApiService.getInstance();
export default apiService;