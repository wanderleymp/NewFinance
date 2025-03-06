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
      // Verificar várias propriedades possíveis para determinar o tipo de conteúdo
      let contentType = message.contentType || message.content_type;
      
      // Se ainda não tiver contentType, tentar inferir pelo tipo de mensagem
      if (!contentType) {
        if (message.isFile || message.is_file || message.fileUrl || (message.metadata && message.metadata.fileUrl)) {
          contentType = 'FILE';
        } else if (message.isDocument || message.is_document || 
                  (message.type && (message.type.toUpperCase() === 'DOCUMENT' || message.type.toUpperCase() === 'FILE'))) {
          contentType = 'DOCUMENT';
        } else {
          contentType = 'TEXT';
        }
      }
      
      // Mapear os campos da API para o formato esperado pelo componente
      return {
        id: message.id || message.message_id, // Usar message_id como fallback
        chatId: message.chatId || message.chat_id,
        content: message.content,
        contentType: contentType, // Já garantimos que contentType não será undefined
        isDocument: contentType === 'DOCUMENT',
        isFile: contentType === 'FILE',
        direction: direction,
        sender: direction === 'OUTBOUND' ? 'me' : 'them',
        timestamp: message.createdAt || message.timestamp || message.created_at,
        status: message.status || 'sent',
        // Campos adicionais para arquivos
        fileUrl: message.fileUrl || (message.metadata && message.metadata.fileUrl),
        fileName: message.fileName || (message.metadata && message.metadata.fileName),
        fileType: message.fileType || (message.metadata && message.metadata.fileType),
        // Preservar campos originais para debug
        originalMessage: message
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
  /**
   * Tenta usar um proxy CORS para contornar problemas de certificado SSL
   * @param {string} url - URL a ser acessada
   * @returns {Promise<Object>} - Resposta do proxy
   * @private
   */
  async _useCorsProxy(url) {
    try {
      // Usar um serviço de proxy CORS público como fallback
      const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      console.log('Tentando usar proxy CORS:', corsProxyUrl);
      
      const headers = await this.getHeaders();
      const response = await fetch(corsProxyUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': headers.Authorization
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro no proxy CORS: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao usar proxy CORS:', error);
      throw error;
    }
  }
  
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
      const headers = await this.getHeaders();
      console.log('Headers da requisição:', headers);
      
      // Verificar se estamos em ambiente de desenvolvimento
      const isDevelopment = import.meta.env.DEV;
      console.log('Ambiente de desenvolvimento?', isDevelopment ? 'Sim' : 'Não');
      
      // Fazer requisição - Usando a rota correta /chats em vez de /chat
      console.log(`Fazendo requisição para /chats/${chatId}/messages`);
      
      let responseData;
      try {
        // Tentar primeiro com o proxy do Vite
        const response = await this.api.get(`/chats/${chatId}/messages`, {
          params: queryParams,
          headers,
          timeout: 10000 // 10 segundos
        });
        
        console.log('Resposta da API:', response.status, response.statusText);
        console.log('Primeiras mensagens:', response.data?.items?.slice(0, 2));
        
        responseData = response.data;
      } catch (apiError) {
        console.warn('Erro ao usar API diretamente:', apiError.message);
        
        // Se falhar, tentar com o proxy CORS
        if (isDevelopment) {
          try {
            const apiUrl = import.meta.env.VITE_API_URL || 'https://dev.agilefinance.com.br';
            const fullUrl = `${apiUrl}/chats/${chatId}/messages?page=${queryParams.page}&limit=${queryParams.limit}`;
            responseData = await this._useCorsProxy(fullUrl);
            console.log('Resposta do proxy CORS:', responseData);
          } catch (corsError) {
            console.error('Erro ao usar proxy CORS:', corsError);
            throw apiError; // Manter o erro original
          }
        } else {
          throw apiError;
        }
      }
      
      // Processar resposta
      const data = this._processMessagesResponse(responseData);
      return data;
    } catch (error) {
      console.error('Erro ao buscar mensagens do chat:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: error.config?.url
      });
      
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
      
      // Validar conteúdo da mensagem
      if (!messageData.content) {
        throw new Error('Conteúdo da mensagem não pode ser vazio');
      }
      
      // Verificar se temos um contactId válido
      const contactId = messageData.contactId || messageData.lastContactId;
      
      if (!contactId) {
        console.error('Erro: contactId não fornecido para envio de mensagem');
        console.log('Dados disponíveis:', messageData);
        
        // Tentar obter o chat para extrair o contactId
        try {
          const chatResponse = await this.api.get(`/chats/${chatId}`);
          const chatData = chatResponse.data;
          
          if (chatData && (chatData.lastContactId || chatData.contactId)) {
            console.log('Obtido contactId do chat:', chatData.lastContactId || chatData.contactId);
            messageData.contactId = chatData.lastContactId || chatData.contactId;
          } else {
            throw new Error('contactId é obrigatório para enviar mensagem');
          }
        } catch (chatError) {
          console.error('Erro ao tentar obter dados do chat:', chatError);
          throw new Error('contactId é obrigatório para enviar mensagem');
        }
      }
      
      // Criar um objeto de mensagem temporária para retornar imediatamente
      const tempMessageId = `temp-${Date.now()}`;
      const tempMessage = {
        id: tempMessageId,
        chatId: chatId,
        content: messageData.content,
        contentType: messageData.contentType || 'TEXT',
        isDocument: (messageData.contentType || 'TEXT') === 'DOCUMENT',
        isFile: (messageData.contentType || 'TEXT') === 'FILE',
        direction: 'OUTBOUND',
        sender: 'me',
        timestamp: new Date().toISOString(),
        status: 'sending'
      };
      
      // Preparar dados da mensagem
      const messagePayload = {
        content: messageData.content,
        contentType: messageData.contentType || 'TEXT',
        channel_id: messageData.channelId || 6,
        contact_id: messageData.contactId
      };
      
      console.log('Dados completos para envio de mensagem:', {
        chatId,
        ...messagePayload
      });
      
      // Tentar todas as estratégias de envio em sequência
      let sentMessage = null;
      
      // 1. Tentar Socket.IO primeiro
      if (socketIoService.isConnected && socketIoService.socket) {
        try {
          console.log('Tentando enviar mensagem via Socket.IO');
          
          const socketPayload = {
            content: messageData.content,
            contentType: messageData.contentType || 'TEXT',
            channelId: messageData.channelId || 6,
            contactId: messageData.contactId
          };
          
          // Usar o método sendMessage do socketIoService que já tem timeout interno
          const response = await socketIoService.sendMessage(chatId, socketPayload);
          console.log('Mensagem enviada com sucesso via Socket.IO:', response);
          
          sentMessage = {
            ...tempMessage,
            id: response.id || tempMessage.id,
            timestamp: response.timestamp || tempMessage.timestamp,
            status: 'sent'
          };
          
          return sentMessage;
        } catch (socketError) {
          console.warn('Falha ao enviar via Socket.IO:', socketError.message);
          // Continuar para próxima estratégia
        }
      } else {
        console.log('Socket.IO não está conectado, tentando outras estratégias');
      }
      
      // 2. Tentar HTTP via proxy do Vite
      try {
        console.log('Tentando enviar mensagem via HTTP (proxy Vite)');
        const headers = await this.getHeaders();
        
        const response = await this.api.post(`/chats/${chatId}/messages`, messagePayload, { 
          headers,
          timeout: 8000 // 8 segundos de timeout
        });
        
        console.log('Resposta do envio de mensagem via HTTP (proxy Vite):', response.data);
        
        // Garantir que a resposta tenha todos os campos necessários
        const responseData = response.data;
        sentMessage = {
          ...tempMessage,
          id: responseData.id || responseData.message_id || tempMessage.id,
          timestamp: responseData.timestamp || responseData.created_at || tempMessage.timestamp,
          status: 'sent'
        };
        
        return sentMessage;
      } catch (proxyError) {
        console.warn('Falha ao enviar via HTTP (proxy Vite):', proxyError.message);
        // Continuar para próxima estratégia
      }
      
      // 3. Tentar HTTP direto (sem proxy)
      try {
        // Usar a URL completa da API
        const apiUrl = import.meta.env.VITE_API_URL || 'https://dev.agilefinance.com.br';
        const url = `${apiUrl}/chats/${chatId}/messages`;
        
        console.log('Tentando enviar mensagem via HTTP direto para:', url);
        const headers = await this.getHeaders();
        
        // Usar fetch em vez de axios para ter mais controle
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': headers.Authorization
          },
          body: JSON.stringify(messagePayload)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('Resposta do envio de mensagem via HTTP direto:', responseData);
        
        sentMessage = {
          ...tempMessage,
          id: responseData.id || responseData.message_id || tempMessage.id,
          timestamp: responseData.timestamp || responseData.created_at || tempMessage.timestamp,
          status: 'sent'
        };
        
        return sentMessage;
      } catch (directHttpError) {
        console.error('Falha ao enviar via HTTP direto:', directHttpError.message);
      }
      
      // 4. Tentar via proxy CORS como último recurso
      try {
        console.log('Tentando enviar mensagem via proxy CORS');
        const apiUrl = import.meta.env.VITE_API_URL || 'https://dev.agilefinance.com.br';
        const targetUrl = `${apiUrl}/chats/${chatId}/messages`;
        const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
        
        const headers = await this.getHeaders();
        
        const response = await fetch(corsProxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': headers.Authorization
          },
          body: JSON.stringify(messagePayload)
        });
        
        if (!response.ok) {
          throw new Error(`CORS proxy error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('Resposta do envio de mensagem via proxy CORS:', responseData);
        
        sentMessage = {
          ...tempMessage,
          id: responseData.id || responseData.message_id || tempMessage.id,
          timestamp: responseData.timestamp || responseData.created_at || tempMessage.timestamp,
          status: 'sent'
        };
        
        return sentMessage;
      } catch (corsError) {
        console.error('Falha ao enviar via proxy CORS:', corsError.message);
        throw new Error('Todas as tentativas de envio falharam');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Criar uma resposta de erro formatada para que o componente possa tratar adequadamente
      return {
        id: `error-${Date.now()}`,
        chatId: chatId,
        content: messageData.content,
        contentType: messageData.contentType || 'TEXT',
        direction: 'OUTBOUND',
        sender: 'me',
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Registra um callback para novas mensagens em um chat específico
   * @param {number} chatId - ID do chat
   * @param {Function} callback - Função a ser chamada quando uma nova mensagem chegar
   * @returns {Function} Função para remover o callback
   */
  onNewMessage(chatId, callback) {
    console.log(`Registrando callback para novas mensagens no chat ${chatId}`);
    
    if (!this.isWebSocketEnabled || !socketIoService.isConnected) {
      console.warn(`Socket.IO não está disponível ou conectado. Estado: ${this.isWebSocketEnabled ? 'Habilitado' : 'Desabilitado'}, Conectado: ${socketIoService.isConnected ? 'Sim' : 'Não'}`);
      console.log('Tentando registrar callback mesmo assim...');
    }
    
    // Usar o método onChatEvent do socketIoService para o evento 'message'
    const removeListener = socketIoService.onChatEvent(chatId, 'message', (messageData) => {
      console.log(`Callback de nova mensagem acionado para o chat ${chatId}:`, messageData);
      
      // Processar a mensagem para garantir formato consistente
      let processedMessage = messageData;
      
      // Se a mensagem vier dentro de um objeto 'data', extrair
      if (messageData.data && typeof messageData.data === 'object') {
        processedMessage = messageData.data;
      }
      
      // Garantir que a mensagem tenha um ID
      if (!processedMessage.id && processedMessage.message_id) {
        processedMessage.id = processedMessage.message_id;
      }
      
      // Garantir que a mensagem tenha um timestamp
      if (!processedMessage.timestamp && processedMessage.createdAt) {
        processedMessage.timestamp = processedMessage.createdAt;
      }
      
      // Chamar o callback com a mensagem processada
      callback(processedMessage);
    });
    
    return removeListener;
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
