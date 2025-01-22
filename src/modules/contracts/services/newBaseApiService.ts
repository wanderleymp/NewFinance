import axios, { AxiosInstance } from 'axios';
import { AuthenticationStrategy, LocalStorageAuthStrategy, AuthenticationService } from './newAuthService';

export class NewBaseApiService {
  protected baseUrl: string;
  protected api: AxiosInstance;
  private authService: AuthenticationService;

  constructor(
    baseUrl: string, 
    authStrategy: AuthenticationStrategy = new LocalStorageAuthStrategy()
  ) {
    this.baseUrl = baseUrl;
    this.authService = new AuthenticationService(authStrategy);
    
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      timeout: 15000
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(async (config) => {
      const token = await this.authService.getValidToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    }, (error) => Promise.reject(error));

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          console.warn('Token inválido. Necessário reautenticar.');
        }
        
        return Promise.reject(error);
      }
    );
  }

  protected async get<T>(endpoint: string, params?: any): Promise<T> {
    return this.api.get<T>(`${this.baseUrl}/${endpoint}`, { params });
  }

  protected async post<T>(endpoint: string, data: any): Promise<T> {
    return this.api.post<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  protected async put<T>(endpoint: string, data: any): Promise<T> {
    return this.api.put<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  protected async delete(endpoint: string): Promise<void> {
    return this.api.delete(`${this.baseUrl}/${endpoint}`);
  }
}
