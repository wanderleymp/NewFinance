import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente do arquivo .env.local primeiro
  const env = loadEnv(mode, process.cwd(), '');
  
  // Verifica se a variável VITE_API_URL está definida
  if (!env.VITE_API_URL) {
    throw new Error('VITE_API_URL não está definida no arquivo .env ou .env.local');
  }
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      hmr: {
        port: 5173
      },
      // Configuração de proxy para lidar com certificados SSL em desenvolvimento
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false, // Ignorar erros de certificado SSL
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        '/socket.io': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false, // Ignorar erros de certificado SSL
          ws: true // Suporte a WebSockets
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
