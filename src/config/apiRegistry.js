import { getCurrentEnvironment } from './environment';

export const API_PROVIDERS = {
  MAIN_BACKEND: {
    url: getCurrentEnvironment().apiUrl,
    type: 'rest'
  }
};
