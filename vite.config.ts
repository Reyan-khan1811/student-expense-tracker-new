import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Recharts ESM fix for Vercel/Node bundling
      'recharts': 'recharts/es6'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'framer-motion', 'recharts', 'date-fns']
        }
      }
    }
  }
})
