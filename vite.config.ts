import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['lucide-react'],
    exclude: []
  },
  resolve: {
    alias: [
      {
        find: 'lucide-react',
        replacement: path.resolve(__dirname, 'node_modules/lucide-react')
      }
    ]
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