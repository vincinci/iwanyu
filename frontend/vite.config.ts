import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Allow external connections
  },
  // Environment variables configuration - ensure production API is used
  define: {
    // Force production API for all environments
    'import.meta.env.VITE_API_URL': JSON.stringify('https://iwanyu-backend.onrender.com/api'),
    'import.meta.env.VITE_APP_NAME': JSON.stringify('Iwanyu Store'),
    'import.meta.env.VITE_FRONTEND_URL': JSON.stringify('https://iwanyu.vercel.app'),
  },
})
