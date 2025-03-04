import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // Split vendor dependencies
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Increase limit to avoid warnings
  }
});