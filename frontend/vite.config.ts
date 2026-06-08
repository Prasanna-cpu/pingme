import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server : {
    port : 2500,
    // Proxy API calls to the backend during development so the frontend and backend
    // share the same origin. This allows cookies (jwt) to be set and sent correctly
    // without cross-site SameSite issues.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      },
      '/auth': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
