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
      // Corrigido para usar método PUT e o endpoint correto
      const response = await api.put(`/nfse/${nfseId}/update-status`);
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
      // Corrigido para usar o endpoint correto
      const response = await api.post(`/nfse/${nfseId}/pdf`);
      console.log('📎 PDF recuperado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao recuperar PDF:', error);
      throw error;
    }
  }
};
