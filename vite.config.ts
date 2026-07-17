import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/** Local VRM Worker (`npm run vrm-worker:dev`). Override via VRM_WORKER_DEV_URL in shell if needed. */
const vrmWorkerDevUrl = process.env.VRM_WORKER_DEV_URL ?? 'http://127.0.0.1:8787'

/** Serve index.html for /jp so locale SPA routes work in vite/preview. */
function jpSpaFallback(): Plugin {
  return {
    name: 'jp-spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (url === '/jp' || url === '/jp/') {
          const html = readFileSync(resolve(server.config.root, 'index.html'), 'utf-8')
          server.transformIndexHtml(url, html).then((transformed) => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html')
            res.end(transformed)
          }, next)
          return
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), jpSpaFallback()],
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
