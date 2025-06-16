import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Allow external connections
  },
  // Environment variables configuration
  define: {
    // Use production API for both development and production
    'import.meta.env.VITE_API_URL': JSON.stringify('https://iwanyu-backend.onrender.com/api'),
  },
})
