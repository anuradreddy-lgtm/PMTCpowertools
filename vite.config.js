import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // During local development proxy API calls to the mock server
        target: process.env.MOCK_API_TARGET || 'http://localhost:4000',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
