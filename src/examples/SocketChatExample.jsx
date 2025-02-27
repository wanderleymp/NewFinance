import React, { useEffect, useState } from 'react';
import financeSocketClientBrowser from '../services/financeSocketClientBrowser';

/**
 * Componente de exemplo para demonstrar o uso do cliente WebSocket no React
 */
const SocketChatExample = () => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('Desconectado');

  // Conectar ao WebSocket quando o componente for montado
  useEffect(() => {
    // Registrar listener para mudanças na conexão
    const removeConnectionListener = financeSocketClientBrowser.onConnectionChange((isConnected, error) => {
      setConnected(isConnected);
      setStatus(isConnected ? 'Conectado' : 'Desconectado');
      
      if (error) {
        console.error('Erro na conexão WebSocket:', error);
        setError(`Erro na conexão: ${error.message}`);
        
        // Verificar se é um erro de certificado SSL
        if (error.message?.includes('certificate') || error.message?.includes('SSL')) {
          setError(`Erro de certificado SSL. Em ambiente de desenvolvimento, isso pode ser ignorado.`);
        }
      } else {
        setError(null);
      }
    });

    // Registrar listener para novas mensagens
    const removeMessageListener = financeSocketClientBrowser.onNewMessage((message) => {
      console.log('Nova mensagem recebida:', message);
      
      // Adicionar a nova mensagem à lista
      setMessages(prevMessages => [...prevMessages, {
        id: message.id || `temp-${Date.now()}`,
        content: message.content,
        contentType: message.contentType || 'TEXT',
        direction: 'INBOUND',
        sender: 'them',
        createdAt: message.timestamp || new Date().toISOString(),
        status: 'received'
      }]);
    });

    // Registrar listener para atualizações de status
    const removeStatusListener = financeSocketClientBrowser.onStatusUpdate((statusUpdate) => {
      console.log('Atualização de status recebida:', statusUpdate);
      
      // Atualizar o status das mensagens
      if (statusUpdate.messageId) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === statusUpdate.messageId 
              ? { ...msg, status: statusUpdate.status } 
              : msg
          )
        );
      }
    });

    // Conectar ao WebSocket
    financeSocketClientBrowser.connect()
      .then(() => {
        console.log('Cliente conectado com sucesso!');
      })
      .catch(error => {
        console.error('Erro ao conectar:', error);
        setError(`Falha na conexão: ${error.message}`);
      });

    // Limpar os listeners quando o componente for desmontado
    return () => {
      removeConnectionListener();
      removeMessageListener();
      removeStatusListener();
      financeSocketClientBrowser.disconnect();
    };
  }, []);

  // Função para enviar uma mensagem
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) {
      return;
    }

    try {
      // Adicionar a mensagem localmente com um ID temporário
      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        id: tempId,
        content: newMessage,
        contentType: 'TEXT',
        direction: 'OUTBOUND',
        sender: 'me',
        createdAt: new Date().toISOString(),
        status: 'sending'
      };
      
      // Adicionar a mensagem temporária ao estado
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      
      // Limpar o campo de mensagem
      setNewMessage('');
      
      // Enviar a mensagem via Socket.IO
      const messageData = {
        content: newMessage,
        contentType: 'TEXT',
        contactId: selectedChat.lastContactId,
        channelId: selectedChat.channel_id || 6
      };
      
      const response = await financeSocketClientBrowser.sendMessage(selectedChat.id, messageData);
      console.log('Mensagem enviada com sucesso:', response);
      
      // Atualizar a mensagem temporária com os dados da resposta
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempId 
            ? { 
                ...msg, 
                id: response.id || msg.id,
                status: 'sent',
                createdAt: response.timestamp || msg.createdAt
              }
            : msg
        )
      );
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setError(`Erro ao enviar mensagem: ${error.message}`);
      
      // Atualizar o status da mensagem temporária para erro
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id.startsWith('temp-') 
            ? { ...msg, status: 'error' }
            : msg
        )
      );
    }
  };

  // Função para selecionar um chat
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setMessages([]); // Limpar mensagens ao trocar de chat
  };

  return (
    <div className="socket-chat-example">
      <div className="connection-status">
        <h2>Status da Conexão: {status}</h2>
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="chat-selection">
        <h3>Selecione um Chat</h3>
        <div className="chat-list">
          {/* Exemplo de chats - Substitua por dados reais */}
          <div 
            className={`chat-item ${selectedChat?.id === 215 ? 'selected' : ''}`}
            onClick={() => handleSelectChat({
              id: 215,
              name: "Exemplo de Chat 1",
              channel_id: 6,
              lastContactId: 178
            })}
          >
            Exemplo de Chat 1
          </div>
          <div 
            className={`chat-item ${selectedChat?.id === 216 ? 'selected' : ''}`}
            onClick={() => handleSelectChat({
              id: 216,
              name: "Exemplo de Chat 2",
              channel_id: 6,
              lastContactId: 179
            })}
          >
            Exemplo de Chat 2
          </div>
        </div>
      </div>

      {selectedChat && (
        <div className="chat-container">
          <h3>Chat com {selectedChat.name}</h3>
          
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="no-messages">Nenhuma mensagem ainda</div>
            ) : (
              messages.map(message => (
                <div 
                  key={message.id} 
                  className={`message ${message.direction === 'OUTBOUND' ? 'outbound' : 'inbound'}`}
                >
                  <div className="message-content">{message.content}</div>
                  <div className="message-meta">
                    <span className="message-time">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                    <span className="message-status">{message.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="message-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={!connected}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!connected || !newMessage.trim()}
            >
              Enviar
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .socket-chat-example {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .connection-status {
          margin-bottom: 20px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        
        .error-message {
          color: #d32f2f;
          margin-top: 10px;
          padding: 10px;
          background-color: #ffebee;
          border-radius: 4px;
        }
        
        .chat-selection {
          margin-bottom: 20px;
        }
        
        .chat-list {
          display: flex;
          gap: 10px;
        }
        
        .chat-item {
          padding: 10px 15px;
          background-color: #e0e0e0;
          border-radius: 5px;
          cursor: pointer;
        }
        
        .chat-item.selected {
          background-color: #2196f3;
          color: white;
        }
        
        .chat-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          border: 1px solid #e0e0e0;
          border-radius: 5px;
          overflow: hidden;
        }
        
        .messages-container {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 300px;
          max-height: 500px;
        }
        
        .no-messages {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #757575;
        }
        
        .message {
          max-width: 70%;
          padding: 10px 15px;
          border-radius: 10px;
          position: relative;
        }
        
        .message.inbound {
          align-self: flex-start;
          background-color: #f5f5f5;
        }
        
        .message.outbound {
          align-self: flex-end;
          background-color: #e3f2fd;
        }
        
        .message-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #757575;
          margin-top: 5px;
        }
        
        .message-input {
          display: flex;
          padding: 10px;
          background-color: #f5f5f5;
        }
        
        .message-input input {
          flex: 1;
          padding: 10px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          margin-right: 10px;
        }
        
        .message-input button {
          padding: 10px 20px;
          background-color: #2196f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .message-input button:disabled {
          background-color: #bdbdbd;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default SocketChatExample;
