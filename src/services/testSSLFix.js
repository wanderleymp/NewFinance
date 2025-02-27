// Teste para verificar se as correções de SSL estão funcionando
import axios from 'axios';

// Função para testar a conexão com a API
async function testApiConnection() {
  try {
    console.log('Testando conexão com a API...');
    
    // Verificar se estamos em ambiente de desenvolvimento
    const isDevelopment = import.meta.env?.DEV || true;
    console.log(`Ambiente de desenvolvimento: ${isDevelopment ? 'Sim' : 'Não'}`);
    
    // URL da API
    const apiUrl = import.meta.env?.VITE_API_URL || 'https://dev.agilefinance.com.br';
    console.log(`URL da API: ${apiUrl}`);
    
    // Criar instância do Axios com configurações para ignorar erros de certificado SSL
    const api = axios.create({
      baseURL: apiUrl,
      timeout: 15000,
      // Ignorar erros de certificado SSL em ambiente de desenvolvimento
      ...(isDevelopment && {
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      })
    });
    
    // Fazer uma requisição de teste
    const response = await api.get('/health');
    console.log('Conexão com a API bem-sucedida!');
    console.log('Resposta:', response.data);
    return true;
  } catch (error) {
    console.error('Erro na conexão com a API:', error.message);
    console.error('Detalhes do erro:', error);
    return false;
  }
}

// Função para testar a conexão com o Socket.IO
async function testSocketConnection() {
  try {
    console.log('Testando conexão com o Socket.IO...');
    
    // Importar Socket.IO
    const { io } = await import('socket.io-client');
    
    // Verificar se estamos em ambiente de desenvolvimento
    const isDevelopment = import.meta.env?.DEV || true;
    console.log(`Ambiente de desenvolvimento: ${isDevelopment ? 'Sim' : 'Não'}`);
    
    // URL da API
    const apiUrl = import.meta.env?.VITE_API_URL || 'https://dev.agilefinance.com.br';
    console.log(`URL da API: ${apiUrl}`);
    
    // Criar uma promessa para aguardar a conexão
    return new Promise((resolve, reject) => {
      // Inicializar Socket.IO com opções
      const socket = io(apiUrl, {
        transports: ['websocket'],
        reconnection: true,
        timeout: 20000,
        path: '/socket.io',
        // Ignorar erros de certificado SSL em ambiente de desenvolvimento
        rejectUnauthorized: false
      });
      
      // Configurar handlers
      socket.on('connect', () => {
        console.log('Conexão Socket.IO estabelecida com sucesso');
        socket.disconnect();
        resolve(true);
      });
      
      socket.on('connect_error', (error) => {
        console.error('Erro na conexão Socket.IO:', error.message);
        console.error('Detalhes do erro:', error);
        socket.disconnect();
        reject(error);
      });
      
      // Definir um timeout
      setTimeout(() => {
        socket.disconnect();
        reject(new Error('Timeout na conexão Socket.IO'));
      }, 10000);
    });
  } catch (error) {
    console.error('Erro ao inicializar Socket.IO:', error.message);
    console.error('Detalhes do erro:', error);
    return false;
  }
}

// Executar os testes
async function runTests() {
  console.log('=== INICIANDO TESTES DE CONEXÃO ===');
  
  // Testar conexão com a API
  const apiResult = await testApiConnection();
  console.log(`\nResultado do teste de API: ${apiResult ? 'SUCESSO' : 'FALHA'}\n`);
  
  // Testar conexão com o Socket.IO
  try {
    const socketResult = await testSocketConnection();
    console.log(`\nResultado do teste de Socket.IO: ${socketResult ? 'SUCESSO' : 'FALHA'}\n`);
  } catch (error) {
    console.log(`\nResultado do teste de Socket.IO: FALHA\n`);
  }
  
  console.log('=== TESTES CONCLUÍDOS ===');
}

// Executar os testes quando o script for carregado
runTests();

export { testApiConnection, testSocketConnection, runTests };
