import { authService } from './authService';

/**
 * Serviço para gerenciar a conexão WebSocket
 */
class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.reconnectInterval = 3000; // 3 segundos
    this.messageCallbacks = new Map();
    this.statusCallbacks = new Map();
    this.typingCallbacks = new Map();
    this.connectionCallbacks = new Set();
  }

  /**
   * Inicializa a conexão WebSocket
   * @returns {Promise} Promessa que resolve quando a conexão é estabelecida
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        // Obter o token de autenticação
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          console.error('Erro ao conectar WebSocket: Token de autenticação não encontrado');
          reject(new Error('Token de autenticação não encontrado'));
          return;
        }
        
        // Obter a URL base da API
        const apiUrl = import.meta.env.VITE_API_URL || 'https://dev.agilefinance.com.br';
        
        // Converter http(s) para ws(s)
        const wsUrl = apiUrl.replace(/^http/, 'ws');
        
        // Construir a URL do WebSocket com o token
        const socketUrl = `${wsUrl}/ws?token=${token}`;
        
        console.log('Conectando ao WebSocket:', socketUrl.replace(/token=.*/, 'token=XXXXX'));
        
        // Fechar conexão existente se houver
        if (this.socket) {
          this.socket.close();
        }
        
        // Criar nova conexão
        this.socket = new WebSocket(socketUrl);
        
        // Configurar handlers
        this.socket.onopen = () => {
          console.log('Conexão WebSocket estabelecida com sucesso');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this._notifyConnectionChange(true);
          resolve();
        };
        
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Mensagem WebSocket recebida:', data);
            
            // Processar diferentes tipos de mensagens
            switch (data.type) {
              case 'chat_message':
                this._notifyMessageReceived(data.payload);
                break;
              case 'typing_indicator':
                this._notifyTypingIndicator(data.payload);
                break;
              case 'connection_status':
                this._notifyConnectionStatus(data.payload);
                break;
              default:
                console.log('Tipo de mensagem WebSocket não reconhecido:', data.type);
            }
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error, 'Dados recebidos:', event.data);
          }
        };
        
        this.socket.onerror = (error) => {
          console.error('Erro na conexão WebSocket:', error);
          
          // Adicionar mais detalhes sobre o erro
          const errorDetails = {
            timestamp: new Date().toISOString(),
            readyState: this.socket ? this.socket.readyState : 'unknown',
            url: wsUrl
          };
          
          console.error('Detalhes do erro WebSocket:', errorDetails);
          
          reject(error);
        };
        
        this.socket.onclose = (event) => {
          this.isConnected = false;
          this._notifyConnectionChange(false);
          
          // Códigos de fechamento WebSocket comuns
          const closeReasons = {
            1000: 'Fechamento normal',
            1001: 'Saindo da página',
            1002: 'Erro de protocolo',
            1003: 'Dados inaceitáveis',
            1005: 'Sem código de status',
            1006: 'Fechamento anormal (possível problema no servidor)',
            1007: 'Dados inconsistentes',
            1008: 'Violação de política',
            1009: 'Mensagem muito grande',
            1010: 'Extensões necessárias',
            1011: 'Erro inesperado no servidor',
            1012: 'Reiniciando servidor',
            1013: 'Tente novamente mais tarde',
            1015: 'Falha na verificação TLS'
          };
          
          const reason = closeReasons[event.code] || 'Desconhecido';
          console.log(`Conexão WebSocket fechada. Código: ${event.code} (${reason}), Razão: ${event.reason || 'Não especificada'}`);
          
          // Tentar reconectar se não foi um fechamento limpo
          if (event.code !== 1000 && event.code !== 1001) {
            this._scheduleReconnect();
          }
        };
        
      } catch (error) {
        console.error('Erro ao inicializar WebSocket:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Agenda uma tentativa de reconexão
   * @private
   */
  _scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Número máximo de tentativas de reconexão atingido');
      return;
    }
    
    this.reconnectAttempts++;
    
    const delay = this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1);
    console.log(`Agendando reconexão em ${delay}ms (tentativa ${this.reconnectAttempts})`);
    
    clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      console.log(`Tentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect().catch(error => {
        console.error('Falha na tentativa de reconexão:', error);
      });
    }, delay);
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
   * Processa uma nova mensagem recebida
   * @param {Object} data - Dados da mensagem
   * @private
   */
  _handleNewMessage(data) {
    const chatId = data.chatId || data.chat_id;
    
    if (!chatId) {
      console.error('Mensagem recebida sem chatId:', data);
      return;
    }
    
    // Notificar callbacks registrados para este chat
    const callbacks = this.messageCallbacks.get(chatId) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Erro ao executar callback para chat ${chatId}:`, error);
      }
    });
    
    // Notificar callbacks globais
    const globalCallbacks = this.messageCallbacks.get('global') || [];
    globalCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Erro ao executar callback global:', error);
      }
    });
  }
  
  /**
   * Processa uma atualização de status
   * @param {Object} data - Dados do status
   * @private
   */
  _handleStatusUpdate(data) {
    const chatId = data.chatId || data.chat_id;
    const messageId = data.messageId || data.message_id;
    
    if (!chatId) {
      console.error('Atualização de status sem chatId:', data);
      return;
    }
    
    // Notificar callbacks registrados para este chat
    const callbacks = this.statusCallbacks.get(chatId) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Erro ao executar callback de status para chat ${chatId}:`, error);
      }
    });
  }
  
  /**
   * Processa um indicador de digitação
   * @param {Object} data - Dados do indicador
   * @private
   */
  _handleTypingIndicator(data) {
    const chatId = data.chatId || data.chat_id;
    
    if (!chatId) {
      console.error('Indicador de digitação sem chatId:', data);
      return;
    }
    
    // Notificar callbacks registrados para este chat
    const callbacks = this.typingCallbacks.get(chatId) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Erro ao executar callback de digitação para chat ${chatId}:`, error);
      }
    });
  }
  
  /**
   * Envia uma mensagem através do WebSocket
   * @param {Object} message - Mensagem a ser enviada
   * @returns {boolean} Sucesso do envio
   */
  sendMessage(message) {
    if (!this.isConnected || !this.socket) {
      console.error('Tentativa de enviar mensagem sem conexão WebSocket');
      return false;
    }
    
    try {
      const messageString = JSON.stringify(message);
      this.socket.send(messageString);
      console.log('Mensagem enviada via WebSocket:', message);
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem via WebSocket:', error);
      return false;
    }
  }
  
  /**
   * Envia um indicador de digitação
   * @param {number} chatId - ID do chat
   * @param {boolean} isTyping - Se está digitando ou parou
   * @returns {boolean} Sucesso do envio
   */
  sendTypingIndicator(chatId, isTyping) {
    return this.sendMessage({
      type: 'typing',
      chatId: chatId,
      isTyping: isTyping
    });
  }
  
  /**
   * Registra um callback para novas mensagens
   * @param {number|string} chatId - ID do chat ou 'global' para todas as mensagens
   * @param {Function} callback - Função a ser chamada quando uma nova mensagem chegar
   * @returns {Function} Função para remover o callback
   */
  onMessage(chatId, callback) {
    if (!this.messageCallbacks.has(chatId)) {
      this.messageCallbacks.set(chatId, []);
    }
    
    this.messageCallbacks.get(chatId).push(callback);
    
    // Retornar função para remover o callback
    return () => {
      const callbacks = this.messageCallbacks.get(chatId) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Registra um callback para atualizações de status
   * @param {number|string} chatId - ID do chat ou 'global' para todos os status
   * @param {Function} callback - Função a ser chamada quando um status for atualizado
   * @returns {Function} Função para remover o callback
   */
  onStatusUpdate(chatId, callback) {
    if (!this.statusCallbacks.has(chatId)) {
      this.statusCallbacks.set(chatId, []);
    }
    
    this.statusCallbacks.get(chatId).push(callback);
    
    // Retornar função para remover o callback
    return () => {
      const callbacks = this.statusCallbacks.get(chatId) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Registra um callback para indicadores de digitação
   * @param {number|string} chatId - ID do chat
   * @param {Function} callback - Função a ser chamada quando alguém estiver digitando
   * @returns {Function} Função para remover o callback
   */
  onTypingIndicator(chatId, callback) {
    if (!this.typingCallbacks.has(chatId)) {
      this.typingCallbacks.set(chatId, []);
    }
    
    this.typingCallbacks.get(chatId).push(callback);
    
    // Retornar função para remover o callback
    return () => {
      const callbacks = this.typingCallbacks.get(chatId) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Registra um callback para mudanças no estado da conexão
   * @param {Function} callback - Função a ser chamada quando o estado da conexão mudar
   * @returns {Function} Função para remover o callback
   */
  onConnectionChange(callback) {
    this.connectionCallbacks.add(callback);
    
    // Retornar função para remover o callback
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }
  
  /**
   * Fecha a conexão WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Fechamento normal');
      this.socket = null;
    }
    
    this.isConnected = false;
    clearTimeout(this.reconnectTimeout);
  }
  
  /**
   * Verifica se o WebSocket está conectado
   * @returns {boolean} Estado da conexão
   */
  isConnected() {
    return this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN;
  }
  
  _notifyMessageReceived(payload) {
    console.log('Nova mensagem recebida:', payload);
  }
  
  _notifyTypingIndicator(payload) {
    console.log('Indicador de digitação recebido:', payload);
  }
  
  _notifyConnectionStatus(payload) {
    console.log('Status de conexão recebido:', payload);
  }
}

// Exportar uma instância única do serviço
export const websocketService = new WebSocketService();

export default websocketService;
