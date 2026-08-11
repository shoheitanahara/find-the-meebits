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
  listedAt?: number
  soldAt?: number
  status?: 'listed' | 'sold'
}

type MeebitsListingsPayload = {
  updatedAt: string
  listings: ListedMeebit[]
  error?: string
}

const MEEBITS_CONTRACT = '0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7'
const COLLECTION_SLUG = 'meebits'
const PAGE_LIMIT = 50
/** 3ギャラリー×30 + 余裕 */
const MAX_UNIQUE_LISTINGS = 100
const MAX_PAGES = 5
/** 直近売却の取り込み（API はこのファイル単体のため config と数値を揃える） */
const MAX_RECENT_SALES = 10
const RECENT_SALE_WINDOW_SEC = 48 * 60 * 60
const CACHE_TTL_MS = 15 * 60 * 1000
const LISTINGS_URL = `https://api.opensea.io/api/v2/listings/collection/${COLLECTION_SLUG}/best`
const EVENTS_URL = `https://api.opensea.io/api/v2/events/collection/${COLLECTION_SLUG}`

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
  startTime?: string | number
}

type OpenSeaListing = {
  order_hash?: string
  orderHash?: string
  chain?: string
  status?: string
  order_created_at?: number
  orderCreatedAt?: number
  price?: OpenSeaPrice
  asset?: { identifier?: string | number; contract?: string }
  protocol_data?: { parameters?: OpenSeaProtocolParameters }
  protocolData?: { parameters?: OpenSeaProtocolParameters }
}

type OpenSeaListingsPage = {
  listings?: OpenSeaListing[]
  next?: string
}

type OpenSeaPayment = {
  quantity?: string
  decimals?: number
  symbol?: string
  token_address?: string
}

type OpenSeaSaleNft = {
  identifier?: string | number
  contract?: string
}

type OpenSeaSaleEvent = {
  event_type?: string
  eventType?: string
  event_timestamp?: number | string
  eventTimestamp?: number | string
  closing_date?: number | string
  order_hash?: string
  orderHash?: string
  payment?: OpenSeaPayment
  nft?: OpenSeaSaleNft
  asset?: { identifier?: string | number; contract?: string }
}

type OpenSeaEventsPage = {
  asset_events?: OpenSeaSaleEvent[]
  assetEvents?: OpenSeaSaleEvent[]
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
  const assetId = Number(listing.asset?.identifier)
  if (Number.isInteger(assetId) && assetId >= 1 && assetId <= 20000) {
    const contract = normalizeAddress(listing.asset?.contract)
    if (!contract || contract === MEEBITS_CONTRACT) return assetId
  }

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

function listedAtFromListing(listing: OpenSeaListing): number | undefined {
  const raw = listing.order_created_at ?? listing.orderCreatedAt ?? parametersOf(listing)?.startTime
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return undefined
  // ミリ秒で来る場合に備える
  return n > 1e12 ? Math.floor(n / 1000) : Math.floor(n)
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
    return
  }
  // 同額なら新しい出品を残す
  if (
    prev.priceEth === next.priceEth &&
    (next.listedAt ?? 0) > (prev.listedAt ?? 0)
  ) {
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

function unixSeconds(raw: number | string | undefined): number | undefined {
  if (raw == null || raw === '') return undefined
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return undefined
  return n > 1e12 ? Math.floor(n / 1000) : Math.floor(n)
}

function parsePaymentEth(payment: OpenSeaPayment | undefined): number | null {
  if (!payment?.quantity) return null
  const symbol = (payment.symbol ?? '').toUpperCase()
  if (symbol && symbol !== 'ETH' && symbol !== 'WETH') return null
  const decimals = typeof payment.decimals === 'number' ? payment.decimals : 18
  const raw = Number(payment.quantity)
  if (!Number.isFinite(raw)) return null
  const eth = raw / 10 ** decimals
  if (!Number.isFinite(eth) || eth < 0) return null
  return Math.round(eth * 1e6) / 1e6
}

function tokenIdFromSale(event: OpenSeaSaleEvent): number | null {
  const nft = event.nft ?? event.asset
  const id = Number(nft?.identifier)
  if (!Number.isInteger(id) || id < 1 || id > 20000) return null
  const contract = normalizeAddress(nft?.contract)
  if (contract && contract !== MEEBITS_CONTRACT) return null
  return id
}

function soldAtFromEvent(event: OpenSeaSaleEvent): number | undefined {
  return unixSeconds(
    event.event_timestamp ?? event.eventTimestamp ?? event.closing_date,
  )
}

async function fetchEventsPage(apiKey: string, after: number): Promise<OpenSeaEventsPage> {
  const url = new URL(EVENTS_URL)
  url.searchParams.set('event_type', 'sale')
  url.searchParams.set('after', String(after))
  url.searchParams.set('limit', String(PAGE_LIMIT))

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'X-API-KEY': apiKey,
    },
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`OpenSea events HTTP ${res.status}: ${text.slice(0, 200)}`)
  }
  try {
    return JSON.parse(text) as OpenSeaEventsPage
  } catch {
    throw new Error(`OpenSea events invalid JSON: ${text.slice(0, 200)}`)
  }
}

/** 48時間以内の売却。token 重複は新しい方を残す。失敗時は呼び出し側で握りつぶす。 */
async function fetchRecentSalesFromOpenSea(apiKey: string): Promise<ListedMeebit[]> {
  const after = Math.floor(Date.now() / 1000) - RECENT_SALE_WINDOW_SEC
  const page = await fetchEventsPage(apiKey, after)
  const events = page.asset_events ?? page.assetEvents ?? []
  const byToken = new Map<number, ListedMeebit>()

  for (const event of events) {
    const type = event.event_type ?? event.eventType
    if (type && type !== 'sale') continue
    const tokenId = tokenIdFromSale(event)
    if (tokenId == null) continue
    const soldAt = soldAtFromEvent(event)
    if (soldAt != null && soldAt < after) continue
    const next: ListedMeebit = {
      tokenId,
      priceEth: parsePaymentEth(event.payment),
      orderHash: event.order_hash ?? event.orderHash,
      soldAt,
      listedAt: soldAt,
      status: 'sold',
    }
    const prev = byToken.get(tokenId)
    if (!prev || (next.soldAt ?? 0) > (prev.soldAt ?? 0)) {
      byToken.set(tokenId, next)
    }
  }

  return [...byToken.values()].sort((a, b) => (b.soldAt ?? 0) - (a.soldAt ?? 0))
}

function mixListingsWithRecentSales(
  listings: ListedMeebit[],
  sales: ListedMeebit[],
): ListedMeebit[] {
  const listedIds = new Set(listings.map((item) => item.tokenId))
  const sold: ListedMeebit[] = []
  for (const sale of sales) {
    if (listedIds.has(sale.tokenId)) continue
    sold.push(sale)
    if (sold.length >= MAX_RECENT_SALES) break
  }
  return sold.length === 0 ? listings : [...listings, ...sold]
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
        listedAt: listedAtFromListing(listing),
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

  // 新しい出品を先頭に（クライアント選抜の母集団順としても使う）
  return [...byToken.values()].sort((a, b) => (b.listedAt ?? 0) - (a.listedAt ?? 0))
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
    const [listings, sales] = await Promise.all([
      fetchAllListingsFromOpenSea(apiKey),
      fetchRecentSalesFromOpenSea(apiKey).catch((error) => {
        const message = error instanceof Error ? error.message : 'sales fetch failed'
        console.error('[opensea] fetchRecentSales failed:', message)
        return [] as ListedMeebit[]
      }),
    ])
    const payload: MeebitsListingsPayload = {
      updatedAt: new Date().toISOString(),
      listings: mixListingsWithRecentSales(listings, sales),
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
