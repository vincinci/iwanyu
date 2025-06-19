import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Allow external connections
  },
  // Environment variables configuration - use development API for local development
  define: mode === 'development' ? {
    // Use local development API
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:3001/api'),
    'import.meta.env.VITE_APP_NAME': JSON.stringify('Iwanyu Store'),
    'import.meta.env.VITE_FRONTEND_URL': JSON.stringify('http://localhost:5173'),
  } : {
    // Force production API for production builds
    'import.meta.env.VITE_API_URL': JSON.stringify('https://iwanyu-backend.onrender.com/api'),
    'import.meta.env.VITE_APP_NAME': JSON.stringify('Iwanyu Store'),
    'import.meta.env.VITE_FRONTEND_URL': JSON.stringify('https://iwanyu.vercel.app'),
  },
}))
