import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/** Local VRM Worker (`npm run vrm-worker:dev`). Override via VRM_WORKER_DEV_URL in shell if needed. */
const vrmWorkerDevUrl = process.env.VRM_WORKER_DEV_URL ?? 'http://127.0.0.1:8787'

const SPA_FALLBACK_PATHS = new Set(['/jp', '/jp/', '/v2', '/v2/', '/jp/v2', '/jp/v2/'])

/** Serve index.html for locale / edition SPA routes in vite/preview. */
function spaPathFallback(): Plugin {
  return {
    name: 'spa-path-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (!SPA_FALLBACK_PATHS.has(url)) {
          next()
          return
        }

        const html = readFileSync(resolve(server.config.root, 'index.html'), 'utf-8')
        server.transformIndexHtml(url, html).then((transformed) => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/html')
          res.end(transformed)
        }, next)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), spaPathFallback()],
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
