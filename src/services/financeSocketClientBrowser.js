import { io } from 'socket.io-client';

/**
 * Cliente Socket.IO para o Finance API - Versão para navegador
 * Implementação otimizada para comunicação em tempo real com o backend
 */
class FinanceSocketClientBrowser {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'https://dev.agilefinance.com.br';
    this.socket = null;
    this.chatSocket = null;
    this.isConnected = false;
    this.chatConnected = false;
    this.messageListeners = new Map();
    this.statusListeners = new Map();
    this.connectionListeners = new Set();
  }

  /**
   * Obtém o token de autenticação do localStorage
   * @returns {string|null} - Token JWT ou null se não estiver disponível
   * @private
   */
  _getToken() {
    return localStorage.getItem('accessToken');
  }

  /**
   * Inicia a conexão com o WebSocket
   * @returns {Promise} - Promise que resolve quando a conexão for estabelecida
   */
  connect() {
    return new Promise((resolve, reject) => {
      const token = this._getToken();
      
      if (!token) {
        reject(new Error('Token não encontrado no localStorage'));
        return;
      }

      // Opções de conexão
      const options = {
        path: '/socket.io',
        auth: { token },
        extraHeaders: {
          Authorization: `Bearer ${token}`
        },
        query: {
          token
        },
        transports: ['websocket', 'polling'],
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        // Ignorar erros de certificado SSL em ambiente de desenvolvimento
        rejectUnauthorized: false
      };

      console.log('Conectando ao Socket.IO...');
      
      // Conectar ao Socket.IO base
      this.socket = io(this.baseUrl, options);

      this.socket.on('connect', () => {
        console.log('Conexão base estabelecida!');
        this.isConnected = true;
        this._notifyConnectionChange(true);
        
        // Conectar ao namespace de chat
        this.connectToChatNamespace();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Erro na conexão base:', error);
        
        const errorDetails = {
          timestamp: new Date().toISOString(),
          message: error.message,
          data: error.data,
          type: error.type,
          description: error.description || 'Sem descrição adicional'
        };
        
        console.error('Detalhes do erro Socket.IO:', errorDetails);
        console.error('Objeto de erro completo:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        
        this._notifyConnectionChange(false, error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Desconectado do servidor:', reason);
        this.isConnected = false;
        this._notifyConnectionChange(false, { message: reason });
      });
    });
  }

  /**
   * Conecta ao namespace de chat
   * @private
   */
  connectToChatNamespace() {
    const token = this._getToken();
    
    if (!token) {
      console.error('Token não encontrado para conectar ao namespace de chat');
      return;
    }

    const options = {
      path: '/socket.io',
      auth: { token },
      extraHeaders: {
        Authorization: `Bearer ${token}`
      },
      query: {
        token
      },
      transports: ['websocket', 'polling'],
      forceNew: true,
      // Ignorar erros de certificado SSL em ambiente de desenvolvimento
      rejectUnauthorized: false
    };

    this.chatSocket = io(`${this.baseUrl}/chats`, options);

    this.chatSocket.on('connect', () => {
      console.log('Conectado ao namespace de chat!');
      this.chatConnected = true;
      
      // Configurar eventos do chat
      this.setupChatEvents();
    });

    this.chatSocket.on('connect_error', (error) => {
      console.error('Erro na conexão ao chat:', error);
      this.chatConnected = false;
    });

    this.chatSocket.on('disconnect', (reason) => {
      console.log('Desconectado do namespace de chat:', reason);
      this.chatConnected = false;
    });
  }

  /**
   * Configura os eventos do chat
   * @private
   */
  setupChatEvents() {
    // Evento de nova mensagem
    this.chatSocket.on('new_message', (data) => {
      console.log('Nova mensagem recebida:', data);
      this._notifyMessageListeners(data);
    });

    // Evento de atualização de status
    this.chatSocket.on('status_update', (data) => {
      console.log('Atualização de status:', data);
      this._notifyStatusListeners(data);
    });

    // Evento de mensagem enviada
    this.chatSocket.on('message_sent', (data) => {
      console.log('Confirmação de mensagem enviada:', data);
      this._notifyMessageListeners({
        ...data,
        type: 'message_sent'
      });
    });

    // Evento de mensagem lida
    this.chatSocket.on('message_read', (data) => {
      console.log('Mensagem marcada como lida:', data);
      this._notifyStatusListeners({
        ...data,
        type: 'message_read'
      });
    });
  }

  /**
   * Envia uma mensagem
   * @param {number} chatId - ID do chat
   * @param {Object} messageData - Dados da mensagem
   * @returns {Promise} - Promise que resolve quando a mensagem for enviada
   */
  sendMessage(chatId, messageData) {
    return new Promise((resolve, reject) => {
      if (!this.chatSocket || !this.chatConnected) {
        const error = new Error('Socket de chat não conectado');
        console.error(error.message);
        reject(error);
        return;
      }

      console.log(`Enviando mensagem para o chat ${chatId}:`, messageData);

      // Gerar um ID temporário para a mensagem
      const tempId = `temp-${Date.now()}`;
      
      // Preparar o payload da mensagem
      const payload = {
        chatId,
        content: messageData.content,
        contentType: messageData.contentType || 'TEXT',
        channelId: messageData.channelId || 6,
        contactId: messageData.contactId || messageData.lastContactId,
        id: tempId,
        timestamp: new Date().toISOString()
      };

      // Verificar se o contactId está presente
      if (!payload.contactId) {
        const error = new Error('contactId é obrigatório para enviar mensagem');
        console.error(error.message);
        reject(error);
        return;
      }

      // Enviar a mensagem via Socket.IO
      this.chatSocket.emit('send_message', payload, (response) => {
        if (response && response.error) {
          console.error('Erro ao enviar mensagem via Socket.IO:', response.error);
          reject(new Error(response.error));
          return;
        }
        
        console.log('Mensagem enviada com sucesso via Socket.IO:', response);
        resolve(response.data || response);
      });
      
      // Definir um timeout para a resposta
      setTimeout(() => {
        reject(new Error('Timeout ao enviar mensagem via Socket.IO'));
      }, 10000); // 10 segundos
    });
  }

  /**
   * Registra um listener para novas mensagens
   * @param {Function} callback - Função a ser chamada quando uma nova mensagem for recebida
   * @returns {Function} - Função para remover o listener
   */
  onNewMessage(callback) {
    const id = Date.now().toString();
    this.messageListeners.set(id, callback);
    
    return () => {
      this.messageListeners.delete(id);
    };
  }

  /**
   * Registra um listener para atualizações de status
   * @param {Function} callback - Função a ser chamada quando houver uma atualização de status
   * @returns {Function} - Função para remover o listener
   */
  onStatusUpdate(callback) {
    const id = Date.now().toString();
    this.statusListeners.set(id, callback);
    
    return () => {
      this.statusListeners.delete(id);
    };
  }

  /**
   * Registra um listener para mudanças no estado da conexão
   * @param {Function} callback - Função a ser chamada quando o estado da conexão mudar
   * @returns {Function} - Função para remover o listener
   */
  onConnectionChange(callback) {
    this.connectionListeners.add(callback);
    
    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  /**
   * Notifica os listeners de mensagens
   * @param {Object} data - Dados da mensagem
   * @private
   */
  _notifyMessageListeners(data) {
    this.messageListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Erro ao executar listener de mensagem:', error);
      }
    });
  }

  /**
   * Notifica os listeners de status
   * @param {Object} data - Dados do status
   * @private
   */
  _notifyStatusListeners(data) {
    this.statusListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Erro ao executar listener de status:', error);
      }
    });
  }

  /**
   * Notifica os listeners de conexão
   * @param {boolean} isConnected - Estado da conexão
   * @param {Object} error - Erro, se houver
   * @private
   */
  _notifyConnectionChange(isConnected, error = null) {
    this.connectionListeners.forEach(callback => {
      try {
        callback(isConnected, error);
      } catch (err) {
        console.error('Erro ao executar listener de conexão:', err);
      }
    });
  }

  /**
   * Desconecta os sockets
   */
  disconnect() {
    if (this.chatSocket) {
      this.chatSocket.disconnect();
      this.chatSocket = null;
      this.chatConnected = false;
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
    
    console.log('Desconectado de todos os sockets');
  }
}

// Exportar uma instância única do cliente
const financeSocketClientBrowser = new FinanceSocketClientBrowser();

export default financeSocketClientBrowser;
