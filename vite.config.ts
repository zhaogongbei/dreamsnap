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
    chunkSizeWarningLimit: 1500, // Increase to 1.5MB to suppress warnings
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
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
      },
    },
  },
})
