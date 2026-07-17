#!/usr/bin/env node
/**
 * Download Meebit trait render WebPs into public/traits/.
 *
 * Color handling (matches meebits.com):
 * - Patterned colors share one file by value: camo.webp, argyle.webp, ...
 * - Solid colors are CSS hex (saved in meebit-trait-colors.json), not images
 * - Special hair colors purple_dye / rainbow use hair_color_*.webp
 * - Tattoo Motif / Tattoo Yes → tattoo_yes.webp only (no tattoo_no)
 *
 * Usage: npm run traits:images
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TRAITS_JSON = join(ROOT, 'public', 'data', 'meebit-traits.json')
const OUT_DIR = join(ROOT, 'public', 'traits')
const MANIFEST_FILE = join(ROOT, 'public', 'data', 'meebit-trait-renders.json')
const COLORS_FILE = join(ROOT, 'public', 'data', 'meebit-trait-colors.json')
const CDN = 'https://cdn.meebco.com/trait-renders'
const CONCURRENCY = 8
const MAX_RETRIES = 4

/** Solid colors used as CSS bg on meebits.com (not CDN images). */
const SOLID_COLORS = {
  beard_color_blond: '#f7eccb',
  beard_color_brown: '#8f725e',
  beard_color_dark: '#3a3a3a',
  beard_color_silver: '#e9e9e9',
  glasses_color_charcoal: '#33404d',
  glasses_color_dark_red: '#a43033',
  glasses_color_white: '#eeeeee',
  hair_color_auburn: '#f54e3e',
  hair_color_bleached: '#e4e1d5',
  hair_color_blond: '#f7eccb',
  hair_color_blonde: '#f7e5af',
  hair_color_blue: '#010bde',
  hair_color_brown: '#8f725e',
  hair_color_dark: '#3a3a3a',
  hair_color_dyed_red: '#e03645',
  hair_color_light_blue: '#79c9ee',
  hair_color_silver: '#e9e9e9',
  hat_color_black: '#2E2E30',
  hat_color_gray: '#b4c1c8',
  hat_color_green: '#3ebb3e',
  hat_color_magenta: '#af27bd',
  hat_color_purple: '#6f2dde',
  hat_color_red: '#bc193e',
  hat_color_white: '#eeeeee',
  hat_color_yellow: '#d6c128',
  overshirt_color_black: '#2E2E30',
  overshirt_color_gray: '#b4c1c8',
  overshirt_color_green: '#3ebb3e',
  overshirt_color_magenta: '#af27bd',
  overshirt_color_purple: '#6f2dde',
  overshirt_color_red: '#bc193e',
  overshirt_color_white: '#eeeeee',
  overshirt_color_yellow: '#d6c128',
  pants_color_black: '#2E2E30',
  pants_color_dark_gray: '#6b6b6b',
  pants_color_dark_red: '#a43033',
  pants_color_denim: '#4266a8',
  pants_color_gray: '#b4c1c8',
  pants_color_green: '#3ebb3e',
  pants_color_magenta: '#af27bd',
  pants_color_purple: '#6f2dde',
  pants_color_red: '#bc193e',
  pants_color_white: '#eeeeee',
  pants_color_yellow: '#d6c128',
  shirt_color_black: '#2E2E30',
  shirt_color_gray: '#b4c1c8',
  shirt_color_green: '#3ebb3e',
  shirt_color_magenta: '#af27bd',
  shirt_color_purple: '#6f2dde',
  shirt_color_red: '#bc193e',
  shirt_color_white: '#eeeeee',
  shirt_color_yellow: '#d6c128',
  shoes_color_black: '#2E2E30',
  shoes_color_gray: '#b4c1c8',
  shoes_color_green: '#3ebb3e',
  shoes_color_magenta: '#af27bd',
  shoes_color_purple: '#6f2dde',
  shoes_color_red: '#bc193e',
  shoes_color_white: '#eeeeee',
  shoes_color_yellow: '#d6c128',
}

/** Shared patterned color / tattoo image remaps (value-based filenames). */
const PATTERN_FILES = [
  'argyle.webp',
  'blue_camo.webp',
  'camo.webp',
  'green_plaid.webp',
  'leopard_print.webp',
  'luxe.webp',
  'posh.webp',
  'red_plaid.webp',
  'tattoo_yes.webp',
]

/** Special non-solid colors that keep type_value filenames on CDN. */
const SPECIAL_COLOR_FILES = ['hair_color_purple_dye.webp', 'hair_color_rainbow.webp']

const COLOR_TYPES = new Set([
  'Hair Color',
  'Beard Color',
  'Shirt Color',
  'Pants Color',
  'Shoes Color',
  'Hat Color',
  'Glasses Color',
  'Overshirt Color',
])

function slugify(text) {
  return String(text)
    .replace(/['']/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
}

function traitKey(type, value) {
  return `${slugify(type)}_${slugify(value)}`
}

function collectPartSlugs() {
  const data = JSON.parse(readFileSync(TRAITS_JSON, 'utf8'))
  /** @type {Map<string, { type: string, value: string }>} */
  const slugs = new Map()
  for (const traits of Object.values(data.byId)) {
    for (const [type, value] of Object.entries(traits)) {
      if (COLOR_TYPES.has(type)) continue
      if (type === 'Tattoo Motif') continue
      if (type === 'Tattoo' && value !== 'Yes') continue
      const slug = traitKey(type, value)
      if (!slugs.has(slug)) slugs.set(slug, { type, value })
    }
  }
  return slugs
}

async function downloadFile(filename, attempt = 1) {
  const url = `${CDN}/${filename}`
  const response = await fetch(url, {
    headers: {
      Accept: 'image/webp,image/*,*/*',
      'User-Agent': 'find-the-meebits-trait-image-fetcher/1.0',
    },
  })

  if (response.status === 429 || response.status >= 500) {
    if (attempt >= MAX_RETRIES) throw new Error(`HTTP ${response.status}`)
    await new Promise((r) => setTimeout(r, attempt * 700))
    return downloadFile(filename, attempt + 1)
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}`)

  const buffer = Buffer.from(await response.arrayBuffer())
  const outPath = join(OUT_DIR, filename)
  const tempPath = `${outPath}.tmp`
  writeFileSync(tempPath, buffer)
  renameSync(tempPath, outPath)
  return buffer.byteLength
}

async function main() {
  if (!existsSync(TRAITS_JSON)) {
    console.error('Missing public/data/meebit-traits.json — run npm run traits:fetch first')
    process.exitCode = 1
    return
  }

  mkdirSync(OUT_DIR, { recursive: true })

  // Drop obsolete tattoo_no if present
  const tattooNo = join(OUT_DIR, 'tattoo_no.webp')
  if (existsSync(tattooNo)) {
    unlinkSync(tattooNo)
    console.log('removed tattoo_no.webp')
  }

  const partSlugs = collectPartSlugs()
  const downloads = [
    ...[...partSlugs.keys()].map((slug) => `${slug}.webp`),
    ...PATTERN_FILES,
    ...SPECIAL_COLOR_FILES,
  ]
  const uniqueFiles = [...new Set(downloads)]
  const missing = uniqueFiles.filter((file) => !existsSync(join(OUT_DIR, file)))

  console.log(
    `Trait renders: ${uniqueFiles.length - missing.length}/${uniqueFiles.length} on disk, ${missing.length} to download`,
  )

  let failures = 0
  let cursor = 0
  let downloadedBytes = 0

  async function worker() {
    while (cursor < missing.length) {
      const index = cursor
      cursor += 1
      const file = missing[index]
      try {
        const bytes = await downloadFile(file)
        downloadedBytes += bytes
        console.log(`ok ${file} (${(bytes / 1024).toFixed(1)} KB)`)
      } catch (error) {
        failures += 1
        console.error(`fail ${file}: ${error instanceof Error ? error.message : error}`)
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))

  /** @type {Record<string, { type: string, value: string, path: string }>} */
  const bySlug = {}
  /** @type {Record<string, string>} */
  const byTraitKey = {}

  for (const [slug, meta] of partSlugs) {
    const file = `${slug}.webp`
    if (!existsSync(join(OUT_DIR, file))) continue
    const path = `/traits/${file}`
    bySlug[slug] = { type: meta.type, value: meta.value, path }
    byTraitKey[`${meta.type}::${meta.value}`] = path
  }

  // Map patterned color values → shared swatch paths
  const patternValueMap = {
    Argyle: '/traits/argyle.webp',
    'Blue Camo': '/traits/blue_camo.webp',
    Camo: '/traits/camo.webp',
    'Green Plaid': '/traits/green_plaid.webp',
    'Leopard Print': '/traits/leopard_print.webp',
    Luxe: '/traits/luxe.webp',
    Posh: '/traits/posh.webp',
    'Red Plaid': '/traits/red_plaid.webp',
  }
  for (const type of COLOR_TYPES) {
    for (const [value, path] of Object.entries(patternValueMap)) {
      byTraitKey[`${type}::${value}`] = path
    }
  }

  // Special hair colors
  if (existsSync(join(OUT_DIR, 'hair_color_purple_dye.webp'))) {
    byTraitKey['Hair Color::Purple Dye'] = '/traits/hair_color_purple_dye.webp'
  }
  if (existsSync(join(OUT_DIR, 'hair_color_rainbow.webp'))) {
    byTraitKey['Hair Color::Rainbow'] = '/traits/hair_color_rainbow.webp'
  }

  // Tattoo Yes + Motif → same image
  if (existsSync(join(OUT_DIR, 'tattoo_yes.webp'))) {
    byTraitKey['Tattoo::Yes'] = '/traits/tattoo_yes.webp'
  }

  const manifest = {
    version: 2,
    source: `${CDN}/{file}`,
    fetchedAt: new Date().toISOString(),
    count: Object.keys(bySlug).length + PATTERN_FILES.filter((f) => existsSync(join(OUT_DIR, f))).length,
    bySlug,
    byTraitKey,
    patternColors: patternValueMap,
  }

  writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2))
  writeFileSync(
    COLORS_FILE,
    JSON.stringify(
      {
        version: 1,
        source: 'meebits.com solid color map',
        fetchedAt: new Date().toISOString(),
        byTraitKeySlug: SOLID_COLORS,
      },
      null,
      2,
    ),
  )

  console.log(
    `Done. images=${uniqueFiles.length - failures}/${uniqueFiles.length}, +${(downloadedBytes / 1024 / 1024).toFixed(2)} MB. Manifest + colors written. failures=${failures}`,
  )
  if (failures > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
