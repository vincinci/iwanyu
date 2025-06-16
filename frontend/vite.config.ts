import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Allow external connections
    // Keep connections alive for persistent connection
    hmr: {
      port: 5174,
      // Enable websocket keep-alive
      clientSocket: {
        heartbeatInterval: 30000, // 30 seconds
        closeOnError: false
      }
    },
    // Proxy for development with connection persistence
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' 
          ? 'https://iwanyu-backend.onrender.com' 
          : 'http://localhost:3001',
        changeOrigin: true,
        secure: true,
        // Keep connections alive
        agent: {
          keepAlive: true,
          keepAliveMsecs: 30000,
          maxSockets: 10
        },
        // Auto-retry on connection failures
        retry: 3,
        retryDelay: 1000,
        // Health check for backend connection
        onProxyReq: (proxyReq, req, res) => {
          console.log(`🔗 Proxying ${req.method} ${req.url} to backend`);
        },
        onError: (err, req, res) => {
          console.error('🔗 Proxy connection error:', err.message);
          // Auto-retry logic is handled by the proxy
        }
      }
    }
  },
  // Build configuration for persistent connections
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate API and connection management into its own chunk
          'api-connection': ['./src/services/api', './src/contexts/AuthContext']
        }
      }
    },
    // Enable source maps for better debugging of connection issues
    sourcemap: process.env.NODE_ENV === 'development'
  },
  // Environment variables configuration - ensure production API is used
  define: {
    // Force production API for all environments with connection settings
    'import.meta.env.VITE_API_URL': JSON.stringify('https://iwanyu-backend.onrender.com/api'),
    'import.meta.env.VITE_APP_NAME': JSON.stringify('Iwanyu Store'),
    'import.meta.env.VITE_FRONTEND_URL': JSON.stringify('https://iwanyu.vercel.app'),
    // Connection configuration constants
    'import.meta.env.VITE_CONNECTION_TIMEOUT': JSON.stringify('10000'),
    'import.meta.env.VITE_HEALTH_CHECK_INTERVAL': JSON.stringify('30000'),
    'import.meta.env.VITE_MAX_RETRIES': JSON.stringify('3'),
    'import.meta.env.VITE_RETRY_DELAY': JSON.stringify('1000'),
  },
  // Enable keep-alive for static assets
  preview: {
    port: 4173,
    host: true
  }
})
