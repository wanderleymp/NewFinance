export const environment = {
  development: {
    apiUrl: import.meta.env.VITE_API_URL || 'https://dev.agilefinance.com.br'
  },
  production: {
    apiUrl: import.meta.env.VITE_API_URL || 'https://api.agilefinance.com.br'
  }
};

export const getCurrentEnvironment = () => {
  return import.meta.env.MODE === 'production' 
    ? environment.production 
    : environment.development;
};
