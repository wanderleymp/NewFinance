import api from './api';

class ChatHistoryService {
  // Buscar histórico de conversas para um contato específico
  async getChatHistory(contactId) {
    try {
      const response = await api.get(`/chat-history/${contactId}`);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar histórico de chat:', error);
      return [];
    }
  }

  // Salvar uma nova mensagem no histórico
  async saveMessage(contactId, message) {
    try {
      const response = await api.post(`/chat-history/${contactId}`, { message });
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar mensagem no histórico:', error);
      return null;
    }
  }

  // Limpar histórico de chat para um contato
  async clearChatHistory(contactId) {
    try {
      await api.delete(`/chat-history/${contactId}`);
      return true;
    } catch (error) {
      console.error('Erro ao limpar histórico de chat:', error);
      return false;
    }
  }
}

export const chatHistoryService = new ChatHistoryService();
