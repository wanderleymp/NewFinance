import { io } from 'socket.io-client';

/**
 * Serviço para gerenciar a conexão Socket.IO
 */
class SocketIoService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
    this.chatListeners = new Map();
    this.connectionCallbacks = new Set();
  }

  /**
   * Inicializa a conexão Socket.IO
   * @returns {Promise} Promessa que resolve quando a conexão é estabelecida
   */
  connect() {
    return new Promise((resolve, reject) => {
      if (this.socket && this.isConnected) {
        console.log('Socket.IO já está conectado');
        resolve();
        return;
      }
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        const error = new Error('Token de autenticação não encontrado');
        console.error(error.message);
        this._connectWithoutAuth().then(resolve).catch(reject);
        return;
      }
      
      // Log do token para depuração (apenas os primeiros 10 caracteres por segurança)
      console.log(`Token encontrado: ${token.substring(0, 10)}...`);
      
      // Obter URL base da API a partir das variáveis de ambiente
      const apiUrl = import.meta.env.VITE_API_URL || 'https://dev.agilefinance.com.br';
      
      // Em ambiente de desenvolvimento, usar o proxy configurado no vite.config.js
      const isDevelopment = import.meta.env.DEV;
      const socketUrl = isDevelopment ? window.location.origin : apiUrl;
      
      console.log(`Conectando ao Socket.IO em ${socketUrl}${isDevelopment ? ' (via proxy de desenvolvimento)' : ''}`);
      
      // Inicializar Socket.IO com opções
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        path: '/socket.io',
        // Enviando o token como query parameter (sem o prefixo Bearer)
        query: {
          token: token
        },
        // Mantendo o formato Bearer nos headers para compatibilidade com HTTP
        extraHeaders: {
          Authorization: `Bearer ${token}`
        },
        // Enviando o token puro no objeto auth
        auth: {
          token: token
        },
        // Ignorar erros de certificado SSL em ambiente de desenvolvimento
        rejectUnauthorized: false
      });
      
      // Configurar handlers
      this.socket.on('connect', () => {
        console.log('Conexão Socket.IO estabelecida com sucesso');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this._notifyConnectionChange(true);
        resolve();
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Erro na conexão Socket.IO:', error.message);
        
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
        
        // Se o erro for de autenticação, tentar conectar sem autenticação
        if (error.message === 'Erro na autenticação') {
          console.log('Tentando conexão alternativa sem autenticação...');
          this._connectWithoutAuth().then(resolve).catch(reject);
        } else {
          reject(error);
        }
      });
      
      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        console.log(`Conexão Socket.IO fechada. Razão: ${reason}`);
        this._notifyConnectionChange(false);
      });
      
      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`Tentativa de reconexão Socket.IO ${attemptNumber}/${this.maxReconnectAttempts}`);
      });
      
      this.socket.on('reconnect_failed', () => {
        console.log('Falha em todas as tentativas de reconexão Socket.IO');
      });
      
      // Configurar listeners para eventos do servidor
      this._setupServerEvents();
    });
  }
  
  /**
   * Tenta conectar sem autenticação como fallback
   * @private
   */
  _connectWithoutAuth() {
    return new Promise((resolve, reject) => {
      try {
        // Obter URL base da API a partir das variáveis de ambiente
        const apiUrl = import.meta.env.VITE_API_URL || 'https://dev.agilefinance.com.br';
        
        // Em ambiente de desenvolvimento, usar o proxy configurado no vite.config.js
        const isDevelopment = import.meta.env.DEV;
        const socketUrl = isDevelopment ? window.location.origin : apiUrl;
        
        console.log(`Tentando conectar ao Socket.IO sem autenticação em ${socketUrl}${isDevelopment ? ' (via proxy de desenvolvimento)' : ''}`);
        
        // Inicializar Socket.IO com opções mínimas
        this.socket = io(socketUrl, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          path: '/socket.io',
          // Ignorar erros de certificado SSL em ambiente de desenvolvimento
          rejectUnauthorized: false
        });
        
        // Configurar handlers
        this.socket.on('connect', () => {
          console.log('Conexão Socket.IO sem autenticação estabelecida com sucesso');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this._notifyConnectionChange(true);
          resolve();
        });
        
        this.socket.on('connect_error', (error) => {
          console.error('Erro na conexão Socket.IO sem autenticação:', error.message);
          this._notifyConnectionChange(false, error);
          reject(error);
        });
        
        // Configurar os mesmos listeners de eventos
        this.socket.on('disconnect', (reason) => {
          this.isConnected = false;
          console.log(`Conexão Socket.IO fechada. Razão: ${reason}`);
          this._notifyConnectionChange(false);
        });
        
        this.socket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`Tentativa de reconexão Socket.IO ${attemptNumber}/${this.maxReconnectAttempts}`);
        });
        
        this.socket.on('reconnect_failed', () => {
          console.log('Falha em todas as tentativas de reconexão Socket.IO');
        });
        
        // Configurar listeners para eventos do servidor
        this._setupServerEvents();
      } catch (error) {
        console.error('Erro ao inicializar Socket.IO sem autenticação:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Configura os listeners para eventos do servidor
   * @private
   */
  _setupServerEvents() {
    if (!this.socket) return;
    
    // Listener para mensagens
    this.socket.on('message', (data) => {
      console.log('Mensagem recebida:', data);
      
      // Notificar listeners globais
      this._notifyEvent('message', data);
      
      // Notificar listeners específicos do chat
      if (data.chatId) {
        this._notifyChatEvent(data.chatId, 'message', data);
      }
    });
    
    // Listener para eventos de digitação
    this.socket.on('typing', (data) => {
      console.log('Evento de digitação recebido:', data);
      
      // Notificar listeners globais
      this._notifyEvent('typing', data);
      
      // Notificar listeners específicos do chat
      if (data.chatId) {
        this._notifyChatEvent(data.chatId, 'typing', data);
      }
    });
    
    // Listener para atualizações de status
    this.socket.on('status', (data) => {
      console.log('Atualização de status recebida:', data);
      
      // Notificar listeners globais
      this._notifyEvent('status', data);
      
      // Notificar listeners específicos do chat
      if (data.chatId) {
        this._notifyChatEvent(data.chatId, 'status', data);
      }
    });
  }
  
  /**
   * Entra em uma sala de chat específica
   * @param {string|number} chatId - ID do chat
   */
  joinChat(chatId) {
    if (!this.isConnected || !this.socket) {
      console.warn('Não é possível entrar no chat: Socket.IO não está conectado');
      return;
    }
    
    console.log(`Entrando no chat ${chatId}`);
    this.socket.emit('joinChat', { chatId });
  }
  
  /**
   * Sai de uma sala de chat específica
   * @param {string|number} chatId - ID do chat
   */
  leaveChat(chatId) {
    if (!this.isConnected || !this.socket) {
      console.warn('Não é possível sair do chat: Socket.IO não está conectado');
      return;
    }
    
    console.log(`Saindo do chat ${chatId}`);
    this.socket.emit('leaveChat', { chatId });
  }
  
  /**
   * Envia um evento de digitação
   * @param {string|number} chatId - ID do chat
   * @param {boolean} isTyping - Se o usuário está digitando ou não
   */
  sendTypingEvent(chatId, isTyping) {
    if (!this.isConnected || !this.socket) {
      console.warn('Não é possível enviar evento de digitação: Socket.IO não está conectado');
      return;
    }
    
    console.log(`Enviando evento de digitação para o chat ${chatId}: ${isTyping ? 'digitando' : 'parou de digitar'}`);
    this.socket.emit('typing', { chatId, isTyping });
  }
  
  /**
   * Envia uma mensagem para um chat específico
   * @param {string|number} chatId - ID do chat
   * @param {Object} messageData - Dados da mensagem
   * @returns {Promise} Promessa que resolve quando a mensagem for enviada
   */
  sendMessage(chatId, messageData) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || !this.socket) {
        const error = new Error('Não é possível enviar mensagem: Socket.IO não está conectado');
        console.warn(error.message);
        reject(error);
        return;
      }
      
      console.log(`Enviando mensagem para o chat ${chatId}:`, messageData);
      
      // Gerar um ID temporário para a mensagem
      const tempId = `temp-${Date.now()}`;
      
      // Adicionar o ID do chat e o ID temporário aos dados da mensagem
      const payload = {
        ...messageData,
        chatId,
        id: tempId,
        timestamp: new Date().toISOString()
      };
      
      // Enviar a mensagem via Socket.IO
      this.socket.emit('sendMessage', payload, (response) => {
        if (response.error) {
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
   * Registra um callback para um tipo específico de evento
   * @param {string} eventType - Tipo de evento ('message', 'status', 'chatStatus', 'typing')
   * @param {Function} callback - Função de callback
   * @returns {Function} Função para remover o listener
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    const listeners = this.listeners.get(eventType);
    listeners.add(callback);
    
    return () => {
      listeners.delete(callback);
    };
  }
  
  /**
   * Registra um callback para um tipo específico de evento em um chat específico
   * @param {string|number} chatId - ID do chat
   * @param {string} eventType - Tipo de evento ('message', 'status', 'chatStatus', 'typing')
   * @param {Function} callback - Função de callback
   * @returns {Function} Função para remover o listener
   */
  onChatEvent(chatId, eventType, callback) {
    const chatKey = String(chatId);
    
    if (!this.chatListeners.has(chatKey)) {
      this.chatListeners.set(chatKey, new Map());
    }
    
    const chatListeners = this.chatListeners.get(chatKey);
    
    if (!chatListeners.has(eventType)) {
      chatListeners.set(eventType, new Set());
    }
    
    const listeners = chatListeners.get(eventType);
    listeners.add(callback);
    
    return () => {
      listeners.delete(callback);
    };
  }
  
  /**
   * Registra um callback para mudanças no estado da conexão
   * @param {Function} callback - Função de callback
   * @returns {Function} Função para remover o listener
   */
  onConnectionChange(callback) {
    this.connectionCallbacks.add(callback);
    
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }
  
  /**
   * Notifica os callbacks sobre um evento
   * @param {string} eventType - Tipo de evento
   * @param {Object} data - Dados do evento
   * @private
   */
  _notifyEvent(eventType, data) {
    const listeners = this.listeners.get(eventType);
    
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erro ao executar callback para evento ${eventType}:`, error);
        }
      });
    }
  }
  
  /**
   * Notifica os callbacks sobre um evento em um chat específico
   * @param {string|number} chatId - ID do chat
   * @param {string} eventType - Tipo de evento
   * @param {Object} data - Dados do evento
   * @private
   */
  _notifyChatEvent(chatId, eventType, data) {
    const chatKey = String(chatId);
    const chatListeners = this.chatListeners.get(chatKey);
    
    if (chatListeners) {
      const listeners = chatListeners.get(eventType);
      
      if (listeners) {
        listeners.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Erro ao executar callback para evento ${eventType} no chat ${chatId}:`, error);
          }
        });
      }
    }
  }
  
  /**
   * Notifica os callbacks sobre mudanças no estado da conexão
   * @param {boolean} isConnected - Estado da conexão
   * @param {Error} error - Erro, se houver
   * @private
   */
  _notifyConnectionChange(isConnected, error = null) {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(isConnected, error);
      } catch (callbackError) {
        console.error('Erro ao executar callback de conexão:', callbackError);
      }
    });
  }
  
  /**
   * Desconecta o Socket.IO
   */
  disconnect() {
    if (this.socket) {
      console.log('Desconectando Socket.IO');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

// Exportar uma instância única do serviço
export const socketIoService = new SocketIoService();

export default socketIoService;
