import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/gemini': {
        target: 'https://undyapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gemini/, '/v1beta'),
        secure: true,
        // Fallback to backup URLs on error
        onError: (err, req, res) => {
          console.error('Primary API failed, would try backup URLs in production');
        },
      },
    },
  },
})
