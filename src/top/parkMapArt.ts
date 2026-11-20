/**
 * Plaza 入口のパーク全体マップ。
 * 自然な円形エリア＋ランドマーク絵＋環境ディテール。
 * 現在地は Plaza 下部。テーマ色は parkZoneTheme / PARK_LOOK 準拠。
 */

export const PARK_MAP_TEX_W = 1600
export const PARK_MAP_TEX_H = 860

const JP_SANS =
  'Montserrat, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", "Yu Gothic", sans-serif'
const EN_DISPLAY = 'Montserrat, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'
const EN_SANS = 'Montserrat, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'

type Locale = 'en' | 'ja'

/** マップ上のエリア（parkZones の ParkZoneId と同じ） */
export type ParkMapZoneId = 'plaza' | 'mountain' | 'culture' | 'sea' | 'astro' | 'musicArt' | 'jungle'

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
  musicArt: {
    id: 'musicArt',
    fill: '#6a3a88',
    fillDeep: '#1c1228',
    rim: '#e85cff',
    banner: '#ffc46a',
    ink: '#140818',
    labelEn: 'Music & Art District',
    labelJa: 'ミュージック＆アートエリア',
  },
  jungle: {
    id: 'jungle',
    fill: '#3e7a38',
    fillDeep: '#1e3a1c',
    rim: '#8ab860',
    banner: '#e8c870',
    ink: '#101a0c',
    labelEn: 'Jungle District',
    labelJa: 'ジャングルエリア',
  },
}

/**
 * エリアの島（テーマパークの案内図ふう）。
 * 大きさ・傾き・輪郭を少しずつ変えて、手描きのようなアンバランスさを出す。
 */
type Blob = {
  x: number
  y: number
  w: number
  h: number
  /** 傾き（ラジアン） */
  tilt: number
  /** 輪郭のゆらぎの種 */
  seed: number
}

/** ラベルの置き方（島の中心からのずれと傾き） */
type LabelPlacement = { dx: number; dy: number; tilt: number }

export function drawParkMap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  locale: Locale,
  /** 看板が立っているエリア（「現在地」を出す） */
  here: ParkMapZoneId = 'plaza',
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
  const at = (nx: number, ny: number): [number, number] => [mapLeft + mapW * nx, mapTop + mapH * ny]
  const blob = (nx: number, ny: number, nw: number, nh: number, tilt: number, seed: number): Blob => {
    const [x, y] = at(nx, ny)
    return { x, y, w: mapW * nw, h: mapH * nh, tilt, seed }
  }

  /**
   * つながりは実際どおり（Plaza の左右に Sea・Mountain、奥に Culture、
   * Culture の左右に Jungle・Astro、その奥に Music & Art）。
   * ただしマス目にはそろえず、位置・大きさ・傾きを少しずつずらす。
   */
  const plaza = blob(0.5, 0.73, 0.29, 0.33, -0.04, 1.3)
  const sea = blob(0.15, 0.66, 0.24, 0.36, 0.12, 4.1)
  const mountain = blob(0.83, 0.66, 0.25, 0.38, -0.1, 2.7)
  const culture = blob(0.45, 0.4, 0.25, 0.25, 0.06, 5.2)
  const jungle = blob(0.19, 0.3, 0.23, 0.29, -0.14, 3.3)
  const astro = blob(0.77, 0.27, 0.24, 0.26, 0.09, 6.4)
  const musicArt = blob(0.45, 0.13, 0.21, 0.21, -0.08, 7.7)

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
  // 日本語は字面が大きいので、タイトルを小さめ・上寄せにしてサブタイトルと重ならないようにする
  ctx.font = `700 ${locale === 'ja' ? 36 : 42}px ${locale === 'ja' ? JP_SANS : EN_DISPLAY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(locale === 'ja' ? 'ミービッツパーク' : 'MEEBITS PARK', width / 2, locale === 'ja' ? 38 : 42)
  ctx.fillStyle = '#9ab0d0'
  ctx.font = `700 ${locale === 'ja' ? 20 : 24}px ${locale === 'ja' ? JP_SANS : EN_SANS}`
  ctx.fillText(locale === 'ja' ? 'パークマップ' : 'PARK MAP', width / 2, locale === 'ja' ? 71 : 72)

  ctx.save()
  roundRect(ctx, mapLeft, mapTop, mapW, mapH, 10)
  ctx.clip()

  // 海と、パーク全体が乗る大きな島
  drawSeaAndLand(ctx, mapLeft, mapTop, mapW, mapH)

  // 遊歩道（ゆるく曲がる小道）
  const links: Array<[Blob, Blob, number]> = [
    [plaza, sea, 0.18],
    [plaza, mountain, -0.16],
    [plaza, culture, 0.22],
    [culture, jungle, -0.2],
    [culture, astro, 0.14],
    [culture, musicArt, -0.25],
    [mountain, astro, 0.2],
  ]
  for (const [from, to, bend] of links) drawWalkway(ctx, from, to, bend)

  // 島の外周の木立（エリアのすき間を森で埋める）
  drawForestClusters(ctx, mapLeft, mapTop, mapW, mapH)

  const zones: Array<[Blob, ZonePaint, (c: CanvasRenderingContext2D, x: number, y: number) => void, LabelPlacement]> = [
    [musicArt, ZONES.musicArt, drawLandmarkMusicArt, { dx: -0.04, dy: 0.26, tilt: 0.03 }],
    [jungle, ZONES.jungle, drawLandmarkJungle, { dx: 0.02, dy: 0.24, tilt: -0.04 }],
    [culture, ZONES.culture, drawLandmarkCulture, { dx: -0.02, dy: 0.24, tilt: 0.02 }],
    [astro, ZONES.astro, drawLandmarkAstro, { dx: 0.03, dy: 0.25, tilt: 0.04 }],
    [sea, ZONES.sea, drawLandmarkSea, { dx: 0.04, dy: 0.2, tilt: -0.03 }],
    [mountain, ZONES.mountain, drawLandmarkMountain, { dx: -0.03, dy: 0.22, tilt: 0.03 }],
    [plaza, ZONES.plaza, drawLandmarkPlaza, { dx: 0, dy: 0.08, tilt: -0.02 }],
  ]
  for (const [b, zone] of zones) drawZoneBlob(ctx, b, zone)

  for (const [b, zone, drawLandmark, label] of zones) {
    if (zone.id === here) drawHereHalo(ctx, b)
    // 各エリアの町並み（島の中心基準のピクセル座標で、ラベルの上に収まるよう描く）
    drawLandmark(ctx, b.x, b.y)
    paintZoneLabel(ctx, b.x + b.w * label.dx, b.y + b.h * label.dy, zone, locale, label.tilt)
  }

  // 現在地：ラベルのすぐ下（Plaza は島の下寄り）
  const hereEntry = zones.find(([, zone]) => zone.id === here) ?? zones[zones.length - 1]
  const [hereBlob, , , hereLabel] = hereEntry
  if (hereBlob === musicArt) {
    // 下はカルチャーの島に近いので、左の空き地に置いてピンを島の縁へ向ける
    drawYouAreHere(ctx, musicArt.x - musicArt.w * 0.5 + 4, musicArt.y - musicArt.h * 0.12, locale, 'pinRight')
  } else {
    const hereY =
      hereBlob === plaza ? plaza.y + plaza.h * 0.36 : hereBlob.y + hereBlob.h * hereLabel.dy + 58
    drawYouAreHere(ctx, hereBlob.x + hereBlob.w * hereLabel.dx, hereY, locale)
  }

  drawCompass(ctx, mapLeft + mapW - 70, mapTop + mapH - 70)

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

/** 手描きふうの有機的な輪郭（傾き・ゆらぎ付き） */
function blobPath(ctx: CanvasRenderingContext2D, b: Blob, dx = 0, dy = 0, grow = 1) {
  const steps = 80
  const cos = Math.cos(b.tilt)
  const sin = Math.sin(b.tilt)
  ctx.beginPath()
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * Math.PI * 2
    const wobble =
      1 +
      Math.sin(t * 2 + b.seed) * 0.07 +
      Math.cos(t * 3 + b.seed * 1.9) * 0.05 +
      Math.sin(t * 5 + b.seed * 0.6) * 0.025
    const lx = Math.cos(t) * (b.w * 0.5) * wobble * grow
    const ly = Math.sin(t) * (b.h * 0.5) * wobble * grow
    const px = b.x + dx + lx * cos - ly * sin
    const py = b.y + dy + lx * sin + ly * cos
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

function drawZoneBlob(ctx: CanvasRenderingContext2D, b: Blob, zone: ZonePaint) {
  // 地面に落ちる影
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)'
  blobPath(ctx, b, 0, 9)
  ctx.fill()

  const grad = ctx.createRadialGradient(b.x - b.w * 0.15, b.y - b.h * 0.2, 10, b.x, b.y, Math.max(b.w, b.h) * 0.62)
  grad.addColorStop(0, zone.fill)
  grad.addColorStop(1, zone.fillDeep)
  ctx.fillStyle = grad
  blobPath(ctx, b)
  ctx.fill()
  // 二重の縁取り（外は濃く、内は明るく）
  ctx.strokeStyle = 'rgba(10, 14, 24, 0.55)'
  ctx.lineWidth = 7
  ctx.stroke()
  ctx.strokeStyle = zone.rim
  ctx.lineWidth = 3.5
  ctx.stroke()
}

/** ゆるく曲がる遊歩道（濃い縁取り＋クリーム色の道＋点線の中心線） */
function drawWalkway(ctx: CanvasRenderingContext2D, from: Blob, to: Blob, bend: number) {
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2
  const dx = to.x - from.x
  const dy = to.y - from.y
  // 進行方向に直角へふくらませる
  const cx = mx - dy * bend
  const cy = my + dx * bend
  const trace = () => {
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.quadraticCurveTo(cx, cy, to.x, to.y)
  }
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.setLineDash([])
  ctx.strokeStyle = 'rgba(60, 44, 26, 0.85)'
  ctx.lineWidth = 22
  trace()
  ctx.stroke()
  ctx.strokeStyle = '#d8c39a'
  ctx.lineWidth = 15
  trace()
  ctx.stroke()
  ctx.strokeStyle = 'rgba(150, 120, 80, 0.7)'
  ctx.lineWidth = 2.5
  ctx.setLineDash([10, 12])
  trace()
  ctx.stroke()
  ctx.setLineDash([])
}

function paintZoneLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  zone: ZonePaint,
  locale: Locale,
  tilt = 0,
) {
  const label = locale === 'ja' ? zone.labelJa : zone.labelEn
  const fontSize = locale === 'ja' ? 40 : 36
  ctx.font = `800 ${fontSize}px ${locale === 'ja' ? JP_SANS : EN_SANS}`
  const tw = ctx.measureText(label).width
  const padX = 22
  const bw = tw + padX * 2
  const bh = 56
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(tilt)
  // リボンの切り欠き（左右の端）
  const notch = 14
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  roundRect(ctx, -bw / 2 + 3, -bh / 2 + 4, bw, bh, 8)
  ctx.fill()
  ctx.fillStyle = shadeHex(zone.banner, 0.75)
  for (const side of [-1, 1] as const) {
    ctx.beginPath()
    ctx.moveTo(side * (bw / 2 - 6), -bh / 2 + 10)
    ctx.lineTo(side * (bw / 2 + notch + 10), -bh / 2 + 10)
    ctx.lineTo(side * (bw / 2 + 10), 6)
    ctx.lineTo(side * (bw / 2 + notch + 10), bh / 2 + 2)
    ctx.lineTo(side * (bw / 2 - 6), bh / 2 + 2)
    ctx.closePath()
    ctx.fill()
  }
  ctx.fillStyle = zone.banner
  roundRect(ctx, -bw / 2, -bh / 2, bw, bh, 8)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = zone.ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 0, 1)
  ctx.restore()
}

function shadeHex(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.round(((n >> 16) & 255) * amount)
  const g = Math.round(((n >> 8) & 255) * amount)
  const b = Math.round((n & 255) * amount)
  return `rgb(${r}, ${g}, ${b})`
}

/** 「いまここ」: ピン＋赤いラベル（Plaza の下寄り） */
/** 現在地のエリアをやわらかく縁取る（光らせすぎない） */
function drawHereHalo(ctx: CanvasRenderingContext2D, b: Blob) {
  ctx.save()
  ctx.setLineDash([10, 8])
  ctx.strokeStyle = 'rgba(255, 236, 200, 0.85)'
  ctx.lineWidth = 3
  blobPath(ctx, b, 0, 0, 1.07)
  ctx.stroke()
  ctx.restore()
}

/**
 * 現在地のピン＋札。
 * center: (x, y) を中心に「ピン・札」の順。pinRight: x がピンの位置で、札はその左。
 */
function drawYouAreHere(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  locale: Locale,
  align: 'center' | 'pinRight' = 'center',
) {
  const label = locale === 'ja' ? 'いまここ' : 'YOU ARE HERE'
  ctx.font = `800 28px ${locale === 'ja' ? JP_SANS : EN_SANS}`
  const tw = ctx.measureText(label).width
  const pinW = 34
  const pillW = tw + 28
  const total = pinW + 10 + pillW
  const left = align === 'center' ? x - total / 2 : x - total
  const pinX = align === 'center' ? left + pinW / 2 : x - pinW / 2

  ctx.fillStyle = '#e04848'
  ctx.beginPath()
  ctx.moveTo(pinX, y + 22)
  ctx.lineTo(pinX - 15, y - 2)
  ctx.lineTo(pinX + 15, y - 2)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.arc(pinX, y - 8, 16, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(pinX, y - 8, 6, 0, Math.PI * 2)
  ctx.fill()

  const pillX = align === 'center' ? left + pinW + 10 : left
  ctx.fillStyle = '#e04848'
  roundRect(ctx, pillX, y - 28, pillW, 42, 8)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, pillX + 14, y - 6)
}

/** 夜の海（波の線・小舟）と、パーク全体が乗る大きな島 */
function drawSeaAndLand(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const sea = ctx.createLinearGradient(0, y, 0, y + h)
  sea.addColorStop(0, '#0f2440')
  sea.addColorStop(1, '#123050')
  ctx.fillStyle = sea
  ctx.fillRect(x, y, w, h)

  // 波の線
  ctx.strokeStyle = 'rgba(150, 200, 230, 0.22)'
  ctx.lineWidth = 2
  for (const [nx, ny] of [
    [0.04, 0.12],
    [0.09, 0.9],
    [0.03, 0.55],
    [0.93, 0.08],
    [0.96, 0.45],
    [0.3, 0.95],
    [0.66, 0.96],
    [0.88, 0.94],
  ] as const) {
    const cx = x + w * nx
    const cy = y + h * ny
    ctx.beginPath()
    ctx.moveTo(cx - 18, cy)
    ctx.quadraticCurveTo(cx - 9, cy - 6, cx, cy)
    ctx.quadraticCurveTo(cx + 9, cy + 6, cx + 18, cy)
    ctx.stroke()
  }
  // 小舟（左下の海）
  ctx.fillStyle = '#8a6040'
  ctx.beginPath()
  ctx.moveTo(x + w * 0.03, y + h * 0.82)
  ctx.lineTo(x + w * 0.03 + 34, y + h * 0.82)
  ctx.lineTo(x + w * 0.03 + 26, y + h * 0.82 + 10)
  ctx.lineTo(x + w * 0.03 + 8, y + h * 0.82 + 10)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#f0e8d8'
  ctx.beginPath()
  ctx.moveTo(x + w * 0.03 + 17, y + h * 0.82 - 2)
  ctx.lineTo(x + w * 0.03 + 17, y + h * 0.82 - 30)
  ctx.lineTo(x + w * 0.03 + 32, y + h * 0.82 - 4)
  ctx.closePath()
  ctx.fill()

  // パーク全体の大きな島（海岸線はゆるく波打つ）
  const land: Blob = { x: x + w * 0.5, y: y + h * 0.5, w: w * 1.0, h: h * 1.06, tilt: 0.02, seed: 9.1 }
  ctx.fillStyle = '#e8d8b0'
  blobPath(ctx, land, 0, 0, 1.0)
  ctx.globalAlpha = 0.18
  ctx.fill()
  ctx.globalAlpha = 1
  const ground = ctx.createRadialGradient(x + w * 0.5, y + h * 0.55, h * 0.2, x + w * 0.5, y + h * 0.5, w * 0.6)
  ground.addColorStop(0, '#2e4632')
  ground.addColorStop(1, '#243a2a')
  ctx.fillStyle = ground
  blobPath(ctx, land, 0, 0, 0.96)
  ctx.fill()
  // 砂浜の縁
  ctx.strokeStyle = 'rgba(216, 195, 154, 0.55)'
  ctx.lineWidth = 6
  ctx.stroke()
}

/** エリアのすき間と島の縁に置く木立 */
function drawForestClusters(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const clusters: Array<[number, number, number]> = [
    [0.07, 0.12, 4],
    [0.33, 0.1, 3],
    [0.64, 0.09, 3],
    [0.93, 0.18, 4],
    [0.32, 0.58, 2],
    [0.66, 0.5, 3],
    [0.06, 0.94, 3],
    [0.31, 0.92, 2],
    [0.7, 0.93, 3],
    [0.94, 0.94, 3],
    [0.6, 0.27, 2],
  ]
  for (const [nx, ny, count] of clusters) {
    for (let i = 0; i < count; i += 1) {
      const ox = (i - (count - 1) / 2) * 16 + Math.sin(i * 2.3 + nx * 10) * 5
      const oy = Math.cos(i * 1.7 + ny * 10) * 7
      drawMapTree(ctx, x + w * nx + ox, y + h * ny + oy, 13 + ((i * 5) % 4))
    }
  }
}

/** 方位記号（右下） */
function drawCompass(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = 'rgba(14, 20, 34, 0.7)'
  ctx.beginPath()
  ctx.arc(0, 0, 34, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#d4b46a'
  ctx.lineWidth = 2
  ctx.stroke()
  for (const [angle, color] of [
    [0, '#e2c77f'],
    [Math.PI, '#8a7a5a'],
    [Math.PI / 2, '#8a7a5a'],
    [-Math.PI / 2, '#8a7a5a'],
  ] as const) {
    ctx.save()
    ctx.rotate(angle)
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(0, -26)
    ctx.lineTo(6, 0)
    ctx.lineTo(-6, 0)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
  ctx.fillStyle = '#e2c77f'
  ctx.font = '800 14px Montserrat, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('N', 0, -44)
  ctx.restore()
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


/* ------------------------------------------------------------------ */
/* 町並みの部品（案内図ふうの立体的なミニ建物）                         */
/* ------------------------------------------------------------------ */

const INK = 'rgba(10, 14, 26, 0.78)'
const WINDOW_WARM = '#ffd98a'
/** 側面の奥行き（右上へ伸ばす） */
const SIDE_DX = 0.9
const SIDE_DY = 0.5

type RoofKind = 'flat' | 'gable' | 'barrel' | 'none'

type BuildingSpec = {
  /** 正面の幅・高さ */
  w: number
  h: number
  /** 側面の奥行き */
  depth?: number
  wall: string
  roof?: string
  roofKind?: RoofKind
  /** 屋根の高さ（gable / barrel） */
  roofH?: number
  windows?: { rows: number; cols: number; color?: string; inset?: number }
  door?: string | null
}

/** 足元の影 */
function groundShadow(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.26)'
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
}

function outline(ctx: CanvasRenderingContext2D, width = 1.6) {
  ctx.strokeStyle = INK
  ctx.lineWidth = width
  ctx.lineJoin = 'round'
  ctx.stroke()
}

function poly(ctx: CanvasRenderingContext2D, pts: Array<[number, number]>, fill: string, stroke = true) {
  ctx.beginPath()
  pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)))
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) outline(ctx)
}

/**
 * 正面＋右側面＋屋根の小さな建物。(x, base) は正面の下辺の中央。
 * 返り値は正面の左上（看板などを足すため）。
 */
function drawBuilding(ctx: CanvasRenderingContext2D, x: number, base: number, spec: BuildingSpec) {
  const { w, h, wall } = spec
  const d = spec.depth ?? Math.min(18, w * 0.28)
  const sx = d * SIDE_DX
  const sy = d * SIDE_DY
  const left = x - w / 2
  const right = x + w / 2
  const top = base - h
  const roof = spec.roof ?? shadeHex(wall, 0.62)
  const kind = spec.roofKind ?? 'flat'
  const roofH = spec.roofH ?? h * 0.4

  groundShadow(ctx, x + sx * 0.5, base + 2, w * 0.62 + sx * 0.4, 6)

  // 側面
  poly(
    ctx,
    [
      [right, base],
      [right + sx, base - sy],
      [right + sx, top - sy],
      [right, top],
    ],
    shadeHex(wall, 0.7),
  )
  // 正面
  poly(
    ctx,
    [
      [left, base],
      [right, base],
      [right, top],
      [left, top],
    ],
    wall,
  )

  if (kind === 'flat') {
    poly(
      ctx,
      [
        [left, top],
        [right, top],
        [right + sx, top - sy],
        [left + sx, top - sy],
      ],
      shadeHex(wall, 1.12),
    )
    // 軒の帯
    ctx.fillStyle = roof
    ctx.fillRect(left, top, w, Math.max(3, h * 0.08))
  } else if (kind === 'gable') {
    // 正面の三角＋側面の屋根面
    poly(
      ctx,
      [
        [x, top - roofH],
        [right, top],
        [right + sx, top - sy],
        [x + sx, top - roofH - sy],
      ],
      roof,
    )
    poly(
      ctx,
      [
        [left, top],
        [right, top],
        [x, top - roofH],
      ],
      shadeHex(wall, 0.92),
    )
    ctx.strokeStyle = shadeHex(roof, 0.75)
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(left - 2, top + 1)
    ctx.lineTo(x, top - roofH)
    ctx.lineTo(right + 2, top + 1)
    ctx.stroke()
  } else if (kind === 'barrel') {
    // かまぼこ屋根（正面は半楕円、奥へ伸びる）
    ctx.beginPath()
    ctx.ellipse(x + sx, top - sy, w / 2, roofH, 0, Math.PI, 0)
    ctx.lineTo(right, top)
    ctx.ellipse(x, top, w / 2, roofH, 0, 0, Math.PI, true)
    ctx.closePath()
    ctx.fillStyle = roof
    ctx.fill()
    outline(ctx)
    ctx.beginPath()
    ctx.ellipse(x, top, w / 2, roofH, 0, Math.PI, 0)
    ctx.closePath()
    ctx.fillStyle = shadeHex(roof, 1.18)
    ctx.fill()
    outline(ctx)
  }

  if (spec.windows) {
    const { rows, cols } = spec.windows
    const inset = spec.windows.inset ?? 0.16
    const gx = (w * (1 - inset * 2)) / cols
    const doorRoom = spec.door === null ? 0 : h * 0.34
    const gy = (h - doorRoom - h * 0.18) / rows
    ctx.fillStyle = spec.windows.color ?? WINDOW_WARM
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const wx = left + w * inset + gx * c + gx * 0.22
        const wy = top + h * 0.14 + gy * r + gy * 0.2
        ctx.fillRect(wx, wy, gx * 0.56, gy * 0.56)
      }
    }
  }
  if (spec.door !== null) {
    const dw = Math.max(6, w * 0.16)
    const dh = Math.max(8, h * 0.3)
    ctx.fillStyle = spec.door ?? 'rgba(20, 16, 22, 0.85)'
    ctx.fillRect(x - dw / 2, base - dh, dw, dh)
  }
  return { left, top, right }
}

/** 色つきの日よけ（縞） */
function drawAwning(
  ctx: CanvasRenderingContext2D,
  left: number,
  y: number,
  w: number,
  a: string,
  b: string,
  stripes = 5,
) {
  const sw = w / stripes
  for (let i = 0; i < stripes; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? a : b
    ctx.beginPath()
    ctx.moveTo(left + sw * i, y)
    ctx.lineTo(left + sw * (i + 1), y)
    ctx.lineTo(left + sw * (i + 1) + 2, y + 9)
    ctx.lineTo(left + sw * i + 2, y + 9)
    ctx.closePath()
    ctx.fill()
  }
  ctx.beginPath()
  ctx.rect(left, y, w + 2, 9)
  ctx.strokeStyle = INK
  ctx.lineWidth = 1.2
  ctx.stroke()
}

/** 丸い広葉樹 */
function drawRoundTree(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, leaf = '#3f8a46') {
  groundShadow(ctx, x + 2, y + 1, r * 0.8, r * 0.26)
  ctx.fillStyle = '#5a3e28'
  ctx.fillRect(x - r * 0.14, y - r * 0.7, r * 0.28, r * 0.7)
  ctx.beginPath()
  ctx.arc(x, y - r * 1.15, r, 0, Math.PI * 2)
  ctx.fillStyle = leaf
  ctx.fill()
  outline(ctx, 1.4)
  ctx.fillStyle = shadeHex(leaf, 1.3)
  ctx.beginPath()
  ctx.arc(x - r * 0.32, y - r * 1.42, r * 0.42, 0, Math.PI * 2)
  ctx.fill()
}

/** 針葉樹（雪を乗せるかどうか） */
function drawPine(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, snow = false) {
  groundShadow(ctx, x + 2, y + 1, h * 0.28, h * 0.08)
  ctx.fillStyle = '#4a3424'
  ctx.fillRect(x - h * 0.05, y - h * 0.16, h * 0.1, h * 0.16)
  const tiers = 3
  for (let i = 0; i < tiers; i += 1) {
    const ty = y - h * 0.12 - i * h * 0.26
    const tw = h * (0.34 - i * 0.07)
    poly(
      ctx,
      [
        [x - tw, ty],
        [x + tw, ty],
        [x, ty - h * 0.42],
      ],
      i === tiers - 1 ? '#2f6a40' : '#295c38',
    )
    if (snow) {
      ctx.fillStyle = 'rgba(240, 246, 252, 0.92)'
      ctx.beginPath()
      ctx.moveTo(x - tw * 0.32, ty - h * 0.28)
      ctx.lineTo(x, ty - h * 0.42)
      ctx.lineTo(x + tw * 0.32, ty - h * 0.28)
      ctx.closePath()
      ctx.fill()
    }
  }
}

function drawPalm(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const s = scale
  groundShadow(ctx, x + 6 * s, y + 1, 12 * s, 3.5 * s)
  ctx.strokeStyle = '#7a5434'
  ctx.lineWidth = 3.5 * s
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.quadraticCurveTo(x + 6 * s, y - 18 * s, x + 3 * s, y - 36 * s)
  ctx.stroke()
  ctx.strokeStyle = '#3f8a46'
  ctx.lineWidth = 4 * s
  for (const a of [-2.6, -1.9, -1.2, -0.5, 0.2]) {
    ctx.beginPath()
    ctx.moveTo(x + 3 * s, y - 36 * s)
    ctx.quadraticCurveTo(
      x + 3 * s + Math.cos(a) * 14 * s,
      y - 36 * s + Math.sin(a) * 10 * s - 4 * s,
      x + 3 * s + Math.cos(a) * 22 * s,
      y - 36 * s + Math.sin(a) * 6 * s + 8 * s,
    )
    ctx.stroke()
  }
  ctx.lineCap = 'butt'
}

/** 街灯（静かな丸い灯り） */
function drawStreetLamp(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = '#2a2a34'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x, y - 20)
  ctx.stroke()
  ctx.fillStyle = 'rgba(255, 220, 150, 0.22)'
  ctx.beginPath()
  ctx.arc(x, y - 22, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = WINDOW_WARM
  ctx.beginPath()
  ctx.arc(x, y - 22, 2.6, 0, Math.PI * 2)
  ctx.fill()
}

/** 地面の小道（エリア内の石畳） */
function drawPath(ctx: CanvasRenderingContext2D, pts: Array<[number, number]>, width: number, color: string) {
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = 'rgba(10, 14, 26, 0.35)'
  ctx.lineWidth = width + 4
  ctx.beginPath()
  pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)))
  ctx.stroke()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()
  ctx.lineCap = 'butt'
}

/* ------------------------------------------------------------------ */
/* エリアごとの町並み（x, y は島の中心）                                */
/* ------------------------------------------------------------------ */

/** Plaza: 奥に美術館（Find the Meebit）、手前に噴水、左にポッドキャスト、右に 8th Street の商店街 */
function drawLandmarkPlaza(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 石畳の広場
  ctx.fillStyle = 'rgba(200, 180, 140, 0.18)'
  ctx.beginPath()
  ctx.ellipse(x, y - 40, 170, 46, -0.04, 0, Math.PI * 2)
  ctx.fill()

  // 美術館（列柱＋三角破風）
  const mx = x - 4
  const mb = y - 66
  const museum = drawBuilding(ctx, mx, mb, {
    w: 112,
    h: 34,
    depth: 16,
    wall: '#e8dcc4',
    roof: '#b89758',
    roofKind: 'gable',
    roofH: 16,
    door: null,
  })
  ctx.fillStyle = 'rgba(60, 50, 40, 0.55)'
  for (let i = 0; i < 6; i += 1) {
    ctx.fillRect(museum.left + 10 + i * 18, museum.top + 6, 5, 26)
  }
  ctx.fillStyle = '#c8b898'
  ctx.fillRect(museum.left - 4, mb - 3, 120, 5)

  // ポッドキャストスタジオ（左）
  const pod = drawBuilding(ctx, x - 140, y - 22, {
    w: 66,
    h: 42,
    wall: '#3c4a68',
    roofKind: 'flat',
    windows: { rows: 1, cols: 2 },
  })
  // ON AIR の小さな赤ランプ
  ctx.fillStyle = '#e84a3a'
  roundRect(ctx, pod.left + 22, pod.top - 9, 22, 7, 3)
  ctx.fill()
  drawRoundTree(ctx, x - 92, y - 18, 11)

  // 8th Street の商店街（右）
  const shops: Array<[number, number, string, string, string]> = [
    [100, 36, '#c87a58', '#f0e4c8', '#c84a3a'],
    [140, 44, '#6a8ab0', '#f0e4c8', '#3a6ab8'],
    [180, 32, '#d8b878', '#f0e4c8', '#4a9a5a'],
  ]
  for (const [dx, h, wall, a, b] of shops) {
    const s = drawBuilding(ctx, x + dx, y - 24 - (dx - 100) * 0.12, {
      w: 38,
      h,
      depth: 10,
      wall,
      roofKind: 'flat',
      windows: { rows: 1, cols: 2 },
    })
    drawAwning(ctx, s.left, s.top + h * 0.5, 38, a, b, 4)
  }
  drawStreetLamp(ctx, x + 72, y - 14)

  // 噴水
  groundShadow(ctx, x, y - 28, 40, 12)
  ctx.beginPath()
  ctx.ellipse(x, y - 32, 38, 14, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#c8b898'
  ctx.fill()
  outline(ctx)
  ctx.beginPath()
  ctx.ellipse(x, y - 33, 31, 10, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#4a9ac0'
  ctx.fill()
  ctx.fillStyle = 'rgba(200, 235, 250, 0.55)'
  ctx.beginPath()
  ctx.ellipse(x - 8, y - 35, 12, 3.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#d4b46a'
  ctx.fillRect(x - 3, y - 50, 6, 17)
  ctx.beginPath()
  ctx.ellipse(x, y - 50, 9, 3.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(210, 240, 255, 0.8)'
  ctx.lineWidth = 2
  for (const s of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(x, y - 54)
    ctx.quadraticCurveTo(x + s * 12, y - 66, x + s * 20, y - 38)
    ctx.stroke()
  }
}

/** Sea: 砂浜の小島に OpenSea Market（美術館ふう）と Sergito の木の工房、桟橋と釣り小屋 */
function drawLandmarkSea(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 水面のきらめきは控えめな波線だけ
  ctx.strokeStyle = 'rgba(210, 240, 255, 0.35)'
  ctx.lineWidth = 2
  for (const [dx, dy] of [
    [-120, 10],
    [96, -82],
    [120, 6],
    [-40, -96],
  ] as const) {
    ctx.beginPath()
    ctx.arc(x + dx, y + dy, 8, 0.3, Math.PI - 0.3)
    ctx.arc(x + dx + 14, y + dy, 8, 0.3, Math.PI - 0.3)
    ctx.stroke()
  }

  // 砂浜の島
  ctx.beginPath()
  ctx.ellipse(x + 6, y - 30, 130, 52, 0.08, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(240, 210, 150, 0.35)'
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + 6, y - 32, 118, 44, 0.08, 0, Math.PI * 2)
  ctx.fillStyle = '#e8cc90'
  ctx.fill()
  outline(ctx, 1.4)
  ctx.beginPath()
  ctx.ellipse(x + 10, y - 38, 92, 30, 0.08, 0, Math.PI * 2)
  ctx.fillStyle = '#7aa860'
  ctx.fill()

  // 桟橋と釣り小屋（左へ突き出す）
  ctx.fillStyle = '#9a7048'
  poly(
    ctx,
    [
      [x - 100, y - 28],
      [x - 160, y - 46],
      [x - 160, y - 38],
      [x - 100, y - 20],
    ],
    '#9a7048',
  )
  ctx.strokeStyle = 'rgba(60, 40, 24, 0.6)'
  ctx.lineWidth = 1
  for (let i = 1; i < 6; i += 1) {
    const px = x - 100 - i * 10
    const py = y - 28 - i * 3
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.lineTo(px, py + 8)
    ctx.stroke()
  }
  drawBuilding(ctx, x - 156, y - 42, {
    w: 22,
    h: 16,
    depth: 7,
    wall: '#b8885a',
    roof: '#5a7a9a',
    roofKind: 'gable',
    roofH: 9,
  })
  // 釣り竿
  ctx.strokeStyle = 'rgba(40, 30, 20, 0.8)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x - 130, y - 38)
  ctx.lineTo(x - 146, y - 66)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(230, 230, 230, 0.55)'
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(x - 146, y - 66)
  ctx.lineTo(x - 150, y - 26)
  ctx.stroke()

  // OpenSea Market（白い石の展示館。列柱と紺の帯で静かに）
  const market = drawBuilding(ctx, x - 22, y - 26, {
    w: 84,
    h: 44,
    depth: 16,
    wall: '#eef0f2',
    roofKind: 'flat',
    door: '#1c3a6a',
  })
  ctx.fillStyle = '#2a5a9a'
  ctx.fillRect(market.left, market.top + 3, 84, 4)
  ctx.fillStyle = 'rgba(120, 140, 160, 0.5)'
  for (let i = 0; i < 5; i += 1) {
    if (i === 2) continue
    ctx.fillRect(market.left + 9 + i * 15, market.top + 12, 4, 30)
  }

  // Sergito の工房（木の切妻屋根）
  drawBuilding(ctx, x + 66, y - 30, {
    w: 52,
    h: 30,
    depth: 14,
    wall: '#b8885a',
    roof: '#7a4a2e',
    roofKind: 'gable',
    roofH: 18,
    windows: { rows: 1, cols: 2 },
  })

  drawPalm(ctx, x - 82, y - 46, 0.85)
  drawPalm(ctx, x + 108, y - 34, 1)
  drawPalm(ctx, x + 22, y - 62, 0.7)
}

/** Mountain: 雪をかぶった山並みと旗、登山道、射的小屋とゼリーの足場、針葉樹 */
function drawLandmarkMountain(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 奥の山並み
  poly(
    ctx,
    [
      [x - 140, y + 4],
      [x - 78, y - 82],
      [x - 30, y - 24],
      [x + 14, y - 118],
      [x + 78, y - 34],
      [x + 108, y - 70],
      [x + 150, y + 4],
    ],
    '#4f6e4a',
  )
  // 陰の面
  ctx.fillStyle = 'rgba(20, 30, 20, 0.28)'
  ctx.beginPath()
  ctx.moveTo(x + 14, y - 118)
  ctx.lineTo(x + 78, y - 34)
  ctx.lineTo(x + 60, y + 4)
  ctx.lineTo(x + 22, y + 4)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x - 78, y - 82)
  ctx.lineTo(x - 30, y - 24)
  ctx.lineTo(x - 52, y + 4)
  ctx.closePath()
  ctx.fill()
  // 雪頂
  ctx.fillStyle = '#eef3f8'
  for (const [px, py, s] of [
    [14, -118, 1],
    [-78, -82, 0.7],
    [108, -70, 0.55],
  ] as const) {
    ctx.beginPath()
    ctx.moveTo(x + px - 15 * s, y + py + 20 * s)
    ctx.lineTo(x + px, y + py)
    ctx.lineTo(x + px + 16 * s, y + py + 21 * s)
    ctx.lineTo(x + px + 6 * s, y + py + 16 * s)
    ctx.lineTo(x + px - 3 * s, y + py + 23 * s)
    ctx.closePath()
    ctx.fill()
  }
  // 頂上の旗
  ctx.strokeStyle = '#f0e4c8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x + 14, y - 118)
  ctx.lineTo(x + 14, y - 136)
  ctx.stroke()
  poly(
    ctx,
    [
      [x + 14, y - 136],
      [x + 30, y - 131],
      [x + 14, y - 126],
    ],
    '#e84a3a',
    false,
  )
  // 登山道（つづら折り）
  ctx.setLineDash([4, 4])
  ctx.strokeStyle = 'rgba(240, 225, 190, 0.75)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x - 6, y - 4)
  ctx.lineTo(x + 26, y - 30)
  ctx.lineTo(x - 2, y - 56)
  ctx.lineTo(x + 22, y - 82)
  ctx.lineTo(x + 10, y - 104)
  ctx.stroke()
  ctx.setLineDash([])

  // ゼリーの足場（Jerry Mountain）：色つきの半透明ブロックの階段
  const jelly = ['#ff8ac8', '#7ae0ff', '#b8f070', '#ffd070']
  for (let i = 0; i < 5; i += 1) {
    const bx = x + 74 + i * 14
    const by = y - 6 - i * 11
    ctx.beginPath()
    roundRect(ctx, bx, by - 12, 14, 12, 3)
    ctx.fillStyle = jelly[i % jelly.length]
    ctx.globalAlpha = 0.85
    ctx.fill()
    ctx.globalAlpha = 1
    outline(ctx, 1.2)
  }

  // 射的小屋（縞の屋根）
  const booth = drawBuilding(ctx, x - 86, y + 2, {
    w: 58,
    h: 30,
    depth: 12,
    wall: '#8a5a3a',
    roofKind: 'none',
    door: null,
  })
  ctx.fillStyle = 'rgba(20, 14, 10, 0.75)'
  ctx.fillRect(booth.left + 6, booth.top + 10, 46, 14)
  // 的
  for (const tx of [booth.left + 16, booth.left + 29, booth.left + 42]) {
    ctx.fillStyle = '#f0e4c8'
    ctx.beginPath()
    ctx.arc(tx, booth.top + 17, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#e84a3a'
    ctx.beginPath()
    ctx.arc(tx, booth.top + 17, 2.2, 0, Math.PI * 2)
    ctx.fill()
  }
  drawAwning(ctx, booth.left - 4, booth.top - 8, 64, '#e84a3a', '#f0e4c8', 6)

  drawPine(ctx, x - 132, y + 6, 34, true)
  drawPine(ctx, x - 40, y + 10, 30, true)
  drawPine(ctx, x + 140, y + 8, 30, true)
  drawPine(ctx, x + 56, y + 12, 26, true)
}

/** Culture: かまぼこ屋根のランウェイホール、ブティック（Look Locker）、フォトブース */
function drawLandmarkCulture(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 広場の石畳
  ctx.fillStyle = 'rgba(180, 200, 240, 0.12)'
  ctx.beginPath()
  ctx.ellipse(x, y - 14, 160, 30, 0.06, 0, Math.PI * 2)
  ctx.fill()

  // ランウェイホール
  const hall = drawBuilding(ctx, x - 2, y - 14, {
    w: 108,
    h: 32,
    depth: 18,
    wall: '#dfe6f2',
    roof: '#5a7ab8',
    roofKind: 'barrel',
    roofH: 22,
    door: null,
  })
  // ガラスの入口とランウェイの帯
  ctx.fillStyle = '#2a3a5a'
  ctx.fillRect(x - 16, hall.top + 8, 28, 24)
  ctx.fillStyle = 'rgba(160, 200, 255, 0.55)'
  ctx.fillRect(x - 13, hall.top + 11, 22, 21)
  ctx.fillStyle = '#c8b8e8'
  poly(
    ctx,
    [
      [x - 10, y - 14],
      [x + 6, y - 14],
      [x + 12, y + 6],
      [x - 16, y + 6],
    ],
    'rgba(220, 210, 240, 0.85)',
  )
  ctx.fillStyle = 'rgba(60, 80, 120, 0.6)'
  for (const wx of [hall.left + 10, hall.left + 24, hall.right - 34, hall.right - 20]) {
    ctx.fillRect(wx, hall.top + 10, 8, 14)
  }

  // Look Locker（左のブティック）
  const shop = drawBuilding(ctx, x - 124, y - 2, {
    w: 60,
    h: 38,
    depth: 12,
    wall: '#2a3a5a',
    roofKind: 'flat',
    windows: { rows: 1, cols: 2, color: '#f0e0c0' },
  })
  drawAwning(ctx, shop.left, shop.top + 16, 60, '#8eb4e8', '#f0f4fa', 6)

  // フォトブース（右のキオスク。カーテン付き）
  const booth = drawBuilding(ctx, x + 112, y - 4, {
    w: 36,
    h: 42,
    depth: 12,
    wall: '#f0e4c8',
    roof: '#c84a3a',
    roofKind: 'flat',
    door: null,
  })
  ctx.fillStyle = '#c84a3a'
  ctx.fillRect(booth.left + 6, booth.top + 12, 24, 30)
  ctx.strokeStyle = 'rgba(90, 20, 20, 0.6)'
  ctx.lineWidth = 1
  for (let i = 1; i < 4; i += 1) {
    ctx.beginPath()
    ctx.moveTo(booth.left + 6 + i * 6, booth.top + 12)
    ctx.lineTo(booth.left + 6 + i * 6, booth.top + 42)
    ctx.stroke()
  }
  ctx.fillStyle = '#1a1a20'
  ctx.fillRect(booth.left + 12, booth.top + 3, 12, 6)

  drawRoundTree(ctx, x - 76, y + 4, 10, '#3f7a56')
  drawRoundTree(ctx, x + 72, y + 2, 9, '#3f7a56')
  drawStreetLamp(ctx, x + 150, y + 6)
  drawStreetLamp(ctx, x - 160, y + 6)
}

/** Jungle: 深い森の中の開けた草地に、ブタ・ウシ・ヒツジ（建物はなし） */
function drawLandmarkJungle(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 開けた草地
  ctx.fillStyle = 'rgba(150, 200, 110, 0.32)'
  ctx.beginPath()
  ctx.ellipse(x + 4, y - 8, 96, 30, -0.1, 0, Math.PI * 2)
  ctx.fill()

  // 奥の木々（大小を混ぜる）
  const back: Array<[number, number, number, 'round' | 'pine']> = [
    [-118, -38, 15, 'round'],
    [-92, -66, 40, 'pine'],
    [-60, -60, 16, 'round'],
    [-24, -74, 44, 'pine'],
    [12, -62, 18, 'round'],
    [50, -70, 40, 'pine'],
    [84, -56, 16, 'round'],
    [118, -40, 36, 'pine'],
  ]
  for (const [dx, dy, s, kind] of back) {
    if (kind === 'round') drawRoundTree(ctx, x + dx, y + dy, s, '#2f7a3a')
    else drawPine(ctx, x + dx, y + dy, s)
  }

  // 動物（ボクセルふうの四角い体）
  drawMapAnimal(ctx, x - 52, y - 10, 'pig')
  drawMapAnimal(ctx, x + 12, y - 22, 'cow')
  drawMapAnimal(ctx, x + 58, y - 2, 'sheep')
  drawMapAnimal(ctx, x - 6, y + 6, 'sheep')

  // 手前の茂み
  drawRoundTree(ctx, x - 132, y + 2, 12, '#2f7a3a')
  drawPine(ctx, x + 134, y + 8, 30)
}

function drawMapAnimal(ctx: CanvasRenderingContext2D, x: number, y: number, kind: 'pig' | 'cow' | 'sheep') {
  const body = kind === 'pig' ? '#f0a8b0' : kind === 'cow' ? '#f2efe8' : '#f4f2ec'
  const head = kind === 'sheep' ? '#e8d8c8' : body
  groundShadow(ctx, x, y + 1, 13, 3)
  ctx.fillStyle = kind === 'sheep' ? '#d8cfc4' : shadeHex(body, 0.75)
  for (const lx of [-8, -3, 4, 8]) ctx.fillRect(x + lx - 1.5, y - 5, 3, 5)
  ctx.beginPath()
  ctx.rect(x - 11, y - 14, 20, 10)
  ctx.fillStyle = body
  ctx.fill()
  outline(ctx, 1.2)
  if (kind === 'cow') {
    ctx.fillStyle = '#2a2a2a'
    ctx.fillRect(x - 6, y - 14, 6, 5)
    ctx.fillRect(x + 3, y - 9, 4, 4)
  }
  ctx.beginPath()
  ctx.rect(x + 8, y - 17, 8, 8)
  ctx.fillStyle = head
  ctx.fill()
  outline(ctx, 1.2)
  if (kind === 'pig') {
    ctx.fillStyle = '#e07e8c'
    ctx.fillRect(x + 14, y - 13, 3, 3)
  }
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(x + 12, y - 15, 1.6, 1.6)
}

/** Astro: 天文台のドーム、星空のコースター、映画館、トレイトのホール */
function drawLandmarkAstro(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 星（静かな点）
  ctx.fillStyle = 'rgba(255, 248, 200, 0.75)'
  for (const [dx, dy, r] of [
    [-150, -40, 1.6],
    [-96, -78, 2],
    [-30, -88, 1.4],
    [64, -84, 1.8],
    [128, -60, 1.6],
    [150, -20, 1.4],
    [-130, -10, 1.2],
  ] as const) {
    ctx.beginPath()
    ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // コースターのレール（奥を大きく弧を描いて走る）
  ctx.strokeStyle = 'rgba(160, 140, 255, 0.55)'
  ctx.lineWidth = 1.5
  for (const px of [-120, -80, -40, 40, 86, 126]) {
    const t = (px + 140) / 280
    const ry = y - 20 - Math.sin(t * Math.PI) * 58
    ctx.beginPath()
    ctx.moveTo(x + px, ry)
    ctx.lineTo(x + px, y + 2)
    ctx.stroke()
  }
  ctx.strokeStyle = '#b8a8ff'
  ctx.lineWidth = 3
  ctx.beginPath()
  for (let i = 0; i <= 40; i += 1) {
    const t = i / 40
    const px = x - 140 + t * 280
    const py = y - 20 - Math.sin(t * Math.PI) * 58 + Math.sin(t * Math.PI * 3) * 6
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.stroke()
  // 小さな車両
  ctx.fillStyle = '#5ce0ff'
  roundRect(ctx, x - 62, y - 74, 16, 8, 3)
  ctx.fill()

  // 天文台
  const obs = drawBuilding(ctx, x + 2, y - 8, {
    w: 64,
    h: 22,
    depth: 14,
    wall: '#3a4668',
    roofKind: 'flat',
    windows: { rows: 1, cols: 3, color: '#9ae8ff' },
  })
  ctx.beginPath()
  ctx.arc(x + 6, obs.top - 4, 26, Math.PI, 0)
  ctx.closePath()
  ctx.fillStyle = '#c8d4e8'
  ctx.fill()
  outline(ctx)
  ctx.fillStyle = 'rgba(40, 50, 80, 0.85)'
  ctx.fillRect(x + 2, obs.top - 28, 8, 24)
  // 望遠鏡
  ctx.strokeStyle = '#8a96b0'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(x + 6, obs.top - 20)
  ctx.lineTo(x + 22, obs.top - 40)
  ctx.stroke()

  // 映画館（左。看板の帯）
  const cinema = drawBuilding(ctx, x - 104, y + 2, {
    w: 66,
    h: 40,
    depth: 12,
    wall: '#5a3a5a',
    roofKind: 'flat',
    door: '#1a1020',
  })
  ctx.fillStyle = '#ffd98a'
  ctx.fillRect(cinema.left + 6, cinema.top + 8, 54, 9)
  ctx.fillStyle = 'rgba(90, 40, 30, 0.8)'
  for (let i = 0; i < 5; i += 1) ctx.fillRect(cinema.left + 10 + i * 10, cinema.top + 11, 6, 3)

  // トレイトのホール（右）
  const hall = drawBuilding(ctx, x + 102, y + 2, {
    w: 58,
    h: 32,
    depth: 12,
    wall: '#2a6070',
    roof: '#5ce0ff',
    roofKind: 'gable',
    roofH: 14,
    windows: { rows: 1, cols: 3, color: '#c8f4ff' },
  })
  void hall
}

/** Music & Art: ヒップホップクラブ、Learn Art（白いキューブ）、ジャズバー */
function drawLandmarkMusicArt(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = 'rgba(232, 92, 255, 0.1)'
  ctx.beginPath()
  ctx.ellipse(x, y - 4, 140, 24, -0.08, 0, Math.PI * 2)
  ctx.fill()

  // Learn Art（静かな現代美術館：白い箱と大きなガラス）
  const gallery = drawBuilding(ctx, x - 4, y - 14, {
    w: 74,
    h: 44,
    depth: 18,
    wall: '#f2f0ec',
    roofKind: 'flat',
    door: null,
  })
  ctx.fillStyle = '#3a3a48'
  ctx.fillRect(gallery.left + 10, gallery.top + 20, 54, 24)
  ctx.fillStyle = 'rgba(180, 210, 240, 0.45)'
  ctx.fillRect(gallery.left + 12, gallery.top + 22, 50, 22)
  ctx.fillStyle = '#d8d4cc'
  ctx.fillRect(gallery.left, gallery.top + 8, 74, 3)

  // ヒップホップクラブ（左。黒い箱に紫の帯）
  const club = drawBuilding(ctx, x - 96, y - 2, {
    w: 64,
    h: 38,
    depth: 12,
    wall: '#2a2234',
    roofKind: 'flat',
    door: '#8a3ab8',
  })
  ctx.fillStyle = '#c85cff'
  ctx.fillRect(club.left, club.top + 8, 64, 5)
  ctx.fillStyle = '#ffc46a'
  ctx.fillRect(club.left + 8, club.top + 18, 10, 6)
  ctx.fillRect(club.left + 46, club.top + 18, 10, 6)

  // ジャズバー（右。レンガに深緑の日よけ）
  const bar = drawBuilding(ctx, x + 92, y - 4, {
    w: 60,
    h: 36,
    depth: 12,
    wall: '#8a4a3a',
    roofKind: 'flat',
    windows: { rows: 1, cols: 2 },
  })
  drawAwning(ctx, bar.left, bar.top + 16, 60, '#2f5a46', '#e8dcc0', 6)

  // 音符をひとつだけ（にぎやかにしすぎない）
  ctx.fillStyle = 'rgba(255, 196, 106, 0.85)'
  ctx.beginPath()
  ctx.ellipse(x + 64, y - 52, 4, 3, -0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(x + 67, y - 70, 1.8, 18)
  ctx.fillRect(x + 67, y - 70, 8, 2)
}
