import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,   // listen on 0.0.0.0
    port: 5173,
    proxy: {
      // Forwards /hf-file/... → https://jbowyer-hunyuan3d-2-1.hf.space/...
      // This avoids CORS when downloading the generated GLB in dev mode.
      '/hf-file': {
        target: 'https://jbowyer-hunyuan3d-2-1.hf.space',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hf-file/, ''),
        secure: false,
      },
    },
  },
})
 