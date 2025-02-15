import BaseService from './baseService';
import { jwtDecode } from "jwt-decode";

export class AuthService extends BaseService {
  constructor() {
    super('/auth');
  }

  async login(username, password) {
    try {
      const response = await this.api.post('/login', { username, password });
      const { accessToken } = response.data;
      
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  logout() {
    localStorage.removeItem('accessToken');
  }

  isAuthenticated() {
    const token = localStorage.getItem('accessToken');
    
    if (!token) return false;

    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  }

  getCurrentUser() {
    const token = localStorage.getItem('accessToken');
    
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  }

  getTokenInfo() {
    const token = localStorage.getItem('accessToken');
    
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return {
        userId: decoded.sub,
        username: decoded.username,
        role: decoded.role,
        exp: decoded.exp
      };
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();
