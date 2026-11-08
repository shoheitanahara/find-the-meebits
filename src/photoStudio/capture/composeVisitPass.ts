import type { WebGLRenderer } from 'three'
import { getLocale } from '../../i18n/locale'
import { isParkChristmasSeason } from '../../top/parkChristmas'
import { getUtcDateKey } from '../../top/dailyFeatured'
import { PHOTO_STUDIO } from '../config'
import {
  collectTodayVisitRecords,
  formatVisitTimestamp,
  getVisitTimezoneLabel,
} from '../visitPassRecords'
import type { VisitPassLine } from '../../park/dailyRecords'
import { getDailyVisitPassTheme, type VisitPassTheme } from './visitPassTheme'

/** レイアウト基準サイズ（見た目の座標） */
const CARD_W = 1024
const CARD_H = 648
/** PNG 書き出し倍率。写真スロットもこの分シャープになる */
const EXPORT_SCALE = 2

const MARGIN = 44
const PHOTO = 268
const PHOTO_X = MARGIN + 8
const PHOTO_Y = 152
/** 右上枠の QR */
const QR_SIZE = 76
const QR_PAD = 5
const QR_SRC = '/photo-booth/visit-pass-qr.png'

const SERIF = 'Georgia, "Times New Roman", Times, serif'
const SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

let visitPassQrImage: HTMLImageElement | null = null
let visitPassQrLoad: Promise<HTMLImageElement | null> | null = null

/** 発行前に呼ぶと QR の読み込み待ちを減らせる */
export function preloadVisitPassQr(): Promise<HTMLImageElement | null> {
  if (visitPassQrImage) return Promise.resolve(visitPassQrImage)
  if (typeof Image === 'undefined') return Promise.resolve(null)
  if (!visitPassQrLoad) {
    visitPassQrLoad = new Promise((resolve) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        visitPassQrImage = img
        resolve(img)
      }
      img.onerror = () => resolve(null)
      img.src = QR_SRC
    })
  }
  return visitPassQrLoad
}

export type VisitPassOptions = {
  meebitNumber: number
  issuedAt?: Date
  records?: VisitPassLine[]
  /** 省略時は UTC 日替わりテーマ */
  theme?: VisitPassTheme
  /** 省略時は端末ローカルの 11–12月で判定 */
  christmas?: boolean
}

/**
 * スタジオ Canvas から来場証明書 PNG を合成する。
 * ミュージアム会員証寄りの紙質・ヘアライン・セリフ見出し。
 * 色味だけ日替わり（`visitPassTheme`）。
 */
export async function composeVisitPass(
  gl: WebGLRenderer,
  options: VisitPassOptions,
): Promise<string | null> {
  const source = gl.domElement
  const sw = source.width
  const sh = source.height
  if (sw < 2 || sh < 2) return null

  const canvas = document.createElement('canvas')
  canvas.width = CARD_W * EXPORT_SCALE
  canvas.height = CARD_H * EXPORT_SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.setTransform(EXPORT_SCALE, 0, 0, EXPORT_SCALE, 0, 0)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  const locale = getLocale()
  const issuedAt = options.issuedAt ?? new Date()
  const records = options.records ?? collectTodayVisitRecords()
  const timestamp = formatVisitTimestamp(issuedAt)
  const timezoneLabel = getVisitTimezoneLabel(issuedAt)
  const dateKey = getUtcDateKey(issuedAt)
  const serial = buildSerial(options.meebitNumber, dateKey)
  const theme = options.theme ?? getDailyVisitPassTheme(dateKey)
  const christmas = options.christmas ?? isParkChristmasSeason(issuedAt)
  const qr = await preloadVisitPassQr()

  paintPaper(ctx, theme)
  paintOuterFrame(ctx, theme)
  paintHeader(ctx, locale, theme)
  paintHeaderQr(ctx, qr, theme)
  paintPhoto(ctx, source, sw, sh, theme)
  paintIdentity(ctx, locale, options.meebitNumber, timestamp, timezoneLabel, theme)
  paintRecords(ctx, locale, records, theme)
  paintFooter(ctx, serial, theme)
  if (christmas) paintPixelChristmasDecor(ctx, locale)

  return canvas.toDataURL('image/png')
}

function paintPaper(ctx: CanvasRenderingContext2D, theme: VisitPassTheme) {
  ctx.fillStyle = 'rgba(26, 36, 56, 0.08)'
  roundRect(ctx, 10, 12, CARD_W - 16, CARD_H - 16, 10)
  ctx.fill()

  const paper = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
  paper.addColorStop(0, theme.paper[0])
  paper.addColorStop(0.45, theme.paper[1])
  paper.addColorStop(1, theme.paper[2])
  ctx.fillStyle = paper
  roundRect(ctx, 0, 0, CARD_W, CARD_H, 12)
  ctx.fill()

  // ごく弱い紙の粒感（テーマ ink を薄く）
  ctx.save()
  ctx.globalAlpha = 0.035
  for (let i = 0; i < 900; i += 1) {
    const x = (i * 97) % CARD_W
    const y = (i * 53) % CARD_H
    ctx.fillStyle = i % 3 === 0 ? theme.ink : '#ffffff'
    ctx.fillRect(x, y, 1.2, 1.2)
  }
  ctx.restore()
}

/**
 * クリスマス装飾
 * - 中央上: 大きめリース
 * - 左右: 枠の内側に寄せた赤／緑／金ストライプ
 * - 背景色を残しつつ雪（降雪＋下辺の積雪）
 */
function paintPixelChristmasDecor(ctx: CanvasRenderingContext2D, _locale: 'en' | 'ja') {
  const px = 5
  ctx.save()
  ctx.imageSmoothingEnabled = false

  paintChristmasSnowDrift(ctx)
  paintChristmasSideStripes(ctx, px)
  paintPixelWreath(ctx, CARD_W * 0.5, 48, px)
  paintChristmasFallingSnow(ctx)

  ctx.restore()
}

/** 左右帯 — カード外縁寄り */
function paintChristmasSideStripes(ctx: CanvasRenderingContext2D, px: number) {
  const colors = ['#c42828', '#1e6a38', '#e8c050'] as const
  const band = colors.length * px
  const inset = 8
  const top = 10
  const bottom = CARD_H - 10
  const h = bottom - top

  const paintBand = (x: number) => {
    for (let i = 0; i < colors.length; i += 1) {
      ctx.fillStyle = colors[i]
      ctx.fillRect(x + i * px, top, px, h)
    }
  }

  paintBand(inset)
  paintBand(CARD_W - inset - band)
}

/** 下辺に積もる雪（フッターより下〜外縁寄り） */
function paintChristmasSnowDrift(ctx: CanvasRenderingContext2D) {
  ctx.save()
  const baseY = CARD_H - 10
  for (let x = 28; x < CARD_W - 28; x += 3) {
    const wave =
      Math.sin(x * 0.05) * 3.5 + Math.sin(x * 0.12) * 1.8 + ((x * 17) % 4) * 0.25
    const h = 4 + wave
    ctx.fillStyle = 'rgba(255, 255, 255, 0.48)'
    ctx.fillRect(x, baseY - h, 3, h + 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.24)'
    ctx.fillRect(x, baseY - h - 2, 3, 2)
  }
  // 下左右の積雪のみ（上隅は控えめ）
  for (const [cx, cy, s] of [
    [40, CARD_H - 16, 1.1],
    [CARD_W - 40, CARD_H - 16, 1.1],
  ] as const) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.beginPath()
    ctx.ellipse(cx, cy, 22 * s, 6 * s, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

/** 舞い散る雪（丸粒・写真枠には被せない） */
function paintChristmasFallingSnow(ctx: CanvasRenderingContext2D) {
  const photoPad = 14
  const photoL = PHOTO_X - photoPad
  const photoT = PHOTO_Y - photoPad
  const photoR = PHOTO_X + PHOTO + photoPad
  const photoB = PHOTO_Y + PHOTO + photoPad
  const hitsPhoto = (x: number, y: number, r: number) =>
    x + r >= photoL && x - r <= photoR && y + r >= photoT && y - r <= photoB

  // 線形合同だと斜め筋が出るので、ハッシュでばらす
  const rand = (n: number) => {
    const t = Math.sin(n * 127.1 + 311.7) * 43758.5453
    return t - Math.floor(t)
  }

  ctx.save()
  for (let i = 0; i < 110; i += 1) {
    const x = 36 + rand(i * 3.17 + 0.11) * (CARD_W - 72)
    const y = 32 + rand(i * 5.91 + 1.7) * (CARD_H - 70)
    const r = 1.8 + rand(i * 2.3 + 0.4) * 3.4
    if (hitsPhoto(x, y, r + 1)) continue

    const alpha = 0.22 + rand(i * 4.1 + 2.2) * 0.28
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.5, alpha + 0.1)})`
    ctx.beginPath()
    ctx.arc(x - r * 0.28, y - r * 0.28, r * 0.32, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

/** 中央上の大きめピクセルリース */
function paintPixelWreath(ctx: CanvasRenderingContext2D, cx: number, cy: number, px: number) {
  const ox = Math.round(cx / px)
  const oy = Math.round(cy / px)
  const put = (x: number, y: number, c: string) => {
    ctx.fillStyle = c
    ctx.fillRect((ox + x) * px, (oy + y) * px, px, px)
  }

  // 厚みのある緑リング
  for (const [r, c] of [
    [11, '#164a28'],
    [10, '#1e5a30'],
    [9, '#246838'],
    [8, '#2a7040'],
    [7, '#348048'],
    [6, '#2f6840'],
  ] as const) {
    for (const [x, y, color] of ringCells(r, c)) put(x, y, color)
  }

  // 葉の凸凹（外側に飛び出す緑）
  const tufts: Array<[number, number]> = [
    [0, -12],
    [4, -11],
    [8, -9],
    [11, -4],
    [12, 0],
    [11, 4],
    [8, 9],
    [4, 11],
    [0, 12],
    [-4, 11],
    [-8, 9],
    [-11, 4],
    [-12, 0],
    [-11, -4],
    [-8, -9],
    [-4, -11],
  ]
  for (const [x, y] of tufts) {
    put(x, y, '#2a7040')
    put(x + (x === 0 ? 0 : Math.sign(x)), y + (y === 0 ? 0 : Math.sign(y)), '#1e5a30')
  }

  // 赤実
  const berries: Array<[number, number]> = [
    [0, -10],
    [7, -7],
    [10, 0],
    [7, 7],
    [0, 10],
    [-7, 7],
    [-10, 0],
    [-7, -7],
    [3, -9],
    [-3, 9],
  ]
  for (const [x, y] of berries) {
    put(x, y, '#c42828')
    put(x, y - 1, '#e04848')
    put(x + 1, y, '#a02028')
  }

  // 金オーナメント
  for (const [x, y] of [
    [5, -3],
    [-5, 3],
    [3, 6],
    [-6, -5],
  ] as const) {
    put(x, y, '#e8c050')
    put(x, y + 1, '#c8a030')
    put(x - 1, y, '#f0d060')
  }

  // 下部の大きめリボン
  put(-5, 11, '#c42828')
  put(-4, 12, '#e04040')
  put(-3, 11, '#c42828')
  put(-2, 12, '#e04040')
  put(-1, 11, '#c42828')
  put(0, 10, '#e04040')
  put(1, 11, '#c42828')
  put(2, 12, '#e04040')
  put(3, 11, '#c42828')
  put(4, 12, '#e04040')
  put(5, 11, '#c42828')
  put(0, 11, '#f0d060')
  put(0, 12, '#e8c050')
  put(-3, 13, '#a02028')
  put(-4, 14, '#c42828')
  put(-2, 14, '#a02028')
  put(3, 13, '#a02028')
  put(4, 14, '#c42828')
  put(2, 14, '#a02028')
  put(-1, 13, '#c42828')
  put(1, 13, '#c42828')

  // 中央の金ベル風
  put(0, -2, '#e8c050')
  put(0, -1, '#f0d060')
  put(-1, 0, '#e8c050')
  put(0, 0, '#fff0a8')
  put(1, 0, '#e8c050')
  put(0, 1, '#c8a030')
  put(-1, 1, '#c8a030')
  put(1, 1, '#c8a030')
}

function ringCells(radius: number, color: string): Array<[number, number, string]> {
  const cells: Array<[number, number, string]> = []
  for (let y = -radius - 1; y <= radius + 1; y += 1) {
    for (let x = -radius - 1; x <= radius + 1; x += 1) {
      const d = Math.hypot(x, y)
      if (d >= radius - 0.75 && d <= radius + 0.45) cells.push([x, y, color])
    }
  }
  return cells
}

function paintOuterFrame(ctx: CanvasRenderingContext2D, theme: VisitPassTheme) {
  ctx.strokeStyle = theme.ink
  ctx.lineWidth = 1.25
  roundRect(ctx, 18, 18, CARD_W - 36, CARD_H - 36, 8)
  ctx.stroke()

  ctx.strokeStyle = theme.rule
  ctx.lineWidth = 0.75
  roundRect(ctx, 24, 24, CARD_W - 48, CARD_H - 48, 6)
  ctx.stroke()

  const mark = 14
  const inset = 32
  ctx.strokeStyle = theme.inkFaint
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(inset, inset + mark)
  ctx.lineTo(inset, inset)
  ctx.lineTo(inset + mark, inset)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(CARD_W - inset - mark, inset)
  ctx.lineTo(CARD_W - inset, inset)
  ctx.lineTo(CARD_W - inset, inset + mark)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(inset, CARD_H - inset - mark)
  ctx.lineTo(inset, CARD_H - inset)
  ctx.lineTo(inset + mark, CARD_H - inset)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(CARD_W - inset - mark, CARD_H - inset)
  ctx.lineTo(CARD_W - inset, CARD_H - inset)
  ctx.lineTo(CARD_W - inset, CARD_H - inset - mark)
  ctx.stroke()
}

function paintHeader(
  ctx: CanvasRenderingContext2D,
  locale: 'en' | 'ja',
  theme: VisitPassTheme,
) {
  const brand = 'Meebits Park'
  const pass = 'Visitor Pass'
  const district =
    locale === 'ja' ? 'カルチャーエリア · フォトブース' : 'Culture District · Photo Booth'

  ctx.fillStyle = theme.accent
  ctx.font = `600 11px ${SANS}`
  ctx.fillText(brand.toUpperCase(), MARGIN + 4, 52)

  ctx.fillStyle = theme.ink
  ctx.font = `italic 40px ${SERIF}`
  ctx.fillText(pass, MARGIN + 4, 92)

  const passWidth = ctx.measureText(pass).width
  ctx.fillStyle = theme.accent
  ctx.fillRect(MARGIN + 4, 100, Math.min(72, passWidth * 0.35), 3)

  const qrBox = QR_SIZE + QR_PAD * 2
  const ruleEndX = CARD_W - MARGIN - qrBox - 16
  ctx.strokeStyle = theme.rule
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(MARGIN + 4, 116)
  ctx.lineTo(ruleEndX, 116)
  ctx.stroke()

  ctx.fillStyle = theme.inkMuted
  ctx.font = `500 12px ${SANS}`
  ctx.fillText(district, MARGIN + 4, 136)
}

/** ヘッダー右上の枠内に QR を置く */
function paintHeaderQr(
  ctx: CanvasRenderingContext2D,
  qr: HTMLImageElement | null,
  theme: VisitPassTheme,
) {
  const box = QR_SIZE + QR_PAD * 2
  const x = CARD_W - MARGIN - box
  const y = 36

  ctx.fillStyle = theme.paperEdge
  ctx.fillRect(x - 2, y - 2, box + 4, box + 4)

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x, y, box, box)

  ctx.strokeStyle = theme.ink
  ctx.lineWidth = 1
  ctx.strokeRect(x + 0.5, y + 0.5, box - 1, box - 1)

  ctx.strokeStyle = theme.rule
  ctx.lineWidth = 0.75
  ctx.strokeRect(x + 3.5, y + 3.5, box - 7, box - 7)

  if (qr) {
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(qr, x + QR_PAD, y + QR_PAD, QR_SIZE, QR_SIZE)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
  }
}

function paintPhoto(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  sw: number,
  sh: number,
  theme: VisitPassTheme,
) {
  const side = Math.min(sw, sh)
  const sx = Math.floor((sw - side) / 2)
  const sy = Math.floor((sh - side) / 2)

  const hiSize = Math.max(PHOTO_STUDIO.exportSize, PHOTO * EXPORT_SCALE)
  const hi = document.createElement('canvas')
  hi.width = hiSize
  hi.height = hiSize
  const hiCtx = hi.getContext('2d')
  if (!hiCtx) return

  hiCtx.imageSmoothingEnabled = true
  hiCtx.imageSmoothingQuality = 'high'
  hiCtx.drawImage(source, sx, sy, side, side, 0, 0, hiSize, hiSize)

  ctx.fillStyle = theme.paperEdge
  ctx.fillRect(PHOTO_X - 10, PHOTO_Y - 10, PHOTO + 20, PHOTO + 20)

  ctx.fillStyle = '#0a0e14'
  ctx.fillRect(PHOTO_X - 1, PHOTO_Y - 1, PHOTO + 2, PHOTO + 2)

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(hi, PHOTO_X, PHOTO_Y, PHOTO, PHOTO)

  ctx.strokeStyle = theme.photoInnerLine
  ctx.lineWidth = 1
  ctx.strokeRect(PHOTO_X + 0.5, PHOTO_Y + 0.5, PHOTO - 1, PHOTO - 1)
}

function paintIdentity(
  ctx: CanvasRenderingContext2D,
  locale: 'en' | 'ja',
  meebitNumber: number,
  timestamp: string,
  timezoneLabel: string,
  theme: VisitPassTheme,
) {
  const textX = PHOTO_X + PHOTO + 48
  const colW = CARD_W - textX - MARGIN - 8
  const idLabel = 'Meebit ID'
  const issuedLabel = locale === 'ja' ? '来場日時' : 'Date of visit'
  const zoneLabel = locale === 'ja' ? 'タイムゾーン' : 'Timezone'
  const idValue = String(meebitNumber).padStart(5, '0')

  drawField(ctx, textX, PHOTO_Y + 8, colW, idLabel, `#${idValue}`, 36, theme)
  drawField(ctx, textX, PHOTO_Y + 108, colW, issuedLabel, timestamp, 22, theme)
  drawField(ctx, textX, PHOTO_Y + 188, colW * 0.72, zoneLabel, timezoneLabel, 18, theme)

  paintVerifiedSeal(ctx, CARD_W - MARGIN - 78, PHOTO_Y + PHOTO - 36, theme)
}

function paintVerifiedSeal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  theme: VisitPassTheme,
) {
  const ink = theme.seal
  const inkSoft = theme.sealSoft
  const outerR = 46
  const midR = 40
  const innerR = 28
  const arcR = (midR + innerR) / 2 + 1

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(-0.16)

  ctx.beginPath()
  ctx.arc(1.2, 0.8, outerR + 1.5, 0, Math.PI * 2)
  ctx.strokeStyle = withAlpha(theme.seal, 0.12)
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.strokeStyle = ink
  ctx.lineWidth = 2.4
  ctx.beginPath()
  ctx.arc(0, 0, outerR, 0, Math.PI * 2)
  ctx.stroke()

  ctx.lineWidth = 1.1
  ctx.beginPath()
  ctx.arc(0, 0, midR, 0, Math.PI * 2)
  ctx.stroke()

  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.arc(0, 0, innerR, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = inkSoft
  ctx.lineWidth = 1
  for (let i = 0; i < 36; i += 1) {
    const a = (i / 36) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * (midR + 1.5), Math.sin(a) * (midR + 1.5))
    ctx.lineTo(Math.cos(a) * (outerR - 2), Math.sin(a) * (outerR - 2))
    ctx.stroke()
  }

  paintSealArcText(ctx, 'MEEBITS PARK', arcR, -Math.PI * 0.86, -Math.PI * 0.14, ink, 7.4, false)
  paintSealArcText(ctx, 'VISITOR PASS', arcR, Math.PI * 0.86, Math.PI * 0.14, ink, 7.1, true)

  ctx.fillStyle = inkSoft
  paintSealStar(ctx, 0, -10, 4.2)

  ctx.fillStyle = ink
  ctx.font = `700 9px ${SANS}`
  const verified = 'VERIFIED'
  ctx.fillText(verified, -ctx.measureText(verified).width / 2, 5)

  ctx.beginPath()
  ctx.arc(-20, 1, 1.35, 0, Math.PI * 2)
  ctx.arc(20, 1, 1.35, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function paintSealStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    const b = a + Math.PI / 5
    const ox = Math.cos(a) * r
    const oy = Math.sin(a) * r
    const ix = Math.cos(b) * r * 0.4
    const iy = Math.sin(b) * r * 0.4
    if (i === 0) ctx.moveTo(x + ox, y + oy)
    else ctx.lineTo(x + ox, y + oy)
    ctx.lineTo(x + ix, y + iy)
  }
  ctx.closePath()
  ctx.fill()
}

function paintSealArcText(
  ctx: CanvasRenderingContext2D,
  text: string,
  radius: number,
  startAngle: number,
  endAngle: number,
  color: string,
  fontSize: number,
  upright: boolean,
) {
  const chars = [...text]
  const step = (endAngle - startAngle) / Math.max(chars.length - 1, 1)

  ctx.save()
  ctx.fillStyle = color
  ctx.font = `700 ${fontSize}px ${SANS}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  chars.forEach((char, index) => {
    if (char === ' ') return
    const angle = startAngle + step * index
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(upright ? angle - Math.PI / 2 : angle + Math.PI / 2)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  })

  ctx.restore()
}

function drawField(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  valueSize: number,
  theme: VisitPassTheme,
) {
  ctx.fillStyle = theme.inkMuted
  ctx.font = `600 10px ${SANS}`
  ctx.fillText(label.toUpperCase(), x, y)

  ctx.strokeStyle = theme.rule
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y + 8)
  ctx.lineTo(x + width, y + 8)
  ctx.stroke()

  ctx.fillStyle = theme.ink
  ctx.font =
    valueSize >= 30
      ? `600 ${valueSize}px ${MONO}`
      : `500 ${valueSize}px ${SANS}`
  ctx.fillText(value, x, y + 8 + valueSize + 4)
}

function paintRecords(
  ctx: CanvasRenderingContext2D,
  locale: 'en' | 'ja',
  records: VisitPassLine[],
  theme: VisitPassTheme,
) {
  const count = records.length
  if (count === 0) return

  const footerTop = CARD_H - 52
  const photoBottom = PHOTO_Y + PHOTO + 18
  const maxBandH = Math.max(80, footerTop - photoBottom - 6)
  const layout = planRecordsLayout(count, maxBandH)

  const headingH = 28
  const bandH = headingH + layout.rows * layout.rowH + 6
  const bandY = footerTop - bandH
  const bandX = MARGIN + 4
  const bandW = CARD_W - MARGIN * 2 - 8

  ctx.strokeStyle = theme.rule
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(bandX, bandY)
  ctx.lineTo(bandX + bandW, bandY)
  ctx.stroke()

  ctx.fillStyle = theme.inkMuted
  ctx.font = `600 9px ${SANS}`
  const heading = locale === 'ja' ? '本日のパーク記録' : "Today's park records"
  ctx.fillText(heading.toUpperCase(), bandX, bandY + 16)

  const colGap = layout.cols >= 4 ? 12 : layout.cols === 3 ? 16 : 20
  const gridTop = bandY + headingH
  const colW = (bandW - colGap * (layout.cols - 1)) / layout.cols
  const labelFont = `500 ${layout.fontSize}px ${SANS}`
  const detailFontFilled = `600 ${layout.fontSize}px ${MONO}`
  const detailFontEmpty = `500 ${layout.fontSize}px ${MONO}`

  records.forEach((record, index) => {
    const col = Math.floor(index / layout.rows)
    const row = index % layout.rows
    if (col >= layout.cols) return

    const x = bandX + col * (colW + colGap)
    const y = gridTop + row * layout.rowH + layout.fontSize

    ctx.fillStyle = record.filled ? theme.inkMuted : theme.inkFaint
    ctx.font = labelFont
    const labelText = fitText(ctx, record.label, colW * 0.48)
    ctx.fillText(labelText, x, y)
    const labelWidth = ctx.measureText(labelText).width

    ctx.fillStyle = record.filled ? theme.ink : theme.inkFaint
    ctx.font = record.filled ? detailFontFilled : detailFontEmpty
    const maxDetailW = Math.max(24, colW - labelWidth - 16)
    const detailText = fitText(ctx, record.detail, maxDetailW)
    const detailW = ctx.measureText(detailText).width
    ctx.fillText(detailText, x + colW - detailW, y)

    if (record.filled && colW - detailW - labelWidth > 24) {
      ctx.strokeStyle = withAlpha(theme.rule, 0.1)
      ctx.lineWidth = 1
      ctx.setLineDash([1, 3])
      ctx.beginPath()
      ctx.moveTo(x + labelWidth + 8, y - 3)
      ctx.lineTo(x + colW - detailW - 8, y - 3)
      ctx.stroke()
      ctx.setLineDash([])
    }
  })
}

/** 列幅に収まるまで末尾を省略（…）。 */
function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text
  const ellipsis = '…'
  let end = text.length
  while (end > 1) {
    end -= 1
    const candidate = `${text.slice(0, end).trimEnd()}${ellipsis}`
    if (ctx.measureText(candidate).width <= maxWidth) return candidate
  }
  return ellipsis
}

function planRecordsLayout(count: number, maxBandH: number) {
  const headingH = 28
  const padding = 6
  const usable = Math.max(40, maxBandH - headingH - padding)
  const minRowH = 14
  const maxRowH = 22

  for (const cols of [2, 3, 4] as const) {
    const rows = Math.max(1, Math.ceil(count / cols))
    const rowH = usable / rows
    if (rowH >= minRowH) {
      const clamped = Math.min(maxRowH, rowH)
      return {
        cols,
        rows,
        rowH: clamped,
        fontSize: clamped >= 19 ? 11 : clamped >= 16 ? 10 : 9,
      }
    }
  }

  const cols = 4
  const rows = Math.max(1, Math.ceil(count / cols))
  const rowH = Math.max(12, usable / rows)
  return {
    cols,
    rows,
    rowH,
    fontSize: rowH >= 15 ? 9 : 8,
  }
}

function paintFooter(ctx: CanvasRenderingContext2D, serial: string, theme: VisitPassTheme) {
  const y = CARD_H - 28

  ctx.strokeStyle = theme.rule
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(MARGIN + 4, y - 14)
  ctx.lineTo(CARD_W - MARGIN - 4, y - 14)
  ctx.stroke()

  ctx.fillStyle = theme.inkFaint
  ctx.font = `500 9px ${MONO}`
  ctx.fillText(serial, MARGIN + 4, y)

  const note = 'This pass records a visit to Meebits Park. Not transferable.'
  ctx.font = `400 9px ${SANS}`
  const noteW = ctx.measureText(note).width
  ctx.fillText(note, CARD_W - MARGIN - 4 - noteW, y)
}

function buildSerial(meebitNumber: number, dateKey: string): string {
  const compact = dateKey.replaceAll('-', '')
  const id = String(meebitNumber).padStart(5, '0')
  return `MP-${compact}-${id}`
}

/** rgba(..., a) のアルファだけ差し替え */
function withAlpha(rgba: string, alpha: number): string {
  return rgba.replace(/[\d.]+\)$/, `${alpha})`)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}
