import BaseService from './baseService';
import { authService } from './authService';
import socketIoService from './socketIoService';

class ChatMessagesService extends BaseService {
  constructor() {
    super('/chats'); // Definindo o endpoint base como /chats
    this.isWebSocketEnabled = false;
    this.initSocketIo();
  }

  /**
   * Inicializa a conexão Socket.IO
   */
  initSocketIo() {
    console.log('Inicializando Socket.IO para o serviço de chat');
    
    try {
      // Verificar se o Socket.IO está habilitado
      this.isWebSocketEnabled = true;
      
      // Tentar conectar o Socket.IO
      socketIoService.connect()
        .then(() => {
          console.log('Socket.IO conectado com sucesso no serviço de chat');
          
          // Registrar o status da conexão
          const removeConnectionListener = socketIoService.onConnectionChange((isConnected, error) => {
            console.log(`Estado da conexão Socket.IO alterado: ${isConnected ? 'Conectado' : 'Desconectado'}`);
            this.isWebSocketEnabled = isConnected;
            
            if (error) {
              console.error('Erro na conexão Socket.IO no serviço de chat:', error);
            }
          });
          
          // Armazenar o listener para poder removê-lo posteriormente
          this.connectionListener = removeConnectionListener;
        })
        .catch(error => {
          console.error('Erro ao conectar Socket.IO no serviço de chat:', error);
          console.log('Verificando se é possível continuar com fallback HTTP');
          
          // Mesmo com erro, tentar manter o serviço funcionando com HTTP
          this.isWebSocketEnabled = false;
          
          // Se for erro de autenticação, registrar informação adicional
          if (error.message === 'Erro na autenticação') {
            console.warn('Erro de autenticação no Socket.IO. Verifique se o token está sendo enviado corretamente e se o backend está configurado para aceitá-lo.');
            console.log('O sistema continuará funcionando com requisições HTTP normais.');
          }
        });
    } catch (error) {
      console.error('Erro ao inicializar Socket.IO no serviço de chat:', error);
      this.isWebSocketEnabled = false;
    }
  }

  /**
   * Obtém os headers de autenticação para as requisições
   * @returns {Object} Headers de autenticação
   */
  getHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  }

  /**
   * Gera mensagens mockadas para um chat
   * @param {number} chatId - ID do chat
   * @returns {Array} Array de mensagens mockadas
   * @private
   */
  _createMockMessages(chatId) {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const fiveMinutesAgo = new Date(now.getTime() - 300000);
    const tenMinutesAgo = new Date(now.getTime() - 600000);
    const fifteenMinutesAgo = new Date(now.getTime() - 900000);
    
    // Criar mensagens diferentes dependendo do chatId para simular conversas diferentes
    const mockMessages = [
      {
        id: `mock-${chatId}-1`,
        chatId: chatId,
        content: 'Olá, como posso ajudar?',
        contentType: 'TEXT',
        direction: 'INBOUND',
        sender: 'them',
        createdAt: fifteenMinutesAgo.toISOString(),
        status: 'read'
      },
      {
        id: `mock-${chatId}-2`,
        chatId: chatId,
        content: 'Preciso de informações sobre minha conta.',
        contentType: 'TEXT',
        direction: 'OUTBOUND',
        sender: 'me',
        createdAt: tenMinutesAgo.toISOString(),
        status: 'delivered'
      },
      {
        id: `mock-${chatId}-3`,
        chatId: chatId,
        content: 'Claro, vou verificar seus dados. Um momento por favor.',
        contentType: 'TEXT',
        direction: 'INBOUND',
        sender: 'them',
        createdAt: fiveMinutesAgo.toISOString(),
        status: 'received'
      }
    ];
    
    // Adicionar mensagens específicas para cada chat
    if (chatId === 215) {
      mockMessages.push({
        id: `mock-${chatId}-4`,
        chatId: chatId,
        content: 'Verifiquei aqui e sua conta está em dia. O próximo pagamento vence em 10 dias.',
        contentType: 'TEXT',
        direction: 'INBOUND',
        sender: 'them',
        createdAt: oneMinuteAgo.toISOString(),
        status: 'received'
      });
    } else if (chatId === 214) {
      mockMessages.push({
        id: `mock-${chatId}-4`,
        chatId: chatId,
        content: 'Você pode me enviar o comprovante de pagamento?',
        contentType: 'TEXT',
        direction: 'INBOUND',
        sender: 'them',
        createdAt: oneMinuteAgo.toISOString(),
        status: 'received'
      });
    }
    
    return mockMessages;
  }

  /**
   * Processa a resposta da API de mensagens
   * @param {Object} response - Resposta da API
   * @returns {Object} Dados processados
   * @private
   */
  _processMessagesResponse(response) {
    console.log('Resposta da API de mensagens:', response);
    
    // Verificar se a resposta já está no formato esperado
    if (response && response.items) {
      console.log('Resposta da API já está no formato esperado:', response);
      return response;
    }
    
    // Verificar se a resposta tem um formato válido
    if (!response) {
      console.error('Resposta da API inválida');
      return { items: [], meta: { total: 0, page: 1, limit: 50 } };
    }
    
    // Extrair mensagens da resposta
    const messages = response.messages || response.data || response.items || [];
    console.log(`Processando ${messages.length} mensagens`);
    
    // Transformar mensagens para o formato esperado
    const transformedMessages = messages.map(message => {
      // Determinar direção da mensagem
      const direction = message.direction || 
                        (message.sender === 'me' ? 'OUTBOUND' : 'INBOUND');
      
      // Determinar tipo de conteúdo
      const contentType = message.contentType || 
                          (message.isFile ? 'FILE' : 
                           message.isDocument ? 'DOCUMENT' : 'TEXT');
      
      return {
        id: message.id,
        chatId: message.chatId,
        content: message.content,
        contentType: contentType,
        direction: direction,
        sender: direction === 'OUTBOUND' ? 'me' : 'them',
        timestamp: message.createdAt || message.timestamp,
        status: message.status || 'sent',
        // Campos adicionais para arquivos
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        fileType: message.fileType
      };
    });
    
    return {
      items: transformedMessages,
      meta: response.meta || {
        total: transformedMessages.length,
        page: 1,
        limit: 50
      }
    };
  }

  /**
   * Busca mensagens de um chat específico
   * @param {number} chatId - ID do chat
   * @param {Object} params - Parâmetros de busca
   * @returns {Promise} Lista de mensagens
   */
  async getChatMessages(chatId, params = {}) {
    try {
      console.log(`Buscando mensagens para o chat ${chatId}`);
      
      // Configurar parâmetros padrão
      const defaultParams = {
        page: 1,
        limit: 50
      };
      
      const queryParams = { ...defaultParams, ...params };
      
      // Configurar headers
      const headers = this.getHeaders();
      console.log('Headers da requisição:', headers);
      
      // Fazer requisição - Usando a rota correta /chats em vez de /chat
      console.log(`Fazendo requisição para /chats/${chatId}/messages`);
      const response = await this.api.get(`/chats/${chatId}/messages`, {
        params: queryParams,
        headers
      });
      
      // Processar resposta
      const data = this._processMessagesResponse(response.data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar mensagens do chat:', error);
      
      // Usar dados mockados para qualquer tipo de erro
      console.log(`Usando mensagens mockadas para o chat ${chatId} devido a erro: ${error.message}`);
      
      // Retornar dados mockados
      return {
        items: this._createMockMessages(chatId),
        meta: {
          total: 3,
          page: 1,
          limit: 50,
          isMock: true
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
      
      // Preparar dados da mensagem
      const messagePayload = {
        content: messageData.content,
        contentType: messageData.contentType || 'TEXT',
        channel_id: messageData.channelId || 6,
        contact_id: contactId
      };
      
      console.log('Dados completos para envio de mensagem:', {
        chatId,
        ...messagePayload
      });
      
      // Tentar enviar via Socket.IO
      try {
        console.log('Tentando enviar mensagem via Socket.IO');
        
        const socketPayload = {
          content: messageData.content,
          contentType: messageData.contentType || 'TEXT',
          channelId: messageData.channelId || 6,
          contactId: contactId
        };
        
        const response = await socketIoService.sendMessage(chatId, socketPayload);
        console.log('Mensagem enviada com sucesso via Socket.IO:', response);
        
        return {
          id: response.id || Date.now().toString(),
          chatId: chatId,
          content: messageData.content,
          contentType: messageData.contentType || 'TEXT',
          direction: 'OUTBOUND',
          sender: 'me',
          timestamp: response.timestamp || new Date().toISOString(),
          status: 'sent'
        };
      } catch (socketError) {
        console.warn('Falha ao enviar via Socket.IO, usando fallback HTTP:', socketError.message);
        // Continua para o fallback HTTP
      }
      
      // Fallback para HTTP se Socket.IO não estiver disponível ou falhar
      const response = await this.api.post(`/chats/${chatId}/messages`, messagePayload);
      
      console.log('Resposta do envio de mensagem via HTTP:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  /**
   * Registra um callback para novas mensagens em um chat específico
   * @param {number} chatId - ID do chat
   * @param {Function} callback - Função a ser chamada quando uma nova mensagem chegar
   * @returns {Function} Função para remover o callback
   */
  onNewMessage(chatId, callback) {
    if (this.isWebSocketEnabled) {
      // Usar o método onChatEvent do socketIoService para o evento 'message'
      return socketIoService.onChatEvent(chatId, 'message', callback);
    }
    
    // Retornar uma função vazia se Socket.IO não estiver disponível
    return () => {};
  }

  /**
   * Envia um indicador de digitação
   * @param {number} chatId - ID do chat
   * @param {boolean} isTyping - Se está digitando ou parou
   * @returns {boolean} Sucesso do envio
   */
  sendTypingIndicator(chatId, isTyping) {
    try {
      console.log(`Enviando indicador de digitação para o chat ${chatId}: ${isTyping ? 'digitando' : 'parou de digitar'}`);
      
      // Usar Socket.IO para enviar o indicador de digitação
      socketIoService.sendTypingEvent(chatId, isTyping);
      return true;
    } catch (error) {
      console.error('Erro ao enviar indicador de digitação:', error);
      return false;
    }
  }

  /**
   * Registra um callback para indicadores de digitação
   * @param {number} chatId - ID do chat
   * @param {Function} callback - Função a ser chamada quando alguém estiver digitando
   * @returns {Function} Função para remover o callback
   */
  onTypingIndicator(chatId, callback) {
    if (this.isWebSocketEnabled) {
      // Usar o método onChatEvent do socketIoService para o evento 'typing'
      return socketIoService.onChatEvent(chatId, 'typing', callback);
    }
    
    // Retornar uma função vazia se Socket.IO não estiver disponível
    return () => {};
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
