/**
 * Vercel Serverless: GET /api/opensea/meebits-listings
 * Env: OPENSEA_API_KEY（Developer Portal の永続キー。VITE_ 禁止）
 *
 * 重要: package.json が "type":"module" のため、相対 import（特に ../../src）は
 * FUNCTION_INVOCATION_FAILED になりやすい。このファイルは依存ゼロで完結させる。
 */

type ListedMeebit = {
  tokenId: number
  priceEth: number | null
  orderHash?: string
}

type MeebitsListingsPayload = {
  updatedAt: string
  listings: ListedMeebit[]
  error?: string
}

const MEEBITS_CONTRACT = '0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7'
const COLLECTION_SLUG = 'meebits'
const PAGE_LIMIT = 50
const MAX_UNIQUE_LISTINGS = 80
const MAX_PAGES = 4
const CACHE_TTL_MS = 15 * 60 * 1000
const LISTINGS_URL = `https://api.opensea.io/api/v2/listings/collection/${COLLECTION_SLUG}/best`

export const LISTINGS_CACHE_CONTROL =
  'public, s-maxage=900, stale-while-revalidate=3600'

type CacheEntry = {
  expiresAt: number
  payload: MeebitsListingsPayload
}

let memoryCache: CacheEntry | null = null

type OpenSeaPrice = {
  current?: {
    currency?: string
    decimals?: number
    value?: string
  }
  currency?: string
  decimals?: number
  value?: string
}

type OpenSeaOfferItem = {
  token?: string
  identifierOrCriteria?: string | number
  itemType?: number
}

type OpenSeaProtocolParameters = {
  offer?: OpenSeaOfferItem[]
  consideration?: OpenSeaOfferItem[]
}

type OpenSeaListing = {
  order_hash?: string
  orderHash?: string
  chain?: string
  status?: string
  price?: OpenSeaPrice
  protocol_data?: { parameters?: OpenSeaProtocolParameters }
  protocolData?: { parameters?: OpenSeaProtocolParameters }
}

type OpenSeaListingsPage = {
  listings?: OpenSeaListing[]
  next?: string
}

function normalizeAddress(addr: string | undefined) {
  return (addr ?? '').toLowerCase()
}

function emptyPayload(error?: string): MeebitsListingsPayload {
  return {
    updatedAt: new Date().toISOString(),
    listings: [],
    ...(error ? { error } : {}),
  }
}

function parsePriceEth(price: OpenSeaPrice | undefined): number | null {
  if (!price) return null
  const current = price.current ?? price
  if (!current?.value) return null
  const currency = (current.currency ?? '').toUpperCase()
  if (currency && currency !== 'ETH' && currency !== 'WETH') return null
  const decimals = typeof current.decimals === 'number' ? current.decimals : 18
  const raw = Number(current.value)
  if (!Number.isFinite(raw)) return null
  const eth = raw / 10 ** decimals
  if (!Number.isFinite(eth) || eth < 0) return null
  return Math.round(eth * 1e6) / 1e6
}

function parametersOf(listing: OpenSeaListing): OpenSeaProtocolParameters | undefined {
  return listing.protocol_data?.parameters ?? listing.protocolData?.parameters
}

function tokenIdFromListing(listing: OpenSeaListing): number | null {
  const params = parametersOf(listing)
  const candidates = [...(params?.offer ?? []), ...(params?.consideration ?? [])]
  for (const item of candidates) {
    const token = normalizeAddress(item.token)
    if (token !== MEEBITS_CONTRACT) continue
    const id = Number(item.identifierOrCriteria)
    if (Number.isInteger(id) && id >= 1 && id <= 20000) return id
  }
  for (const item of params?.offer ?? []) {
    const id = Number(item.identifierOrCriteria)
    if (!Number.isInteger(id) || id < 1 || id > 20000) continue
    if (item.itemType === 2 || item.itemType === 3) return id
  }
  return null
}

function mergeCheapest(map: Map<number, ListedMeebit>, next: ListedMeebit) {
  const prev = map.get(next.tokenId)
  if (!prev) {
    map.set(next.tokenId, next)
    return
  }
  if (next.priceEth == null) return
  if (prev.priceEth == null || next.priceEth < prev.priceEth) {
    map.set(next.tokenId, next)
  }
}

async function fetchListingsPage(apiKey: string, next?: string): Promise<OpenSeaListingsPage> {
  const url = new URL(LISTINGS_URL)
  url.searchParams.set('limit', String(PAGE_LIMIT))
  if (next) url.searchParams.set('next', next)

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'X-API-KEY': apiKey,
    },
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`OpenSea listings HTTP ${res.status}: ${text.slice(0, 200)}`)
  }
  try {
    return JSON.parse(text) as OpenSeaListingsPage
  } catch {
    throw new Error(`OpenSea listings invalid JSON: ${text.slice(0, 200)}`)
  }
}

async function fetchAllListingsFromOpenSea(apiKey: string): Promise<ListedMeebit[]> {
  const byToken = new Map<number, ListedMeebit>()
  let next: string | undefined
  let pages = 0
  let rawCount = 0

  while (pages < MAX_PAGES && byToken.size < MAX_UNIQUE_LISTINGS) {
    pages += 1
    const page = await fetchListingsPage(apiKey, next)
    const listings = page.listings ?? []
    rawCount += listings.length
    for (const listing of listings) {
      if (listing.status && listing.status !== 'ACTIVE') continue
      const tokenId = tokenIdFromListing(listing)
      if (tokenId == null) continue
      mergeCheapest(byToken, {
        tokenId,
        priceEth: parsePriceEth(listing.price),
        orderHash: listing.order_hash ?? listing.orderHash,
      })
    }
    if (!page.next || listings.length === 0) break
    next = page.next
  }

  if (rawCount > 0 && byToken.size === 0) {
    throw new Error(
      `OpenSea returned ${rawCount} listings but none matched Meebits token parse (contract/shape mismatch)`,
    )
  }

  return [...byToken.values()].sort((a, b) => a.tokenId - b.tokenId)
}

export type FetchMeebitsListingsOptions = {
  apiKey: string
  forceRefresh?: boolean
}

/** Listing を取得して正規化。失敗時は空配列 + error（例外は投げない）。 */
export async function fetchMeebitsListings(
  options: FetchMeebitsListingsOptions,
): Promise<MeebitsListingsPayload> {
  const now = Date.now()
  if (!options.forceRefresh && memoryCache && memoryCache.expiresAt > now) {
    return memoryCache.payload
  }

  const apiKey = options.apiKey?.trim()
  if (!apiKey) {
    return emptyPayload('OPENSEA_API_KEY is not set')
  }

  try {
    const listings = await fetchAllListingsFromOpenSea(apiKey)
    const payload: MeebitsListingsPayload = {
      updatedAt: new Date().toISOString(),
      listings,
    }
    memoryCache = { expiresAt: now + CACHE_TTL_MS, payload }
    return payload
  } catch (error) {
    const message = error instanceof Error ? error.message : 'fetch failed'
    console.error('[opensea] fetchMeebitsListings failed:', message)
    if (memoryCache) {
      return { ...memoryCache.payload, error: message }
    }
    return emptyPayload(message)
  }
}

type VercelReq = {
  method?: string
}

type VercelRes = {
  setHeader: (name: string, value: string) => void
  status: (code: number) => VercelRes
  json: (body: unknown) => void
  end: (body?: string) => void
}

export default async function handler(req: VercelReq, res: VercelRes) {
  try {
    if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    const payload = await fetchMeebitsListings({
      apiKey: process.env.OPENSEA_API_KEY ?? '',
    })
    res.setHeader('Cache-Control', LISTINGS_CACHE_CONTROL)
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.status(200).json(payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'handler failed'
    console.error('[opensea] handler failed:', message)
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.status(200).json(emptyPayload(message))
  }
}
