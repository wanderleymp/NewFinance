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
      
      // Verificar se a resposta tem o formato esperado
      if (!response.data || !response.data.items) {
        throw new Error('Formato de resposta inválido');
      }

      // Transformar a resposta para o formato esperado pelo frontend
      const transformedMessages = response.data.items.map(messageItem => {
        // Extrair informações de diferentes níveis
        const message = messageItem.message || messageItem;
        const contact = messageItem.contact || {};

        return {
          id: message.id || messageItem.id,
          content: message.content || messageItem.content,
          contentType: message.contentType || messageItem.contentType,
          senderId: contact.id || message.contactId,
          senderName: contact.name || contact.contact_name || 'Contato Desconhecido',
          createdAt: message.createdAt || messageItem.createdAt,
          status: message.status || messageItem.status,
          direction: message.direction || messageItem.direction,
          formattedTime: message.formattedTime || null
        };
      });

      return {
        data: transformedMessages,
        meta: response.data.meta || {
          totalItems: transformedMessages.length,
          itemCount: transformedMessages.length,
          itemsPerPage: queryParams.limit,
          totalPages: 1,
          currentPage: queryParams.page
        }
      };
    } catch (error) {
      console.error('Erro ao buscar mensagens do chat:', error);
      
      // Fallback para dados mockados com tratamento de erro
      return {
        data: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: queryParams.limit,
          totalPages: 0,
          currentPage: queryParams.page
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
      const transformedChats = response.data.items.map(chatItem => {
        // Extrair informações de diferentes níveis
        const chat = chatItem.chat;
        const channel = chatItem.channel;
        const lastMessage = chatItem.lastMessage;
        const participants = chatItem.participants || [];

        // Encontrar o primeiro participante com nome
        const participant = participants.length > 0 
          ? participants.find(p => p.contact_name) || participants[0]
          : null;

        return {
          id: chat.id,
          name: participant?.contact_name || channel.name || `Chat #${chat.id}`,
          channelId: channel.id,
          channelName: channel.name,
          lastMessage: lastMessage?.content || 'Sem mensagens',
          lastMessageTime: lastMessage?.formattedTime || null,
          contactId: participant?.contact_id || null,
          unreadCount: parseInt(chat.unreadCount || '0'),
          status: chat.status,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt || chat.createdAt,
          allowReply: chat.allowReply,
          messageDirection: lastMessage?.direction || null,
          messageStatus: chatItem.messageStatus
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
