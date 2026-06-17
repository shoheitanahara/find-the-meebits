import type { VercelRequest, VercelResponse } from '@vercel/node'

const UPSTREAM_ORIGIN = 'https://files.meebits.app'
const VRM_CONTENT_TYPE = 'model/vrm'

function getIdParam(request: VercelRequest): string | null {
  const raw = request.query.id
  const rawId = Array.isArray(raw) ? raw[0] : raw
  if (!rawId) return null

  // `/api/vrm/2766` と `/api/vrm/2766.vrm` の両方を許容する。
  const normalized = rawId.replace(/\.vrm$/i, '')
  return /^\d+$/.test(normalized) ? normalized : null
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const id = getIdParam(request)
  if (!id) {
    response.status(400).send('Invalid VRM id.')
    return
  }

  const upstreamUrl = `${UPSTREAM_ORIGIN}/vrm/${id}.vrm`

  try {
    const upstream = await fetch(upstreamUrl)

    if (!upstream.ok) {
      response.status(upstream.status).send(`Upstream error (${upstream.status}).`)
      return
    }

    const buffer = Buffer.from(await upstream.arrayBuffer())

    response.setHeader('Content-Type', upstream.headers.get('content-type') ?? VRM_CONTENT_TYPE)
    response.setHeader('Content-Length', String(buffer.byteLength))
    response.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, immutable')

    response.status(200).send(buffer)
  } catch {
    response.status(502).send('Failed to proxy VRM.')
  }
}

