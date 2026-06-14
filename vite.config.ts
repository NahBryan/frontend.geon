import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from "@tailwindcss/vite"
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    host: '0.0.0.0',
    // Uses Render's port or defaults to 5173 locally
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173, 
    allowedHosts: true // Prevents "Invalid Host Header" errors on Render's domain
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
