/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const resolveNodeModule = (moduleName) => path.resolve(__dirname, 'node_modules', moduleName)

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    fs: {
      // Allow serving files from outside of the root directory
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared/src'),
      '@bc/shared': path.resolve(__dirname, '../shared/src'),
      react: resolveNodeModule('react'),
      'react-dom': resolveNodeModule('react-dom'),
      '@reduxjs/toolkit': resolveNodeModule('@reduxjs/toolkit'),
      'react-redux': resolveNodeModule('react-redux')
    },
    preserveSymlinks: true
  },
  define: {
    global: 'globalThis',
    'process.env': '{}',
    'window.__ENV__': JSON.stringify({
      VITE_API_URL: process.env.VITE_API_URL,
      NODE_ENV: process.env.NODE_ENV || 'development'
    })
  },
  optimizeDeps: {
    include: ['@reduxjs/toolkit', 'react-redux'],
    exclude: ['@react-native-async-storage/async-storage']
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@heroicons/react']
        }
      }
    }
  }
})
