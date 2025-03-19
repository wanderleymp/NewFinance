import financeSocketClient from '../services/financeSocketClient.js';

/**
 * Exemplo de uso do FinanceSocketClient
 * Este script demonstra como utilizar o cliente WebSocket para comunicação em tempo real
 */

// Definir o token JWT (substitua pelo seu token válido)
const token = 'SEU_TOKEN_JWT_AQUI';
financeSocketClient.setToken(token);

// Registrar listener para mudanças na conexão
const removeConnectionListener = financeSocketClient.onConnectionChange((isConnected, error) => {
  console.log(`Estado da conexão: ${isConnected ? 'Conectado' : 'Desconectado'}`);
  if (error) {
    console.error('Erro de conexão:', error.message);
  }
});

// Registrar listener para novas mensagens
const removeMessageListener = financeSocketClient.onNewMessage((message) => {
  console.log('Nova mensagem recebida:', message);
  
  // Exemplo: responder automaticamente a mensagens
  if (message.content && message.chatId) {
    console.log(`Respondendo automaticamente ao chat ${message.chatId}`);
    
    // Enviar uma resposta automática (descomente para testar)
    /*
    financeSocketClient.sendMessage(message.chatId, {
      content: `Resposta automática para: "${message.content}"`,
      contentType: 'TEXT',
      contactId: message.contactId
    }).catch(error => {
      console.error('Erro ao enviar resposta automática:', error);
    });
    */
  }
});

// Registrar listener para atualizações de status
const removeStatusListener = financeSocketClient.onStatusUpdate((status) => {
  console.log('Atualização de status recebida:', status);
});

// Conectar ao WebSocket
console.log('Iniciando conexão...');
financeSocketClient.connect()
  .then(() => {
    console.log('Cliente conectado com sucesso!');
    
    // Exemplo: enviar uma mensagem (descomente e ajuste os valores para testar)
    /*
    const chatId = 215; // Substitua pelo ID do chat desejado
    const contactId = 178; // Substitua pelo ID do contato desejado
    
    financeSocketClient.sendMessage(chatId, {
      content: 'Olá, esta é uma mensagem de teste!',
      contentType: 'TEXT',
      contactId: contactId
    })
    .then(response => {
      console.log('Mensagem enviada com sucesso:', response);
    })
    .catch(error => {
      console.error('Erro ao enviar mensagem:', error);
    });
    */
  })
  .catch(error => {
    console.error('Erro ao conectar:', error);
  });

// Configurar para desconectar ao encerrar o programa
process.on('SIGINT', () => {
  console.log('Encerrando conexão...');
  
  // Remover todos os listeners
  removeConnectionListener();
  removeMessageListener();
  removeStatusListener();
  
  // Desconectar
  financeSocketClient.disconnect();
  
  console.log('Conexão encerrada.');
  process.exit(0);
});

console.log('Exemplo de Socket.IO iniciado. Pressione Ctrl+C para encerrar.');
