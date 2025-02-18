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
    const queryParams = {
      page: 1,
      limit: 50,
      ...params
    };

    try {
      const response = await this.api.get(`/chats/${chatId}/messages`, { params: queryParams });
      const transformedMessages = response.data.items.map(message => ({
        id: message.id,
        content: message.content,
        contentType: message.contentType,
        senderId: message.contactId,
        senderName: message.contactName,
        createdAt: message.createdAt,
        status: message.status
      }));

      return {
        data: transformedMessages,
        meta: response.data.meta
      };
    } catch (error) {
      console.error('Erro ao buscar mensagens do chat:', error);
      
      // Fallback para dados mockados se a requisição falhar
      return {
        data: [
          {
            id: 1,
            content: 'Mensagem de exemplo',
            contentType: 'text',
            senderId: 6,
            senderName: 'Wanderley Pinheiro',
            createdAt: new Date().toISOString(),
            status: 'SENT'
          }
        ],
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 50,
          totalPages: 1,
          currentPage: 1
        }
      };
    }
  }

  /**
   * Busca lista de chats do usuário
   * @param {Object} params - Parâmetros de busca opcional
   * @returns {Promise} Lista de chats
   */
  async getChatList(params = {}) {
    // Definir parâmetros padrão
    const queryParams = {
      page: 1,
      limit: 20,
      ...params
    };

    try {
      const response = await this.api.get('/chats', { params: queryParams });
      
      // Transformar a resposta para o formato esperado pelo frontend
      const transformedChats = response.data.items.map(chat => {
        // Tratamento avançado para participants
        const participant = chat.participants && chat.participants.length > 0 
          ? chat.participants[0] 
          : { 
              contact_id: chat.id, 
              contact_name: `Chat #${chat.id}`, 
              role: 'UNKNOWN',
              status: 'INACTIVE'
            };

        return {
          id: chat.id,
          name: participant.contact_name || `Chat #${chat.id}`,
          lastMessage: chat.lastMessageContent || 'Sem mensagens',
          channelId: chat.channelId,
          contactId: participant.contact_id,
          unreadCount: parseInt(chat.unreadCount || '0'),
          status: chat.status,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt || chat.createdAt,
          allowReply: chat.allowReply,
          totalCount: parseInt(chat.totalCount || '0'),
          participantRole: participant.role,
          participantStatus: participant.status
        };
      });

      return {
        data: transformedChats,
        meta: response.data.meta
      };
    } catch (error) {
      console.error('Erro ao buscar lista de chats:', error);
      
      // Fallback para dados mockados com tratamento de erro
      return {
        data: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: 20,
          totalPages: 0,
          currentPage: 1
        }
      };
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
