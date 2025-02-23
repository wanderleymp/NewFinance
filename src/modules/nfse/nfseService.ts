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
  },

  async atualizarStatus(nfseId: number): Promise<any> {
    try {
      console.log('🔄 Atualizando status da NFSe:', nfseId);
      const response = await api.post(`/nfse/${nfseId}/atualizar-status`);
      console.log('✅ Status atualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      throw error;
    }
  },

  async recuperarPdf(nfseId: number): Promise<any> {
    try {
      console.log('📄 Recuperando PDF da NFSe:', nfseId);
      const response = await api.post(`/nfse/${nfseId}/recuperar-pdf`);
      console.log('📎 PDF recuperado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao recuperar PDF:', error);
      throw error;
    }
  }
};
