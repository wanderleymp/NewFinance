// Utilitários de autenticação

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const setUserData = (userData) => {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
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
  removeUserData();
  window.location.href = '/login';
};

export const isAuthenticated = () => {
  const token = getToken();
  
  // Verificação simples de token
  if (!token) return false;

  try {
    // Se você estiver usando tokens JWT, pode adicionar validação adicional aqui
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const payload = JSON.parse(window.atob(base64));
    
    // Verificar expiração do token
    return payload.exp > Date.now() / 1000;
  } catch (error) {
    // Token inválido
    return false;
  }
};
