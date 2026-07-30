const DEFAULT_UPSTREAM = 'https://files.meebits.app'
const VRM_CONTENT_TYPE = 'model/vrm'
const PREVIEW_CONTENT_TYPE = 'image/webp'
/** クライアント生成プレビューの上限（320x320 webp/png） */
const MAX_PREVIEW_BYTES = 512_000
const MIN_MEEBIT_ID = 1
const MAX_MEEBIT_ID = 20_000

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

function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false
  if (allowedOrigins.length === 0) return true
  return allowedOrigins.includes(origin)
}

function buildCorsHeaders(request: Request, allowedOrigins: string[]): Headers {
  const headers = new Headers()
  const origin = request.headers.get('Origin')
  const requestedMethod = request.headers.get('Access-Control-Request-Method')?.toUpperCase()
  const isWriteRequest =
    request.method === 'PUT' || (request.method === 'OPTIONS' && requestedMethod === 'PUT')

  // VRM・プレビュー画像は公開アセットなので、GET/HEAD は配信元を限定しない。
  // ブラウザからの PUT のみ、キャッシュ汚染を防ぐため許可リストを適用する。
  if (!isWriteRequest) {
    headers.set('Access-Control-Allow-Origin', '*')
  } else if (origin && isOriginAllowed(origin, allowedOrigins)) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Vary', 'Origin')
  }

  headers.set('Access-Control-Allow-Methods', 'GET, HEAD, PUT, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  headers.set('Access-Control-Max-Age', '86400')

  return headers
}

function isBrowserPutAllowed(request: Request, allowedOrigins: string[]): boolean {
  const origin = request.headers.get('Origin')
  // Vite プロキシ経由だと Origin が付く。curl 等の手動 PUT は開発用に許可。
  if (!origin) return true
  return isOriginAllowed(origin, allowedOrigins)
}

function parseMeebitId(pathname: string): string | null {
  const match = pathname.match(/^\/vrm\/(\d+)\.vrm$/)
  return match?.[1] ?? null
}

function parsePreviewId(pathname: string): string | null {
  const match = pathname.match(/^\/previews\/v\d+\/(\d+)\.webp$/)
  return match?.[1] ?? null
}

function isValidPreviewMeebitId(id: string): boolean {
  const n = Number(id)
  return Number.isInteger(n) && n >= MIN_MEEBIT_ID && n <= MAX_MEEBIT_ID
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

async function putPreview(
  request: Request,
  env: Env,
  key: string,
  corsHeaders: Headers,
): Promise<Response> {
  const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGINS)

  // ブラウザからの PUT は Origin を検証。未設定（curl 等）は開発向けに通す。
  if (!isBrowserPutAllowed(request, allowedOrigins)) {
    return new Response('Origin not allowed', { status: 403, headers: corsHeaders })
  }

  const existing = await env.VRM_BUCKET.head(key)
  if (existing) {
    return new Response('Already cached', { status: 200, headers: corsHeaders })
  }

  const contentType = (request.headers.get('Content-Type') ?? '').split(';')[0]?.trim().toLowerCase()
  if (contentType !== 'image/webp' && contentType !== 'image/png') {
    return new Response('Content-Type must be image/webp or image/png', {
      status: 415,
      headers: corsHeaders,
    })
  }

  const body = await request.arrayBuffer()
  if (body.byteLength === 0 || body.byteLength > MAX_PREVIEW_BYTES) {
    return new Response('Preview body size out of range', { status: 413, headers: corsHeaders })
  }

  await env.VRM_BUCKET.put(key, body, {
    httpMetadata: {
      contentType: contentType === 'image/png' ? 'image/png' : PREVIEW_CONTENT_TYPE,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  })

  return new Response('Created', { status: 201, headers: corsHeaders })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = buildCorsHeaders(request, parseAllowedOrigins(env.ALLOWED_ORIGINS))

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    const pathname = new URL(request.url).pathname
    const previewId = parsePreviewId(pathname)

    if (previewId) {
      if (!isValidPreviewMeebitId(previewId)) {
        return new Response('Invalid meebit id', { status: 400, headers: corsHeaders })
      }

      const key = pathname.slice(1)

      if (request.method === 'PUT') {
        return putPreview(request, env, key, corsHeaders)
      }

      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method not allowed', { status: 405, headers: corsHeaders })
      }

      const object = await env.VRM_BUCKET.get(key)

      if (!object) {
        return new Response('Preview not found', { status: 404, headers: corsHeaders })
      }

      return buildObjectResponse(request, object, corsHeaders, PREVIEW_CONTENT_TYPE)
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders })
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
