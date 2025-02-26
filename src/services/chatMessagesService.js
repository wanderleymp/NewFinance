import BaseService from './baseService';
import { authService } from './authService';

class ChatMessagesService extends BaseService {
  constructor() {
    super('/chats'); // Definindo o endpoint base como /chats
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
      // Log dos headers antes da requisição
      const token = localStorage.getItem('accessToken');
      console.log('Headers da requisição:', {
        Authorization: token ? `Bearer ${token}` : 'Não presente',
        'Content-Type': 'application/json'
      });

      const response = await this.api.get(`/chat/${chatId}/messages`, { 
        params: queryParams,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Estrutura completa da resposta da API:', response.data); // Log para verificar a estrutura completa da resposta
      
      // Verificar se a resposta tem o formato esperado
      if (!response.data || !response.data.items) {
        throw new Error('Formato de resposta inválido');
      }

      // Log detalhado da primeira mensagem para análise
      if (response.data.items && response.data.items.length > 0) {
        console.log('Exemplo de mensagem recebida:', JSON.stringify(response.data.items[0], null, 2));
      }

      // Transformar a resposta para o formato esperado pelo frontend
      // Se a resposta vier dentro de messages, use isso, caso contrário use a resposta direta
      const messages = response.data.messages || response.data.items || [];
      
      console.log(`Processando ${messages.length} mensagens`);
      
      const transformedMessages = messages.map((messageItem, index) => {
        // Log detalhado para cada mensagem (apenas as primeiras 3 para não sobrecarregar o console)
        if (index < 3) {
          console.log(`Mensagem ${index}:`, JSON.stringify(messageItem, null, 2));
        }
        
        // Extrair informações de diferentes níveis
        const message = messageItem.message || messageItem;
        const contact = messageItem.contact || {};
        
        // Verificar propriedades para debug
        const hasContent = !!message.content || !!messageItem.content;
        const hasFileUrl = !!message.fileUrl || !!messageItem.fileUrl || !!message.url || !!messageItem.url;
        const hasType = !!message.type || !!messageItem.type || !!message.contentType || !!messageItem.contentType;
        
        // Log de propriedades importantes para debug
        if (index < 3) {
          console.log(`Mensagem ${index} - Propriedades:`, {
            id: message.id || messageItem.id,
            content: message.content || messageItem.content,
            type: message.type || messageItem.type,
            contentType: message.contentType || messageItem.contentType,
            fileUrl: message.fileUrl || messageItem.fileUrl || message.url || messageItem.url,
            hasContent,
            hasFileUrl,
            hasType
          });
        }

        // Verificar se é um documento baseado no tipo, contentType ou outras propriedades
        const isDocument = 
          message.type === 'document' || 
          messageItem.type === 'document' || 
          message.contentType === 'DOCUMENT' || 
          messageItem.contentType === 'DOCUMENT' ||
          message.type === 'DOCUMENT' || 
          messageItem.type === 'DOCUMENT' ||
          (message.content && message.content.includes('http') && (message.content.includes('.pdf') || message.content.includes('.doc')));
        
        // Verificar se é um arquivo baseado no tipo, contentType ou presença de URL
        const isFile = 
          message.type === 'file' || 
          messageItem.type === 'file' || 
          message.contentType === 'FILE' || 
          messageItem.contentType === 'FILE' ||
          message.type === 'FILE' || 
          messageItem.type === 'FILE' ||
          message.fileUrl || 
          messageItem.fileUrl ||
          message.url || 
          messageItem.url ||
          (message.content && (
            message.content.includes('http') && 
            (message.content.includes('.jpg') || 
             message.content.includes('.png') || 
             message.content.includes('.pdf') || 
             message.content.includes('.doc'))
          ));
        
        // Determinar URL do arquivo - verificar em várias propriedades possíveis
        let fileUrl = message.fileUrl || messageItem.fileUrl || message.url || messageItem.url || '';
        
        // Se não encontrou URL nas propriedades específicas, procurar no conteúdo da mensagem
        if (!fileUrl && message.content && message.content.includes('http')) {
          // Extrair URL do conteúdo da mensagem usando regex
          const urlMatch = message.content.match(/(https?:\/\/[^\s]+)/g);
          if (urlMatch && urlMatch.length > 0) {
            fileUrl = urlMatch[0];
          }
        }
        
        // Determinar o tipo de arquivo baseado na extensão
        let fileType = 'document';
        if (fileUrl) {
          const extension = fileUrl.split('.').pop().toLowerCase();
          if (['pdf'].includes(extension)) {
            fileType = 'pdf';
          } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
            fileType = 'image';
          } else if (['doc', 'docx'].includes(extension)) {
            fileType = 'document';
          }
        }
        
        // Log para debug de arquivos
        if ((isDocument || isFile) && index < 5) {
          console.log(`Mensagem ${index} - Arquivo detectado:`, {
            isDocument,
            isFile,
            fileUrl,
            fileType,
            content: message.content || messageItem.content
          });
        }
        
        // Determinar nome do arquivo
        let filename = message.documentName || messageItem.documentName || message.fileName || messageItem.fileName;
        if (!filename && fileUrl) {
          // Extrair nome do arquivo da URL
          const urlParts = fileUrl.split('/');
          filename = urlParts[urlParts.length - 1];
        }
        
        return {
          id: message.id || messageItem.id,
          content: message.content || messageItem.content,
          contentType: message.contentType || messageItem.contentType || (isDocument ? 'DOCUMENT' : isFile ? 'FILE' : 'TEXT'),
          senderId: contact.id || message.contactId,
          senderName: contact.name || contact.contact_name || 'Contato Desconhecido',
          createdAt: message.createdAt || messageItem.createdAt,
          status: message.status || messageItem.status,
          direction: message.direction || messageItem.direction,
          formattedTime: message.formattedTime || null,
          // Informações de arquivo e documento
          isDocument,
          isFile: isFile || isDocument,
          fileUrl,
          fileType,
          document: (isDocument || isFile) ? {
            filename: filename || 'Documento',
            url: fileUrl,
            type: fileType
          } : null
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
      
      // Verificar se a resposta já está no formato esperado
      if (response.data && 
          response.data.items && 
          Array.isArray(response.data.items) && 
          response.data.meta) {
        
        console.log('Resposta da API já está no formato esperado:', response.data);
        return response.data;
      }
      
      // Caso contrário, transformar para o formato esperado
      const items = (response.data.items || []).map(chat => {
        return {
          id: chat.id,
          name: chat.name || `Chat #${chat.id}`,
          channel_id: chat.channelId || chat.channel_id || 6,
          channelType: chat.channelType || "zap6595",
          contactValue: chat.contactValue || chat.value || "",
          lastContactId: chat.contactId || chat.lastContactId || 0,
          avatar: chat.avatar || "",
          lastMessage: {
            content: chat.lastMessage?.content || "",
            type: chat.lastMessage?.contentType || "TEXT",
            fileUrl: chat.lastMessage?.fileUrl || null,
            status: chat.lastMessage?.status || "SENT",
            timestamp: chat.lastMessage?.timestamp || new Date().toISOString()
          },
          unreadCount: chat.unread?.toString() || "0",
          isGroup: chat.isGroup || false,
          isMuted: chat.isMuted || false,
          isPinned: chat.isPinned || false,
          contactStatus: chat.contactStatus || "OFFLINE"
        };
      });
      
      return {
        items: items,
        meta: {
          totalItems: items.length,
          itemCount: items.length,
          itemsPerPage: queryParams.limit,
          totalPages: Math.ceil(items.length / queryParams.limit),
          currentPage: queryParams.page
        }
      };
    } catch (error) {
      console.error('Erro ao buscar lista de chats:', error);
      
      // Retornar o formato mockado exato conforme solicitado
      return {
        items: [
          {
            id: 215,
            name: "Wanderley Antigo",
            channel_id: 6,
            channelType: "zap6595",
            contactValue: "5569984049494",
            lastContactId: 178,
            avatar: "",
            lastMessage: {
              content: "ola",
              type: "TEXT",
              fileUrl: null,
              status: "SENT",
              timestamp: "2025-02-23T23:32:14.612Z"
            },
            unreadCount: "27",
            isGroup: false,
            isMuted: false,
            isPinned: false,
            contactStatus: "OFFLINE"
          },
          {
            id: 214,
            name: "69999768281",
            channel_id: 6,
            channelType: "zap6595",
            contactValue: "69999768281",
            lastContactId: 216,
            avatar: "",
            lastMessage: {
              content: "oi",
              type: "TEXT",
              fileUrl: null,
              status: "DELIVERED",
              timestamp: "2025-02-21T20:20:07.912Z"
            },
            unreadCount: "3",
            isGroup: false,
            isMuted: false,
            isPinned: false,
            contactStatus: "OFFLINE"
          }
        ],
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 20,
          totalPages: 1,
          currentPage: 1
        }
      };
    }
  }

  /**
   * Envia uma nova mensagem para um chat
   * @param {number} chatId - ID do chat
   * @param {Object} messageData - Dados da mensagem a ser enviada
   * @returns {Promise} Mensagem enviada
   */
  async sendMessage(chatId, messageData) {
    try {
      console.log('Enviando mensagem para o chat:', {
        chatId,
        messageData
      });
      
      // Usar o lastContactId que já vem nos dados do chat
      const contactId = messageData.contactId || messageData.lastContactId;
      
      if (!contactId) {
        console.error('Erro: contactId não fornecido para envio de mensagem');
        throw new Error('contactId é obrigatório para enviar mensagem');
      }
      
      console.log('Dados completos para envio de mensagem:', {
        chatId,
        content: messageData.content,
        contentType: messageData.contentType || 'TEXT',
        channel_id: messageData.channelId || 6,
        contact_id: contactId
      });
      
      const response = await this.api.post(`/chats/${chatId}/messages`, {
        content: messageData.content,
        contentType: messageData.contentType || 'TEXT',
        channel_id: messageData.channelId || 6,
        contact_id: contactId
      });
      
      console.log('Resposta do envio de mensagem:', response.data);
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
