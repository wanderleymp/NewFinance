import api from './api';

const paymentDocumentTypeService = {
  async getPaymentDocumentTypes() {
    try {
      const response = await api.get('/payment-document-types');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tipos de documentos de pagamento:', error);
      throw error;
    }
  },

  async getPaymentDocumentTypeById(id) {
    try {
      const response = await api.get(`/payment-document-types/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar tipo de documento de pagamento ${id}:`, error);
      throw error;
    }
  }
};

export default paymentDocumentTypeService;
