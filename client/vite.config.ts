import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        // Same-origin in the browser → no CORS issues with Sanctum cookies.
        // Do NOT proxy /auth/* broadly — /auth/callback is a React route.
        '^/(api|sanctum|login|logout|register|auth/tmdb|forgot-password|reset-password|email|verify-email|storage|up)':
          {
            target: apiTarget,
            changeOrigin: true,
          },
      },
    },
  }
})
