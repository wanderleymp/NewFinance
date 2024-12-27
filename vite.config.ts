import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  esbuild: {
    loader: 'tsx',
    target: 'es2019',
  },
  server: {
    hmr: {
      overlay: true,
    },
  },
});