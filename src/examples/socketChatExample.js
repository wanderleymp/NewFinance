/**
 * Exemplo de uso do cliente WebSocket para chat
 * 
 * Este exemplo demonstra como usar o cliente WebSocket para enviar e receber mensagens de chat
 * em uma aplicação Node.js.
 */

import financeSocketClient from '../services/financeSocketClient.js';

// Configurar o token JWT (substitua por um token válido)
const token = 'SEU_TOKEN_JWT_AQUI';
financeSocketClient.setToken(token);

// Definir handlers para eventos
const setupEventHandlers = () => {
  // Handler para novas mensagens
  financeSocketClient.onNewMessage((message) => {
    console.log('Nova mensagem recebida:', message);
    
    // Aqui você pode adicionar lógica para processar a mensagem
    // Por exemplo, atualizar a interface do usuário, enviar notificações, etc.
  });
  
  // Handler para atualizações de status de mensagens
  financeSocketClient.onMessageStatusUpdate((update) => {
    console.log('Atualização de status de mensagem:', update);
    
    // Aqui você pode atualizar o status das mensagens na interface
    // Por exemplo, marcar como entregue, lida, etc.
  });
  
  // Handler para mudanças de status de conexão
  financeSocketClient.onConnectionStatusChange((isConnected) => {
    console.log('Status de conexão alterado:', isConnected ? 'Conectado' : 'Desconectado');
    
    // Aqui você pode atualizar a interface para mostrar o status da conexão
  });
};

// Função principal
const main = async () => {
  try {
    console.log('Iniciando exemplo de chat com WebSocket...');
    
    // Configurar handlers de eventos
    setupEventHandlers();
    
    // Conectar ao servidor
    console.log('Conectando ao servidor...');
    await financeSocketClient.connect();
    console.log('Conectado com sucesso!');
    
    // Exemplo de envio de mensagem
    const chatId = 215; // Substitua pelo ID do chat real
    const contactId = 178; // Substitua pelo ID do contato real
    
    const messageData = {
      content: 'Olá, esta é uma mensagem de teste do exemplo!',
      contentType: 'TEXT',
      channelId: 6, // Substitua pelo ID do canal real
      contactId: contactId
    };
    
    console.log('Enviando mensagem de teste...');
    await financeSocketClient.sendMessage(chatId, messageData);
    console.log('Mensagem enviada com sucesso!');
    
    // Manter a conexão aberta por 30 segundos para receber eventos
    console.log('Aguardando eventos por 30 segundos...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Desconectar
    console.log('Desconectando...');
    financeSocketClient.disconnect();
    console.log('Desconectado com sucesso!');
    
  } catch (error) {
    console.error('Erro no exemplo de chat:', error);
  }
};

// Executar o exemplo
main();
