import api from '../../services/api';
import { NfseListResponse, NfseListParams } from './nfseTypes';

export const nfseService = {
  async listNfse(params?: NfseListParams): Promise<NfseListResponse> {
    try {
      console.log('🔍 Buscando NFSes com parâmetros:', params);
      const response = await api.get('/nfse', { params });
      console.log('🎉 NFSes encontradas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar NFSes:', error);
      throw error;
    }
  }
};
