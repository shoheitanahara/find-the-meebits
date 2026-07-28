#!/usr/bin/env node
/**
 * Generate Meebit preview WebPs (same framing as TargetPreviewCapture) into previews-out/.
 *
 * Prerequisites:
 *   npx playwright install chromium
 *   Local VRM Worker running OR files.meebits.app reachable
 *
 * Usage:
 *   npm run previews:generate
 *   npm run previews:generate -- --from 1 --to 500
 *   npm run previews:generate -- --vrm-origin https://files.meebits.app
 */
import { createServer } from 'node:http'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PREVIEW_HTML = join(ROOT, 'scripts', 'preview-gen.html')
const DEFAULT_OUT = join(ROOT, 'previews-out', 'v1')
const PREVIEW_VERSION = 1
const DEFAULT_VRM_ORIGIN = process.env.VRM_ORIGIN ?? 'http://127.0.0.1:8787'
const DEFAULT_FROM = 1
const DEFAULT_TO = 20000
const DEFAULT_CONCURRENCY = 2

function parseArgs(argv) {
  let from = DEFAULT_FROM
  let to = DEFAULT_TO
  let outDir = DEFAULT_OUT
  let vrmOrigin = DEFAULT_VRM_ORIGIN
  let concurrency = DEFAULT_CONCURRENCY

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--from') from = Number(argv[++i])
    else if (arg === '--to') to = Number(argv[++i])
    else if (arg === '--out') outDir = argv[++i]
    else if (arg === '--vrm-origin') vrmOrigin = argv[++i]
    else if (arg === '--concurrency') concurrency = Number(argv[++i])
  }

  return { from, to, outDir, vrmOrigin, concurrency }
}

async function probeVrmOrigin(origin) {
  try {
    const response = await fetch(`${origin.replace(/\/$/, '')}/vrm/1.vrm`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(8_000),
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Playwright 用ローカルサーバ。
 * `/vrm/*` は VRM origin へプロキシする（ランダムポート→Worker の CORS 拒否を避ける）。
 */
function startStaticServer(vrmOrigin) {
  const html = readFileSync(PREVIEW_HTML)
  const upstream = vrmOrigin.replace(/\/$/, '')

  return createServer(async (req, res) => {
    const url = req.url ?? '/'

    if (url.startsWith('/preview-gen.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(html)
      return
    }

    const vrmMatch = url.match(/^\/vrm\/(\d+)\.vrm(?:\?.*)?$/)
    if (vrmMatch) {
      try {
        const upstreamRes = await fetch(`${upstream}/vrm/${vrmMatch[1]}.vrm`)
        if (!upstreamRes.ok) {
          res.writeHead(upstreamRes.status, { 'Content-Type': 'text/plain' })
          res.end(`Upstream VRM ${upstreamRes.status}`)
          return
        }
        const buffer = Buffer.from(await upstreamRes.arrayBuffer())
        res.writeHead(200, {
          'Content-Type': upstreamRes.headers.get('content-type') ?? 'model/vrm',
          'Content-Length': buffer.length,
          'Cache-Control': 'no-store',
        })
        res.end(buffer)
      } catch (error) {
        res.writeHead(502, { 'Content-Type': 'text/plain' })
        res.end(`VRM proxy failed: ${error instanceof Error ? error.message : error}`)
      }
      return
    }

    res.writeHead(404)
    res.end('Not found')
  }).listen(0, '127.0.0.1')
}

async function loadPlaywright() {
  try {
    return await import('playwright')
  } catch {
    console.error('Playwright is required: npm install -D playwright && npx playwright install chromium')
    process.exit(1)
  }
}

async function captureOne(page, baseUrl, id, outDir, vrmOrigin) {
  const webpPath = join(outDir, `${id}.webp`)
  const pngPath = join(outDir, `${id}.png`)
  if (existsSync(webpPath) || existsSync(pngPath)) {
    return 'skip'
  }

  const url = `${baseUrl}/preview-gen.html?id=${id}&vrmOrigin=${encodeURIComponent(vrmOrigin)}`
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120_000 })
  await page.waitForFunction(() => window.__PREVIEW_READY__ === true || window.__PREVIEW_ERROR__, null, {
    timeout: 120_000,
  })

  const error = await page.evaluate(() => window.__PREVIEW_ERROR__)
  if (error) {
    throw new Error(String(error))
  }

  const pngBuffer = await page.locator('canvas').screenshot({ type: 'png' })

  try {
    const sharp = await import('sharp')
    await sharp.default(pngBuffer).webp({ quality: 82 }).toFile(webpPath)
  } catch {
    writeFileSync(pngPath, pngBuffer)
    return 'png'
  }

  return 'ok'
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  let { from, to, outDir, vrmOrigin, concurrency } = args
  mkdirSync(outDir, { recursive: true })

  if (!(await probeVrmOrigin(vrmOrigin))) {
    const fallbacks = ['http://127.0.0.1:8787', 'http://127.0.0.1:8788', 'https://files.meebits.app']
      .filter((origin) => origin !== vrmOrigin)
    let found = null
    for (const candidate of fallbacks) {
      if (await probeVrmOrigin(candidate)) {
        found = candidate
        break
      }
    }
    if (!found) {
      console.error(
        `VRM origin unreachable: ${vrmOrigin}\n` +
          'Start the local worker (`npm run vrm-worker:dev` / `npm run dev`) or pass --vrm-origin.',
      )
      process.exit(1)
    }
    console.warn(`VRM origin ${vrmOrigin} unreachable — using ${found}`)
    vrmOrigin = found
  }

  const { chromium } = await loadPlaywright()
  const server = startStaticServer(vrmOrigin)
  await new Promise((resolve) => server.once('listening', resolve))
  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 0
  const baseUrl = `http://127.0.0.1:${port}`
  // ページからは同一オリジンのプロキシ経由で VRM を取る（CORS 回避）
  const pageVrmOrigin = baseUrl

  console.log(`Generating previews v${PREVIEW_VERSION}: #${from}..#${to}`)
  console.log(`VRM upstream: ${vrmOrigin} (proxied via ${baseUrl})`)
  console.log(`Output: ${outDir}`)

  const browser = await chromium.launch({ headless: true })
  const pages = await Promise.all(
    Array.from({ length: concurrency }, async () => {
      const context = await browser.newContext({ viewport: { width: 320, height: 320 } })
      return context.newPage()
    }),
  )

  let ok = 0
  let skipped = 0
  let failed = 0
  const ids = Array.from({ length: to - from + 1 }, (_, i) => from + i)
  let cursor = 0

  async function worker(page) {
    while (cursor < ids.length) {
      const id = ids[cursor]
      cursor += 1
      try {
        const result = await captureOne(page, baseUrl, id, outDir, pageVrmOrigin)
        if (result === 'skip') {
          skipped += 1
        } else {
          ok += 1
          if (ok % 25 === 0) {
            console.log(`  ${ok} generated (latest #${id})`)
          }
        }
      } catch (error) {
        failed += 1
        console.error(`  #${id} failed: ${error instanceof Error ? error.message : error}`)
      }
    }
  }

  await Promise.all(pages.map((page) => worker(page)))
  await browser.close()
  server.close()

  console.log(`Done. generated=${ok} skipped=${skipped} failed=${failed}`)
  if (failed > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
