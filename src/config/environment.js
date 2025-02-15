export const environment = {
  development: {
    apiUrl: process.env.VITE_API_URL
  },
  production: {
    apiUrl: process.env.VITE_API_URL
  }
};

export const getCurrentEnvironment = () => {
  return process.env.NODE_ENV === 'production' 
    ? environment.production 
    : environment.development;
};
