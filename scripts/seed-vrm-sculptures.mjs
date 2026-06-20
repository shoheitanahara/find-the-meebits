#!/usr/bin/env node
/**
 * Pre-seed fixed VRM assets (sculptures + default player) into R2.
 * Requires: wrangler login, bucket `meebits-vrm` created.
 *
 * Usage: npm run vrm:seed
 */
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BUCKET = 'meebits-vrm'
const UPSTREAM = 'https://files.meebits.app'

/** Keep in sync with worldLandmarks.ts + gameConfig.ts */
const MEEBIT_IDS = [
  17600, 11143, 8506, 605, 10326, 11796, 7347, 3458, 8369,
  4274, // DEFAULT_PLAYER_MEEBIT_ID
]

const tempDir = mkdtempSync(join(tmpdir(), 'vrm-seed-'))

try {
  for (const id of MEEBIT_IDS) {
    const key = `vrm/${id}.vrm`
    const filePath = join(tempDir, `${id}.vrm`)
    const url = `${UPSTREAM}/vrm/${id}.vrm`

    process.stdout.write(`Fetching #${id}... `)
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`failed (${response.status})`)
      process.exitCode = 1
      continue
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    writeFileSync(filePath, buffer)
    console.log(`${(buffer.byteLength / 1024).toFixed(0)} KB`)

    process.stdout.write(`  Uploading to R2 (${key})... `)
    const result = spawnSync(
      'npx',
      [
        'wrangler',
        'r2',
        'object',
        'put',
        `${BUCKET}/${key}`,
        `--file=${filePath}`,
        '--content-type=model/vrm',
      ],
      { stdio: 'inherit' },
    )

    if (result.status !== 0) {
      console.error('upload failed')
      process.exitCode = 1
    } else {
      console.log('ok')
    }
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true })
}
