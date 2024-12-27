import { jwtDecode } from 'jwt-decode';
import { LoginCredentials, LoginResponse, User, DecodedToken } from '../types/auth';
import apiService from './ApiService';
import { messages } from '../constants/messages';

export class AuthService {
  private static readonly TOKEN_KEY = '@AgileFinance:token';
  private static readonly TOKEN_EXPIRY_THRESHOLD = 5 * 60; // 5 minutes in seconds

  public static async login(credentials: LoginCredentials): Promise<void> {
    try {
      const response = await apiService.post<LoginResponse>('/auth/login', credentials);
      this.setToken(response.token);
      
      // Setup token refresh
      this.setupTokenRefresh(response.token);
    } catch (error) {
      throw new Error(messages.auth.invalidCredentials);
    }
  }

  public static async getCurrentUser(): Promise<User> {
    try {
      return await apiService.get<User>('/auth/me');
    } catch (error) {
      throw new Error(messages.auth.sessionExpired);
    }
  }

  public static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  public static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  public static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      
      // If token is about to expire, try to refresh it
      if (decoded.exp - currentTime < this.TOKEN_EXPIRY_THRESHOLD) {
        this.refreshToken();
        return false;
      }
      
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  private static setupTokenRefresh(token: string): void {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const expiresIn = decoded.exp - Date.now() / 1000;
      
      if (expiresIn > this.TOKEN_EXPIRY_THRESHOLD) {
        // Set timeout to refresh token before it expires
        setTimeout(
          () => this.refreshToken(),
          (expiresIn - this.TOKEN_EXPIRY_THRESHOLD) * 1000
        );
      } else {
        // Token is about to expire, refresh it immediately
        this.refreshToken();
      }
    } catch (error) {
      console.error('Error setting up token refresh:', error);
    }
  }

  private static async refreshToken(): Promise<void> {
    try {
      const response = await apiService.post<LoginResponse>('/auth/refresh');
      this.setToken(response.token);
      this.setupTokenRefresh(response.token);
    } catch (error) {
      this.logout();
      throw new Error(messages.auth.tokenRefreshError);
    }
  }

  public static async validateToken(): Promise<boolean> {
    try {
      await apiService.get('/auth/validate');
      return true;
    } catch {
      return false;
    }
  }
}