import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/** Local VRM Worker (`npm run vrm-worker:dev`). Override via VRM_WORKER_DEV_URL in shell if needed. */
const vrmWorkerDevUrl = process.env.VRM_WORKER_DEV_URL ?? 'http://127.0.0.1:8787'

const SPA_FALLBACK_PATHS = new Set([
  '/jp',
  '/jp/',
  '/v2',
  '/v2/',
  '/jp/v2',
  '/jp/v2/',
  '/8th-street',
  '/8th-street/',
  '/jp/8th-street',
  '/jp/8th-street/',
  '/mountain',
  '/mountain/',
  '/jp/mountain',
  '/jp/mountain/',
  '/neon-stack',
  '/neon-stack/',
  '/jp/neon-stack',
  '/jp/neon-stack/',
  '/runway',
  '/runway/',
  '/jp/runway',
  '/jp/runway/',
  '/look-locker',
  '/look-locker/',
  '/jp/look-locker',
  '/jp/look-locker/',
  '/meet-sergito',
  '/meet-sergito/',
  '/jp/meet-sergito',
  '/jp/meet-sergito/',
  '/opensea-market',
  '/opensea-market/',
  '/jp/opensea-market',
  '/jp/opensea-market/',
  '/shooting-gallery',
  '/shooting-gallery/',
  '/jp/shooting-gallery',
  '/jp/shooting-gallery/',
  '/starlight-rush',
  '/starlight-rush/',
  '/jp/starlight-rush',
  '/jp/starlight-rush/',
  '/shore-fishing',
  '/shore-fishing/',
  '/jp/shore-fishing',
  '/jp/shore-fishing/',
  '/photo-booth',
  '/photo-booth/',
  '/jp/photo-booth',
  '/jp/photo-booth/',
  '/pfp-studio',
  '/pfp-studio/',
  '/jp/pfp-studio',
  '/jp/pfp-studio/',
  '/find-the-meebit',
  '/find-the-meebit/',
  '/jp/find-the-meebit',
  '/jp/find-the-meebit/',
])

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

/** Local OpenSea listings proxy（本番は Vercel /api） */
function openseaListingsDevApi(): Plugin {
  return {
    name: 'opensea-listings-dev-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (url !== '/api/opensea/meebits-listings') {
          next()
          return
        }
        if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }
        try {
          const { fetchMeebitsListings, LISTINGS_CACHE_CONTROL } = await import(
            './api/opensea/meebits-listings'
          )
          const payload = await fetchMeebitsListings({
            apiKey: env.OPENSEA_API_KEY || process.env.OPENSEA_API_KEY || '',
          })
          if (payload.error) {
            console.warn('[opensea-listings-dev-api]', payload.error)
          }
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.setHeader('Cache-Control', LISTINGS_CACHE_CONTROL)
          res.end(JSON.stringify(payload))
        } catch (error) {
          const message = error instanceof Error ? error.message : 'fetch failed'
          console.error('[opensea-listings-dev-api]', message)
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(
            JSON.stringify({
              updatedAt: new Date().toISOString(),
              listings: [],
              error: message,
            }),
          )
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), spaPathFallback(), openseaListingsDevApi()],
  server: {
    proxy: {
      '/vrm': {
        target: vrmWorkerDevUrl,
        changeOrigin: true,
      },
      '/previews': {
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
      '/previews': {
        target: vrmWorkerDevUrl,
        changeOrigin: true,
      },
    },
  },
})
