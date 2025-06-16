import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Allow external connections
  },
  // Ensure environment variables are available
  define: {
    // Add production API URL
    'import.meta.env.VITE_API_URL': JSON.stringify('https://iwanyu-backend.onrender.com/api'),
  },
})
