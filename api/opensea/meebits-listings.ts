/**
 * Vercel Serverless: GET /api/opensea/meebits-listings
 * Env: OPENSEA_API_KEY（Developer Portal の永続キー。VITE_ 禁止）
 */
import {
  fetchMeebitsListings,
  LISTINGS_CACHE_CONTROL,
} from '../../src/opensea/fetchMeebitsListings'

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
}
