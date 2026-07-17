#!/usr/bin/env node
/**
 * Fetch Meebit traits for IDs 1..20000 from https://meebits.app/meebit/{id}
 * and write a compact JSON dataset for the app.
 *
 * Usage:
 *   npm run traits:fetch
 *   npm run traits:fetch -- --concurrency 12
 *
 * Resumes from checkpoint if interrupted.
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public', 'data')
const OUT_FILE = join(OUT_DIR, 'meebit-traits.json')
const CHECKPOINT_FILE = join(OUT_DIR, 'meebit-traits.checkpoint.json')

const TOTAL = 20000
const SOURCE = 'https://meebits.app/meebit/{id}'
const DEFAULT_CONCURRENCY = 10
const SAVE_EVERY = 100
const MAX_RETRIES = 5

function parseArgs(argv) {
  const concurrencyIndex = argv.indexOf('--concurrency')
  const concurrency =
    concurrencyIndex >= 0 ? Number(argv[concurrencyIndex + 1]) : DEFAULT_CONCURRENCY
  return {
    concurrency: Number.isFinite(concurrency) && concurrency > 0 ? concurrency : DEFAULT_CONCURRENCY,
  }
}

function loadCheckpoint() {
  if (!existsSync(CHECKPOINT_FILE)) {
    return { byId: {} }
  }
  try {
    const parsed = JSON.parse(readFileSync(CHECKPOINT_FILE, 'utf8'))
    return { byId: parsed.byId && typeof parsed.byId === 'object' ? parsed.byId : {} }
  } catch {
    return { byId: {} }
  }
}

function attributesToTraits(attributes) {
  const traits = {}
  if (!Array.isArray(attributes)) return traits
  for (const entry of attributes) {
    if (!entry || typeof entry.trait_type !== 'string') continue
    traits[entry.trait_type] = String(entry.value ?? '')
  }
  return traits
}

async function fetchTraits(id, attempt = 1) {
  const url = `https://meebits.app/meebit/${id}`
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'find-the-meebits-traits-fetcher/1.0',
    },
  })

  if (response.status === 429 || response.status >= 500) {
    if (attempt >= MAX_RETRIES) {
      throw new Error(`HTTP ${response.status}`)
    }
    const waitMs = attempt * 800 + Math.floor(Math.random() * 400)
    await new Promise((resolve) => setTimeout(resolve, waitMs))
    return fetchTraits(id, attempt + 1)
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const data = await response.json()
  return attributesToTraits(data.attributes)
}

function saveCheckpoint(byId) {
  mkdirSync(OUT_DIR, { recursive: true })
  const temp = `${CHECKPOINT_FILE}.tmp`
  writeFileSync(
    temp,
    JSON.stringify({
      version: 1,
      source: SOURCE,
      updatedAt: new Date().toISOString(),
      count: Object.keys(byId).length,
      byId,
    }),
  )
  renameSync(temp, CHECKPOINT_FILE)
}

function saveFinal(byId) {
  mkdirSync(OUT_DIR, { recursive: true })
  const ids = Object.keys(byId)
    .map(Number)
    .sort((a, b) => a - b)
  const ordered = {}
  for (const id of ids) {
    ordered[String(id)] = byId[String(id)]
  }

  const payload = {
    version: 1,
    source: SOURCE,
    fetchedAt: new Date().toISOString(),
    count: ids.length,
    byId: ordered,
  }

  const temp = `${OUT_FILE}.tmp`
  writeFileSync(temp, JSON.stringify(payload))
  renameSync(temp, OUT_FILE)
}

async function main() {
  const { concurrency } = parseArgs(process.argv.slice(2))
  const { byId } = loadCheckpoint()
  const missing = []
  for (let id = 1; id <= TOTAL; id += 1) {
    if (!byId[String(id)]) missing.push(id)
  }

  console.log(
    `Meebit traits fetch: ${TOTAL - missing.length}/${TOTAL} done, ${missing.length} remaining (concurrency=${concurrency})`,
  )

  if (missing.length === 0) {
    saveFinal(byId)
    console.log(`Already complete. Wrote ${OUT_FILE}`)
    return
  }

  let completedSinceSave = 0
  let failures = 0
  let cursor = 0
  const startedAt = Date.now()

  async function worker() {
    while (cursor < missing.length) {
      const index = cursor
      cursor += 1
      const id = missing[index]
      try {
        byId[String(id)] = await fetchTraits(id)
      } catch (error) {
        failures += 1
        console.error(`#${id} failed: ${error instanceof Error ? error.message : error}`)
        continue
      }

      completedSinceSave += 1
      const have = Object.keys(byId).length
      if (have % 200 === 0 || completedSinceSave >= SAVE_EVERY) {
        saveCheckpoint(byId)
        completedSinceSave = 0
        const elapsed = (Date.now() - startedAt) / 1000
        const progressed = have - (TOTAL - missing.length)
        const rate = progressed / Math.max(elapsed, 0.001)
        const remain = TOTAL - have
        const eta = rate > 0 ? Math.round(remain / rate) : '?'
        console.log(`progress ${have}/${TOTAL} (${rate.toFixed(1)}/s, eta ~${eta}s, failures=${failures})`)
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()))
  saveCheckpoint(byId)
  saveFinal(byId)

  const finalCount = Object.keys(byId).length
  console.log(`Done. ${finalCount}/${TOTAL} traits saved to ${OUT_FILE} (failures this run: ${failures})`)
  if (finalCount < TOTAL) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
