// Utilitários de autenticação
import axios from 'axios';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'user_data';

// Configuração do axios para requisições autenticadas
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://dev.agilefinance.com.br'
});

// Configuração dos interceptors
api.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newTokens = await refreshToken();
        setToken(newTokens.accessToken);
        setRefreshToken(newTokens.refreshToken);
        
        originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const setRefreshToken = (refreshToken) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const removeRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Função para renovar o token
export const refreshToken = async () => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('Refresh token não encontrado');
  }

  try {
    const response = await api.post('/auth/refresh', { refreshToken });
    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken
    };
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    logout();
    throw error;
  }
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const setUserData = (userData) => {
  console.log('Armazenando dados do usuário:', {
    username: userData.username,
    roles: userData.roles,
    timestamp: new Date().toISOString()
  });

  if (!userData.roles) {
    console.warn('Dados do usuário sem roles, atribuindo role padrão', {
      username: userData.username,
      timestamp: new Date().toISOString()
    });
    userData.roles = ['consulta'];
  }

  if (!Array.isArray(userData.roles)) {
    console.error('Roles do usuário devem ser um array', {
      username: userData.username,
      roles: userData.roles,
      timestamp: new Date().toISOString()
    });
    throw new Error('Roles do usuário devem ser um array');
  }

  localStorage.setItem(USER_KEY, JSON.stringify(userData));
};

// Verificar roles do usuário
export const hasRole = (requiredRole) => {
  const userData = getUserData();
  
  console.log('Verificando role:', {
    requiredRole,
    userRoles: userData?.roles,
    timestamp: new Date().toISOString()
  });

  if (!userData?.roles) {
    console.warn('Roles do usuário não encontradas', {
      username: userData?.username,
      timestamp: new Date().toISOString()
    });
    return false;
  }

  if (!Array.isArray(userData.roles)) {
    console.error('Roles do usuário devem ser um array', {
      username: userData?.username,
      roles: userData.roles,
      timestamp: new Date().toISOString()
    });
    return false;
  }

  const hasRole = userData.roles.includes(requiredRole);
  console.log('Resultado da verificação de role:', {
    hasRole,
    username: userData?.username,
    timestamp: new Date().toISOString()
  });
  return hasRole;
};

export const getUserData = () => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const removeUserData = () => {
  localStorage.removeItem(USER_KEY);
};

export const logout = () => {
  removeToken();
  removeRefreshToken();
  removeUserData();
  window.location.href = '/login';
};

// Limpar todos os dados de autenticação
export const clearAuthData = () => {
  removeToken();
  removeRefreshToken();
  removeUserData();
};

// Validação de token JWT
const validateToken = (token) => {
  if (!token) return false;
  
  try {
    const [header, payload, signature] = token.split('.');
    
    // Verificar estrutura básica
    if (!header || !payload || !signature) {
      console.warn('Token JWT inválido: estrutura incorreta');
      return false;
    }

    // Decodificar payload
    const decodedPayload = JSON.parse(window.atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    // Verificar expiração
    if (!decodedPayload.exp || decodedPayload.exp < Date.now() / 1000) {
      console.warn('Token JWT expirado');
      return false;
    }

    // Verificar claims básicas
    if (!decodedPayload.sub || !decodedPayload.iat) {
      console.warn('Token JWT inválido: claims ausentes');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return false;
  }
};

// Verificar autenticação
export const isAuthenticated = () => {
  const token = getToken();
  
  console.log('Verificando autenticação...', {
    timestamp: new Date().toISOString()
  });

  // Verificação inicial
  if (!token) {
    console.debug('Nenhum token encontrado', {
      timestamp: new Date().toISOString()
    });
    return false;
  }

  // Validação completa do token
  if (!validateToken(token)) {
    console.warn('Token inválido ou expirado', {
      timestamp: new Date().toISOString()
    });
    removeToken();
    removeUserData();
    return false;
  }

  // Verificar se o usuário tem roles válidas
  const userData = getUserData();
  if (!userData?.roles || userData.roles.length === 0) {
    console.warn('Usuário sem roles definidas', {
      username: userData?.username,
      timestamp: new Date().toISOString()
    });
    return false;
  }

  console.log('Usuário autenticado com sucesso:', {
    username: userData.username,
    roles: userData.roles,
    timestamp: new Date().toISOString()
  });

  return true;
};

// Verificar permissões do usuário
export const hasPermission = (requiredPermission) => {
  const userData = getUserData();
  
  if (!userData?.permissions) {
    console.warn('Permissões do usuário não encontradas');
    return false;
  }

  return userData.permissions.includes(requiredPermission);
};
