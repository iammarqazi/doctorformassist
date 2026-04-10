import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Lazy load heavy PDF/ZIP libs — only downloaded when user clicks Download
          pdfzip: ['jspdf', 'jszip'],
        },
      },
    },
  },
})
