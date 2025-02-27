import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

/**
 * Componente para testar a conexão SSL com a API e Socket.IO
 */
const TestSSLConnection = () => {
  const [apiStatus, setApiStatus] = useState('Não testado');
  const [socketStatus, setSocketStatus] = useState('Não testado');
  const [apiResponse, setApiResponse] = useState(null);
  const [socketResponse, setSocketResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para testar a conexão com a API
  const testApiConnection = async () => {
    setLoading(true);
    setApiStatus('Testando...');
    setError(null);
    
    try {
      // Verificar se estamos em ambiente de desenvolvimento
      const isDevelopment = import.meta.env?.DEV || true;
      console.log(`Ambiente de desenvolvimento: ${isDevelopment ? 'Sim' : 'Não'}`);
      
      // URL da API
      const apiUrl = import.meta.env?.VITE_API_URL || 'https://dev.agilefinance.com.br';
      console.log(`URL da API: ${apiUrl}`);
      
      // Em ambiente de desenvolvimento, usar o proxy configurado no vite.config.js
      const baseURL = isDevelopment ? '/api' : apiUrl;
      console.log(`URL base para teste: ${baseURL}`);
      
      // Criar instância do Axios
      const api = axios.create({
        baseURL,
        timeout: 15000
      });
      
      // Fazer uma requisição de teste
      const response = await api.get('/health');
      console.log('Conexão com a API bem-sucedida!');
      console.log('Resposta:', response.data);
      
      setApiStatus('Conectado');
      setApiResponse(response.data);
      return true;
    } catch (error) {
      console.error('Erro na conexão com a API:', error.message);
      console.error('Detalhes do erro:', error);
      
      setApiStatus('Falha');
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Função para testar a conexão com o Socket.IO
  const testSocketConnection = async () => {
    setLoading(true);
    setSocketStatus('Testando...');
    setError(null);
    
    try {
      // Verificar se estamos em ambiente de desenvolvimento
      const isDevelopment = import.meta.env?.DEV || true;
      console.log(`Ambiente de desenvolvimento: ${isDevelopment ? 'Sim' : 'Não'}`);
      
      // URL da API
      const apiUrl = import.meta.env?.VITE_API_URL || 'https://dev.agilefinance.com.br';
      console.log(`URL da API: ${apiUrl}`);
      
      // Em ambiente de desenvolvimento, usar o proxy configurado no vite.config.js
      const socketUrl = isDevelopment ? window.location.origin : apiUrl;
      console.log(`URL do Socket.IO para teste: ${socketUrl}`);
      
      // Criar uma promessa para aguardar a conexão
      return new Promise((resolve, reject) => {
        // Inicializar Socket.IO com opções
        const socket = io(socketUrl, {
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
          setSocketStatus('Conectado');
          setSocketResponse({ id: socket.id, connected: true });
          socket.disconnect();
          setLoading(false);
          resolve(true);
        });
        
        socket.on('connect_error', (error) => {
          console.error('Erro na conexão Socket.IO:', error.message);
          console.error('Detalhes do erro:', error);
          setSocketStatus('Falha');
          setError(error.message);
          socket.disconnect();
          setLoading(false);
          reject(error);
        });
        
        // Definir um timeout
        setTimeout(() => {
          if (socket.connected) return;
          socket.disconnect();
          setSocketStatus('Timeout');
          setError('Timeout na conexão Socket.IO');
          setLoading(false);
          reject(new Error('Timeout na conexão Socket.IO'));
        }, 10000);
      });
    } catch (error) {
      console.error('Erro ao inicializar Socket.IO:', error.message);
      console.error('Detalhes do erro:', error);
      setSocketStatus('Falha');
      setError(error.message);
      setLoading(false);
      return false;
    }
  };

  // Estilo para o componente
  const styles = {
    container: {
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      textAlign: 'center',
      marginBottom: '20px'
    },
    section: {
      marginBottom: '20px',
      padding: '15px',
      border: '1px solid #ddd',
      borderRadius: '5px'
    },
    button: {
      padding: '10px 15px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginRight: '10px'
    },
    buttonDisabled: {
      padding: '10px 15px',
      backgroundColor: '#cccccc',
      color: '#666666',
      border: 'none',
      borderRadius: '4px',
      cursor: 'not-allowed',
      marginRight: '10px'
    },
    status: {
      fontWeight: 'bold',
      marginLeft: '10px'
    },
    success: {
      color: 'green'
    },
    error: {
      color: 'red'
    },
    testing: {
      color: 'orange'
    },
    response: {
      marginTop: '15px',
      padding: '10px',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px',
      overflowX: 'auto'
    }
  };

  // Função para obter a cor do status
  const getStatusStyle = (status) => {
    if (status === 'Conectado') return styles.success;
    if (status === 'Falha' || status === 'Timeout') return styles.error;
    if (status === 'Testando...') return styles.testing;
    return {};
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Teste de Conexão SSL</h1>
        <p>Este componente testa a conexão com a API e Socket.IO, verificando se as configurações SSL estão funcionando corretamente.</p>
      </div>
      
      <div style={styles.section}>
        <h2>Conexão com a API</h2>
        <button 
          onClick={testApiConnection} 
          disabled={loading}
          style={loading ? styles.buttonDisabled : styles.button}
        >
          Testar API
        </button>
        <span style={{...styles.status, ...getStatusStyle(apiStatus)}}>
          Status: {apiStatus}
        </span>
        
        {apiResponse && (
          <div style={styles.response}>
            <h3>Resposta da API:</h3>
            <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
        )}
      </div>
      
      <div style={styles.section}>
        <h2>Conexão com Socket.IO</h2>
        <button 
          onClick={testSocketConnection} 
          disabled={loading}
          style={loading ? styles.buttonDisabled : styles.button}
        >
          Testar Socket.IO
        </button>
        <span style={{...styles.status, ...getStatusStyle(socketStatus)}}>
          Status: {socketStatus}
        </span>
        
        {socketResponse && (
          <div style={styles.response}>
            <h3>Resposta do Socket.IO:</h3>
            <pre>{JSON.stringify(socketResponse, null, 2)}</pre>
          </div>
        )}
      </div>
      
      {error && (
        <div style={styles.section}>
          <h2 style={styles.error}>Erro</h2>
          <div style={styles.response}>
            <pre>{error}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSSLConnection;
