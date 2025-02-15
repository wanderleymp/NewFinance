import BaseService from './baseService';
import { jwtDecode } from "jwt-decode";

export class AuthService extends BaseService {
  constructor() {
    super('/auth');
  }

  async login(username, password) {
    try {
      const response = await this.api.post('/auth/login', { username, password });
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
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
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
      const userString = localStorage.getItem('user');
      let user = null;

      if (userString) {
        try {
          user = JSON.parse(userString);
        } catch (parseError) {
          console.error('Erro ao parsear usuário:', parseError);
        }
      }

      const decodedToken = jwtDecode(token);
      const tokenUser = {
        user_id: decodedToken.sub,
        username: decodedToken.username,
        profile_id: decodedToken.profile_id || null,
        enable_2fa: decodedToken.enable_2fa || false
      };

      // Prioriza usuário do localStorage, senão usa do token
      const mappedUser = {
        id: user?.user_id || tokenUser.user_id,
        username: user?.username || tokenUser.username,
        profile_id: user?.profile_id || tokenUser.profile_id,
        enable_2fa: user?.enable_2fa || tokenUser.enable_2fa
      };

      console.log(' Usuário recuperado:', mappedUser);
      return mappedUser;
    } catch (error) {
      console.error('Erro ao recuperar usuário atual:', error);
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
