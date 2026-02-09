import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router-dom/')
          ) {
            return 'react-core'
          }

          if (
            id.includes('/@mui/') ||
            id.includes('/@emotion/')
          ) {
            return 'mui-core'
          }

          if (id.includes('/recharts/')) {
            return 'charts'
          }

          if (id.includes('/@supabase/supabase-js/')) {
            return 'supabase'
          }

          if (id.includes('/framer-motion/')) {
            return 'motion'
          }
          return undefined
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
