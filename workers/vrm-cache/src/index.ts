const DEFAULT_UPSTREAM = 'https://files.meebits.app'
const VRM_CONTENT_TYPE = 'model/vrm'
const PREVIEW_CONTENT_TYPE = 'image/webp'

export interface Env {
  VRM_BUCKET: R2Bucket
  UPSTREAM_ORIGIN?: string
  /** Comma-separated origins, e.g. https://example.com,http://localhost:5173 */
  ALLOWED_ORIGINS?: string
}

function parseAllowedOrigins(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return []
  }

  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

function buildCorsHeaders(request: Request, allowedOrigins: string[]): Headers {
  const headers = new Headers()
  const origin = request.headers.get('Origin')

  if (origin && (allowedOrigins.length === 0 || allowedOrigins.includes(origin))) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Vary', 'Origin')
  }

  headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  headers.set('Access-Control-Max-Age', '86400')

  return headers
}

function parseMeebitId(pathname: string): string | null {
  const match = pathname.match(/^\/vrm\/(\d+)\.vrm$/)
  return match?.[1] ?? null
}

function parsePreviewId(pathname: string): string | null {
  const match = pathname.match(/^\/previews\/v\d+\/(\d+)\.webp$/)
  return match?.[1] ?? null
}

async function fetchAndStoreVrm(
  env: Env,
  id: string,
  key: string,
): Promise<R2ObjectBody | null> {
  const upstreamOrigin = env.UPSTREAM_ORIGIN?.replace(/\/$/, '') ?? DEFAULT_UPSTREAM
  const upstream = await fetch(`${upstreamOrigin}/vrm/${id}.vrm`)

  if (!upstream.ok) {
    return null
  }

  const body = await upstream.arrayBuffer()
  const contentType = upstream.headers.get('content-type') ?? VRM_CONTENT_TYPE

  await env.VRM_BUCKET.put(key, body, {
    httpMetadata: {
      contentType,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  })

  return env.VRM_BUCKET.get(key)
}

function buildObjectResponse(
  request: Request,
  object: R2ObjectBody,
  corsHeaders: Headers,
  fallbackContentType: string,
): Response {
  const headers = new Headers(corsHeaders)
  headers.set('Content-Type', object.httpMetadata?.contentType ?? fallbackContentType)
  headers.set('Cache-Control', object.httpMetadata?.cacheControl ?? 'public, max-age=31536000, immutable')
  headers.set('ETag', object.httpEtag)

  if (request.method === 'HEAD') {
    headers.set('Content-Length', String(object.size))
    return new Response(null, { status: 200, headers })
  }

  return new Response(object.body, { status: 200, headers })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = buildCorsHeaders(request, parseAllowedOrigins(env.ALLOWED_ORIGINS))

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    }

    const pathname = new URL(request.url).pathname
    const previewId = parsePreviewId(pathname)

    if (previewId) {
      const key = pathname.slice(1)
      const object = await env.VRM_BUCKET.get(key)

      if (!object) {
        return new Response('Preview not found', { status: 404, headers: corsHeaders })
      }

      return buildObjectResponse(request, object, corsHeaders, PREVIEW_CONTENT_TYPE)
    }

    const id = parseMeebitId(pathname)
    if (!id) {
      return new Response('Not found', { status: 404, headers: corsHeaders })
    }

    const key = `vrm/${id}.vrm`
    let object = await env.VRM_BUCKET.get(key)

    if (!object) {
      object = await fetchAndStoreVrm(env, id, key)
      if (!object) {
        return new Response('Upstream VRM not found', { status: 404, headers: corsHeaders })
      }
    }

    return buildObjectResponse(request, object, corsHeaders, VRM_CONTENT_TYPE)
  },
}
