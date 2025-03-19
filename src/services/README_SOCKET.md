# Cliente WebSocket para Finance API

Este documento descreve a implementação do cliente WebSocket para comunicação em tempo real com a API do Finance.

## Visão Geral

O cliente WebSocket fornece uma interface para comunicação bidirecional em tempo real com o backend, permitindo:

- Receber mensagens de chat em tempo real
- Enviar mensagens instantaneamente
- Receber atualizações de status
- Manter uma conexão persistente com o servidor

## Implementações Disponíveis

Existem duas implementações do cliente:

1. **financeSocketClient.js** - Para uso em ambiente Node.js (scripts, testes, etc.)
2. **financeSocketClientBrowser.js** - Para uso no navegador (aplicação React)

## Como Usar

### No Navegador (React)

```javascript
import React, { useEffect } from 'react';
import financeSocketClientBrowser from '../services/financeSocketClientBrowser';

const ChatComponent = () => {
  useEffect(() => {
    // Conectar ao WebSocket
    financeSocketClientBrowser.connect()
      .then(() => {
        console.log('Conectado com sucesso!');
      })
      .catch(error => {
        console.error('Erro ao conectar:', error);
      });
    
    // Registrar listener para novas mensagens
    const removeMessageListener = financeSocketClientBrowser.onNewMessage((message) => {
      console.log('Nova mensagem recebida:', message);
      // Atualizar o estado com a nova mensagem
    });
    
    // Limpar ao desmontar o componente
    return () => {
      removeMessageListener();
      financeSocketClientBrowser.disconnect();
    };
  }, []);
  
  // Função para enviar mensagem
  const sendMessage = async (chatId, content) => {
    try {
      const messageData = {
        content,
        contentType: 'TEXT',
        contactId: 178 // ID do contato
      };
      
      const response = await financeSocketClientBrowser.sendMessage(chatId, messageData);
      console.log('Mensagem enviada:', response);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };
  
  return (
    <div>
      {/* Interface do chat */}
    </div>
  );
};

export default ChatComponent;
```

### Em Scripts Node.js

```javascript
const financeSocketClient = require('./financeSocketClient');

// Definir o token JWT
financeSocketClient.setToken('seu-token-jwt-aqui');

// Conectar ao WebSocket
financeSocketClient.connect()
  .then(() => {
    console.log('Conectado com sucesso!');
    
    // Enviar uma mensagem
    return financeSocketClient.sendMessage(215, {
      content: 'Olá, esta é uma mensagem de teste!',
      contentType: 'TEXT',
      contactId: 178
    });
  })
  .then(response => {
    console.log('Mensagem enviada:', response);
  })
  .catch(error => {
    console.error('Erro:', error);
  });

// Registrar listener para novas mensagens
const removeMessageListener = financeSocketClient.onNewMessage((message) => {
  console.log('Nova mensagem recebida:', message);
});

// Desconectar quando terminar
process.on('SIGINT', () => {
  removeMessageListener();
  financeSocketClient.disconnect();
  process.exit(0);
});
```

## API do Cliente

### Métodos Principais

| Método | Descrição |
|--------|-----------|
| `connect()` | Conecta ao WebSocket e retorna uma Promise |
| `disconnect()` | Desconecta do WebSocket |
| `sendMessage(chatId, messageData)` | Envia uma mensagem e retorna uma Promise |
| `onNewMessage(callback)` | Registra um listener para novas mensagens |
| `onStatusUpdate(callback)` | Registra um listener para atualizações de status |
| `onConnectionChange(callback)` | Registra um listener para mudanças na conexão |

### Formato dos Dados

#### Envio de Mensagem

```javascript
const messageData = {
  content: 'Texto da mensagem',
  contentType: 'TEXT', // Ou 'FILE', 'IMAGE', etc.
  contactId: 178, // ID do contato
  channelId: 6 // ID do canal (opcional)
};
```

#### Recebimento de Mensagem

```javascript
{
  id: '12345',
  chatId: 215,
  content: 'Texto da mensagem',
  contentType: 'TEXT',
  sender: 'them',
  timestamp: '2025-02-27T13:45:30.123Z',
  status: 'received'
}
```

## Eventos Suportados

| Evento | Descrição |
|--------|-----------|
| `new_message` | Nova mensagem recebida |
| `message_sent` | Confirmação de mensagem enviada |
| `status_update` | Atualização de status (lido, entregue, etc.) |
| `message_read` | Mensagem marcada como lida |

## Tratamento de Erros

O cliente inclui tratamento robusto de erros, incluindo:

- Timeout para operações (10 segundos)
- Reconexão automática
- Fallback para HTTP quando o WebSocket falha
- Logs detalhados para diagnóstico

## Exemplos

Consulte os arquivos de exemplo para implementações completas:

- `src/examples/socketExample.js` - Exemplo de uso em Node.js
- `src/examples/SocketChatExample.jsx` - Exemplo de uso em React
