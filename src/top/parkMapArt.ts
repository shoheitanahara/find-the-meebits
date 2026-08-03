/**
 * Plaza 入口のパーク全体マップ。
 * 自然な円形エリア＋ランドマーク絵＋環境ディテール。
 * 現在地は Plaza 下部。テーマ色は parkZoneTheme / PARK_LOOK 準拠。
 */

export const PARK_MAP_TEX_W = 1600
export const PARK_MAP_TEX_H = 860

const JP_SANS =
  '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", "Yu Gothic", sans-serif'
const EN_DISPLAY = 'Georgia, "Palatino Linotype", Palatino, "Times New Roman", Times, serif'
const EN_SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'

type Locale = 'en' | 'ja'

type ZonePaint = {
  id: string
  fill: string
  fillDeep: string
  rim: string
  banner: string
  ink: string
  labelEn: string
  labelJa: string
}

/** applyZoneLook / PARK_LOOK のテーマ色 */
const ZONES: Record<string, ZonePaint> = {
  plaza: {
    id: 'plaza',
    fill: '#4a5366',
    fillDeep: '#303746',
    rim: '#b89758',
    banner: '#d4b46a',
    ink: '#1a1820',
    labelEn: 'Meebits Plaza',
    labelJa: 'ミービッツ広場',
  },
  culture: {
    id: 'culture',
    fill: '#2a5088',
    fillDeep: '#152038',
    rim: '#8eb4e8',
    banner: '#8eb4e8',
    ink: '#0a1220',
    labelEn: 'Culture District',
    labelJa: 'カルチャーエリア',
  },
  mountain: {
    id: 'mountain',
    fill: '#4a6848',
    fillDeep: '#2e362c',
    rim: '#6a7a52',
    banner: '#ffb060',
    ink: '#1a1208',
    labelEn: 'Mountain District',
    labelJa: 'マウンテンエリア',
  },
  sea: {
    id: 'sea',
    fill: '#3a90b8',
    fillDeep: '#1a5070',
    rim: '#7ec8e8',
    banner: '#f0b868',
    ink: '#1a1208',
    labelEn: 'Sea District',
    labelJa: 'シーエリア',
  },
  astro: {
    id: 'astro',
    fill: '#2a3458',
    fillDeep: '#141824',
    rim: '#5ce0ff',
    banner: '#5ce0ff',
    ink: '#041018',
    labelEn: 'Astro District',
    labelJa: 'アストロエリア',
  },
}

type Blob = { x: number; y: number; w: number; h: number }

export function drawParkMap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  locale: Locale,
) {
  const margin = 24
  const titleH = 88
  const footerH = 64
  const mapTop = titleH + 6
  const mapBottom = height - footerH
  const mapLeft = margin + 6
  const mapRight = width - margin - 6
  const mapW = mapRight - mapLeft
  const mapH = mapBottom - mapTop

  // 上 Culture / 左 Sea / 中央 Plaza / 右 Mountain / 右上 Astro
  // 少し寄せて余白を詰める（重ならない程度）
  const plaza: Blob = {
    x: mapLeft + mapW * 0.5,
    y: mapTop + mapH * 0.58,
    w: mapW * 0.32,
    h: mapH * 0.4,
  }
  const culture: Blob = {
    x: mapLeft + mapW * 0.4,
    y: mapTop + mapH * 0.2,
    w: mapW * 0.3,
    h: mapH * 0.3,
  }
  const sea: Blob = {
    x: mapLeft + mapW * 0.15,
    y: mapTop + mapH * 0.54,
    w: mapW * 0.26,
    h: mapH * 0.4,
  }
  const mountain: Blob = {
    x: mapLeft + mapW * 0.85,
    y: mapTop + mapH * 0.56,
    w: mapW * 0.26,
    h: mapH * 0.38,
  }
  const astro: Blob = {
    x: mapLeft + mapW * 0.78,
    y: mapTop + mapH * 0.2,
    w: mapW * 0.24,
    h: mapH * 0.26,
  }

  const paper = ctx.createLinearGradient(0, 0, 0, height)
  paper.addColorStop(0, '#1a2238')
  paper.addColorStop(1, '#101828')
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = '#d4b46a'
  ctx.lineWidth = 8
  roundRect(ctx, 10, 10, width - 20, height - 20, 12)
  ctx.stroke()

  ctx.fillStyle = '#0e1422'
  roundRect(ctx, margin, 16, width - margin * 2, 72, 8)
  ctx.fill()
  ctx.fillStyle = '#e2c77f'
  ctx.font = `700 ${locale === 'ja' ? 44 : 42}px ${locale === 'ja' ? JP_SANS : EN_DISPLAY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(locale === 'ja' ? 'ミービッツパーク' : 'MEEBITS PARK', width / 2, 42)
  ctx.fillStyle = '#9ab0d0'
  ctx.font = `700 24px ${locale === 'ja' ? JP_SANS : EN_SANS}`
  ctx.fillText(locale === 'ja' ? 'パークマップ' : 'PARK MAP', width / 2, 72)

  ctx.save()
  roundRect(ctx, mapLeft, mapTop, mapW, mapH, 10)
  ctx.clip()

  const sky = ctx.createLinearGradient(0, mapTop, 0, mapBottom)
  sky.addColorStop(0, '#111a33')
  sky.addColorStop(1, '#17233d')
  ctx.fillStyle = sky
  ctx.fillRect(mapLeft, mapTop, mapW, mapH)

  // 背景の環境ディテール（園内の空気）
  drawEnvironmentDecor(ctx, mapLeft, mapTop, mapW, mapH)

  // 斜め・折れ線の園路
  ctx.strokeStyle = 'rgba(184, 151, 88, 0.88)'
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  strokePath(ctx, [
    [plaza.x - plaza.w * 0.08, plaza.y - plaza.h * 0.42],
    [plaza.x - plaza.w * 0.18, mapTop + mapH * 0.38],
    [culture.x + culture.w * 0.12, culture.y + culture.h * 0.42],
  ])
  strokePath(ctx, [
    [plaza.x - plaza.w * 0.42, plaza.y + plaza.h * 0.05],
    [mapLeft + mapW * 0.32, plaza.y + mapH * 0.02],
    [sea.x + sea.w * 0.42, sea.y],
  ])
  strokePath(ctx, [
    [plaza.x + plaza.w * 0.42, plaza.y + plaza.h * 0.05],
    [mapLeft + mapW * 0.68, plaza.y + mapH * 0.02],
    [mountain.x - mountain.w * 0.42, mountain.y],
  ])
  strokePath(ctx, [
    [culture.x + culture.w * 0.42, culture.y - culture.h * 0.05],
    [mapLeft + mapW * 0.58, culture.y - mapH * 0.02],
    [astro.x - astro.w * 0.42, astro.y + astro.h * 0.1],
  ])
  strokePath(ctx, [
    [mountain.x - mountain.w * 0.1, mountain.y - mountain.h * 0.42],
    [mountain.x - mountain.w * 0.2, mapTop + mapH * 0.36],
    [astro.x + astro.w * 0.05, astro.y + astro.h * 0.42],
  ])

  drawZoneBlob(ctx, culture, ZONES.culture)
  drawZoneBlob(ctx, sea, ZONES.sea)
  drawZoneBlob(ctx, mountain, ZONES.mountain)
  drawZoneBlob(ctx, astro, ZONES.astro)
  drawZoneBlob(ctx, plaza, ZONES.plaza)

  // エリアごとのランドマーク（ラベルより上）
  drawLandmarkPlaza(ctx, plaza.x, plaza.y - plaza.h * 0.18)
  drawLandmarkCulture(ctx, culture.x, culture.y - culture.h * 0.22)
  drawLandmarkMountain(ctx, mountain.x, mountain.y - mountain.h * 0.18)
  drawLandmarkSea(ctx, sea.x, sea.y - sea.h * 0.12)
  drawLandmarkAstro(ctx, astro.x, astro.y - astro.h * 0.18)

  paintZoneLabel(ctx, culture.x, culture.y + culture.h * 0.18, ZONES.culture, locale)
  paintZoneLabel(ctx, sea.x, sea.y + sea.h * 0.2, ZONES.sea, locale)
  paintZoneLabel(ctx, mountain.x, mountain.y + mountain.h * 0.2, ZONES.mountain, locale)
  paintZoneLabel(ctx, astro.x, astro.y + astro.h * 0.2, ZONES.astro, locale)
  paintZoneLabel(ctx, plaza.x, plaza.y + plaza.h * 0.08, ZONES.plaza, locale)

  drawYouAreHere(ctx, plaza.x, plaza.y + plaza.h * 0.34, locale)

  ctx.restore()

  ctx.fillStyle = '#c8b890'
  ctx.font = `700 24px ${locale === 'ja' ? JP_SANS : EN_SANS}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(
    locale === 'ja'
      ? 'ゲートを通って各エリアへ · 毎日アップデート！'
      : 'Cross the gates to explore · Updated daily!',
    width / 2,
    height - footerH / 2 - 4,
  )
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function drawZoneBlob(ctx: CanvasRenderingContext2D, blob: Blob, zone: ZonePaint) {
  const { x: cx, y: cy, w, h } = blob
  const grad = ctx.createRadialGradient(cx - w * 0.12, cy - h * 0.15, 8, cx, cy, Math.max(w, h) * 0.55)
  grad.addColorStop(0, zone.fill)
  grad.addColorStop(1, zone.fillDeep)
  ctx.fillStyle = grad
  ctx.beginPath()
  const steps = 30
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * Math.PI * 2
    const wobble = 1 + Math.sin(t * 3 + zone.id.length) * 0.05 + Math.cos(t * 5) * 0.035
    const px = cx + Math.cos(t) * (w * 0.5) * wobble
    const py = cy + Math.sin(t) * (h * 0.5) * wobble
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = zone.rim
  ctx.lineWidth = 5
  ctx.stroke()
}

function strokePath(ctx: CanvasRenderingContext2D, points: Array<[number, number]>) {
  if (points.length < 2) return
  ctx.beginPath()
  ctx.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1])
  ctx.stroke()
}

function paintZoneLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  zone: ZonePaint,
  locale: Locale,
) {
  const label = locale === 'ja' ? zone.labelJa : zone.labelEn
  const fontSize = locale === 'ja' ? 40 : 36
  ctx.font = `800 ${fontSize}px ${locale === 'ja' ? JP_SANS : EN_SANS}`
  const tw = ctx.measureText(label).width
  const padX = 22
  const bw = tw + padX * 2
  const bh = 56
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  roundRect(ctx, x - bw / 2 + 2, y - bh / 2 + 3, bw, bh, 8)
  ctx.fill()
  ctx.fillStyle = zone.banner
  roundRect(ctx, x - bw / 2, y - bh / 2, bw, bh, 8)
  ctx.fill()
  ctx.fillStyle = zone.ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x, y + 1)
}

function drawYouAreHere(ctx: CanvasRenderingContext2D, x: number, y: number, locale: Locale) {
  ctx.fillStyle = '#e04848'
  ctx.beginPath()
  ctx.moveTo(x, y + 18)
  ctx.lineTo(x - 20, y - 26)
  ctx.lineTo(x + 20, y - 26)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x, y - 34, 15, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(x, y - 34, 6, 0, Math.PI * 2)
  ctx.fill()

  const label = locale === 'ja' ? 'いまここ' : 'YOU ARE HERE'
  ctx.font = `800 30px ${locale === 'ja' ? JP_SANS : EN_SANS}`
  const tw = ctx.measureText(label).width
  const labelX = x + 28
  const labelY = y - 34
  ctx.fillStyle = '#e04848'
  roundRect(ctx, labelX, labelY - 22, tw + 24, 44, 8)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, labelX + 12, labelY)
}

/** 余白を園内っぽくする木・丘・草地 */
function drawEnvironmentDecor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  // 遠景の丘
  ctx.fillStyle = 'rgba(40, 70, 55, 0.28)'
  ctx.beginPath()
  ctx.moveTo(x, y + h * 0.42)
  ctx.quadraticCurveTo(x + w * 0.18, y + h * 0.22, x + w * 0.36, y + h * 0.4)
  ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.28, x + w * 0.62, y + h * 0.42)
  ctx.lineTo(x + w * 0.62, y + h)
  ctx.lineTo(x, y + h)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = 'rgba(50, 80, 60, 0.22)'
  ctx.beginPath()
  ctx.moveTo(x + w * 0.55, y + h * 0.48)
  ctx.quadraticCurveTo(x + w * 0.72, y + h * 0.26, x + w * 0.9, y + h * 0.4)
  ctx.quadraticCurveTo(x + w * 0.96, y + h * 0.5, x + w, y + h * 0.46)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x + w * 0.55, y + h)
  ctx.closePath()
  ctx.fill()

  // 星
  ctx.fillStyle = 'rgba(220, 230, 255, 0.5)'
  for (const [nx, ny] of [
    [0.08, 0.08],
    [0.22, 0.05],
    [0.48, 0.07],
    [0.68, 0.04],
    [0.86, 0.09],
    [0.94, 0.16],
    [0.35, 0.12],
  ] as const) {
    ctx.beginPath()
    ctx.arc(x + w * nx, y + h * ny, 1.8, 0, Math.PI * 2)
    ctx.fill()
  }

  // 草地パッチ
  const patches: Array<[number, number, number, number]> = [
    [0.28, 0.72, 0.08, 0.04],
    [0.62, 0.78, 0.07, 0.035],
    [0.5, 0.36, 0.05, 0.025],
    [0.08, 0.78, 0.06, 0.03],
  ]
  for (const [nx, ny, rw, rh] of patches) {
    ctx.fillStyle = 'rgba(70, 110, 70, 0.22)'
    ctx.beginPath()
    ctx.ellipse(x + w * nx, y + h * ny, w * rw, h * rh, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // 木々
  const trees: Array<[number, number, number]> = [
    [0.06, 0.62, 14],
    [0.1, 0.74, 11],
    [0.24, 0.82, 12],
    [0.7, 0.82, 13],
    [0.92, 0.68, 14],
    [0.96, 0.78, 10],
    [0.52, 0.88, 9],
    [0.3, 0.38, 8],
    [0.58, 0.34, 9],
  ]
  for (const [nx, ny, r] of trees) {
    drawMapTree(ctx, x + w * nx, y + h * ny, r)
  }

  // Sea 側の外海ヒント
  ctx.fillStyle = 'rgba(40, 110, 150, 0.2)'
  ctx.beginPath()
  ctx.ellipse(x + w * 0.05, y + h * 0.48, w * 0.08, h * 0.16, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawMapTree(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.fillStyle = 'rgba(55, 40, 28, 0.55)'
  ctx.fillRect(x - 2, y - 2, 4, r * 0.55)
  ctx.fillStyle = 'rgba(45, 95, 55, 0.55)'
  ctx.beginPath()
  ctx.arc(x, y - r * 0.35, r * 0.7, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(70, 130, 75, 0.4)'
  ctx.beginPath()
  ctx.arc(x - r * 0.2, y - r * 0.45, r * 0.4, 0, Math.PI * 2)
  ctx.fill()
}

function drawLandmarkPlaza(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 噴水リング
  ctx.strokeStyle = 'rgba(212, 180, 106, 0.85)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(x, y, 34, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#4a8ab0'
  ctx.beginPath()
  ctx.arc(x, y, 26, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#6ab0d0'
  ctx.beginPath()
  ctx.arc(x, y, 16, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#d4b46a'
  ctx.beginPath()
  ctx.arc(x, y, 7, 0, Math.PI * 2)
  ctx.fill()
  // 水しぶき
  ctx.fillStyle = 'rgba(200, 230, 245, 0.7)'
  for (const [dx, dy] of [
    [-10, -28],
    [0, -34],
    [10, -28],
    [-16, -18],
    [16, -18],
  ] as const) {
    ctx.beginPath()
    ctx.arc(x + dx, y + dy, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawLandmarkCulture(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // ギャラリーアーチ
  ctx.fillStyle = 'rgba(20, 35, 60, 0.75)'
  ctx.fillRect(x - 42, y - 8, 14, 36)
  ctx.fillRect(x + 28, y - 8, 14, 36)
  ctx.fillStyle = 'rgba(142, 180, 232, 0.55)'
  ctx.beginPath()
  ctx.moveTo(x - 42, y - 8)
  ctx.quadraticCurveTo(x, y - 36, x + 42, y - 8)
  ctx.lineTo(x + 42, y)
  ctx.quadraticCurveTo(x, y - 22, x - 42, y)
  ctx.closePath()
  ctx.fill()
  // ランウェイ帯
  ctx.fillStyle = 'rgba(200, 220, 255, 0.45)'
  ctx.fillRect(x - 10, y + 6, 20, 28)
  ctx.fillStyle = '#8eb4e8'
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath()
    ctx.arc(x - 14, y + 10 + i * 7, 2, 0, Math.PI * 2)
    ctx.arc(x + 14, y + 10 + i * 7, 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawLandmarkMountain(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = 'rgba(55, 85, 50, 0.9)'
  ctx.beginPath()
  ctx.moveTo(x - 48, y + 28)
  ctx.lineTo(x - 12, y - 22)
  ctx.lineTo(x + 16, y + 18)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = 'rgba(70, 105, 60, 0.95)'
  ctx.beginPath()
  ctx.moveTo(x - 10, y + 30)
  ctx.lineTo(x + 18, y - 36)
  ctx.lineTo(x + 50, y + 30)
  ctx.closePath()
  ctx.fill()
  // 雪頂
  ctx.fillStyle = 'rgba(235, 240, 248, 0.9)'
  ctx.beginPath()
  ctx.moveTo(x + 8, y - 12)
  ctx.lineTo(x + 18, y - 36)
  ctx.lineTo(x + 28, y - 10)
  ctx.closePath()
  ctx.fill()
  // 旗
  ctx.strokeStyle = '#f0e4c8'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(x + 18, y - 36)
  ctx.lineTo(x + 18, y - 52)
  ctx.stroke()
  ctx.fillStyle = '#ff3a28'
  ctx.beginPath()
  ctx.moveTo(x + 18, y - 52)
  ctx.lineTo(x + 34, y - 46)
  ctx.lineTo(x + 18, y - 40)
  ctx.closePath()
  ctx.fill()
}

function drawLandmarkSea(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 明るい水面
  ctx.fillStyle = 'rgba(120, 200, 230, 0.4)'
  ctx.beginPath()
  ctx.ellipse(x, y + 4, 48, 22, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(210, 240, 255, 0.65)'
  ctx.lineWidth = 3
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath()
    ctx.arc(x - 18 + i * 18, y + 6, 10 + i * 2, 0.2, Math.PI - 0.2)
    ctx.stroke()
  }
  // ヤシ
  drawPalm(ctx, x - 36, y + 8, 1)
  drawPalm(ctx, x + 34, y + 12, 0.85)
  // 砂
  ctx.fillStyle = 'rgba(240, 200, 140, 0.45)'
  ctx.beginPath()
  ctx.ellipse(x, y + 28, 42, 10, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawPalm(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const s = scale
  ctx.strokeStyle = 'rgba(90, 60, 35, 0.8)'
  ctx.lineWidth = 3.5 * s
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.quadraticCurveTo(x + 4 * s, y - 18 * s, x + 2 * s, y - 36 * s)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(70, 140, 70, 0.75)'
  ctx.lineWidth = 2.5 * s
  for (const a of [-0.9, -0.35, 0.25, 0.8]) {
    ctx.beginPath()
    ctx.moveTo(x + 2 * s, y - 34 * s)
    ctx.quadraticCurveTo(
      x + Math.cos(a) * 22 * s,
      y - 34 * s + Math.sin(a) * 8 * s,
      x + Math.cos(a) * 28 * s,
      y - 20 * s + Math.sin(a) * 16 * s,
    )
    ctx.stroke()
  }
}

function drawLandmarkAstro(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // ドーム
  ctx.fillStyle = 'rgba(90, 200, 230, 0.35)'
  ctx.beginPath()
  ctx.arc(x, y + 6, 28, Math.PI, 0)
  ctx.fill()
  ctx.strokeStyle = 'rgba(92, 224, 255, 0.85)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(x, y + 6, 28, Math.PI, 0)
  ctx.stroke()
  ctx.fillStyle = 'rgba(30, 40, 70, 0.7)'
  ctx.fillRect(x - 30, y + 4, 60, 14)
  // 軌道リング
  ctx.strokeStyle = 'rgba(180, 160, 255, 0.7)'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.ellipse(x, y, 40, 12, -0.35, 0, Math.PI * 2)
  ctx.stroke()
  // 星
  ctx.fillStyle = '#fff8c0'
  for (const [dx, dy] of [
    [-28, -18],
    [30, -22],
    [22, 8],
    [-34, 2],
  ] as const) {
    ctx.beginPath()
    ctx.arc(x + dx, y + dy, 2.4, 0, Math.PI * 2)
    ctx.fill()
  }
}

