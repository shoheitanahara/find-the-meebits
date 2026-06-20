import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Local VRM Worker (`npm run vrm-worker:dev`). Override via VRM_WORKER_DEV_URL in shell if needed. */
const vrmWorkerDevUrl = process.env.VRM_WORKER_DEV_URL ?? 'http://127.0.0.1:8787'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/vrm': {
        target: vrmWorkerDevUrl,
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      '/vrm': {
        target: vrmWorkerDevUrl,
        changeOrigin: true,
      },
    },
  },
})
