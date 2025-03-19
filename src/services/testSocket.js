// Script de teste para o cliente WebSocket
// Execute com: node --experimental-modules src/services/testSocket.js

import { io } from 'socket.io-client';

console.log('Iniciando teste de conexão Socket.IO...');

// Token de exemplo (substitua por um token válido)
// Este token é apenas um exemplo e precisa ser substituído por um token válido
// Você pode obter um token válido fazendo login na aplicação e copiando-o do localStorage
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImlhdCI6MTc0MDY2ODIzNiwiZXhwIjoxNzQwNjgyNjM2fQ.jeIOH_BG3C9VzUTQS-mAJD2jMSoF5hKes6hhSa2ZGE0';

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
  timeout: 20000,
  // Ignorar erros de certificado SSL em ambiente de desenvolvimento
  rejectUnauthorized: false
};

// URL do servidor
const baseUrl = 'https://dev.agilefinance.com.br';

console.log('Conectando ao Socket.IO...');

// Conectar ao Socket.IO base
const socket = io(baseUrl, options);

socket.on('connect', () => {
  console.log('Conexão base estabelecida!');
  
  // Conectar ao namespace de chat
  console.log('Tentando conectar ao namespace de chat...');
  const chatSocket = io(`${baseUrl}/chats`, options);
  
  chatSocket.on('connect', () => {
    console.log('Conectado ao namespace de chat!');
    
    // Configurar eventos do chat
    chatSocket.on('new_message', (data) => {
      console.log('Nova mensagem recebida:', data);
    });
    
    chatSocket.on('status_update', (data) => {
      console.log('Atualização de status:', data);
    });
    
    // Exemplo: enviar uma mensagem
    console.log('Tentando enviar uma mensagem de teste...');
    
    const payload = {
      chatId: 215,
      content: 'Olá, esta é uma mensagem de teste!',
      contentType: 'TEXT',
      channelId: 6,
      contactId: 178,
      id: `temp-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    // Enviar a mensagem via Socket.IO
    console.log('Enviando mensagem com payload:', payload);
    
    // Usar o evento correto 'sendMessage'
    console.log('Enviando com o evento "sendMessage"...');
    chatSocket.emit('sendMessage', payload);
    
    console.log('Mensagem enviada! Aguardando eventos do servidor...');
    
    // Adicionar listener para mensagens recebidas
    chatSocket.on('newMessage', (message) => {
      console.log('Nova mensagem recebida:', message);
    });
    
    // Adicionar listener para atualizações de status
    chatSocket.on('messageStatusUpdate', (update) => {
      console.log('Atualização de status recebida:', update);
    });
    
    // Desconectar após 10 segundos
    setTimeout(() => {
      console.log('Desconectando após 10 segundos...');
      chatSocket.disconnect();
      socket.disconnect();
      console.log('Teste concluído.');
      process.exit(0);
    }, 10000);
  });
  
  chatSocket.on('connect_error', (error) => {
    console.error('Erro na conexão ao chat:', error);
    socket.disconnect();
  });
});

socket.on('connect_error', (error) => {
  console.error('Erro na conexão base:', error);
  console.error('Detalhes do erro:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
});

socket.on('disconnect', (reason) => {
  console.log('Desconectado do servidor:', reason);
});

// Encerrar após 30 segundos (caso não receba resposta)
setTimeout(() => {
  console.log('Tempo limite atingido. Encerrando...');
  socket.disconnect();
  process.exit(0);
}, 30000);
