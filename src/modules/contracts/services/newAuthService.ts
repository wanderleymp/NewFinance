import { jwtDecode } from 'jwt-decode';

export interface AuthenticationStrategy {
  getToken(): Promise<string | null>;
  isTokenValid(): boolean;
  refreshToken?(): Promise<string>;
}

export class LocalStorageAuthStrategy implements AuthenticationStrategy {
  getToken(): Promise<string | null> {
    return Promise.resolve(localStorage.getItem('accessToken'));
  }

  isTokenValid(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      const decoded: { exp?: number } = jwtDecode(token);
      return decoded.exp ? decoded.exp > Date.now() / 1000 : false;
    } catch {
      return false;
    }
  }
}

export class AuthenticationService {
  private strategy: AuthenticationStrategy;

  constructor(strategy: AuthenticationStrategy = new LocalStorageAuthStrategy()) {
    this.strategy = strategy;
  }

  async getValidToken(): Promise<string | null> {
    if (!this.strategy.isTokenValid()) {
      // Lógica de refresh token ou reautenticação
      return null;
    }
    return this.strategy.getToken();
  }
}
