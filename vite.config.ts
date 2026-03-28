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
  build: {
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit to 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          'gemini': [
            '@google/genai',
          ],
          'supabase': [
            '@supabase/supabase-js',
          ],
        },
      },
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
