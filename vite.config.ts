import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    open: false,
    port: 5173,
    host: true
  },
  preview: {
    port: 5173,
    host: true
  }
});