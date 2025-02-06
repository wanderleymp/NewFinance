import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente do arquivo .env.local primeiro
  const env = loadEnv(mode, process.cwd(), '');
  
  // Verifica se a variável VITE_API_URL está definida
  if (!env.VITE_API_URL) {
    throw new Error('VITE_API_URL não está definida no arquivo .env ou .env.local');
  }
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      hmr: {
        port: 5173
      },
      // Removido proxy para usar a URL da API diretamente
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
