#!/usr/bin/env node
/**
 * Upload generated previews to R2 (previews/v1/{id}.webp).
 *
 * Usage:
 *   npm run previews:upload
 *   npm run previews:upload -- --dir previews-out/v1 --from 1 --to 500
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const BUCKET = 'meebits-vrm'
const PREVIEW_VERSION = 1

function parseArgs(argv) {
  let dir = join(process.cwd(), 'previews-out', `v${PREVIEW_VERSION}`)
  let from = 1
  let to = 20000

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--dir') dir = argv[++i]
    else if (arg === '--from') from = Number(argv[++i])
    else if (arg === '--to') to = Number(argv[++i])
  }

  return { dir, from, to }
}

function main() {
  const { dir, from, to } = parseArgs(process.argv.slice(2))
  if (!existsSync(dir)) {
    console.error(`Directory not found: ${dir}`)
    process.exit(1)
  }

  const files = readdirSync(dir).filter((name) => /^\d+\.(webp|png)$/.test(name))
  let uploaded = 0
  let failed = 0

  for (const name of files) {
    const id = Number(name.replace(/\.\w+$/, ''))
    if (!Number.isFinite(id) || id < from || id > to) continue

    const ext = name.endsWith('.png') ? 'png' : 'webp'
    const localPath = join(dir, name)
    const key = `previews/v${PREVIEW_VERSION}/${id}.${ext}`
    const contentType = ext === 'png' ? 'image/png' : 'image/webp'

    process.stdout.write(`Uploading #${id} → ${key} ... `)
    const result = spawnSync(
      'npx',
      [
        'wrangler',
        'r2',
        'object',
        'put',
        `${BUCKET}/${key}`,
        `--file=${localPath}`,
        `--content-type=${contentType}`,
        '--cache-control=public, max-age=31536000, immutable',
      ],
      { stdio: 'inherit' },
    )

    if (result.status === 0) {
      uploaded += 1
      console.log('ok')
    } else {
      failed += 1
      console.log('failed')
    }
  }

  console.log(`Upload complete. uploaded=${uploaded} failed=${failed}`)
  if (failed > 0) process.exitCode = 1
}

main()
