import BaseService from './baseService';
import { authService } from './authService';

class ChatMessagesService extends BaseService {
  constructor() {
    super('/chat-messages');
  }

  /**
   * Busca mensagens de um chat específico
   * @param {number} chatId - ID do chat
   * @param {Object} params - Parâmetros de busca
   * @returns {Promise} Lista de mensagens
   */
  async getChatMessages(chatId, params = {}) {
    try {
      const response = await this.api.get(`/${chatId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar mensagens do chat:', error);
      throw error;
    }
  }

  /**
   * Envia uma nova mensagem
   * @param {Object} messageData - Dados da mensagem
   * @param {number} messageData.channelId - Canal de comunicação
   * @param {number|null} messageData.chatId - ID do chat (pode ser null)
   * @param {number} messageData.contactId - ID do contato destinatário
   * @param {string} messageData.content - Conteúdo da mensagem
   * @param {string} messageData.contentType - Tipo de conteúdo
   * @returns {Promise} Mensagem enviada
   */
  async sendMessage(messageData) {
    try {
      // Validar dados obrigatórios
      if (!messageData.channelId || !messageData.contactId) {
        throw new Error('channelId e contactId são obrigatórios');
      }

      // Preparar payload completo
      const payload = {
        channelId: messageData.channelId,
        chatId: messageData.chatId || null, // Permite enviar com chatId null
        contactId: messageData.contactId,
        content: messageData.content,
        contentType: messageData.contentType || 'TEXT',
        senderId: authService.getCurrentUser()?.id // Obtém ID do usuário logado
      };

      // Enviar mensagem para o novo endpoint
      const response = await this.api.post('/send', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  /**
   * Cria um novo chat com a primeira mensagem
   * @param {Object} chatData - Dados para criação do chat
   * @returns {Promise} Dados do novo chat
   */
  async createChatWithFirstMessage(chatData) {
    try {
      const response = await this.api.post('/create-chat', chatData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar chat:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma mensagem existente
   * @param {number} chatId - ID do chat
   * @param {number} messageId - ID da mensagem
   * @param {Object} updateData - Dados para atualização
   * @returns {Promise} Mensagem atualizada
   */
  async updateMessage(chatId, messageId, updateData) {
    try {
      const response = await this.api.patch(`/${chatId}/messages/${messageId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar mensagem:', error);
      throw error;
    }
  }

  /**
   * Exclui uma mensagem específica
   * @param {number} chatId - ID do chat
   * @param {number} messageId - ID da mensagem
   * @returns {Promise} Resultado da exclusão
   */
  async deleteMessage(chatId, messageId) {
    try {
      const response = await this.api.delete(`/${chatId}/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error);
      throw error;
    }
  }

  /**
   * Marca mensagens como lidas
   * @param {number} chatId - ID do chat
   * @param {Array} messageIds - Lista de IDs de mensagens
   * @returns {Promise} Resultado da marcação
   */
  async markMessagesAsRead(chatId, messageIds) {
    try {
      const response = await this.api.post(`/${chatId}/read`, { messageIds });
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      throw error;
    }
  }
}

export default new ChatMessagesService();
