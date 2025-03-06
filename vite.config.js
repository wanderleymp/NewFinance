import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import https from 'https';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente do arquivo .env.local primeiro
  const env = loadEnv(mode, process.cwd(), '');
  
  // Verifica se a variável VITE_API_URL está definida
  if (!env.VITE_API_URL) {
    throw new Error('VITE_API_URL não está definida no arquivo .env ou .env.local');
  }
  
  // Configuração avançada para o agente HTTPS que ignora erros de certificado
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Ignora erros de certificado
    keepAlive: true,
    timeout: 60000 // 60 segundos
  });
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      strictPort: false, // Permitir usar outra porta se 5173 estiver ocupada
      hmr: {
        port: 5173
      },
      // Configuração de proxy para lidar com certificados SSL em desenvolvimento
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false, // Ignorar erros de certificado SSL
          rewrite: (path) => path.replace(/^\/api/, ''),
          agent: httpsAgent, // Usar agente HTTPS personalizado
          configure: (proxy, _options) => {
            // Adicionar mais logs detalhados
            proxy.on('error', (err, req, res) => {
              console.log('🔴 Erro no proxy:', err.message);
              console.log('URL que causou o erro:', req.url);
              
              // Se o erro for de timeout, responder com um erro personalizado
              if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
                res.writeHead(504, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  error: 'Gateway Timeout', 
                  message: 'A requisição excedeu o tempo limite' 
                }));
              }
            });
            
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('🔄 Proxy request:', req.method, req.url);
              
              // Adicionar headers personalizados
              proxyReq.setHeader('X-Proxy-Agent', 'Vite-Dev-Server');
              
              // Aumentar timeout da requisição
              req.setTimeout(30000); // 30 segundos
            });
            
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log(`🟢 Proxy response: ${proxyRes.statusCode} ${req.method} ${req.url}`);
              
              // Log detalhado para erros 5xx
              if (proxyRes.statusCode >= 500) {
                console.log('⚠️ Erro 5xx detectado na resposta do proxy');
                let body = '';
                proxyRes.on('data', chunk => {
                  body += chunk;
                });
                proxyRes.on('end', () => {
                  try {
                    console.log('Corpo da resposta de erro:', body);
                  } catch (e) {
                    console.log('Não foi possível parsear a resposta de erro');
                  }
                });
              }
            });
            
            // Configurar timeout no objeto options
            _options.proxyTimeout = 45000; // 45 segundos
            _options.timeout = 45000; // 45 segundos
          }
        },
        '/socket.io': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false, // Ignorar erros de certificado SSL
          ws: true, // Suporte a WebSockets
          agent: httpsAgent, // Usar agente HTTPS personalizado
          configure: (proxy, _options) => {
            proxy.on('error', (err, req, res) => {
              console.log('🔴 Erro no proxy WebSocket:', err.message);
              console.log('URL que causou o erro:', req.url);
              
              // Se for uma conexão HTTP (não WebSocket), podemos responder
              if (res && res.writeHead) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  error: 'Bad Gateway', 
                  message: 'Erro na conexão WebSocket' 
                }));
              }
            });
            
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('🔄 WebSocket proxy request:', req.method, req.url);
              
              // Adicionar headers personalizados
              proxyReq.setHeader('X-Proxy-Agent', 'Vite-WebSocket-Proxy');
            });
            
            proxy.on('proxyReqWs', (proxyReq, req, socket, options, head) => {
              console.log('🔄 WebSocket upgrade request:', req.url);
            });
            
            proxy.on('open', (proxySocket) => {
              console.log('🟢 WebSocket connection opened');
            });
            
            proxy.on('close', (proxyRes, proxySocket, proxyHead) => {
              console.log('🟠 WebSocket connection closed');
            });
          }
        }
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        // Aumentar o timeout do esbuild
        keepNames: true,
        define: {
          global: 'globalThis'
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: false
    }
  };
});
